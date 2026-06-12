<script setup lang="ts">
import { onMounted, ref } from 'vue'
import DictTypePanel from './DictTypePanel.vue'
import DictItemPanel from './DictItemPanel.vue'

const selectedTypeCode = ref('')
const typePanelRef = ref<InstanceType<typeof DictTypePanel>>()

function onTypeSelect(code: string) {
  selectedTypeCode.value = code
}

function onItemChanged() {
  // 字典项变更后刷新类型列表（可能影响缓存）
  typePanelRef.value?.fetchList()
}

onMounted(() => {
  // 子组件自行加载，父组件仅协调
})
</script>

<template>
  <div class="dict-page">
    <el-row :gutter="16">
      <el-col :span="10">
        <DictTypePanel ref="typePanelRef" @select="onTypeSelect" />
      </el-col>
      <el-col :span="14">
        <DictItemPanel
          :dict-type-code="selectedTypeCode"
          @changed="onItemChanged"
        />
      </el-col>
    </el-row>
  </div>
</template>

<style scoped lang="scss">
.dict-page {
  min-height: calc(100vh - 120px);
}
</style>
