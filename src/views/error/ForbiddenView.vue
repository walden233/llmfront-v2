<template>
  <div class="app-page">
    <el-result icon="warning" title="无访问权限" sub-title="请联系管理员开启该功能">
      <template #extra>
        <RouterLink to="/dashboard">
          <el-button type="primary">返回首页</el-button>
        </RouterLink>
      </template>
    </el-result>
  </div>
</template>
