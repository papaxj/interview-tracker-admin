<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import {
  DataBoard,
  OfficeBuilding,
  Document,
  Calendar,
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
  { path: '/interview', title: '面试管理', icon: Calendar },
  { path: '/interview/kanban', title: '面试看板', icon: Calendar },
  { path: '/offer', title: 'Offer', icon: Trophy },
  { path: '/dict', title: '数据字典', icon: Collection },
]

function navigate(path: string) {
  router.push(path)
}
</script>

<template>
  <aside class="app-menu" :class="{ 'app-menu--collapsed': appStore.collapsed }">
    <el-menu
      :default-active="activeMenu"
      :collapse="appStore.collapsed"
      background-color="#001529"
      text-color="#ffffffa6"
      active-text-color="#fff"
    >
      <el-menu-item
        v-for="item in menuItems"
        :key="item.path"
        :index="item.path"
        @click="navigate(item.path)"
      >
        <el-icon><component :is="item.icon" /></el-icon>
        <template #title>{{ item.title }}</template>
      </el-menu-item>
    </el-menu>
  </aside>
</template>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.app-menu {
  width: $sidebar-width;
  flex-shrink: 0;
  background: #001529;
  transition: width 0.2s;

  &--collapsed {
    width: $sidebar-collapsed-width;
  }

  .el-menu {
    border-right: none;
    height: 100%;
  }
}
</style>
