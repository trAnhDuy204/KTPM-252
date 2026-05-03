import { fireEvent, render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom";

import ReceptionLayout from "../ReceptionLayout";

const mockNavigate = jest.fn();
let mockPathname = "/reception/rooms";

jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({
    pathname: mockPathname,
  }),
}));

const mockLogout = jest.fn();
let mockUser = {
  fullName: "Nguyen Van A",
  email: "customer@test.com",
};

jest.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    user: mockUser,
    logout: mockLogout,
  }),
}));

const mockToggleTheme = jest.fn();
let mockTheme = "light";

jest.mock("@/context/ThemeContext", () => ({
  useTheme: () => ({
    theme: mockTheme,
    toggleTheme: mockToggleTheme,
  }),
}));

jest.mock("@/components/ConfirmDialog", () => ({
  __esModule: true,
  default: ({
    open,
    title,
    message,
    confirmLabel,
    onConfirm,
    onCancel,
  }) => {
    if (!open) return null;

    return (
      <div role="dialog" aria-label={title}>
        <p>{message}</p>
        <button onClick={onConfirm}>{confirmLabel}</button>
        <button onClick={onCancel}>Hủy</button>
      </div>
    );
  },
}));

const renderLayout = (
  pathname = "/reception/rooms",
  children = <div>Content</div>
) => {
  mockPathname = pathname;

  return render(<ReceptionLayout>{children}</ReceptionLayout>);
};

describe("ReceptionLayout", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockPathname = "/reception/rooms";
    mockTheme = "light";
    mockUser = {
      fullName: "Nguyen Van A",
      email: "customer@test.com",
    };
  });

  it("should render children, brand and user info", () => {
    renderLayout("/reception/rooms", <div>Reception content</div>);

    expect(screen.getByText("Reception content")).toBeInTheDocument();
    expect(screen.getAllByText("LUMIÈRE")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Reception")[0]).toBeInTheDocument();

    expect(screen.getAllByText("Nguyen Van A")[0]).toBeInTheDocument();
    expect(screen.getAllByText("customer@test.com")[0]).toBeInTheDocument();
  });

  it("should navigate when clicking nav item", () => {
    renderLayout();

    fireEvent.click(screen.getAllByRole("button", { name: /tổng quan/i })[0]);

    expect(mockNavigate).toHaveBeenCalledWith("/reception");
  });

  it("should mark current nav item as active", () => {
    renderLayout("/reception/rooms");

    const roomButtons = screen.getAllByRole("button", { name: /phòng/i });

    expect(roomButtons[0]).toHaveClass("text-accent");
    expect(roomButtons[0]).toHaveClass("bg-accent-soft/85");
  });

  it("should toggle theme when clicking theme button", () => {
    mockTheme = "light";

    renderLayout();

    const themeButtons = screen.getAllByRole("button", {
      name: /chuyển sang giao diện tối/i,
    });

    fireEvent.click(themeButtons[0]);

    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });

  it("should render light mode target when theme is dark", () => {
    mockTheme = "dark";

    renderLayout();

    const themeButtons = screen.getAllByRole("button", {
      name: /chuyển sang giao diện sáng/i,
    });

    expect(themeButtons.length).toBeGreaterThanOrEqual(1);
  });

  it("should open logout confirm dialog when clicking logout", () => {
    renderLayout();

    fireEvent.click(screen.getAllByRole("button", { name: /đăng xuất/i })[0]);

    expect(screen.getByRole("dialog", { name: /đăng xuất/i })).toBeInTheDocument();
    expect(screen.getByText("Bạn có chắc muốn đăng xuất?")).toBeInTheDocument();
  });

  it("should logout and navigate to login when confirming logout", () => {
    renderLayout();

    fireEvent.click(screen.getAllByRole("button", { name: /đăng xuất/i })[0]);

    const dialog = screen.getByRole("dialog", { name: /đăng xuất/i });

    fireEvent.click(
      within(dialog).getByRole("button", { name: /^đăng xuất$/i })
    );

    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });


  it("should close logout confirm dialog when cancelling logout", () => {
    renderLayout();

    fireEvent.click(screen.getAllByRole("button", { name: /đăng xuất/i })[0]);

    expect(screen.getByRole("dialog", { name: /đăng xuất/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /hủy/i }));

    expect(screen.queryByRole("dialog", { name: /đăng xuất/i })).not.toBeInTheDocument();
    expect(mockLogout).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalledWith("/login");
  });
});
