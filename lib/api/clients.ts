import axios, { type AxiosInstance } from "axios";

function withAuthInterceptor(instance: AxiosInstance): AxiosInstance {
  instance.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
      const token = sessionStorage.getItem("newron_access_token");
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
  return instance;
}

// 브라우저에서는 /api/proxy/* 경유, 서버사이드에서는 직접 접근
const isServer = typeof window === "undefined";

export const mainApi = withAuthInterceptor(
  axios.create({
    baseURL: isServer
      ? process.env.MAIN_API_URL
      : "/api/proxy/main",
    timeout: 10000,
  })
);

export const persApi = withAuthInterceptor(
  axios.create({
    baseURL: isServer
      ? process.env.PERS_API_URL
      : "/api/proxy/pers",
    timeout: 10000,
  })
);

export const aiApi = withAuthInterceptor(
  axios.create({
    baseURL: isServer
      ? process.env.AI_API_URL
      : "/api/proxy/ai",
    timeout: 15000,
  })
);

export const briefApi = withAuthInterceptor(
  axios.create({
    baseURL: isServer
      ? process.env.BRIEF_API_URL
      : "/api/proxy/brief",
    timeout: 35000, // 브리핑 생성 최대 30초
  })
);
