<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { deleteCompany, getCompanyList, type CompanyVo } from '@/api/company'
import { usePagination } from '@/composables/usePagination'
import { useAppStore } from '@/stores/app'
import { formatDate } from '@/utils/format'

const router = useRouter()
const appStore = useAppStore()
const keyword = ref('')

const { loading, list, total, page, size, load, handlePageChange, handleSizeChange } =
  usePagination<CompanyVo>((p, s) =>
    getCompanyList({
      page: p,
      size: s,
      userId: appStore.currentUserId,
    }),
  )

const displayList = ref<CompanyVo[]>([])

async function fetchList() {
  await load()
  filterList()
}

function filterList() {
  const kw = keyword.value.trim().toLowerCase()
  displayList.value = kw
    ? list.value.filter((item) => item.name?.toLowerCase().includes(kw))
    : [...list.value]
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

onMounted(fetchList)
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
        style="width: 240px"
        @input="filterList"
        @clear="filterList"
      />
      <el-button @click="fetchList">查询</el-button>
    </div>

    <el-table v-loading="loading" :data="displayList" stripe>
      <el-table-column prop="name" label="公司名称" min-width="140" />
      <el-table-column prop="industry" label="行业" width="100" />
      <el-table-column prop="city" label="城市" width="90" />
      <el-table-column prop="companySize" label="规模" width="90" />
      <el-table-column prop="hrName" label="HR" width="90" />
      <el-table-column prop="hrContact" label="联系方式" width="120" />
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
      v-if="!keyword"
      class="pagination"
      background
      layout="total, sizes, prev, pager, next"
      :total="total"
      :current-page="page"
      :page-size="size"
      :page-sizes="[10, 20, 50]"
      @current-change="(p: number) => { handlePageChange(p); filterList() }"
      @size-change="(s: number) => { handleSizeChange(s); filterList() }"
    />
  </el-card>
</template>

<style scoped lang="scss">
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.pagination {
  margin-top: 16px;
  justify-content: flex-end;
}
</style>
