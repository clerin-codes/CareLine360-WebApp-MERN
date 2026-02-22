import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL;

if (import.meta.env.DEV) {
  console.log("API Base URL:", import.meta.env.VITE_API_URL);
}

export const api = axios.create({ baseURL });

// attach access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// auto refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) return Promise.reject(err);

      try {
        const refreshRes = await axios.post(`${baseURL}/auth/refresh`, { refreshToken });
        localStorage.setItem("accessToken", refreshRes.data.accessToken);

        if (!original.headers) {
          original.headers = {};
        }
        original.headers.Authorization = `Bearer ${refreshRes.data.accessToken}`;
        return api(original);
      } catch (refreshError) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(err);
  }
);
