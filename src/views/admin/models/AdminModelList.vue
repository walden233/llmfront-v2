<template>
  <div class="app-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>模型管理</span>
          <el-button type="primary" @click="handleOpenForm()">创建模型</el-button>
        </div>
      </template>

      <el-table :data="models" v-loading="loading" style="width: 100%">
        <el-table-column prop="displayName" label="模型名称" width="200" />
        <el-table-column prop="modelIdentifier" label="模型标识" width="200" />
        <el-table-column prop="providerName" label="提供商" width="150" />
        <el-table-column prop="priority" label="优先级" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-switch
              :model-value="row.status === 1"
              @change="(val) => handleStatusChange(row, val as boolean)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
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

    <!-- Model Form Dialog -->
    <el-dialog v-model="isFormVisible" :title="form.id ? '编辑模型' : '创建模型'" width="600px">
      <el-form :model="form" ref="formRef" label-width="100px">
        <el-form-item label="显示名称" prop="displayName" required>
          <el-input v-model="form.displayName" />
        </el-form-item>
        <el-form-item label="模型标识" prop="modelIdentifier" required>
          <el-input v-model="form.modelIdentifier" />
        </el-form-item>
        <el-form-item label="提供商" prop="providerId" required>
           <el-select v-model="form.providerId" placeholder="选择提供商">
            <el-option v-for="p in providers" :key="p.id" :label="p.name" :value="p.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="功能" prop="capabilities" required>
           <el-select v-model="form.capabilities" multiple placeholder="选择模型功能">
            <el-option label="文生文" value="text-to-text" />
            <el-option label="文生图" value="text-to-image" />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级" prop="priority" required>
          <el-input-number v-model="form.priority" :min="1" />
        </el-form-item>
         <el-form-item label="定价" prop="pricing">
          <el-input v-model="form.pricing" type="textarea" :rows="3" placeholder='例如：{"inputPricePerThousandTokens": 0.001, "outputPricePerThousandTokens": 0.002}'/>
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
import { listModels, createModel, updateModel, deleteModel, updateModelStatus, listProviders } from '@/api/admin'
import type { Model, ModelCapability } from '@/types/model'
import type { Provider } from '@/types/provider'


const models = ref<Model[]>([])
const providers = ref<Provider[]>([])
const loading = ref(false)
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)
const isFormVisible = ref(false)

const initialFormState = {
  id: undefined as number | undefined,
  displayName: '',
  modelIdentifier: '',
  providerId: '' as string,
  capabilities: [] as ModelCapability[],
  priority: 100,
  pricing: ''
}
const form = reactive({ ...initialFormState })


const fetchModels = async () => {
  loading.value = true
  try {
    const { records, total: totalItems } = await listModels({
      pageNum: pageNum.value,
      pageSize: pageSize.value,
    })
    models.value = records
    total.value = totalItems
  } catch (error) {
    ElMessage.error('获取模型列表失败')
  } finally {
    loading.value = false
  }
}

const fetchProviders = async () => {
    try {
        const { records } = await listProviders({ pageNum: 1, pageSize: 1000});
        providers.value = records;
    } catch {
        ElMessage.error("获取提供商列表失败");
    }
}


const handlePageChange = (currentPage: number) => {
  pageNum.value = currentPage
  fetchModels()
}

const handleOpenForm = (model?: Model) => {
  Object.assign(form, initialFormState); // Reset form
  if (model) {
    Object.assign(form, {
        ...model,
        providerId: String(model.providerId),
        pricing: JSON.stringify(model.pricing, null, 2)
    });
  }
  isFormVisible.value = true
}

const handleSubmit = async () => {
    try {
        const payload = {
            ...form,
            pricing: JSON.parse(form.pricing),
            providerId: String(form.providerId)
        }
        if(form.id) {
            await updateModel(form.id, payload)
            ElMessage.success('模型更新成功')
        } else {
            await createModel(payload)
            ElMessage.success('模型创建成功')
        }
        isFormVisible.value = false;
        await fetchModels();
    } catch {
        ElMessage.error("操作失败，请检查输入");
    }
}

const handleDelete = (model: Model) => {
    ElMessageBox.confirm(`确定要删除模型 ${model.displayName} 吗?`, '警告', {
        type: 'warning'
    }).then(async () => {
        await deleteModel(model.id);
        ElMessage.success("删除成功");
        await fetchModels();
    }).catch(() => {});
}

const handleStatusChange = async (model: Model, newStatus: boolean) => {
    try {
        await updateModelStatus(model.id, { status: newStatus ? 1 : 0});
        ElMessage.success("状态更新成功");
        model.status = newStatus ? 1 : 0;
    } catch {
         ElMessage.error("状态更新失败");
    }
}

onMounted(() => {
  fetchModels()
  fetchProviders()
})
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
