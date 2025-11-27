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
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleOpenForm(row)">编辑</el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { listProviders, createProvider, updateProvider, deleteProvider } from '@/api/admin'
import type { Provider } from '@/types/provider'

const providers = ref<Provider[]>([])
const loading = ref(false)
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)
const isFormVisible = ref(false)

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
</style>
