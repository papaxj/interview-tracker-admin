import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getProfile, type SysUserVo } from '@/api/user'

export const useUserStore = defineStore('user', () => {
  const profile = ref<SysUserVo | null>(null)

  async function fetchProfile() {
    profile.value = await getProfile()
  }

  function clearProfile() {
    profile.value = null
  }

  return { profile, fetchProfile, clearProfile }
})
