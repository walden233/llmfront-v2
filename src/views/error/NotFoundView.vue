<template>
  <div class="app-page">
    <el-result icon="error" title="页面不存在" sub-title="链接可能已失效或权限不足">
      <template #extra>
        <RouterLink to="/dashboard">
          <el-button type="primary">回到首页</el-button>
        </RouterLink>
      </template>
    </el-result>
  </div>
</template>
