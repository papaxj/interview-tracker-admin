<script setup lang="ts">
import { useAppStore } from '@/stores/app'
import { Expand, Fold } from '@element-plus/icons-vue'

const appStore = useAppStore()
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
}
</style>
