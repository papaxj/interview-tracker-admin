<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { FormRules } from 'element-plus'
import { getJobApplicationList, type JobApplicationVo } from '@/api/application'
import { getCompanyList } from '@/api/company'
import {
  createOffer,
  deleteOffer,
  getOfferList,
  updateOffer,
  type OfferInfoSaveRequest,
  type OfferInfoVo,
} from '@/api/offer'
import { usePagination } from '@/composables/usePagination'
import { useCrudDialog } from '@/composables/useCrudDialog'
import { OFFER_STATUS } from '@/constants/enums'
import { useAppStore } from '@/stores/app'
import { formatDate, formatMoney } from '@/utils/format'

const appStore = useAppStore()
const applications = ref<JobApplicationVo[]>([])
const filterStatus = ref('')

const appMap = ref<Record<number, string>>({})

const appLabelMap = computed(() => {
  const map: Record<number, string> = {}
  for (const a of applications.value) {
    const position = a.positionName ?? ''
    const companyName = a.companyId ? appMap.value[a.companyId] : undefined
    map[a.id] = `${position}${companyName ? ` (${companyName})` : ''}`.trim() || `#${a.id}`
  }
  return map
})

const { loading, list, total, page, size, load, handlePageChange, handleSizeChange } =
  usePagination<OfferInfoVo>((p, s) => {
    const params: Record<string, unknown> = { page: p, size: s }
    if (filterStatus.value) params.status = filterStatus.value
    return getOfferList(params)
  })

const defaultForm = (): OfferInfoSaveRequest => ({
  applicationId: applications.value[0]?.id ?? 0,
  status: '待确认',
})

const rules: FormRules = {
  applicationId: [{ required: true, message: '请选择投递', trigger: 'change' }],
}

const {
  dialogVisible,
  editingId,
  submitting,
  formRef,
  form,
  dialogTitle,
  openCreate,
  openEdit,
  doSubmit,
  doDelete,
} = useCrudDialog<OfferInfoSaveRequest>({
  label: 'Offer',
  defaultForm,
  onSaved: load,
})

async function fetchApplications() {
  const userId = appStore.currentUserId
  const [appRes, companyRes] = await Promise.all([
    getJobApplicationList({ page: 1, size: 100, userId }),
    getCompanyList({ page: 1, size: 100, userId }),
  ])
  applications.value = appRes.content
  appMap.value = Object.fromEntries(companyRes.content.map((c) => [c.id, c.name]))
}

function handleOpenEdit(row: OfferInfoVo) {
  openEdit(row.id, {
    applicationId: row.applicationId ?? 0,
    baseSalary: row.baseSalary,
    bonusSalary: row.bonusSalary,
    stockValue: row.stockValue,
    signBonus: row.signBonus,
    otherBenefits: row.otherBenefits ?? '',
    offerDate: row.offerDate?.slice(0, 10) ?? '',
    deadlineDate: row.deadlineDate?.slice(0, 10) ?? '',
    joinDate: row.joinDate?.slice(0, 10) ?? '',
    status: row.status ?? '待确认',
    remark: row.remark ?? '',
  } as Partial<OfferInfoSaveRequest>)
}

async function handleSubmit() {
  await doSubmit(
    () => createOffer({ ...form }),
    () => updateOffer(editingId.value!, { ...form }),
  )
}

async function handleDelete(row: OfferInfoVo) {
  await doDelete(row.id, '', () => deleteOffer(row.id))
}

onMounted(async () => {
  await fetchApplications()
  await load()
})
</script>

<template>
  <el-card shadow="never">
    <template #header>
      <div class="page-header">
        <span>Offer 管理</span>
        <el-button type="primary" :disabled="!applications.length" @click="openCreate">
          新增 Offer
        </el-button>
      </div>
    </template>

    <div class="toolbar">
      <el-select v-model="filterStatus" placeholder="筛选状态" clearable style="width: 140px" @change="load">
        <el-option v-for="s in OFFER_STATUS" :key="s.value" :label="s.label" :value="s.value" />
      </el-select>
      <el-button @click="load">刷新</el-button>
    </div>

    <el-table v-loading="loading" :data="list" stripe>
      <el-table-column label="投递" min-width="160">
        <template #default="{ row }">{{ appLabelMap[row.applicationId!] ?? row.applicationId }}</template>
      </el-table-column>
      <el-table-column label="基础薪资" width="120">
        <template #default="{ row }">{{ formatMoney(row.baseSalary) }}</template>
      </el-table-column>
      <el-table-column label="奖金" width="100">
        <template #default="{ row }">{{ formatMoney(row.bonusSalary) }}</template>
      </el-table-column>
      <el-table-column label="签字费" width="100">
        <template #default="{ row }">{{ formatMoney(row.signBonus) }}</template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="90">
        <template #default="{ row }">
          <el-tag size="small">{{ row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Offer日期" width="110">
        <template #default="{ row }">{{ formatDate(row.offerDate)?.slice(0, 10) }}</template>
      </el-table-column>
      <el-table-column label="截止日期" width="110">
        <template #default="{ row }">{{ formatDate(row.deadlineDate)?.slice(0, 10) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="handleOpenEdit(row)">编辑</el-button>
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

  <el-dialog v-model="dialogVisible" :title="dialogTitle" width="560px" destroy-on-close>
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="投递" prop="applicationId">
        <el-select v-model="form.applicationId" style="width: 100%">
          <el-option
            v-for="app in applications"
            :key="app.id"
            :label="appLabelMap[app.id]"
            :value="app.id"
          />
        </el-select>
      </el-form-item>
      <el-row :gutter="12">
        <el-col :span="12">
          <el-form-item label="基础薪资">
            <el-input-number v-model="form.baseSalary" :min="0" controls-position="right" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="奖金">
            <el-input-number v-model="form.bonusSalary" :min="0" controls-position="right" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="股票价值">
            <el-input-number v-model="form.stockValue" :min="0" controls-position="right" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="签字费">
            <el-input-number v-model="form.signBonus" :min="0" controls-position="right" style="width: 100%" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="12">
        <el-col :span="12">
          <el-form-item label="Offer日期">
            <el-date-picker v-model="form.offerDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="截止日期">
            <el-date-picker v-model="form.deadlineDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="入职日期">
            <el-date-picker v-model="form.joinDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态">
            <el-select v-model="form.status" style="width: 100%">
              <el-option v-for="s in OFFER_STATUS" :key="s.value" :label="s.label" :value="s.value" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="其他福利">
        <el-input v-model="form.otherBenefits" type="textarea" :rows="2" />
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="form.remark" type="textarea" :rows="2" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">保存</el-button>
    </template>
  </el-dialog>
</template>


