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
      <span class="app-header__logo">AT</span>
      <span class="app-header__title">面试追踪</span>
    </div>
    <div class="app-header__right">
      <span class="app-header__label">用户</span>
      <UserSelect />
      <el-button text class="app-header__logout" @click="handleLogout">退出</el-button>
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
  padding: 0 20px;
  background: #fff;
  border-bottom: 1px solid $border-color;

  &__left {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__logo {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 6px;
    background: $primary-color;
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.05em;
  }

  &__title {
    font-size: 14px;
    font-weight: 600;
    color: $text-color;
  }

  &__right {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__label {
    font-size: 12px;
    color: $text-secondary;
  }

  &__logout {
    font-size: 13px;
    color: $text-secondary;
  }
}
</style>
