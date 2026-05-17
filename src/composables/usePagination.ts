import { ref } from 'vue'
import type { PageResult } from '@/types/api'

export function usePagination<T>(fetcher: (page: number, size: number) => Promise<PageResult<T>>) {
  const loading = ref(false)
  const list = ref<T[]>([])
  const total = ref(0)
  const page = ref(1)
  const size = ref(10)

  async function load() {
    loading.value = true
    try {
      const res = await fetcher(page.value, size.value)
      list.value = res.content
      total.value = res.totalElements
    } finally {
      loading.value = false
    }
  }

  function handlePageChange(p: number) {
    page.value = p
    load()
  }

  function handleSizeChange(s: number) {
    size.value = s
    page.value = 1
    load()
  }

  return {
    loading,
    list,
    total,
    page,
    size,
    load,
    handlePageChange,
    handleSizeChange,
  }
}
