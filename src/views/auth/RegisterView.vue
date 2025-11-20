<template>
  <div>
    <p class="auth-title">创建新账号</p>
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
      <el-form-item label="用户名" prop="username">
        <el-input v-model.trim="form.username" placeholder="请输入用户名" />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model.trim="form.email" placeholder="可选，便于接收通知" />
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input v-model="form.password" type="password" placeholder="设置登录密码" show-password />
      </el-form-item>
      <el-form-item>
        <el-button class="auth-submit" type="primary" :loading="authStore.loading" @click="handleSubmit">
          注册
        </el-button>
      </el-form-item>
      <p class="auth-action">
        已有账号？<RouterLink to="/login">返回登录</RouterLink>
      </p>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const formRef = ref<FormInstance>()
const form = reactive({
  username: '',
  email: '',
  password: '',
})

const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, message: '用户名至少 3 个字符', trigger: 'blur' },
  ],
  email: [{ type: 'email', message: '邮箱格式不正确', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少 6 个字符', trigger: 'blur' },
  ],
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate()
  await authStore.register(form)
  router.push({ name: 'Login' })
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
