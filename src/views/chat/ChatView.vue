<template>
  <div class="chat-view">
    <div class="chat-view__sidebar">
      <div class="chat-view__sidebar-header">
        <a-select v-model="selectedModel" placeholder="选择模型">
          <a-option v-for="model in models" :key="model.modelIdentifier" :value="model.modelIdentifier">
            {{ model.displayName }}
          </a-option>
        </a-select>
      </div>
      <div class="chat-view__sidebar-content">
        <!-- Placeholder for chat history list -->
        <p class="text-muted">会话列表即将推出。</p>
      </div>
    </div>
    <div class="chat-view__main">
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
        <div class="input-area__upload">
          <a-upload
            :show-file-list="false"
            :custom-request="handleImageUpload"
            accept="image/*"
          >
            <template #upload-button>
              <a-button>
                <icon-upload />
              </a-button>
            </template>
          </a-upload>
        </div>
        <div class="input-area__text">
          <div v-if="uploadedImage" class="image-preview">
            <a-image :src="uploadedImage" width="40" height="40" />
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
      </a-layout-footer>
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
import { ref, onMounted, nextTick, watch } from 'vue'
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
const messages = ref<ChatMessage[]>([])
const userInput = ref('')
const isResponding = ref(false)
const messageContainer = ref<HTMLElement | null>(null)
const isKeyModalVisible = ref(false)
const sessionKeyInput = ref('')
const uploadedImage = ref<string | null>(null)

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
}

const handleSend = async () => {
  if ((!userInput.value.trim() && !uploadedImage.value) || isResponding.value) return
  if (!authStore.sessionAccessKey) {
    ElMessage.warning('请先设置 Access Key')
    isKeyModalVisible.value = true
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
  if (!authStore.sessionAccessKey) {
    isKeyModalVisible.value = true
  }
})
</script>

<style scoped>
.chat-view {
  display: flex;
  height: calc(100vh - var(--app-header-height));
  background-color: #f7f7f8;
}

.chat-view__sidebar {
  width: 260px;
  background-color: #fff;
  border-right: 1px solid #e5e6eb;
  display: flex;
  flex-direction: column;
}

.chat-view__sidebar-header {
  padding: 16px;
  border-bottom: 1px solid #e5e6eb;
}

.chat-view__sidebar-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

.chat-view__main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #fff;
}

.message-list {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.message-item {
  display: flex;
  margin-bottom: 20px;
}

.message-item__avatar {
  margin-right: 16px;
}

.message-item__content {
  max-width: 80%;
}

.message-item__bubble {
  padding: 12px 16px;
  border-radius: 18px;
  background-color: #f2f3f5;
  line-height: 1.6;
}

.message-item--user {
  justify-content: flex-end;
}
.message-item--user .message-item__content {
  order: -1;
}

.message-item--user .message-item__avatar {
  margin-left: 16px;
  margin-right: 0;
}

.message-item--user .message-item__bubble {
  background-color: #1677ff;
  color: #fff;
}

.input-area {
  padding: 16px 24px;
  border-top: 1px solid #e5e6eb;
  background-color: #fff;
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.input-area__text {
  flex: 1;
  position: relative;
}

.image-preview {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
  background: #fff;
  padding: 2px;
  border-radius: 4px;
  box-shadow: 0 0 5px rgba(0,0,0,0.2);
}

.image-preview__remove {
  position: absolute;
  top: -8px;
  right: -8px;
}

.input-area .a-textarea {
  padding-left: 60px; /* Make space for image preview */
}
</style>