<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'
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
const keyword = ref('')
const hasMore = ref(true)

// 记录每页的 cursor 位置，支持翻页
const cursorStack = ref<number[]>([0])
const currentPage = ref(1)
const total = ref(0)

async function fetchPage() {
  if (loading.value) return
  loading.value = true
  try {
    const cursor = cursorStack.value[currentPage.value - 1]
    const res = await scrollQueryIdentity({
      size: PAGE_SIZE,
      cursor,
      keyword: keyword.value.trim() || undefined,
    })
    list.value = res.content ?? []
    hasMore.value = res.hasMore ?? false

    // 记录下一页的 cursor
    if (res.hasMore && res.nextCursor != null) {
      cursorStack.value[currentPage.value] = res.nextCursor
    }
  } finally {
    loading.value = false
  }
}

async function nextPage() {
  if (!hasMore.value) return
  currentPage.value++
  await fetchPage()
  nextTick(() => {
    const { v: tableDom } = tableRef.value ?? {}
    const wrap = (tableDom as HTMLElement)?.querySelector('.el-scrollbar__wrap')
    if (wrap) wrap.scrollTop = 0
  })
}

async function prevPage() {
  if (currentPage.value <= 1) return
  currentPage.value--
  await fetchPage()
  nextTick(() => {
    const { v: tableDom } = tableRef.value ?? {}
    const wrap = (tableDom as HTMLElement)?.querySelector('.el-scrollbar__wrap')
    if (wrap) wrap.scrollTop = 0
  })
}

function handleSearch() {
  cursorStack.value = [0]
  currentPage.value = 1
  hasMore.value = true
  fetchPage()
}

const tableRef = ref()

onMounted(async () => {
  await loadDicts(['gender'])
  fetchPage()
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
    </div>

    <el-table
      ref="tableRef"
      v-loading="loading"
      :data="list"
      height="calc(100vh - 340px)"
      stripe
    >
      <el-table-column type="index" label="#" width="50" />
      <el-table-column prop="name" label="姓名" width="200" />
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

    <div class="pagination-bar">
      <span class="page-info">第 {{ currentPage }} 页</span>
      <el-button :disabled="currentPage <= 1" @click="prevPage">上一页</el-button>
      <el-button :disabled="!hasMore" @click="nextPage">下一页</el-button>
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
}

.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 12px;
  padding: 8px 0;
}

.page-info {
  font-size: 13px;
  color: $text-secondary;
}

.gender-tag {
  font-weight: 500;

  &--M { color: #409eff; }

  &--F { color: #e6a23c; }
}
</style>
