<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getCompanyDetail } from '@/api/company'
import { useDictLabel } from '@/composables/useDictLabel'
import { formatDate } from '@/utils/format'
import { useTencentMap } from '@/composables/useTencentMap'

const route = useRoute()
const router = useRouter()
const { initMap } = useTencentMap()

const { labelMap, loadDicts } = useDictLabel()

const loading = ref(false)
const data = ref<any>(null)

function translate(dictKey: string, value?: string) {
  if (!value) return '-'
  return labelMap.value[dictKey]?.[value] ?? value
}

const companyId = computed(() => Number(route.params.id))

async function loadDetail() {
  loading.value = true
  try {
    const res = await getCompanyDetail(companyId.value)
    data.value = res
    // 初始化地图（等 DOM 渲染后）
    if (res.latitude && res.longitude) {
      await new Promise((resolve) => setTimeout(resolve, 100))
      initMap('tencent-map-container', res.latitude, res.longitude)
    }
  } finally {
    loading.value = false
  }
}

function goEdit() {
  router.push(`/company/form/${companyId.value}`)
}

onMounted(async () => {
  await loadDicts(['industry', 'city', 'scale', 'financing_stage'])
  await loadDetail()
})
</script>

<template>
  <el-card v-loading="loading" shadow="never">
    <template #header>
      <div class="page-header">
        <div class="page-header__left">
          <el-button text @click="router.push('/company')">← 返回</el-button>
          <span>公司详情</span>
        </div>
        <el-button type="primary" @click="goEdit">编辑</el-button>
      </div>
    </template>

    <el-descriptions :column="3" border v-if="data">
      <el-descriptions-item label="公司名称">{{ data.name }}</el-descriptions-item>
      <el-descriptions-item label="行业">{{ translate('industry', data.industry) }}</el-descriptions-item>
      <el-descriptions-item label="城市">{{ translate('city', data.city) }}</el-descriptions-item>
      <el-descriptions-item label="公司规模">{{ translate('scale', data.companySize) }}</el-descriptions-item>
      <el-descriptions-item label="融资阶段">{{ translate('financing_stage', data.financingStage) }}
      </el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag :type="data.status === 1 ? 'success' : 'info'" size="small">
          {{ data.status === 1 ? '正常' : '停用' }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="官网" :span="2">
        <a v-if="data.website" :href="data.website" target="_blank" class="link">{{ data.website }}</a>
        <span v-else>-</span>
      </el-descriptions-item>
      <el-descriptions-item label="地址" :span="3">{{ data.address || '-' }}</el-descriptions-item>
      <el-descriptions-item label="HR姓名">{{ data.hrName || '-' }}</el-descriptions-item>
      <el-descriptions-item label="HR联系方式">{{ data.hrContact || '-' }}</el-descriptions-item>
      <el-descriptions-item label="备注" :span="3">{{ data.remark || '-' }}</el-descriptions-item>
      <el-descriptions-item label="创建时间">{{ formatDate(data.createdAt) }}</el-descriptions-item>
      <el-descriptions-item label="更新时间">{{ formatDate(data.updatedAt) }}</el-descriptions-item>
    </el-descriptions>

    <!-- 地图区域 -->
    <div class="map-section" v-if="data?.latitude && data?.longitude">
      <div class="map-section__title">公司位置</div>
      <div id="tencent-map-container" class="tencent-map-container" />
    </div>
  </el-card>
</template>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  &__left {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;
  }
}

.link {
  color: $primary-color;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
}

.map-section {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;

  &__title {
    font-size: 14px;
    font-weight: 600;
    color: $text-color;
    margin-bottom: 12px;
  }
}

.tencent-map-container {
  width: 100%;
  height: 560px;
  border-radius: 8px;
  overflow: hidden;
  background: #f5f7fa;
}
</style>
