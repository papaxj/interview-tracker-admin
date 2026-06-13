<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { Loading } from '@element-plus/icons-vue'
import { scrollQueryIdentity, type IdentityInfoVo } from '@/api/identity'
import { formatDate } from '@/utils/format'
import { useDictLabel } from '@/composables/useDictLabel'

const { labelMap, loadDicts } = useDictLabel()

function genderLabel(value?: string) {
  if (!value) return '-'
  const label = labelMap.value['gender']?.[value]
  return label || '-'
}

const PAGE_SIZE = 20

const list = ref<IdentityInfoVo[]>([])
const loading = ref(false)
const cursor = ref<number | undefined>(undefined)
const hasMore = ref(true)
const keyword = ref('')

const sentinelRef = ref<HTMLElement | null>(null)
const scrollWrapper = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

async function loadMore() {
  if (loading.value || !hasMore.value) return
  loading.value = true
  try {
    const res = await scrollQueryIdentity({
      size: PAGE_SIZE,
      cursor: cursor.value,
      keyword: keyword.value.trim() || undefined,
    })
    list.value.push(...(res.content ?? []))
    hasMore.value = res.hasMore ?? false
    if (res.nextCursor != null) {
      cursor.value = res.nextCursor
    }
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  list.value = []
  cursor.value = undefined
  hasMore.value = true
  nextTick(() => {
    setupObserver()
    loadMore()
  })
}

function setupObserver() {
  teardownObserver()
  if (!sentinelRef.value || !scrollWrapper.value) return
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) {
        loadMore()
      }
    },
    {
      root: scrollWrapper.value,
      rootMargin: '80px',
    },
  )
  observer.observe(sentinelRef.value)
}

function teardownObserver() {
  observer?.disconnect()
  observer = null
}

onMounted(async () => {
  await loadDicts(['gender'])
  loadMore()
  nextTick(() => {
    setupObserver()
  })
})

onBeforeUnmount(() => {
  teardownObserver()
})
</script>

<template>
  <el-card shadow="never">
    <template #header>
      <div class="page-header">
        <span>身份信息查询</span>
      </div>
    </template>

    <div class="toolbar">
      <el-input
        v-model="keyword"
        placeholder="搜索姓名 / 身份证号 / 手机号 / 邮箱"
        clearable
        prefix-icon="Search"
        style="width: 360px"
        @keyup.enter="handleSearch"
        @clear="handleSearch"
      />
      <el-button @click="handleSearch">查询</el-button>
      <span class="toolbar__count">
        <template v-if="loading && list.length > 0">
          <el-icon class="is-loading loading-color" :size="14"><Loading /></el-icon>
          加载中…
        </template>
        <template v-else>已加载 {{ list.length }} 条</template>
      </span>
    </div>

    <div ref="scrollWrapper" class="scroll-wrapper">
      <el-table
        v-loading="loading"
        :data="list"
        stripe
      >
        <el-table-column type="index" label="#" width="50" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="idCard" label="身份证号" width="180" />
        <el-table-column prop="gender" label="性别" width="80">
          <template #default="{ row }">
            <span :class="['gender-tag', `gender-tag--${row.gender}`]">{{ genderLabel(row.gender) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="birthday" label="出生日期" width="110" />
        <el-table-column prop="mobile" label="手机号" width="130" />
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="address" label="地址" min-width="200" />
        <el-table-column label="创建时间" width="160">
          <template #default="{ row }">{{ formatDate(row.createTime) }}</template>
        </el-table-column>
      </el-table>

      <div ref="sentinelRef" class="scroll-sentinel">
        <template v-if="loading && list.length > 0">
          <el-icon class="is-loading" :size="18"><Loading /></el-icon>
          <span>加载中…</span>
        </template>
        <template v-else-if="!hasMore && list.length > 0">
          <span class="scroll-sentinel__end">— 已加载全部数据 —</span>
        </template>
        <template v-else-if="list.length === 0 && !loading">
          <span class="scroll-sentinel__empty">暂无数据</span>
        </template>
      </div>
    </div>
  </el-card>
</template>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;

  &__count {
    margin-left: auto;
    color: $text-secondary;
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .loading-color {
    color: $primary-color;
  }
}

.scroll-wrapper {
  max-height: calc(100vh - 320px);
  overflow-y: auto;

  :deep(.el-table__header-wrapper) {
    position: sticky;
    top: 0;
    z-index: 10;
  }

  :deep(.el-table__empty-block) {
    display: none;
  }
}

.scroll-sentinel {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px 0;
  color: $text-secondary;
  font-size: 13px;
  min-height: 48px;

  &__end,
  &__empty {
    color: $text-secondary;
  }
}

.gender-tag {
  font-weight: 500;

  &--M { color: #409eff; }

  &--F { color: #e6a23c; }
}
</style>
