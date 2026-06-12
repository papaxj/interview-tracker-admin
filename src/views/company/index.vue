<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { deleteCompany, getCompanyList, type CompanyVo } from '@/api/company'
import type { SysDictItemVo } from '@/api/dict'
import { usePagination } from '@/composables/usePagination'
import { useDict } from '@/composables/useDict'
import { useAppStore } from '@/stores/app'
import { formatDate } from '@/utils/format'

const router = useRouter()
const appStore = useAppStore()
const keyword = ref('')

// 数据字典
const { loadDict } = useDict()
const industryOptions = ref<SysDictItemVo[]>([])
const cityOptions = ref<SysDictItemVo[]>([])
const scaleOptions = ref<SysDictItemVo[]>([])

function translate(value: string | undefined, options: SysDictItemVo[]) {
  if (!value) return '-'
  const found = options.find((item) => item.value === value || item.label === value)
  return found?.label ?? value
}

const { loading, list, total, page, size, load, handlePageChange, handleSizeChange } =
  usePagination<CompanyVo>((p, s) =>
    getCompanyList({
      page: p,
      size: s,
      userId: appStore.currentUserId,
      name: keyword.value || undefined,
    }),
  )

async function fetchList() {
  // 搜索时重置到第一页
  if (page.value !== 1) page.value = 1
  await load()
}

function handleSearch() {
  fetchList()
}

function goForm(id?: number) {
  router.push(id ? `/company/form/${id}` : '/company/form')
}

async function handleDelete(row: CompanyVo) {
  await ElMessageBox.confirm(`确定删除公司「${row.name}」？`, '提示', { type: 'warning' })
  await deleteCompany(row.id)
  ElMessage.success('删除成功')
  fetchList()
}

onMounted(async () => {
  const [industries, cities, scales] = await Promise.all([
    loadDict('industry'),
    loadDict('city'),
    loadDict('scale'),
  ])
  industryOptions.value = industries
  cityOptions.value = cities
  scaleOptions.value = scales
  await fetchList()
})
</script>

<template>
  <el-card shadow="never">
    <template #header>
      <div class="page-header">
        <span>公司管理</span>
        <el-button type="primary" @click="goForm()">新增公司</el-button>
      </div>
    </template>

    <div class="toolbar">
      <el-input
        v-model="keyword"
        placeholder="搜索公司名称"
        clearable
        prefix-icon="Search"
        style="width: 260px"
        @keyup.enter="handleSearch"
        @clear="handleSearch"
      />
      <el-button @click="fetchList">刷新</el-button>
    </div>

    <el-table v-loading="loading" :data="list" stripe max-height="calc(100vh - 280px)">
      <el-table-column prop="name" label="公司名称" min-width="140" />
      <el-table-column label="行业" width="140">
        <template #default="{ row }">{{ translate(row.industry, industryOptions) }}</template>
      </el-table-column>
      <el-table-column label="城市" width="90">
        <template #default="{ row }">{{ translate(row.city, cityOptions) }}</template>
      </el-table-column>
      <el-table-column label="规模" width="120">
        <template #default="{ row }">{{ translate(row.companySize, scaleOptions) }}</template>
      </el-table-column>
      <el-table-column prop="hrName" label="HR" width="90" />
      <el-table-column prop="hrContact" label="联系方式" width="160" />
      <el-table-column label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
            {{ row.status === 1 ? '正常' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="160">
        <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="goForm(row.id)">编辑</el-button>
          <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      class="pagination"
      background
      layout="total, sizes, prev, pager, next"
      :total="total"
      :current-page="page"
      :page-size="size"
      :page-sizes="[10, 20, 50]"
      @current-change="handlePageChange"
      @size-change="handleSizeChange"
    />
  </el-card>
</template>


