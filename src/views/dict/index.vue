<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getDictTypeList,
  createDictType,
  updateDictType,
  deleteDictType,
  getDictItemList,
  createDictItem,
  updateDictItem,
  deleteDictItem,
  type SysDictTypeVo,
  type SysDictTypeSaveRequest,
  type SysDictItemVo,
  type SysDictItemSaveRequest,
} from '@/api/dict'
import { usePagination } from '@/composables/usePagination'

// ==================== 字典类型 ====================
const typeKeyword = ref('')
const selectedTypeCode = ref('')

const {
  loading: typeLoading,
  list: typeList,
  total: typeTotal,
  page: typePage,
  size: typeSize,
  load: loadTypes,
  handlePageChange: handleTypePageChange,
  handleSizeChange: handleTypeSizeChange,
} = usePagination<SysDictTypeVo>((p, s) =>
  getDictTypeList({ page: p, size: s }),
)

const typeDisplayList = computed(() => {
  const kw = typeKeyword.value.trim().toLowerCase()
  return kw
    ? typeList.value.filter(
        (item) =>
          item.dictName?.toLowerCase().includes(kw) ||
          item.dictCode?.toLowerCase().includes(kw),
      )
    : [...typeList.value]
})

async function fetchTypeList() {
  await loadTypes()
}

// 类型弹窗
const typeDialogVisible = ref(false)
const typeDialogTitle = ref('新增字典类型')
const typeEditingId = ref<number | null>(null)
const typeForm = ref<SysDictTypeSaveRequest>({
  dictName: '',
  dictCode: '',
  status: 1,
  remark: '',
})

function openTypeDialog(row?: SysDictTypeVo) {
  if (row) {
    typeDialogTitle.value = '编辑字典类型'
    typeEditingId.value = row.id
    typeForm.value = {
      dictName: row.dictName,
      dictCode: row.dictCode,
      status: row.status ?? 1,
      remark: row.remark ?? '',
    }
  } else {
    typeDialogTitle.value = '新增字典类型'
    typeEditingId.value = null
    typeForm.value = { dictName: '', dictCode: '', status: 1, remark: '' }
  }
  typeDialogVisible.value = true
}

async function submitTypeForm() {
  if (typeEditingId.value) {
    await updateDictType(typeEditingId.value, typeForm.value)
    ElMessage.success('更新成功')
  } else {
    await createDictType(typeForm.value)
    ElMessage.success('新增成功')
  }
  typeDialogVisible.value = false
  fetchTypeList()
}

async function handleDeleteType(row: SysDictTypeVo) {
  await ElMessageBox.confirm(`确定删除字典类型「${row.dictName}」？`, '提示', {
    type: 'warning',
  })
  await deleteDictType(row.id)
  ElMessage.success('删除成功')
  if (selectedTypeCode.value === row.dictCode) {
    selectedTypeCode.value = ''
  }
  fetchTypeList()
}

function selectType(row: SysDictTypeVo) {
  selectedTypeCode.value = row.dictCode
  itemPage.value = 1
  fetchItemList()
}

async function toggleTypeStatus(row: SysDictTypeVo) {
  const newStatus = row.status === 1 ? 0 : 1
  await updateDictType(row.id, { dictName: row.dictName, dictCode: row.dictCode, status: newStatus, remark: row.remark })
  row.status = newStatus
  ElMessage.success(newStatus === 1 ? '已启用' : '已停用')
}

// ==================== 字典数据项 ====================
const itemKeyword = ref('')

const {
  loading: itemLoading,
  list: itemList,
  total: itemTotal,
  page: itemPage,
  size: itemSize,
  load: loadItems,
  handlePageChange: handleItemPageChange,
  handleSizeChange: handleItemSizeChange,
} = usePagination<SysDictItemVo>((p, s) =>
  getDictItemList({
    page: p,
    size: s,
    dictTypeCode: selectedTypeCode.value || undefined,
  }),
)

const itemDisplayList = computed(() => {
  const kw = itemKeyword.value.trim().toLowerCase()
  return kw
    ? itemList.value.filter(
        (item) =>
          item.label?.toLowerCase().includes(kw) ||
          item.value?.toLowerCase().includes(kw),
      )
    : [...itemList.value]
})

async function fetchItemList() {
  if (!selectedTypeCode.value) return
  await loadItems()
}

// 数据项弹窗
const itemDialogVisible = ref(false)
const itemDialogTitle = ref('新增字典项')
const itemEditingId = ref<number | null>(null)
const itemForm = ref<SysDictItemSaveRequest>({
  dictTypeCode: '',
  label: '',
  value: '',
  sortOrder: 0,
  isDefault: 0,
  status: 1,
  remark: '',
})

function openItemDialog(row?: SysDictItemVo) {
  if (row) {
    itemDialogTitle.value = '编辑字典项'
    itemEditingId.value = row.id
    itemForm.value = {
      dictTypeCode: row.dictTypeCode,
      label: row.label,
      value: row.value,
      sortOrder: row.sortOrder ?? 0,
      isDefault: row.isDefault ?? 0,
      status: row.status ?? 1,
      remark: row.remark ?? '',
    }
  } else {
    itemDialogTitle.value = '新增字典项'
    itemEditingId.value = null
    itemForm.value = {
      dictTypeCode: selectedTypeCode.value,
      label: '',
      value: '',
      sortOrder: 0,
      isDefault: 0,
      status: 1,
      remark: '',
    }
  }
  itemDialogVisible.value = true
}

async function submitItemForm() {
  if (itemEditingId.value) {
    await updateDictItem(itemEditingId.value, itemForm.value)
    ElMessage.success('更新成功')
  } else {
    await createDictItem(itemForm.value)
    ElMessage.success('新增成功')
  }
  itemDialogVisible.value = false
  fetchItemList()
}

async function handleDeleteItem(row: SysDictItemVo) {
  await ElMessageBox.confirm(`确定删除字典项「${row.label}」？`, '提示', {
    type: 'warning',
  })
  await deleteDictItem(row.id)
  ElMessage.success('删除成功')
  fetchItemList()
}

async function toggleItemStatus(row: SysDictItemVo) {
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
  ElMessage.success(newStatus === 1 ? '已启用' : '已停用')
}

onMounted(fetchTypeList)
</script>

<template>
  <div class="dict-page">
    <el-row :gutter="16">
      <!-- 左侧：字典类型 -->
      <el-col :span="10">
        <el-card shadow="never">
          <template #header>
            <div class="page-header">
              <span>字典类型管理</span>
              <el-button type="primary" size="small" @click="openTypeDialog()">新增</el-button>
            </div>
          </template>

          <div class="toolbar">
            <el-input
              v-model="typeKeyword"
              placeholder="搜索类型名称/编码"
              clearable
            />
          </div>

          <el-table
            v-loading="typeLoading"
            :data="typeDisplayList"
            stripe
            highlight-current-row
            :show-overflow-tooltip="true"
            @row-click="selectType"
          >
            <el-table-column prop="dictName" label="字典名称" min-width="100" show-overflow-tooltip />
            <el-table-column prop="dictCode" label="编码" min-width="100" show-overflow-tooltip />
            <el-table-column label="状态" width="70">
              <template #default="{ row }">
                <el-switch
                  :model-value="row.status === 1"
                  @change="toggleTypeStatus(row)"
                  @click.stop
                />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click.stop="openTypeDialog(row)">编辑</el-button>
                <el-button link type="danger" size="small" @click.stop="handleDeleteType(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>

          <el-pagination
            v-if="!typeKeyword"
            class="pagination"
            background
            layout="total, prev, pager, next"
            :total="typeTotal"
            :current-page="typePage"
            :page-size="typeSize"
            :page-sizes="[10, 20, 50]"
            @current-change="handleTypePageChange"
            @size-change="handleTypeSizeChange"
          />
        </el-card>
      </el-col>

      <!-- 右侧：字典数据项 -->
      <el-col :span="14">
        <el-card shadow="never">
          <template #header>
            <div class="page-header">
              <span>
                字典数据管理
                <template v-if="selectedTypeCode">
                  — <el-tag type="primary" size="small">{{ selectedTypeCode }}</el-tag>
                </template>
              </span>
              <el-button
                type="primary"
                size="small"
                :disabled="!selectedTypeCode"
                @click="openItemDialog()"
              >
                新增
              </el-button>
            </div>
          </template>

          <template v-if="!selectedTypeCode">
            <el-empty description="请在左侧点击选择一个字典类型" />
          </template>

          <template v-else>
            <div class="toolbar">
              <el-input
                v-model="itemKeyword"
                placeholder="搜索标签/值"
                clearable
              />
            </div>

            <el-table v-loading="itemLoading" :data="itemDisplayList" stripe>
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
                <el-switch
                  :model-value="row.status === 1"
                  @change="toggleItemStatus(row)"
                />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="openItemDialog(row)">编辑</el-button>
                <el-button link type="danger" size="small" @click="handleDeleteItem(row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>

            <el-pagination
              v-if="!itemKeyword"
              class="pagination"
              background
              layout="total, prev, pager, next"
              :total="itemTotal"
              :current-page="itemPage"
              :page-size="itemSize"
              :page-sizes="[10, 20, 50]"
              @current-change="handleItemPageChange"
              @size-change="handleItemSizeChange"
            />
          </template>
        </el-card>
      </el-col>
    </el-row>

    <!-- 类型弹窗 -->
    <el-dialog
      v-model="typeDialogVisible"
      :title="typeDialogTitle"
      width="500px"
      destroy-on-close
    >
      <el-form :model="typeForm" label-width="80px">
        <el-form-item label="字典名称" required>
          <el-input v-model="typeForm.dictName" placeholder="如：性别" />
        </el-form-item>
        <el-form-item label="字典编码" required>
          <el-input
            v-model="typeForm.dictCode"
            placeholder="如：gender"
            :disabled="!!typeEditingId"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="typeForm.status">
            <el-radio :value="1">正常</el-radio>
            <el-radio :value="0">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="typeForm.remark" type="textarea" :rows="2" placeholder="可选" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="typeDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitTypeForm">确定</el-button>
      </template>
    </el-dialog>

    <!-- 数据项弹窗 -->
    <el-dialog
      v-model="itemDialogVisible"
      :title="itemDialogTitle"
      width="500px"
      destroy-on-close
    >
      <el-form :model="itemForm" label-width="80px">
        <el-form-item label="字典类型">
          <el-input :model-value="itemForm.dictTypeCode" disabled />
        </el-form-item>
        <el-form-item label="标签" required>
          <el-input v-model="itemForm.label" placeholder="如：男" />
        </el-form-item>
        <el-form-item label="值" required>
          <el-input v-model="itemForm.value" placeholder="如：male" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="itemForm.sortOrder" :min="0" controls-position="right" />
        </el-form-item>
        <el-form-item label="默认">
          <el-switch
            :model-value="itemForm.isDefault === 1"
            active-text="是"
            inactive-text="否"
            @change="(val: boolean) => (itemForm.isDefault = val ? 1 : 0)"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="itemForm.status">
            <el-radio :value="1">正常</el-radio>
            <el-radio :value="0">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="itemForm.remark" type="textarea" :rows="2" placeholder="可选" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="itemDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitItemForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.dict-page {
  min-height: calc(100vh - 120px);
}
</style>
