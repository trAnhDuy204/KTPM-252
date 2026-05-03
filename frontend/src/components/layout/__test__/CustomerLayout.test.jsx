import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

import CustomerLayout from "../CustomerLayout";

const mockNavigate = jest.fn();
let mockPathname = "/dashboard";

jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: mockPathname }),
  Outlet: () => <div data-testid="outlet">Outlet content</div>,
  Link: ({ to, children, ...props }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

const mockLogout = jest.fn();
let mockUser = {
  fullName: "Trần Khách Hàng",
  email: "customer@lumiere.com",
  role: "CUSTOMER",
};

jest.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    user: mockUser,
    logout: mockLogout,
  }),
}));

const mockToggleTheme = jest.fn();
let mockTheme = "dark";

jest.mock("@/context/ThemeContext", () => ({
  useTheme: () => ({
    theme: mockTheme,
    toggleTheme: mockToggleTheme,
  }),
}));

const renderLayout = (
  pathname = "/dashboard",
  children = <div>Page Content</div>
) => {
  mockPathname = pathname;

  return render(<CustomerLayout>{children}</CustomerLayout>);
};

beforeEach(() => {
  jest.clearAllMocks();

  mockPathname = "/dashboard";
  mockTheme = "dark";
  mockUser = {
    fullName: "Trần Khách Hàng",
    email: "customer@lumiere.com",
    role: "CUSTOMER",
  };
});



describe("CustomerLayout – Brand", () => {
  it("hiển thị tên thương hiệu LUMIÈRE", () => {
    renderLayout();
    expect(screen.getAllByText("LUMIÈRE").length).toBeGreaterThanOrEqual(1);
  });

  it("hiển thị role label 'Customer' khi role = CUSTOMER", () => {
    renderLayout();
    expect(screen.getAllByText("Customer").length).toBeGreaterThanOrEqual(1);
  });

  it("hiển thị role label 'Admin' khi role = ADMIN", () => {
    mockUser = { fullName: "Admin User", email: "a@b.com", role: "ADMIN" };

    renderLayout();
    expect(screen.getAllByText("Admin").length).toBeGreaterThanOrEqual(1);
  });

  it("hiển thị role label 'Reception' khi role = RECEPTION", () => {
    mockUser = { fullName: "Staff", email: "s@b.com", role: "RECEPTION" };
    renderLayout();
    expect(screen.getAllByText("Reception").length).toBeGreaterThanOrEqual(1);
  });

  it("hiển thị role gốc khi role không khớp ROLE_LABELS", () => {
    mockUser = { fullName: "X", email: "x@b.com", role: "UNKNOWN_ROLE" };
    renderLayout();
    expect(screen.getAllByText("UNKNOWN_ROLE").length).toBeGreaterThanOrEqual(1);
  });
});


describe("CustomerLayout – thông tin user", () => {
  it("hiển thị fullName của user", () => {
    renderLayout();
    expect(screen.getAllByText("Trần Khách Hàng").length).toBeGreaterThanOrEqual(1);
  });

  it("hiển thị email của user", () => {
    renderLayout();
    expect(screen.getAllByText("customer@lumiere.com").length).toBeGreaterThanOrEqual(1);
  });

  it("không crash khi user = undefined", () => {
    mockUser = undefined;
    expect(() => renderLayout()).not.toThrow();
  });
});


describe("CustomerLayout – navigation items", () => {
  const navLabels = ["Tổng quan", "Khách sạn", "Đánh giá", "Hồ sơ"];

  test.each(navLabels)("hiển thị nav item '%s'", (label) => {
    renderLayout();
    expect(screen.getAllByText(label).length).toBeGreaterThanOrEqual(1);
  });
});


describe("CustomerLayout – active state nav", () => {
  it("item 'Tổng quan' active khi pathname = /dashboard", () => {
    renderLayout("/dashboard");
    const buttons = screen.getAllByRole("button", { name: /tổng quan/i });
    const activeBtn = buttons.find((b) => b.className.includes("bg-accent-soft"));
    expect(activeBtn).toBeTruthy();
  });

  it("item 'Khách sạn' active khi pathname = /dashboard/hotels", () => {
    renderLayout("/dashboard/hotels");
    const buttons = screen.getAllByRole("button", { name: /khách sạn/i });
    const activeBtn = buttons.find((b) => b.className.includes("bg-accent-soft"));
    expect(activeBtn).toBeTruthy();
  });

  it("item 'Đánh giá' active khi pathname = /dashboard/reviews", () => {
    renderLayout("/dashboard/reviews");
    const buttons = screen.getAllByRole("button", { name: /đánh giá/i });
    const activeBtn = buttons.find((b) => b.className.includes("bg-accent-soft"));
    expect(activeBtn).toBeTruthy();
  });

  it("item 'Hồ sơ' active khi pathname = /dashboard/profile", () => {
    renderLayout("/dashboard/profile");
    const buttons = screen.getAllByRole("button", { name: /hồ sơ/i });
    const activeBtn = buttons.find((b) => b.className.includes("bg-accent-soft"));
    expect(activeBtn).toBeTruthy();
  });

  it("item 'Hồ sơ' active khi pathname bắt đầu với /dashboard/profile/", () => {
    renderLayout("/dashboard/profile/edit");
    const buttons = screen.getAllByRole("button", { name: /hồ sơ/i });
    const activeBtn = buttons.find((b) => b.className.includes("bg-accent-soft"));
    expect(activeBtn).toBeTruthy();
  });

  it("item 'Tổng quan' KHÔNG active khi pathname = /dashboard/hotels", () => {
    renderLayout("/dashboard/hotels");
    const buttons = screen.getAllByRole("button", { name: /tổng quan/i });
    const activeBtn = buttons.find((b) => b.className.includes("bg-accent-soft"));
    expect(activeBtn).toBeFalsy();
  });

  it("'Tổng quan' KHÔNG active khi pathname = /dashboard/hotels (prefix guard)", () => {
    // /dashboard không phải prefix của /dashboard/hotels trong ngữ nghĩa exact match
    renderLayout("/dashboard/hotels");
    const buttons = screen.getAllByRole("button", { name: /tổng quan/i });
    const activeBtn = buttons.find((b) => b.className.includes("bg-accent-soft"));
    expect(activeBtn).toBeFalsy();
  });
});


describe("CustomerLayout – điều hướng", () => {
  it("navigate đến /dashboard/hotels khi nhấn 'Khách sạn'", () => {
    renderLayout();
    const buttons = screen.getAllByRole("button", { name: /khách sạn/i });
    fireEvent.click(buttons[0]);
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard/hotels");
  });

  it("navigate đến /dashboard/reviews khi nhấn 'Đánh giá'", () => {
    renderLayout();
    const buttons = screen.getAllByRole("button", { name: /đánh giá/i });
    fireEvent.click(buttons[0]);
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard/reviews");
  });

  it("navigate đến /dashboard/profile khi nhấn 'Hồ sơ'", () => {
    renderLayout();
    const buttons = screen.getAllByRole("button", { name: /hồ sơ/i });
    fireEvent.click(buttons[0]);
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard/profile");
  });

  it("navigate đến /dashboard khi nhấn 'Tổng quan'", () => {
    renderLayout();
    const buttons = screen.getAllByRole("button", { name: /tổng quan/i });
    fireEvent.click(buttons[0]);
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
  });
});


describe("CustomerLayout – đăng xuất", () => {
  it("gọi logout() khi nhấn nút Đăng xuất", () => {
    renderLayout();
    const logoutBtns = screen.getAllByRole("button", { name: /đăng xuất/i });
    fireEvent.click(logoutBtns[0]);
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it("navigate đến /login sau khi logout", () => {
    renderLayout();
    const logoutBtns = screen.getAllByRole("button", { name: /đăng xuất/i });
    fireEvent.click(logoutBtns[0]);
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("gọi logout() trước khi navigate /login", () => {
    const callOrder = [];
    mockLogout.mockImplementation(() => callOrder.push("logout"));
    mockNavigate.mockImplementation((path) => {
      if (path === "/login") callOrder.push("navigate");
    });

    renderLayout();
    const logoutBtns = screen.getAllByRole("button", { name: /đăng xuất/i });
    fireEvent.click(logoutBtns[0]);

    expect(callOrder).toEqual(["logout", "navigate"]);
  });
});


describe("CustomerLayout – theme toggle", () => {
  it("hiển thị aria-label 'Chuyển sang giao diện sáng' khi theme = dark", () => {
    renderLayout();
    const btns = screen.getAllByRole("button", { name: /chuyển sang giao diện sáng/i });
    expect(btns.length).toBeGreaterThanOrEqual(1);
  });

  it("gọi toggleTheme khi nhấn nút theme", () => {
    renderLayout();
    const btns = screen.getAllByRole("button", { name: /chuyển sang giao diện sáng/i });
    fireEvent.click(btns[0]);
    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });

  it("hiển thị aria-label 'Chuyển sang giao diện tối' khi theme = light", () => {
    mockTheme = "light";

    renderLayout();

    const btns = screen.getAllByRole("button", {
      name: /chuyển sang giao diện tối/i,
    });

    expect(btns.length).toBeGreaterThanOrEqual(1);
  });

});


describe("CustomerLayout – children", () => {
  it("render children bên trong main", () => {
    renderLayout("/dashboard", <p>Nội dung dashboard</p>);
    expect(screen.getByText("Nội dung dashboard")).toBeInTheDocument();
  });
});