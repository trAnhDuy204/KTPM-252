import { clearAuthStorage, getStoredUser } from "../authStorage";

describe("authStorage", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe("clearAuthStorage", () => {
    it("xóa tất cả key auth trong localStorage", () => {
      localStorage.setItem("accessToken", "abc");
      localStorage.setItem("refreshToken", "xyz");
      localStorage.setItem("user", JSON.stringify({ id: 1 }));

      clearAuthStorage();

      expect(localStorage.getItem("accessToken")).toBeNull();
      expect(localStorage.getItem("refreshToken")).toBeNull();
      expect(localStorage.getItem("user")).toBeNull();
    });
  });

  describe("getStoredUser", () => {
    it("trả về user nếu dữ liệu hợp lệ", () => {
      const user = { id: 1, name: "John" };

      localStorage.setItem("accessToken", "token");
      localStorage.setItem("refreshToken", "refresh");
      localStorage.setItem("user", JSON.stringify(user));

      const result = getStoredUser();

      expect(result).toEqual(user);
    });

    it("thiếu accessToken → return null và clear storage", () => {
      localStorage.setItem("refreshToken", "refresh");
      localStorage.setItem("user", JSON.stringify({ id: 1 }));

      const result = getStoredUser();

      expect(result).toBeNull();
      expect(localStorage.getItem("user")).toBeNull();
    });

    it("thiếu refreshToken → return null và clear storage", () => {
      localStorage.setItem("accessToken", "token");
      localStorage.setItem("user", JSON.stringify({ id: 1 }));

      const result = getStoredUser();

      expect(result).toBeNull();
      expect(localStorage.getItem("accessToken")).toBeNull();
    });

    it("thiếu user → return null", () => {
      localStorage.setItem("accessToken", "token");
      localStorage.setItem("refreshToken", "refresh");

      const result = getStoredUser();

      expect(result).toBeNull();
    });

    it("user JSON lỗi → return null và clear storage", () => {
      localStorage.setItem("accessToken", "token");
      localStorage.setItem("refreshToken", "refresh");
      localStorage.setItem("user", "invalid-json");

      const result = getStoredUser();

      expect(result).toBeNull();
      expect(localStorage.getItem("accessToken")).toBeNull();
      expect(localStorage.getItem("user")).toBeNull();
    });
  });
});