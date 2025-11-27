<template>
  <div class="app-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>我的订单</span>
          <el-button type="primary" @click="handleCreateOrder">创建新订单</el-button>
        </div>
      </template>

      <el-table :data="orders" v-loading="loading" style="width: 100%">
        <el-table-column prop="orderNo" label="订单号" width="220" />
        <el-table-column prop="amount" label="金额 (元)" width="120">
          <template #default="{ row }">
            {{ row.amount.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ new Date(row.createdAt).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button
              link
              type="primary"
              size="small"
              @click="handleCancelOrder(row)"
              :disabled="row.status !== 'PENDING'"
            >
              取消订单
            </el-button>
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { listMyOrders, createOrder, cancelOrder } from '@/api/order'
import type { Order, OrderStatus } from '@/types/order'

const authStore = useAuthStore()
const orders = ref<Order[]>([])
const loading = ref(false)
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)

const fetchOrders = async () => {
  loading.value = true
  try {
    const { records, total: totalItems } = await listMyOrders({
      pageNum: pageNum.value,
      pageSize: pageSize.value,
    })
    orders.value = records
    total.value = totalItems
  } catch (error) {
    ElMessage.error('获取订单列表失败')
  } finally {
    loading.value = false
  }
}

const statusType = (status: OrderStatus) => {
  switch (status) {
    case 'PENDING':
      return 'warning'
    case 'COMPLETED':
      return 'success'
    case 'FAILED':
      return 'danger'
    case 'CANCELLED':
      return 'info'
    default:
      return undefined // Return undefined instead of empty string
  }
}

const statusText = (status: OrderStatus) => {
  switch (status) {
    case 'PENDING':
      return '待支付'
    case 'COMPLETED':
      return '已完成'
    case 'FAILED':
      return '已失败'
    case 'CANCELLED':
      return '已取消'
    default:
      return '未知'
  }
}

const handlePageChange = (currentPage: number) => {
  pageNum.value = currentPage
  fetchOrders()
}

const handleCreateOrder = () => {
  ElMessageBox.prompt('请输入充值金额 (元)', '创建新订单', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /^[1-9]\d*(\.\d{1,2})?$/,
    inputErrorMessage: '请输入有效的金额',
  })
    .then(async ({ value }) => {
      if (!authStore.user?.id) {
        ElMessage.error('无法获取用户信息，请重新登录')
        return
      }
      loading.value = true
      try {
        await createOrder({
          userId: authStore.user.id,
          amount: Number(value),
        })
        ElMessage.success('订单创建成功')
        await fetchOrders() // Refresh list
      } catch (error) {
        ElMessage.error('订单创建失败')
      } finally {
        loading.value = false
      }
    })
    .catch(() => {
      ElMessage.info('已取消创建订单')
    })
}

const handleCancelOrder = (order: Order) => {
  ElMessageBox.confirm('确定要取消这个订单吗？', '取消订单', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      loading.value = true
      try {
        await cancelOrder({ orderNo: order.orderNo })
        ElMessage.success('订单已取消')
        await fetchOrders() // Refresh list
      } catch (error) {
        ElMessage.error('取消订单失败')
      } finally {
        loading.value = false
      }
    })
    .catch(() => {
      ElMessage.info('已取消操作')
    })
}

onMounted(() => {
  fetchOrders()
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
