const AUTH_KEYS = ["accessToken", "refreshToken", "user"];

export function clearAuthStorage() {
  AUTH_KEYS.forEach((key) => localStorage.removeItem(key));
}

export function getStoredUser() {
  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");
  const rawUser = localStorage.getItem("user");

  if (!accessToken || !refreshToken || !rawUser) {
    clearAuthStorage();
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch {
    clearAuthStorage();
    return null;
  }
}
