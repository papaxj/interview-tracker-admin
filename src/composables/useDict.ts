import { getDictItemsByTypeCode, type SysDictItemVo } from '@/api/dict'

/** 模块级缓存：同一字典码只请求一次 */
const cache = new Map<string, SysDictItemVo[]>()

/**
 * 字典加载组合函数 —— 自动缓存，避免重复请求。
 *
 * @example
 * const { loadDict, refreshDict } = useDict()
 * const cities = await loadDict('city')
 * // 修改字典后强制刷新
 * await refreshDict('industry')
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

  /** 清除指定字典的缓存并重新请求 */
  async function refreshDict(code: string): Promise<SysDictItemVo[]> {
    cache.delete(code)
    return loadDict(code)
  }

  /** 清除所有缓存（用于批量修改后） */
  function clearAllCache() {
    cache.clear()
  }

  return { loadDict, refreshDict, clearAllCache }
}
