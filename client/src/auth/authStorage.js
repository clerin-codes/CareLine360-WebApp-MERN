export const setAuth = ({ accessToken, refreshToken, user }) => {
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
  localStorage.setItem("role", user.role);
  localStorage.setItem("userId", user.id);
};

export const clearAuth = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("role");
  localStorage.removeItem("userId");
};

export const getRole = () => localStorage.getItem("role");
export const hasToken = () => !!localStorage.getItem("accessToken");
