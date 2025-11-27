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
              <div class="message-item__bubble" v-html="renderMarkdown(message.content)"></div>
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
        <a-textarea
          v-model="userInput"
          placeholder="输入消息..."
          :auto-size="{ minRows: 1, maxRows: 5 }"
          @keydown.enter.prevent="handleSend"
        />
        <a-button type="primary" @click="handleSend" :disabled="!userInput.trim() || isResponding">
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
import { chatCompletion } from '@/api/proxy' // Changed import
import type { Model } from '@/types/model'
import type { ChatMessage } from '@/types/chat'
import { ElMessage } from 'element-plus'
import { v4 as uuidv4 } from 'uuid'
import MarkdownIt from 'markdown-it'
import 'highlight.js/styles/github.css';
import hljs from 'highlight.js';

const authStore = useAuthStore()
const models = ref<Model[]>([])
const selectedModel = ref<string>('')
const messages = ref<ChatMessage[]>([])
const userInput = ref('')
const isResponding = ref(false)
const messageContainer = ref<HTMLElement | null>(null)
const isKeyModalVisible = ref(false)
const sessionKeyInput = ref('')

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
    const { records } = await listModels({ status: '1', pageSize: 100 })
    models.value = records
    if (records.length > 0) {
      selectedModel.value = records[0]!.modelIdentifier
    }
  } catch {
    ElMessage.error('获取模型列表失败')
  }
}

const handleSend = async () => {
  if (!userInput.value.trim() || isResponding.value) return
  if (!authStore.sessionAccessKey) {
    ElMessage.warning('请先设置 Access Key')
    isKeyModalVisible.value = true
    return
  }

  const userMessage: ChatMessage = {
    id: uuidv4(),
    role: 'user',
    content: userInput.value,
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

  try {
    const response = await chatCompletion(
      {
        model: selectedModel.value,
        messages: messages.value.slice(0, -1).map(m => ({ role: m.role, content: m.content })),
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
        // Find the first text part in the content array
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
  align-items: center;
  gap: 16px;
}
</style>
