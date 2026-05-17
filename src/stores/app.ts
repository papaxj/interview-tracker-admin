import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getMyUserList, type MyUserVo } from '@/api/my-user'
import { getCurrentUserId, setCurrentUserId } from '@/utils/user'

export const useAppStore = defineStore('app', () => {
  const collapsed = ref(false)
  const myUsers = ref<MyUserVo[]>([])
  const currentUserId = ref(getCurrentUserId())

  function toggleSidebar() {
    collapsed.value = !collapsed.value
  }

  async function loadMyUsers() {
    const res = await getMyUserList({ page: 1, size: 100 })
    myUsers.value = res.content
    if (!myUsers.value.find((u) => u.id === currentUserId.value) && myUsers.value.length) {
      setCurrentUser(myUsers.value[0].id)
    }
  }

  function setCurrentUser(id: number) {
    currentUserId.value = id
    setCurrentUserId(id)
  }

  function getCurrentUserName() {
    return myUsers.value.find((u) => u.id === currentUserId.value)?.name ?? `用户#${currentUserId.value}`
  }

  return {
    collapsed,
    myUsers,
    currentUserId,
    toggleSidebar,
    loadMyUsers,
    setCurrentUser,
    getCurrentUserName,
  }
})
