<template>
  <div class="chat-view">
    <div class="chat-view__sidebar">
      <div class="chat-view__sidebar-header">
        <p class="eyebrow">模型选择</p>
        <h3>会话空间</h3>
        <p class="text-muted">挑选合适的模型与提示风格，后续会话沿用。</p>
      </div>
      <div class="chat-view__sidebar-card">
        <p class="chat-view__sidebar-label">首选模型</p>
        <a-select v-model="selectedModel" placeholder="选择模型">
          <a-option v-for="model in models" :key="model.modelIdentifier" :value="model.modelIdentifier">
            {{ model.displayName }}
          </a-option>
        </a-select>
      </div>
      <div class="chat-view__sidebar-content">
        <div class="chat-view__history-card">
          <p class="chat-view__sidebar-label">最近会话</p>
          <p class="text-muted">会话列表即将推出，敬请期待。</p>
        </div>
      </div>
    </div>
    <div class="chat-view__main">
        <div class="chat-view__hero">
          <div>
            <p class="eyebrow">智能聊天</p>
            <h2>多模态对话体验</h2>
            <p class="text-muted">输入文本或上传图片，感受流畅的模型响应与轻盈布局。</p>
          </div>
          <div class="chat-view__hero-meta">
            <span class="pill">模型: {{ selectedModel || '未选择' }}</span>
            <span v-if="isResponding" class="pill pill--live">AI 正在响应</span>
            <span
              v-for="cap in capabilityTags"
              :key="cap"
              class="pill pill--muted"
            >
              {{ capabilityLabel[cap] || cap }}
            </span>
          </div>
        </div>

      <div class="chat-view__surface">
      <a-layout-content>
        <div ref="messageContainer" class="message-list">
          <div v-for="message in messages" :key="message.id" class="message-item" :class="`message-item--${message.role}`">
            <div class="message-item__avatar">
              <a-avatar>{{ message.role === 'user' ? authStore.username.slice(0, 2).toUpperCase() : 'AI' }}</a-avatar>
            </div>
            <div class="message-item__content">
              <div v-if="message.imageUrl">
                <a-image :src="message.imageUrl" width="200" />
              </div>
              <div class="message-item__bubble" v-if="message.content" v-html="renderMarkdown(message.content)"></div>
            </div>
          </div>
          <div v-if="isResponding" class="message-item message-item--assistant">
             <div class="message-item__avatar">
              <a-avatar>AI</a-avatar>
            </div>
            <div class="message-item__content">
              <div class="message-item__bubble">
                <a-spin size="small" />
              </div>
            </div>
          </div>
        </div>
      </a-layout-content>
      <a-layout-footer class="input-area">
        <div class="input-area__shell">
          <div class="input-area__upload">
            <a-upload
              :show-file-list="false"
              :custom-request="handleImageUpload"
              accept="image/*"
              :disabled="!canUseImage"
            >
              <template #upload-button>
                <a-button :disabled="!canUseImage">
                  <icon-upload />
                </a-button>
              </template>
            </a-upload>
            <a-input
              v-model="imageUrlInput"
              size="small"
              placeholder="或粘贴图片 URL"
              :disabled="!canUseImage"
              allow-clear
              @press-enter="applyImageUrl"
              style="margin-top: 6px"
            />
          </div>
          <div class="input-area__text">
            <div v-if="uploadedImage" class="image-preview">
              <a-image :src="uploadedImage" width="46" height="46" />
              <a-button shape="circle" size="mini" class="image-preview__remove" @click="clearUploadedImage">
                <icon-close />
              </a-button>
            </div>
            <a-textarea
              v-model="userInput"
              placeholder="输入消息... (可上传图片进行多模态输入)"
              :auto-size="{ minRows: 1, maxRows: 5 }"
              @keydown.enter.prevent="handleSend"
            />
          </div>
          <a-button type="primary" @click="handleSend" :disabled="(!userInput.trim() && !uploadedImage) || isResponding">
            发送
          </a-button>
        </div>
        <p class="input-area__hint">
          Enter 发送 · 图片输入{{ canUseImage ? '已启用' : '当前模型不支持图片' }} · 信息传输加密
        </p>
      </a-layout-footer>
      </div>
    </div>

    <!-- Access Key Modal -->
    <a-modal v-model:visible="isKeyModalVisible" title="请输入 Access Key" @ok="handleSetKey" :mask-closable="false">
      <a-input v-model="sessionKeyInput" placeholder="请输入你的 Access Key" />
      <template #extra>
        <p>Access Key 用于调用模型，你可以在“Access Keys”页面创建。</p>
      </template>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { listModels } from '@/api/model'
import { chatCompletion } from '@/api/proxy'
import type { Model } from '@/types/model'
import type { ChatMessage, OpenAiMessage } from '@/types/chat'
import { ElMessage } from 'element-plus'
import { v4 as uuidv4 } from 'uuid'
import MarkdownIt from 'markdown-it'
import 'highlight.js/styles/github.css';
import hljs from 'highlight.js';
import { IconUpload, IconClose } from '@arco-design/web-vue/es/icon';

const authStore = useAuthStore()
const models = ref<Model[]>([])
const selectedModel = ref<string>('')
const selectedModelEntity = computed(() => models.value.find((m) => m.modelIdentifier === selectedModel.value))
const messages = ref<ChatMessage[]>([])
const userInput = ref('')
const isResponding = ref(false)
const messageContainer = ref<HTMLElement | null>(null)
const isKeyModalVisible = ref(false)
const sessionKeyInput = ref('')
const uploadedImage = ref<string | null>(null)
const imageUrlInput = ref('')
const canUseImage = computed(() => selectedModelEntity.value?.capabilities?.includes('image-to-text'))
const capabilityTags = computed(() => selectedModelEntity.value?.capabilities ?? [])
const capabilityLabel: Record<string, string> = {
  'text-to-text': '文生文',
  'text-to-image': '文生图',
  'image-to-text': '多模态输入',
  'image-to-image': '图像编辑',
}

const md: MarkdownIt = new MarkdownIt({
  highlight: (str: string, lang: string) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre class="hljs"><code>' +
               hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
               '</code></pre>';
      } catch (__) {}
    }
    return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
  }
});

const renderMarkdown = (content: string) => md.render(content)

const scrollToBottom = () => {
  nextTick(() => {
    if (messageContainer.value) {
      messageContainer.value.scrollTop = messageContainer.value.scrollHeight
    }
  })
}

watch(messages, () => scrollToBottom(), { deep: true })
watch(canUseImage, (val) => {
  if (!val) {
    uploadedImage.value = null
    imageUrlInput.value = ''
  }
})

const fetchModels = async () => {
  try {
    const textPromise = listModels({ status: '1', capability: 'text-to-text', pageSize: 100 });
    const imagePromise = listModels({ status: '1', capability: 'image-to-text', pageSize: 100 });

    const [textResult, imageResult] = await Promise.all([textPromise, imagePromise]);

    const allModels = [...textResult.records, ...imageResult.records];
    const uniqueModels = Array.from(new Map(allModels.map(m => [m.id, m])).values());
    
    models.value = uniqueModels;
    
    if (uniqueModels.length > 0) {
      selectedModel.value = uniqueModels[0]!.modelIdentifier;
    }
  } catch {
    ElMessage.error('获取模型列表失败');
  }
};

const handleImageUpload = (options: any) => {
  if (!canUseImage.value) {
    ElMessage.warning('当前模型不支持图片输入')
    return
  }
  const { file, onSuccess } = options
  const reader = new FileReader()
  reader.onload = (e) => {
    uploadedImage.value = e.target?.result as string
    onSuccess()
  }
  reader.readAsDataURL(file)
  return {
    abort: () => {
      uploadedImage.value = null
    }
  }
}

const clearUploadedImage = () => {
  uploadedImage.value = null
  imageUrlInput.value = ''
}

const applyImageUrl = () => {
  if (!canUseImage.value) return
  if (!imageUrlInput.value.trim()) return
  uploadedImage.value = imageUrlInput.value.trim()
}

const handleSend = async () => {
  if ((!userInput.value.trim() && !uploadedImage.value) || isResponding.value) return
  if (!authStore.sessionAccessKey) {
    ElMessage.warning('请先设置 Access Key')
    isKeyModalVisible.value = true
    return
  }
  if (uploadedImage.value && !canUseImage.value) {
    ElMessage.warning('当前模型不支持图片输入')
    return
  }

  const userMessage: ChatMessage = {
    id: uuidv4(),
    role: 'user',
    content: userInput.value,
    imageUrl: uploadedImage.value || undefined
  }
  messages.value.push(userMessage)

  const assistantMessage: ChatMessage = {
    id: uuidv4(),
    role: 'assistant',
    content: '',
  }
  messages.value.push(assistantMessage)
  
  isResponding.value = true
  userInput.value = ''
  uploadedImage.value = null

  try {
    const apiMessages: OpenAiMessage[] = messages.value
      .slice(0, -1) // Exclude the empty assistant message
      .map(m => {
        const content: any = [];
        if (m.content) {
          content.push({ type: 'text', text: m.content });
        }
        if (m.imageUrl) {
          content.push({ type: 'image_url', image_url: { url: m.imageUrl } });
        }
        
        // Ensure content is not empty
        if (content.length === 0) {
            content.push({ type: 'text', text: '' });
        }

        // If there's only an image, the content for OpenAI should be an array.
        // If there's only text, it can be a string. Let's keep it consistent as an array.
        return { role: m.role, content };
      });


    const response = await chatCompletion(
      {
        model: selectedModel.value,
        messages: apiMessages,
        stream: false,
      },
      authStore.sessionAccessKey
    )

    const content = response.choices?.[0]?.message?.content
    let textContent = ''

    if (content) {
      if (typeof content === 'string') {
        textContent = content
      } else if (Array.isArray(content)) {
        const textPart = content.find(part => part.type === 'text')
        if (textPart && typeof textPart.text === 'string') {
          textContent = textPart.text
        }
      }
    }
    
    if (textContent) {
      const lastMsg = messages.value[messages.value.length - 1]
      if (lastMsg && lastMsg.role === 'assistant') {
        lastMsg.content = textContent
      }
    } else {
      ElMessage.error('未能获取到有效的 AI 响应内容')
      const lastMsg = messages.value[messages.value.length - 1]
      if (lastMsg && lastMsg.role === 'assistant') {
          lastMsg.content += '\n\n**请求失败: 无有效内容**'
      }
    }
  } catch (error: any) {
    ElMessage.error('请求 AI 聊天失败: ' + (error.message || '未知错误'))
    const lastMsg = messages.value[messages.value.length - 1]
    if (lastMsg && lastMsg.role === 'assistant') {
        lastMsg.content += '\n\n**请求失败**'
    }
  } finally {
    isResponding.value = false
  }
}

const handleSetKey = () => {
  if (sessionKeyInput.value.trim()) {
    authStore.setSessionAccessKey(sessionKeyInput.value.trim())
    isKeyModalVisible.value = false
    ElMessage.success('Access Key 已设置')
  }
}

onMounted(() => {
  fetchModels()
  authStore.ensureSessionAccessKey().then((key) => {
    if (!key) {
      isKeyModalVisible.value = true
    }
  })
})
</script>

<style scoped>
.chat-view {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 18px;
  height: calc(100vh - var(--app-header-height));
  padding: 20px 24px;
  background: transparent;
}

.chat-view__sidebar {
  background: linear-gradient(180deg, #0f172a 0%, #0b1224 100%);
  border-radius: 18px;
  color: #fff;
  padding: 18px;
  box-shadow: var(--app-shadow-soft);
  display: flex;
  flex-direction: column;
  gap: 12px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.chat-view__sidebar-header h3 {
  margin: 4px 0 6px;
  font-size: 18px;
}

.chat-view__sidebar .eyebrow {
  color: rgba(255, 255, 255, 0.7);
}

.chat-view__sidebar-card,
.chat-view__history-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 12px;
  border-radius: 12px;
  backdrop-filter: blur(6px);
}

.chat-view__sidebar-content {
  flex: 1;
  overflow-y: auto;
}

.chat-view__sidebar-label {
  margin: 0 0 8px;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: rgba(255, 255, 255, 0.68);
}

.chat-view__main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
}

.chat-view__hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 20px;
  border-radius: 18px;
  background: linear-gradient(120deg, rgba(37, 99, 235, 0.16), rgba(14, 165, 233, 0.18), rgba(255, 255, 255, 0.5));
  border: 1px solid #dbeafe;
  box-shadow: var(--app-shadow-soft);
  position: relative;
  overflow: hidden;
}

.chat-view__hero::after {
  content: '';
  position: absolute;
  right: -40px;
  top: -30px;
  width: 220px;
  height: 220px;
  background: radial-gradient(circle, rgba(37, 99, 235, 0.25), transparent 60%);
  filter: blur(10px);
}

.chat-view__hero h2 {
  margin: 4px 0 6px;
}

.chat-view__hero-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  z-index: 1;
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid #e0e7ff;
  color: #1f2937;
  font-weight: 600;
  font-size: 12px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
}

.pill--live {
  background: linear-gradient(90deg, #ef4444, #f97316);
  color: #fff;
  border: none;
  animation: pulse 1.6s infinite;
}

.pill--muted {
  background: rgba(255, 255, 255, 0.7);
  border-color: #e5e7eb;
  color: #475569;
}

.eyebrow {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 12px;
  color: #6b7280;
}

.chat-view__surface {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.94);
  border-radius: 20px;
  border: 1px solid #e5e7eb;
  box-shadow: var(--app-shadow-soft);
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.chat-view__surface :deep(.arco-layout-content) {
  flex: 1;
  display: flex;
}

.chat-view__surface :deep(.arco-layout-footer) {
  border: none;
  padding: 0;
}

.message-list {
  flex: 1;
  padding: 24px 28px;
  overflow-y: auto;
  background:
    radial-gradient(circle at 14% 20%, rgba(37, 99, 235, 0.06), transparent 30%),
    radial-gradient(circle at 84% 10%, rgba(14, 165, 233, 0.07), transparent 30%),
    #f8fafc;
}

.message-item {
  display: flex;
  gap: 12px;
  margin-bottom: 22px;
  animation: fadeInUp 0.2s ease;
}

.message-item__avatar {
  margin-top: 4px;
}

.message-item__content {
  max-width: 72%;
  display: grid;
  gap: 8px;
}

.message-item__bubble {
  padding: 12px 16px;
  border-radius: 16px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  line-height: 1.6;
  box-shadow: 0 12px 40px rgba(15, 23, 42, 0.08);
}

.message-item--user {
  justify-content: flex-end;
}
.message-item--user .message-item__content {
  order: -1;
}

.message-item--user .message-item__bubble {
  background: linear-gradient(135deg, #2563eb, #0ea5e9);
  color: #fff;
  border: none;
  box-shadow: 0 14px 36px rgba(37, 99, 235, 0.32);
}

.input-area {
  padding: 14px 18px;
  border-top: 1px solid #eef2f7;
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.95), rgba(255, 255, 255, 0.9));
}

.input-area__shell {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 12px 14px;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
}

.input-area__text {
  flex: 1;
  position: relative;
}

.input-area__hint {
  margin-top: 8px;
  font-size: 12px;
  color: var(--app-muted);
}

.image-preview {
  position: absolute;
  left: 10px;
  top: 10px;
  z-index: 1;
  background: #fff;
  padding: 4px;
  border-radius: 10px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
}

.image-preview__remove {
  position: absolute;
  top: -10px;
  right: -10px;
}

.input-area :deep(.arco-textarea) {
  padding-left: 70px;
  border-radius: 12px;
  border-color: #e5e7eb;
  background: #f9fbff;
  min-height: 64px;
}

.message-list::-webkit-scrollbar {
  width: 8px;
}
.message-list::-webkit-scrollbar-thumb {
  background: rgba(15, 23, 42, 0.2);
  border-radius: 999px;
}

@keyframes pulse {
  0% {
    transform: translateZ(0);
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
