"use client";

import { useEffect, useState } from "react";
import { getGuestUserId } from "@/lib/guestId";

// TODO: 로그인 세션 연동 후 NextAuth user_id 우선 사용하도록 교체
export function useUserId(): string | null {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    setUserId(getGuestUserId());
  }, []);

  return userId;
}
