<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  createDictItem,
  deleteDictItem,
  getDictItemList,
  updateDictItem,
  type SysDictItemVo,
  type SysDictItemSaveRequest,
} from '@/api/dict'
import { usePagination } from '@/composables/usePagination'
import { useDict } from '@/composables/useDict'

const props = defineProps<{
  dictTypeCode: string
}>()

const emit = defineEmits<{
  changed: []
}>()

const { clearAllCache } = useDict()

// ---- 分页与搜索 ----
const keyword = ref('')

const {
  loading,
  list,
  total,
  page,
  size,
  load,
  handlePageChange,
  handleSizeChange,
} = usePagination<SysDictItemVo>((p, s) =>
  getDictItemList({
    page: p,
    size: s,
    dictTypeCode: props.dictTypeCode || undefined,
    keyword: keyword.value || undefined,
  }),
)

function fetchList() {
  if (!props.dictTypeCode) return
  if (page.value !== 1) page.value = 1
  load()
}

function handleSearch() {
  fetchList()
}

// 监听 dictTypeCode 变化自动加载
watch(() => props.dictTypeCode, (val) => {
  if (val) {
    page.value = 1
    load()
  }
})

// ---- 弹窗 ----
const dialogVisible = ref(false)
const dialogTitle = ref('新增字典项')
const editingId = ref<number | null>(null)
const form = ref<SysDictItemSaveRequest>({
  dictTypeCode: '',
  label: '',
  value: '',
  sortOrder: 0,
  isDefault: 0,
  status: 1,
  remark: '',
})

function openDialog(row?: SysDictItemVo) {
  if (row) {
    dialogTitle.value = '编辑字典项'
    editingId.value = row.id
    form.value = {
      dictTypeCode: row.dictTypeCode,
      label: row.label,
      value: row.value,
      sortOrder: row.sortOrder ?? 0,
      isDefault: row.isDefault ?? 0,
      status: row.status ?? 1,
      remark: row.remark ?? '',
    }
  } else {
    dialogTitle.value = '新增字典项'
    editingId.value = null
    form.value = {
      dictTypeCode: props.dictTypeCode,
      label: '',
      value: '',
      sortOrder: 0,
      isDefault: 0,
      status: 1,
      remark: '',
    }
  }
  dialogVisible.value = true
}

async function submitForm() {
  if (editingId.value) {
    await updateDictItem(editingId.value, form.value)
    ElMessage.success('更新成功')
  } else {
    await createDictItem(form.value)
    ElMessage.success('新增成功')
  }
  clearAllCache()
  dialogVisible.value = false
  fetchList()
  emit('changed')
}

async function handleDelete(row: SysDictItemVo) {
  await ElMessageBox.confirm(`确定删除字典项「${row.label}」？`, '提示', {
    type: 'warning',
  })
  try {
    await deleteDictItem(row.id)
    ElMessage.success('删除成功')
    clearAllCache()
    fetchList()
    emit('changed')
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : '删除失败')
  }
}

async function toggleStatus(row: SysDictItemVo) {
  const newStatus = row.status === 1 ? 0 : 1
  await updateDictItem(row.id, {
    dictTypeCode: row.dictTypeCode,
    label: row.label,
    value: row.value,
    sortOrder: row.sortOrder,
    isDefault: row.isDefault,
    status: newStatus,
    remark: row.remark,
  })
  row.status = newStatus
  clearAllCache()
  ElMessage.success(newStatus === 1 ? '已启用' : '已停用')
  emit('changed')
}
</script>

<template>
  <el-card shadow="never">
    <template #header>
      <div class="page-header">
        <span>
          字典数据管理
          <template v-if="props.dictTypeCode">
            — <el-tag type="primary" size="small">{{ props.dictTypeCode }}</el-tag>
          </template>
        </span>
        <el-button
          type="primary"
          size="small"
          :disabled="!props.dictTypeCode"
          @click="openDialog()"
        >
          新增
        </el-button>
      </div>
    </template>

    <template v-if="!props.dictTypeCode">
      <el-empty description="请在左侧点击选择一个字典类型" />
    </template>

    <template v-else>
      <div class="toolbar">
        <el-input
          v-model="keyword"
          placeholder="搜索标签/值"
          clearable
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        />
      </div>

      <el-table v-loading="loading" :data="list" stripe>
        <el-table-column prop="label" label="标签" min-width="100" show-overflow-tooltip />
        <el-table-column prop="value" label="值" min-width="100" show-overflow-tooltip />
        <el-table-column prop="sortOrder" label="排序" width="60" />
        <el-table-column label="默认" width="55">
          <template #default="{ row }">
            <el-tag :type="row.isDefault === 1 ? 'warning' : 'info'" size="small">
              {{ row.isDefault === 1 ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="70">
          <template #default="{ row }">
            <el-switch :model-value="row.status === 1" @change="toggleStatus(row)" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openDialog(row)">编辑</el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        class="pagination"
        background
        layout="total, prev, pager, next"
        :total="total"
        :current-page="page"
        :page-size="size"
        :page-sizes="[10, 20, 50]"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </template>
  </el-card>

  <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" destroy-on-close>
    <el-form :model="form" label-width="80px">
      <el-form-item label="字典类型">
        <el-input :model-value="form.dictTypeCode" disabled />
      </el-form-item>
      <el-form-item label="标签" required>
        <el-input v-model="form.label" placeholder="如：男" />
      </el-form-item>
      <el-form-item label="值" required>
        <el-input v-model="form.value" placeholder="如：male" />
      </el-form-item>
      <el-form-item label="排序">
        <el-input-number v-model="form.sortOrder" :min="0" controls-position="right" />
      </el-form-item>
      <el-form-item label="默认">
        <el-switch
          :model-value="form.isDefault === 1"
          active-text="是"
          inactive-text="否"
          @change="(val: boolean) => (form.isDefault = val ? 1 : 0)"
        />
      </el-form-item>
      <el-form-item label="状态">
        <el-radio-group v-model="form.status">
          <el-radio :value="1">正常</el-radio>
          <el-radio :value="0">停用</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="可选" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitForm">确定</el-button>
    </template>
  </el-dialog>
</template>
