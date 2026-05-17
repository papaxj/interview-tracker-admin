const USER_ID_KEY = 'it_current_user_id'

export function getCurrentUserId(): number {
  const raw = localStorage.getItem(USER_ID_KEY)
  return raw ? Number(raw) : 1
}

export function setCurrentUserId(id: number) {
  localStorage.setItem(USER_ID_KEY, String(id))
}
