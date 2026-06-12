import { ref, type Ref } from 'vue'
import { type SysDictItemVo } from '@/api/dict'
import { useDict } from './useDict'

/**
 * 字典标签翻译组合函数 —— 封装字典加载 + value→label 映射。
 *
 * @example
 * const { labelMap, translate, loadDicts } = useDictLabel()
 * await loadDicts(['industry', 'city', 'scale'])
 * // 使用
 * translate('industry', row.industry)   // "RGZN" → "人工智能"
 *
 * // 或直接取 labelMap 在模板中使用：
 * labelMap.value['industry']?.[row.industry]
 */
export function useDictLabel() {
  const { loadDict: rawLoad } = useDict()

  /** 字典编码 → value → label */
  const labelMap = ref<Record<string, Record<string, string>>>({})

  /** 字典选项列表（保留原始数据，供下拉框等使用） */
  const options = ref<Record<string, SysDictItemVo[]>>({})

  /**
   * 批量加载字典
   * @param codes 字典编码数组，如 ['industry', 'city', 'scale']
   */
  async function loadDicts(codes: string[]) {
    const results = await Promise.all(codes.map((code) => rawLoad(code)))
    for (let i = 0; i < codes.length; i++) {
      const code = codes[i]
      const items = results[i]
      options.value[code] = items
      labelMap.value[code] = Object.fromEntries(
        items.map((item) => [item.value, item.label]),
      )
      // 兼容旧数据：label → label 反向映射
      for (const item of items) {
        if (!labelMap.value[code][item.label]) {
          labelMap.value[code][item.label] = item.label
        }
      }
    }
  }

  /**
   * 翻译字典值 → 标签
   * @param code 字典编码
   * @param value 需要翻译的值，undefined 返回 '-'
   */
  function translate(code: string, value: string | undefined): string {
    if (!value) return '-'
    return labelMap.value[code]?.[value] ?? value
  }

  /**
   * 获取指定字典的选项列表（供下拉框使用）
   */
  function getOptions(code: string): SysDictItemVo[] {
    return options.value[code] ?? []
  }

  return { labelMap, options, translate, loadDicts, getOptions }
}
