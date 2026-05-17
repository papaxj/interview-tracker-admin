<script setup lang="ts">
import AppHeader from '@/components/layout/AppHeader.vue'
import AppMenu from '@/components/layout/AppMenu.vue'
import AppMain from '@/components/layout/AppMain.vue'
</script>

<template>
  <div class="app-layout">
    <AppHeader />
    <div class="app-layout__body">
      <AppMenu />
      <AppMain />
    </div>
  </div>
</template>

<style scoped lang="scss">
.app-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;

  &__body {
    display: flex;
    flex: 1;
    overflow: hidden;
  }
}
</style>
