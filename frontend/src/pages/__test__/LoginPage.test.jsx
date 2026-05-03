import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

import LoginPage from "../LoginPage";
import { useAuth } from "@/context/AuthContext";

const mockNavigate = jest.fn();
const loginMock = jest.fn();

jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  Link: ({ to, children, ...props }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

jest.mock("@/context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("lucide-react", () => ({
  Building2: () => <svg data-testid="building-icon" />,
  AlertCircle: () => <svg data-testid="alert-icon" />,
  ArrowLeft: () => <svg data-testid="arrow-left-icon" />,
}));

describe("LoginPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    useAuth.mockReturnValue({
      login: loginMock,
      loading: false,
    });
  });

  it("should render login page", () => {
    render(<LoginPage />);

    expect(screen.getAllByText("LUMIÈRE").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole("heading", { name: "Đăng nhập" })).toBeInTheDocument();
    expect(
      screen.getByText("Chào mừng trở lại. Vui lòng đăng nhập để tiếp tục.")
    ).toBeInTheDocument();

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Mật khẩu")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /đăng nhập/i })).toBeInTheDocument();
  });

  it("should render home and register links", () => {
    render(<LoginPage />);

    expect(screen.getByRole("link", { name: /trang chủ/i }))
      .toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: /đăng ký ngay/i }))
      .toHaveAttribute("href", "/register");
  });

  it("should show required errors after blur", () => {
    render(<LoginPage />);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Mật khẩu");

    fireEvent.blur(emailInput);
    fireEvent.blur(passwordInput);

    expect(screen.getByText("Email là bắt buộc")).toBeInTheDocument();
    expect(screen.getByText("Mật khẩu là bắt buộc")).toBeInTheDocument();
  });

  it("should show invalid email error after blur", () => {
    render(<LoginPage />);

    const emailInput = screen.getByLabelText("Email");

    fireEvent.change(emailInput, {
      target: {
        name: "email",
        value: "invalid-email",
      },
    });
    fireEvent.blur(emailInput);

    expect(screen.getByText("Email không hợp lệ")).toBeInTheDocument();
  });

  it("should not call login when form is invalid", async () => {
    render(<LoginPage />);

    fireEvent.click(screen.getByRole("button", { name: /đăng nhập/i }));

    await waitFor(() => {
      expect(loginMock).not.toHaveBeenCalled();
    });
  });

  it("should login and navigate to admin page", async () => {
    loginMock.mockResolvedValueOnce({
      user: {
        role: "ADMIN",
      },
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: {
        name: "email",
        value: "admin@test.com",
      },
    });
    fireEvent.change(screen.getByLabelText("Mật khẩu"), {
      target: {
        name: "password",
        value: "password123",
      },
    });

    fireEvent.click(screen.getByRole("button", { name: /đăng nhập/i }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith({
        email: "admin@test.com",
        password: "password123",
      });
    });

    expect(mockNavigate).toHaveBeenCalledWith("/admin");
  });

  it("should login and navigate to reception page", async () => {
    loginMock.mockResolvedValueOnce({
      user: {
        role: "RECEPTION",
      },
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: {
        name: "email",
        value: "reception@test.com",
      },
    });
    fireEvent.change(screen.getByLabelText("Mật khẩu"), {
      target: {
        name: "password",
        value: "password123",
      },
    });

    fireEvent.click(screen.getByRole("button", { name: /đăng nhập/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/reception");
    });
  });

  it("should login and navigate to dashboard page for customer role", async () => {
    loginMock.mockResolvedValueOnce({
      user: {
        role: "CUSTOMER",
      },
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: {
        name: "email",
        value: "customer@test.com",
      },
    });
    fireEvent.change(screen.getByLabelText("Mật khẩu"), {
      target: {
        name: "password",
        value: "password123",
      },
    });

    fireEvent.click(screen.getByRole("button", { name: /đăng nhập/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("should show server error when login fails", async () => {
    loginMock.mockRejectedValueOnce(new Error("Sai email hoặc mật khẩu"));

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText("Email"), {
      target: {
        name: "email",
        value: "user@test.com",
      },
    });
    fireEvent.change(screen.getByLabelText("Mật khẩu"), {
      target: {
        name: "password",
        value: "wrong-password",
      },
    });

    fireEvent.click(screen.getByRole("button", { name: /đăng nhập/i }));

    expect(await screen.findByText("Sai email hoặc mật khẩu")).toBeInTheDocument();
    expect(screen.getByTestId("alert-icon")).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("should disable submit button and show spinner when loading", () => {
    useAuth.mockReturnValue({
      login: loginMock,
      loading: true,
    });

    const { container } = render(<LoginPage />);

    const submitButton = screen.getByRole("button");

    expect(submitButton).toBeDisabled();
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });
});
