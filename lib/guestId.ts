const GUEST_ID_KEY = "newron_guest_user_id";

// spec §7-6: 비로그인 사용자는 localStorage UUID를 user_id로 사용
export function getGuestUserId(): string {
  let id = localStorage.getItem(GUEST_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(GUEST_ID_KEY, id);
  }
  return id;
}
