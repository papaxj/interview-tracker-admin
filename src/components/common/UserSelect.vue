<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'

const router = useRouter()
const appStore = useAppStore()

function handleChange(id: number) {
  appStore.setCurrentUser(id)
  router.go(0)
}
</script>

<template>
  <el-select
    :model-value="appStore.currentUserId"
    placeholder="选择用户"
    style="width: 140px"
    @change="handleChange"
  >
    <el-option
      v-for="user in appStore.myUsers"
      :key="user.id"
      :label="user.name"
      :value="user.id"
    />
  </el-select>
</template>
