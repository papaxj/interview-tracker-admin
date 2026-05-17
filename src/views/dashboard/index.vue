<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getCompanyList } from '@/api/company'
import { getJobApplicationList } from '@/api/application'
import { getInterviewRoundList } from '@/api/interview'
import { getOfferList } from '@/api/offer'
import { useAppStore } from '@/stores/app'

const router = useRouter()
const appStore = useAppStore()
const loading = ref(false)

const stats = ref({
  companies: 0,
  applications: 0,
  interviews: 0,
  offers: 0,
})

async function loadStats() {
  loading.value = true
  const userId = appStore.currentUserId
  try {
    const [companies, applications, interviews, offers] = await Promise.all([
      getCompanyList({ page: 1, size: 1, userId }),
      getJobApplicationList({ page: 1, size: 1, userId }),
      getInterviewRoundList({ page: 1, size: 1 }),
      getOfferList({ page: 1, size: 1 }),
    ])
    stats.value = {
      companies: companies.totalElements,
      applications: applications.totalElements,
      interviews: interviews.totalElements,
      offers: offers.totalElements,
    }
  } finally {
    loading.value = false
  }
}

const cards = [
  { key: 'companies', title: '公司', path: '/company', color: '#409eff' },
  { key: 'applications', title: '投递', path: '/application', color: '#67c23a' },
  { key: 'interviews', title: '面试', path: '/interview', color: '#e6a23c' },
  { key: 'offers', title: 'Offer', path: '/offer', color: '#f56c6c' },
] as const

onMounted(loadStats)
</script>

<template>
  <div v-loading="loading">
    <el-card shadow="never" class="mb-16">
      <template #header>
        <span>仪表盘 · {{ appStore.getCurrentUserName() }}</span>
      </template>
      <p class="welcome">欢迎使用面试追踪管理后台</p>
    </el-card>

    <el-row :gutter="16">
      <el-col v-for="card in cards" :key="card.key" :span="6">
        <el-card
          shadow="hover"
          class="stat-card"
          @click="router.push(card.path)"
        >
          <div class="stat-card__value" :style="{ color: card.color }">
            {{ stats[card.key] }}
          </div>
          <div class="stat-card__title">{{ card.title }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="mt-16">
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>快捷入口</template>
          <el-space wrap>
            <el-button @click="router.push('/company/form')">新增公司</el-button>
            <el-button @click="router.push('/application')">管理投递</el-button>
            <el-button @click="router.push('/interview/kanban')">面试看板</el-button>
            <el-button @click="router.push('/offer')">管理 Offer</el-button>
          </el-space>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>使用提示</template>
          <ul class="tips">
            <li>顶部可切换当前用户（my_user），业务数据按用户隔离</li>
            <li>建议流程：公司 → 投递 → 面试轮次 → Offer</li>
            <li>面试看板支持拖拽式状态切换（下拉选择结果）</li>
          </ul>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped lang="scss">
.mb-16 {
  margin-bottom: 16px;
}

.mt-16 {
  margin-top: 16px;
}

.welcome {
  color: #606266;
  margin: 0;
}

.stat-card {
  cursor: pointer;
  text-align: center;

  &__value {
    font-size: 36px;
    font-weight: 700;
    line-height: 1.2;
  }

  &__title {
    margin-top: 8px;
    color: #909399;
    font-size: 14px;
  }
}

.tips {
  margin: 0;
  padding-left: 20px;
  color: #606266;
  line-height: 2;
  font-size: 13px;
}
</style>
