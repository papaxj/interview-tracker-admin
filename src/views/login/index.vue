<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { login } from '@/api/user'
import { useAppStore } from '@/stores/app'
import { setToken } from '@/utils/auth'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive({
  username: '',
  password: '',
})

const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    const res = await login(form)
    setToken(res.token)
    if (res.type === 'my' && 'id' in res.user) {
      appStore.setCurrentUser(res.user.id)
    }
    const redirect = (route.query.redirect as string) || '/dashboard'
    router.push(redirect)
  } catch (err) {
    const message = err instanceof Error ? err.message : '登录失败，请检查用户名或后端服务'
    ElMessage.error(message)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-brand">
        <span class="login-brand__logo">AT</span>
        <h1 class="login-brand__title">面试追踪</h1>
        <p class="login-brand__sub">智能面试流程管理平台</p>
      </div>
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="login-form">
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="form.username"
            placeholder="系统用户名或业务用户名"
            size="large"
          />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            show-password
            placeholder="请输入密码"
            size="large"
            @keyup.enter="handleSubmit"
          />
        </el-form-item>
        <el-button
          type="primary"
          :loading="loading"
          class="login-btn"
          size="large"
          @click="handleSubmit"
        >
          登录
        </el-button>
      </el-form>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #f5f6fa;
}

.login-card {
  width: 400px;
  padding: 44px 40px;
  background: #fff;
  border: 1px solid $border-color;
  border-radius: 10px;
}

.login-brand {
  text-align: center;
  margin-bottom: 36px;

  &__logo {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 10px;
    background: $primary-color;
    color: #fff;
    font-size: 16px;
    font-weight: 700;
    letter-spacing: 0.05em;
    margin-bottom: 14px;
  }

  &__title {
    font-size: 20px;
    font-weight: 700;
    color: $text-color;
    margin: 0 0 4px;
  }

  &__sub {
    font-size: 13px;
    color: $text-secondary;
    margin: 0;
  }
}

.login-form {
  :deep(.el-form-item__label) {
    font-weight: 500;
  }
}

.login-btn {
  width: 100%;
  height: 42px;
  margin-top: 4px;
  border-radius: $radius;
  font-weight: 600;
  font-size: 14px;
}
</style>
