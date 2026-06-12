<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  createDictType,
  deleteDictType,
  getDictTypeList,
  updateDictType,
  type SysDictTypeVo,
  type SysDictTypeSaveRequest,
} from '@/api/dict'
import { usePagination } from '@/composables/usePagination'

const emit = defineEmits<{
  select: [code: string]
}>()

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
} = usePagination<SysDictTypeVo>((p, s) =>
  getDictTypeList({ page: p, size: s }),
)

const displayList = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  return kw
    ? list.value.filter(
        (item) =>
          item.dictName?.toLowerCase().includes(kw) ||
          item.dictCode?.toLowerCase().includes(kw),
      )
    : [...list.value]
})

function fetchList() {
  load()
}

// ---- 弹窗 ----
const dialogVisible = ref(false)
const dialogTitle = ref('新增字典类型')
const editingId = ref<number | null>(null)
const form = ref<SysDictTypeSaveRequest>({
  dictName: '',
  dictCode: '',
  status: 1,
  remark: '',
})

function openDialog(row?: SysDictTypeVo) {
  if (row) {
    dialogTitle.value = '编辑字典类型'
    editingId.value = row.id
    form.value = {
      dictName: row.dictName,
      dictCode: row.dictCode,
      status: row.status ?? 1,
      remark: row.remark ?? '',
    }
  } else {
    dialogTitle.value = '新增字典类型'
    editingId.value = null
    form.value = { dictName: '', dictCode: '', status: 1, remark: '' }
  }
  dialogVisible.value = true
}

async function submitForm() {
  if (editingId.value) {
    await updateDictType(editingId.value, form.value)
    ElMessage.success('更新成功')
  } else {
    await createDictType(form.value)
    ElMessage.success('新增成功')
  }
  dialogVisible.value = false
  fetchList()
}

async function handleDelete(row: SysDictTypeVo) {
  await ElMessageBox.confirm(`确定删除字典类型「${row.dictName}」？`, '提示', {
    type: 'warning',
  })
  await deleteDictType(row.id)
  ElMessage.success('删除成功')
  fetchList()
}

function onRowClick(row: SysDictTypeVo) {
  emit('select', row.dictCode)
}

async function toggleStatus(row: SysDictTypeVo) {
  const newStatus = row.status === 1 ? 0 : 1
  await updateDictType(row.id, {
    dictName: row.dictName,
    dictCode: row.dictCode,
    status: newStatus,
    remark: row.remark,
  })
  row.status = newStatus
  ElMessage.success(newStatus === 1 ? '已启用' : '已停用')
}

onMounted(() => {
  fetchList()
})

defineExpose({ fetchList })
</script>

<template>
  <el-card shadow="never">
    <template #header>
      <div class="page-header">
        <span>字典类型管理</span>
        <el-button type="primary" size="small" @click="openDialog()">新增</el-button>
      </div>
    </template>

    <div class="toolbar">
      <el-input v-model="keyword" placeholder="搜索类型名称/编码" clearable />
    </div>

    <el-table
      v-loading="loading"
      :data="displayList"
      stripe
      highlight-current-row
      :show-overflow-tooltip="true"
      @row-click="onRowClick"
    >
      <el-table-column prop="dictName" label="字典名称" min-width="100" show-overflow-tooltip />
      <el-table-column prop="dictCode" label="编码" min-width="100" show-overflow-tooltip />
      <el-table-column label="状态" width="70">
        <template #default="{ row }">
          <el-switch
            :model-value="row.status === 1"
            @change="toggleStatus(row)"
            @click.stop
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click.stop="openDialog(row)">编辑</el-button>
          <el-button link type="danger" size="small" @click.stop="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-if="!keyword"
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
  </el-card>

  <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" destroy-on-close>
    <el-form :model="form" label-width="80px">
      <el-form-item label="字典名称" required>
        <el-input v-model="form.dictName" placeholder="如：性别" />
      </el-form-item>
      <el-form-item label="字典编码" required>
        <el-input v-model="form.dictCode" placeholder="如：gender" :disabled="!!editingId" />
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
