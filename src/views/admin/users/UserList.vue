<template>
  <div class="app-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
        </div>
      </template>

      <div class="filter-bar" style="margin-bottom: 20px;">
        <el-select v-model="roleFilter" placeholder="按角色筛选" clearable>
          <el-option v-for="role in roles" :key="role" :label="role" :value="role" />
        </el-select>
      </div>

      <el-table :data="users" v-loading="loading" style="width: 100%" @sort-change="handleSortChange">
        <el-table-column prop="username" label="用户名" width="180" sortable="custom" />
        <el-table-column prop="email" label="邮箱" width="220" />
        <el-table-column prop="balance" label="余额" width="120" sortable="custom">
           <template #default="{ row }">
            ¥{{ row.balance.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="role" label="角色" width="200">
           <template #default="{ row }">
            <el-select :model-value="row.role" @change="(newRole) => handleRoleChange(row, newRole)">
              <el-option v-for="role in roles" :key="role" :label="role" :value="role" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="注册时间" sortable="custom" />
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
import { ref, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { listUsers, assignRole } from '@/api/admin'
import type { User } from '@/types/user'
import type { UserRole } from '@/types/auth'

const users = ref<User[]>([])
const loading = ref(false)
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)
const roles: UserRole[] = ['ROLE_ROOT_ADMIN', 'ROLE_MODEL_ADMIN', 'ROLE_USER']
const roleFilter = ref<UserRole | ''>('')
const sortBy = ref('id')
const sortOrder = ref('desc')

const fetchUsers = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      role: roleFilter.value || undefined,
      sortBy: sortBy.value,
      sortOrder: sortOrder.value
    };
    const { records, total: totalItems } = await listUsers(params)
    users.value = records
    total.value = totalItems
  } catch {
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

const handlePageChange = (currentPage: number) => {
  pageNum.value = currentPage
  fetchUsers()
}

const handleSortChange = ({ prop, order }: { prop: string, order: 'ascending' | 'descending' | null }) => {
  if (order) {
    sortBy.value = prop
    sortOrder.value = order === 'ascending' ? 'asc' : 'desc'
  } else {
    sortBy.value = 'id'
    sortOrder.value = 'desc'
  }
  fetchUsers()
}

watch(roleFilter, () => {
  pageNum.value = 1 // Reset to first page when filter changes
  fetchUsers()
})


const handleRoleChange = async (user: User, newRole: UserRole) => {
    try {
        await assignRole({ userId: user.id, role: newRole });
        ElMessage.success(`用户 ${user.username} 的角色已更新为 ${newRole}`);
        user.role = newRole; // Optimistic update
    } catch {
        ElMessage.error("角色更新失败");
    }
}

onMounted(fetchUsers)
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
