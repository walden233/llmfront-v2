<template>
  <div>
    <p class="auth-title">欢迎回来</p>
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @keyup.enter="handleSubmit">
      <el-form-item label="用户名" prop="username">
        <el-input v-model.trim="form.username" placeholder="请输入用户名" />
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input v-model.trim="form.password" type="password" placeholder="请输入密码" show-password />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" class="auth-submit" :loading="authStore.loading" @click="handleSubmit">
          登录
        </el-button>
      </el-form-item>
      <p class="auth-action">
        还没有账号？
        <RouterLink to="/register">立即注册</RouterLink>
      </p>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const formRef = ref<FormInstance>()
const form = reactive({
  username: '',
  password: '',
})

const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate()
  await authStore.login(form)
  const redirect = (route.query.redirect as string) || '/dashboard'
  router.replace(redirect)
}
</script>

<style scoped>
.auth-title {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 16px;
}

.auth-submit {
  width: 100%;
}

.auth-action {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.auth-action a {
  color: #165dff;
}
</style>
