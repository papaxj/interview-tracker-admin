<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import {
  DataBoard,
  OfficeBuilding,
  Document,
  Trophy,
  Collection,
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

const activeMenu = computed(() => route.path)

const menuItems = [
  { path: '/dashboard', title: '仪表盘', icon: DataBoard },
  { path: '/company', title: '公司管理', icon: OfficeBuilding },
  { path: '/application', title: '投递记录', icon: Document },
  { path: '/offer', title: 'Offer', icon: Trophy },
  { path: '/dict', title: '数据字典', icon: Collection },
]

function navigate(path: string) {
  router.push(path)
}
</script>

<template>
  <aside class="app-menu" :class="{ 'app-menu--collapsed': appStore.collapsed }">
    <nav class="app-menu__nav">
      <div
        v-for="item in menuItems"
        :key="item.path"
        class="app-menu__item"
        :class="{ 'is-active': activeMenu === item.path || activeMenu.startsWith(item.path + '/') }"
        @click="navigate(item.path)"
        :title="appStore.collapsed ? item.title : ''"
      >
        <el-icon :size="18"><component :is="item.icon" /></el-icon>
        <span v-if="!appStore.collapsed" class="app-menu__text">{{ item.title }}</span>
      </div>
    </nav>
  </aside>
</template>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.app-menu {
  width: $sidebar-width;
  flex-shrink: 0;
  background: $sidebar-bg;
  transition: width $transition;
  overflow: hidden;

  &--collapsed {
    width: $sidebar-collapsed-width;
  }

  &__nav {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 14px 10px;
  }

  &__item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border-radius: 6px;
    color: rgba(255, 255, 255, 0.5);
    cursor: pointer;
    transition: all $transition;
    user-select: none;

    &:hover {
      background: rgba(255, 255, 255, 0.06);
      color: rgba(255, 255, 255, 0.9);
    }

    &.is-active {
      background: rgba(255, 255, 255, 0.08);
      color: #fff;
    }
  }

  &--collapsed &__item {
    justify-content: center;
    padding: 12px;
  }

  &__text {
    font-size: 14px;
    font-weight: 500;
    white-space: nowrap;
  }
}
</style>
