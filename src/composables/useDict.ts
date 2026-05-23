import { getDictItemsByTypeCode, type SysDictItemVo } from '@/api/dict'

/** 模块级缓存：同一字典码只请求一次 */
const cache = new Map<string, SysDictItemVo[]>()

/**
 * 字典加载组合函数 —— 自动缓存，避免重复请求。
 *
 * @example
 * const { loadDict } = useDict()
 * const cities = await loadDict('city')
 */
export function useDict() {
  async function loadDict(code: string): Promise<SysDictItemVo[]> {
    if (cache.has(code)) return cache.get(code)!

    try {
      const items = await getDictItemsByTypeCode(code)
      const list = items ?? []
      cache.set(code, list)
      return list
    } catch {
      return []
    }
  }

  return { loadDict }
}
