<template>
  <div class="app-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>可用模型</span>
        </div>
      </template>

      <el-table :data="models" v-loading="loading" style="width: 100%">
        <el-table-column prop="displayName" label="模型名称" width="200" />
        <el-table-column prop="modelIdentifier" label="模型标识" width="200" />
        <el-table-column prop="providerName" label="提供商" width="150" />
        <el-table-column prop="capabilities" label="功能">
          <template #default="{ row }">
            <el-tag v-for="cap in row.capabilities" :key="cap" class="mr-2">{{ cap }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="priority" label="优先级" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '在线' : '离线' }}
            </el-tag>
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { listModels } from '@/api/model'
import type { Model } from '@/types/model'

const models = ref<Model[]>([])
const loading = ref(false)
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)

const fetchModels = async () => {
  loading.value = true
  try {
    const { records, total: totalItems } = await listModels({
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      status: '1', // Only show online models to users
      sortBy: 'priority',
      sortOrder: 'asc',
    })
    models.value = records
    total.value = totalItems
  } catch (error) {
    ElMessage.error('获取模型列表失败')
  } finally {
    loading.value = false
  }
}

const handlePageChange = (currentPage: number) => {
  pageNum.value = currentPage
  fetchModels()
}

onMounted(() => {
  fetchModels()
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
.mr-2 {
  margin-right: 8px;
}
</style>
