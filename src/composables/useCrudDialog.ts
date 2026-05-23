import { computed, reactive, ref } from 'vue'
import type { FormInstance } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'

export interface UseCrudDialogOptions<TForm extends Record<string, unknown>> {
  /** 实体名称，用于弹窗标题和提示信息，例如 '投递'、'面试'、'Offer' */
  label: string
  /** 表单默认值工厂 */
  defaultForm: () => TForm
  /** 保存成功后的回调，通常用于刷新列表 */
  onSaved: () => void | Promise<void>
}

/**
 * 通用 CRUD 弹窗组合函数 —— 封装新增/编辑/删除的公共状态与流程。
 *
 * @example
 * const { dialogVisible, editingId, submitting, formRef, form, dialogTitle,
 *          openCreate, openEdit, close, doSubmit, doDelete } =
 *   useCrudDialog({ label: '投递', defaultForm, onSaved: fetchList })
 */
export function useCrudDialog<TForm extends Record<string, unknown>>(
  options: UseCrudDialogOptions<TForm>,
) {
  const dialogVisible = ref(false)
  const editingId = ref<number | null>(null)
  const submitting = ref(false)
  const formRef = ref<FormInstance>()

  const form = reactive(options.defaultForm()) as TForm

  const dialogTitle = computed(() =>
    editingId.value ? `编辑${options.label}` : `新增${options.label}`,
  )

  function openCreate() {
    editingId.value = null
    Object.assign(form, options.defaultForm())
    dialogVisible.value = true
    // 清除表单校验
    formRef.value?.clearValidate()
  }

  function openEdit(id: number, data: Partial<TForm>) {
    editingId.value = id
    Object.assign(form, data)
    dialogVisible.value = true
    formRef.value?.clearValidate()
  }

  function close() {
    dialogVisible.value = false
  }

  /**
   * 执行新增或更新，内部自动校验表单。
   * @returns true 表示保存成功
   */
  async function doSubmit(
    createApi: () => Promise<unknown>,
    updateApi: () => Promise<unknown>,
  ): Promise<boolean> {
    const valid = await formRef.value?.validate().catch(() => false)
    if (!valid) return false

    submitting.value = true
    try {
      if (editingId.value) {
        await updateApi()
      } else {
        await createApi()
      }
      ElMessage.success(editingId.value ? '更新成功' : '创建成功')
      dialogVisible.value = false
      await options.onSaved()
      return true
    } finally {
      submitting.value = false
    }
  }

  /** 执行删除 —— 内置确认弹窗 */
  async function doDelete(
    id: number,
    name: string,
    deleteApi: () => Promise<unknown>,
  ) {
    await ElMessageBox.confirm(`确定删除${options.label}「${name}」？`, '提示', {
      type: 'warning',
    })
    await deleteApi()
    ElMessage.success('删除成功')
    await options.onSaved()
  }

  return {
    dialogVisible,
    editingId,
    submitting,
    formRef,
    form,
    dialogTitle,
    openCreate,
    openEdit,
    close,
    doSubmit,
    doDelete,
  }
}
