<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <main class="app-main">
    <RouterView />
  </main>
</template>

<style scoped lang="scss">
.app-main {
  flex: 1;
  padding: 16px;
  overflow: auto;
}
</style>
