<template>
  <div class="app-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <div>
            <p class="eyebrow">交易记录</p>
            <span>订单管理</span>
            <p class="text-muted">查看所有订单，支持管理员代支付或取消未完成订单。</p>
          </div>
        </div>
      </template>

      <el-table :data="orders" v-loading="loading" style="width: 100%" class="order-table" border>
        <el-table-column prop="orderNo" label="订单号" width="220" />
        <el-table-column prop="userId" label="用户 ID" width="120" />
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
        <el-table-column label="操作" width="220">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button
                v-if="row.status === 'PENDING'"
                link
                type="success"
                size="small"
                @click="handlePayOrder(row)"
              >
                确认支付
              </el-button>
              <el-button
                link
                type="primary"
                size="small"
                @click="handleCancelOrder(row)"
                :disabled="row.status !== 'PENDING'"
              >
                取消订单
              </el-button>
            </div>
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
import { listOrders } from '@/api/admin'
import { cancelOrder, payOrder } from '@/api/order'
import type { Order, OrderStatus } from '@/types/order'

const orders = ref<Order[]>([])
const loading = ref(false)
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)

const fetchOrders = async () => {
  loading.value = true
  try {
    const { records, total: totalItems } = await listOrders({
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
      return undefined
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
        await fetchOrders()
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

const handlePayOrder = (order: Order) => {
  ElMessageBox.confirm('确认支付该订单吗？确认后将立即完成支付。', '确认支付', {
    confirmButtonText: '确认支付',
    cancelButtonText: '取消',
    type: 'success',
  })
    .then(async () => {
      loading.value = true
      try {
        await payOrder({ orderNo: order.orderNo })
        ElMessage.success('支付成功')
        await fetchOrders()
      } catch (error) {
        ElMessage.error('支付失败')
      } finally {
        loading.value = false
      }
    })
    .catch(() => {
      ElMessage.info('已取消支付')
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
  gap: 8px;
}

.card-header span {
  display: block;
  font-weight: 700;
  font-size: 16px;
  margin-top: 2px;
}

.order-table {
  border-radius: 14px;
  overflow: hidden;
}

.order-table :deep(.el-table__header-wrapper th) {
  background: #f8fafc;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.mt-4 {
  margin-top: 16px;
}
</style>
