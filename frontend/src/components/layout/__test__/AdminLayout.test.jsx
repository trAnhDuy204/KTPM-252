import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import AdminLayout from "../AdminLayout";
import "@testing-library/jest-dom";

const mockNavigate = jest.fn();
let mockPathname = "/admin";

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

jest.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    user: { fullName: "Nguyễn Admin", email: "admin@lumiere.com" },
    logout: mockLogout,
  }),
}));

let mockTheme = "light";
const mockToggleTheme = jest.fn();

jest.mock("@/context/ThemeContext", () => ({
  useTheme: () => ({
    theme: mockTheme,
    toggleTheme: mockToggleTheme,
  }),
}));



const renderLayout = (
  pathname = "/admin",
  children = <div>Content</div>
) => {
  mockPathname = pathname;

  return render(<AdminLayout>{children}</AdminLayout>);
};


beforeEach(() => {
  jest.clearAllMocks();
  mockTheme = "light";
});



describe("AdminLayout – Brand", () => {
  it("hiển thị tên thương hiệu LUMIÈRE", () => {
    renderLayout();
    // Xuất hiện cả ở sidebar và header mobile
    expect(screen.getAllByText("LUMIÈRE").length).toBeGreaterThanOrEqual(1);
  });

  it("hiển thị label 'Admin' bên dưới tên thương hiệu", () => {
    renderLayout();
    expect(screen.getAllByText("Admin").length).toBeGreaterThanOrEqual(1);
  });
});


describe("AdminLayout – thông tin user", () => {
  it("hiển thị fullName của user", () => {
    renderLayout();
    expect(screen.getAllByText("Nguyễn Admin").length).toBeGreaterThanOrEqual(1);
  });

  it("hiển thị email của user", () => {
    renderLayout();
    expect(screen.getAllByText("admin@lumiere.com").length).toBeGreaterThanOrEqual(1);
  });

  it("không crash khi user là undefined", () => {
    jest.resetModules();
    // Tạm mock user = undefined
    jest
      .spyOn(require("@/context/AuthContext"), "useAuth")
      .mockReturnValue({ user: undefined, logout: mockLogout });

    expect(() => renderLayout()).not.toThrow();
  });
});


describe("AdminLayout – navigation items", () => {
  const navLabels = ["Tổng quan", "Khách sạn", "Phòng", "Loại phòng", "Nhân viên"];

  test.each(navLabels)("hiển thị nav item '%s'", (label) => {
    renderLayout();
    // Mỗi label xuất hiện ở cả desktop nav và mobile nav
    expect(screen.getAllByText(label).length).toBeGreaterThanOrEqual(1);
  });
});


describe("AdminLayout – active state nav", () => {
  it("item 'Tổng quan' active khi pathname = /admin", () => {
    renderLayout("/admin");
    // Lấy tất cả button có text "Tổng quan"
    const buttons = screen.getAllByRole("button", { name: /tổng quan/i });
    const activeBtn = buttons.find((b) =>
      b.className.includes("bg-accent-soft")
    );
    expect(activeBtn).toBeTruthy();
  });

  it("item 'Khách sạn' active khi pathname = /admin/hotels", () => {
    renderLayout("/admin/hotels");
    const buttons = screen.getAllByRole("button", { name: /khách sạn/i });
    const activeBtn = buttons.find((b) =>
      b.className.includes("bg-accent-soft")
    );
    expect(activeBtn).toBeTruthy();
  });

  it("item 'Phòng' active khi pathname bắt đầu với /admin/rooms/", () => {
    renderLayout("/admin/rooms/42");
    const buttons = screen.getAllByRole("button", { name: /^phòng$/i });
    const activeBtn = buttons.find((b) =>
      b.className.includes("bg-accent-soft")
    );
    expect(activeBtn).toBeTruthy();
  });

  it("item 'Tổng quan' KHÔNG active khi pathname = /admin/hotels", () => {
    renderLayout("/admin/hotels");
    const buttons = screen.getAllByRole("button", { name: /tổng quan/i });
    const activeBtn = buttons.find((b) =>
      b.className.includes("bg-accent-soft")
    );
    expect(activeBtn).toBeFalsy();
  });
});


describe("AdminLayout – điều hướng", () => {
  it("navigate đến /admin/hotels khi nhấn 'Khách sạn' ở desktop nav", () => {
    renderLayout();
    const buttons = screen.getAllByRole("button", { name: /khách sạn/i });
    fireEvent.click(buttons[0]);
    expect(mockNavigate).toHaveBeenCalledWith("/admin/hotels");
  });

  it("navigate đến /admin/rooms khi nhấn 'Phòng'", () => {
    renderLayout();
    const buttons = screen.getAllByRole("button", { name: /^phòng$/i });
    fireEvent.click(buttons[0]);
    expect(mockNavigate).toHaveBeenCalledWith("/admin/rooms");
  });

  it("navigate đến /admin/users khi nhấn 'Nhân viên'", () => {
    renderLayout();
    const buttons = screen.getAllByRole("button", { name: /nhân viên/i });
    fireEvent.click(buttons[0]);
    expect(mockNavigate).toHaveBeenCalledWith("/admin/users");
  });
});


describe("AdminLayout – đăng xuất", () => {
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


describe("AdminLayout – theme toggle", () => {
  it("hiển thị icon Sun khi theme = dark", () => {
    mockTheme = "dark";

    renderLayout();

    expect(
      screen.getAllByRole("button", { name: /chuyển sang giao diện sáng/i })
        .length
    ).toBeGreaterThanOrEqual(1);
  });


  it("gọi toggleTheme khi nhấn nút theme", () => {
    mockTheme = "light";

    renderLayout();

    const themeBtns = screen.getAllByRole("button", {
      name: /chuyển sang giao diện tối/i,
    });

    fireEvent.click(themeBtns[0]);

    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });


  it("hiển thị icon Moon và label 'Tối' khi theme = light", () => {
    mockTheme = "light";

    renderLayout();

    const themeBtns = screen.getAllByRole("button", {
      name: /chuyển sang giao diện tối/i,
    });

    expect(themeBtns.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Tối")).toBeInTheDocument();
  });

});


describe("AdminLayout – children", () => {
  it("render children bên trong main", () => {
    renderLayout("/admin", <p>Nội dung trang</p>);
    expect(screen.getByText("Nội dung trang")).toBeInTheDocument();
  });
});