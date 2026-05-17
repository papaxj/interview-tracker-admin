<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { removeToken } from '@/utils/auth'
import { Expand, Fold } from '@element-plus/icons-vue'
import UserSelect from '@/components/common/UserSelect.vue'

const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()

onMounted(() => {
  appStore.loadMyUsers()
})

function handleLogout() {
  removeToken()
  userStore.clearProfile()
  router.push('/login')
}
</script>

<template>
  <header class="app-header">
    <div class="app-header__left">
      <el-button
        :icon="appStore.collapsed ? Expand : Fold"
        text
        @click="appStore.toggleSidebar()"
      />
      <span class="app-header__title">面试追踪管理后台</span>
    </div>
    <div class="app-header__right">
      <span class="app-header__label">当前用户</span>
      <UserSelect />
      <el-button type="danger" text @click="handleLogout">退出登录</el-button>
    </div>
  </header>
</template>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: $header-height;
  padding: 0 16px;
  background: #fff;
  border-bottom: 1px solid #ebeef5;

  &__left {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__title {
    font-size: 16px;
    font-weight: 600;
  }

  &__right {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__label {
    font-size: 13px;
    color: #909399;
  }
}
</style>
