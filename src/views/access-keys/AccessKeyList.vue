<template>
  <div class="app-page">
    <div class="page-header">
      <div>
        <h2>Access Key 管理</h2>
        <p class="text-muted">创建/删除 Access Key，并在模型测试工具中临时使用。</p>
      </div>
      <div class="page-actions">
        <el-button type="success" plain @click="promptSetKey">设置调试 Key</el-button>
        <el-button @click="refreshKeys" :loading="loading">刷新</el-button>
        <el-button type="primary" :loading="creating" @click="handleCreate">创建 Access Key</el-button>
      </div>
    </div>

    <el-table :data="keys" v-loading="loading" border>
      <el-table-column prop="maskedKeyValue" label="Key" min-width="240">
        <template #default="{ row }">
          {{ row.maskedKeyValue || row.keyValue }}
        </template>
      </el-table-column>
      <el-table-column prop="isActive" label="状态" width="120">
        <template #default="{ row }">
          <el-tag :type="row.isActive ? 'success' : 'info'">{{ row.isActive ? '已启用' : '已禁用' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="200" />
      <el-table-column label="操作" width="160">
        <template #default="{ row }">
          <el-popconfirm title="确认删除该 Access Key 吗？" @confirm="() => handleDelete(row)">
            <template #reference>
              <el-button link type="danger">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <el-empty v-if="!loading && keys.length === 0" description="暂无 Access Key" class="mt-24" />

    <el-dialog v-model="createDialogVisible" title="Access Key 创建成功" width="520px">
      <el-alert
        title="仅在此处展示一次，请妥善保管。"
        type="warning"
        show-icon
        class="mb-16"
      />
      <el-input v-model="newKeyValue" readonly>
        <template #append>
          <el-button @click="copyKey">复制</el-button>
        </template>
      </el-input>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="createDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { listAccessKeys, createAccessKey, deleteAccessKey } from '@/api/access-keys'
import type { AccessKeyItem } from '@/types/access-key'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const loading = ref(false)
const creating = ref(false)
const keys = ref<AccessKeyItem[]>([])
const createDialogVisible = ref(false)
const newKeyValue = ref('')

const refreshKeys = async () => {
  loading.value = true
  try {
    keys.value = await listAccessKeys()
  } finally {
    loading.value = false
  }
}

const handleCreate = async () => {
  creating.value = true
  try {
    const result = await createAccessKey()
    newKeyValue.value = result.keyValue
    authStore.setSessionAccessKey(result.keyValue)
    createDialogVisible.value = true
    await refreshKeys()
  } finally {
    creating.value = false
  }
}

const handleDelete = async (row: AccessKeyItem) => {
  await deleteAccessKey(row.id)
  ElMessage.success('删除成功')
  await refreshKeys()
}

const copyKey = async () => {
  if (!newKeyValue.value) return
  await navigator.clipboard.writeText(newKeyValue.value)
  ElMessage.success('复制成功')
}

const promptSetKey = async () => {
  try {
    const { value } = await ElMessageBox.prompt('请输入完整 Access Key，将仅保存在当前会话中。', '设置调试 Key', {
      inputValue: newKeyValue.value,
      inputPlaceholder: '例如 ak-xxxx',
      confirmButtonText: '保存',
      cancelButtonText: '取消',
    })
    if (value) {
      authStore.setSessionAccessKey(value.trim())
      ElMessage.success('当前会话 Access Key 已更新')
    }
  } catch (error) {
    // 用户取消
  }
}

onMounted(() => {
  refreshKeys()
})
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 16px;
}

.page-actions {
  display: flex;
  gap: 12px;
}

.mt-24 {
  margin-top: 24px;
}

.mb-16 {
  margin-bottom: 16px;
}
</style>
