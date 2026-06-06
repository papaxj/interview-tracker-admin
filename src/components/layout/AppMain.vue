<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <main class="app-main">
    <RouterView />
  </main>
</template>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.app-main {
  flex: 1;
  overflow: auto;
  background: $bg-color;
  padding: 20px;
}
</style>
