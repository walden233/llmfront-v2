<template>
  <div class="app-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>供应商管理</span>
          <el-button type="primary" @click="handleOpenForm()">创建供应商</el-button>
        </div>
      </template>

      <el-table :data="providers" v-loading="loading" style="width: 100%">
        <el-table-column prop="name" label="名称" width="250" />
        <el-table-column prop="urlBase" label="API 地址" />
        <el-table-column prop="createdAt" label="创建时间" width="200" />
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-space :size="8" wrap>
              <el-button link type="primary" size="small" @click="handleOpenKeys(row)">管理 API Key</el-button>
              <el-button link type="primary" size="small" @click="handleOpenForm(row)">编辑</el-button>
              <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
            </el-space>
          </template>
        </el-table-column>
      </el-table>

       <el-pagination
        background
        layout="prev, pager, next, total"
        :total="total"
        :page-size="pageSize"
        :current-page="pageNum"
        @current-change="handlePageChange"
        class="mt-4"
      />
    </el-card>

    <!-- Provider Form Dialog -->
    <el-dialog v-model="isFormVisible" :title="form.id ? '编辑供应商' : '创建供应商'" width="600px">
      <el-form :model="form" ref="formRef" label-width="100px">
        <el-form-item label="名称" prop="name" required>
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="API 地址" prop="urlBase">
          <el-input v-model="form.urlBase" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="isFormVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">提交</el-button>
      </template>
    </el-dialog>

    <!-- Provider Keys Dialog -->
    <el-dialog
      v-model="isKeyDialogVisible"
      :title="selectedProvider ? `管理 ${selectedProvider.name} 的 API Key` : '管理 API Key'"
      width="640px"
    >
      <div class="key-toolbar">
        <el-input
          v-model="newKeyValue"
          size="small"
          placeholder="输入新的 API Key"
          clearable
          style="max-width: 320px"
        />
        <el-button type="primary" size="small" :loading="creatingKey" @click="handleCreateKey">
          新增 Key
        </el-button>
      </div>

      <el-table :data="providerKeys" v-loading="keyLoading" border size="small">
        <el-table-column label="Key" min-width="200">
          <template #default="{ row }">
            {{ row.maskedApiKey || row.apiKey || '***' }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="140">
          <template #default="{ row }">
            <el-switch
              :model-value="isKeyActive(row)"
              :loading="Boolean(statusLoading[row.id])"
              @change="(val) => handleToggleKey(row, val as boolean)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-popconfirm title="确认删除该 Key？" @confirm="() => handleDeleteKey(row)">
              <template #reference>
                <el-button link type="danger" size="small">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-if="!keyLoading && providerKeys.length === 0" description="暂无 Key" class="mt-4" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  listProviders,
  createProvider,
  updateProvider,
  deleteProvider,
  listProviderKeys,
  createProviderKey,
  updateProviderKeyStatus,
  deleteProviderKey,
} from '@/api/admin'
import type { Provider, ProviderKey } from '@/types/provider'

const providers = ref<Provider[]>([])
const loading = ref(false)
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)
const isFormVisible = ref(false)
const isKeyDialogVisible = ref(false)
const selectedProvider = ref<Provider | null>(null)
const providerKeys = ref<ProviderKey[]>([])
const keyLoading = ref(false)
const creatingKey = ref(false)
const newKeyValue = ref('')
const statusLoading = ref<Record<number, boolean>>({})

const initialFormState = {
  id: undefined as number | undefined,
  name: '',
  urlBase: ''
}
const form = reactive({ ...initialFormState })

const fetchProviders = async () => {
  loading.value = true
  try {
    const { records, total: totalItems } = await listProviders({
        pageNum: pageNum.value,
        pageSize: pageSize.value
    })
    providers.value = records
    total.value = totalItems
  } catch {
    ElMessage.error('获取供应商列表失败')
  } finally {
    loading.value = false
  }
}

const handlePageChange = (currentPage: number) => {
  pageNum.value = currentPage
  fetchProviders()
}

const handleOpenForm = (provider?: Provider) => {
  Object.assign(form, initialFormState);
  if (provider) {
    Object.assign(form, provider);
  }
  isFormVisible.value = true
}

const handleOpenKeys = (provider: Provider) => {
  selectedProvider.value = provider
  isKeyDialogVisible.value = true
  newKeyValue.value = ''
  fetchProviderKeys(provider.id)
}

const fetchProviderKeys = async (providerId: number) => {
  keyLoading.value = true
  try {
    providerKeys.value = await listProviderKeys(providerId)
  } catch {
    ElMessage.error('获取 Provider Key 失败')
  } finally {
    keyLoading.value = false
  }
}

const handleCreateKey = async () => {
  if (!selectedProvider.value) return
  if (!newKeyValue.value.trim()) {
    ElMessage.warning('请输入 API Key')
    return
  }
  creatingKey.value = true
  try {
    const created = await createProviderKey({
      providerId: selectedProvider.value.id,
      apiKey: newKeyValue.value.trim(),
    })
    providerKeys.value.unshift(created)
    newKeyValue.value = ''
    ElMessage.success('新增 Key 成功')
  } catch {
    ElMessage.error('新增 Key 失败')
  } finally {
    creatingKey.value = false
  }
}

const handleToggleKey = async (key: ProviderKey, status: boolean) => {
  statusLoading.value[key.id] = true
  try {
    await updateProviderKeyStatus(key.id, { status })
    key.status = status
    ElMessage.success('状态已更新')
  } catch {
    ElMessage.error('更新状态失败')
  } finally {
    statusLoading.value[key.id] = false
  }
}

const handleDeleteKey = (key: ProviderKey) => {
  ElMessageBox.confirm('删除后不可恢复，确认删除该 Key 吗？', '提示', { type: 'warning' })
    .then(async () => {
      await deleteProviderKey(key.id)
      providerKeys.value = providerKeys.value.filter((item) => item.id !== key.id)
      ElMessage.success('删除成功')
    })
    .catch(() => {})
}

const isKeyActive = (key: ProviderKey) => key.status === true || key.status === 1

const handleSubmit = async () => {
    try {
        if (form.id) {
            await updateProvider(form.id, form);
            ElMessage.success("更新成功");
        } else {
            await createProvider(form);
            ElMessage.success("创建成功");
        }
        isFormVisible.value = false;
        await fetchProviders();
    } catch {
        ElMessage.error("操作失败");
    }
}

const handleDelete = (provider: Provider) => {
    ElMessageBox.confirm(`确定要删除供应商 ${provider.name} 吗? 这会一并删除其下的模型和 API Keys。`, '严重警告', {
        type: 'warning'
    }).then(async () => {
        await deleteProvider(provider.id);
        ElMessage.success("删除成功");
        await fetchProviders();
    }).catch(() => {});
}

onMounted(fetchProviders)
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.mt-4 {
  margin-top: 16px;
}

.key-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}
</style>
