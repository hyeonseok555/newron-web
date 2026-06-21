// 메인 서버 응답 포맷
export interface PaginationMeta {
  last_id: number;
  has_next: boolean;
  limit: number;
}

export interface MainResponse<T> {
  status: "success" | "error";
  meta?: { api_version: string; server_time: string; pagination?: PaginationMeta };
  data: T;
}

// 개인화 서버 응답 포맷
export interface PersResponse<T> {
  code: number;
  message: string;
  result: T;
}
