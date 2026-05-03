import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

import RegisterPage from "../RegisterPage";
import { useAuth } from "@/context/AuthContext";

const mockNavigate = jest.fn();
const registerMock = jest.fn();

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
}));

describe("RegisterPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    useAuth.mockReturnValue({
      register: registerMock,
      loading: false,
    });
  });

  it("should render register page", () => {
    render(<RegisterPage />);

    expect(screen.getAllByText("LUMIÈRE").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole("heading", { name: "Tạo tài khoản" })).toBeInTheDocument();
    expect(
      screen.getByText("Đăng ký để trải nghiệm dịch vụ đặt phòng cao cấp.")
    ).toBeInTheDocument();

    expect(screen.getByPlaceholderText("Nguyễn Văn A")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("0901234567")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("your@email.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Tối thiểu 8 ký tự")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Nhập lại mật khẩu")).toBeInTheDocument();
  });

  it("should render login link", () => {
    render(<RegisterPage />);

    expect(screen.getByRole("link", { name: /đăng nhập/i }))
      .toHaveAttribute("href", "/login");
  });

  it("should show required errors after blur", () => {
    render(<RegisterPage />);

    fireEvent.blur(screen.getByPlaceholderText("Nguyễn Văn A"));
    fireEvent.blur(screen.getByPlaceholderText("your@email.com"));
    fireEvent.blur(screen.getByPlaceholderText("Tối thiểu 8 ký tự"));
    fireEvent.blur(screen.getByPlaceholderText("Nhập lại mật khẩu"));

    expect(screen.getByText("Họ tên là bắt buộc")).toBeInTheDocument();
    expect(screen.getByText("Email là bắt buộc")).toBeInTheDocument();
    expect(screen.getByText("Mật khẩu là bắt buộc")).toBeInTheDocument();
    expect(screen.getByText("Vui lòng xác nhận mật khẩu")).toBeInTheDocument();
  });

  it("should show min full name error", () => {
    render(<RegisterPage />);

    const fullNameInput = screen.getByPlaceholderText("Nguyễn Văn A");

    fireEvent.change(fullNameInput, {
      target: {
        name: "fullName",
        value: "A",
      },
    });
    fireEvent.blur(fullNameInput);

    expect(screen.getByText("Tối thiểu 2 ký tự")).toBeInTheDocument();
  });

  it("should show invalid email error", () => {
    render(<RegisterPage />);

    const emailInput = screen.getByPlaceholderText("your@email.com");

    fireEvent.change(emailInput, {
      target: {
        name: "email",
        value: "invalid-email",
      },
    });
    fireEvent.blur(emailInput);

    expect(screen.getByText("Email không hợp lệ")).toBeInTheDocument();
  });

  it("should show invalid phone error", () => {
    render(<RegisterPage />);

    const phoneInput = screen.getByPlaceholderText("0901234567");

    fireEvent.change(phoneInput, {
      target: {
        name: "phone",
        value: "abc123",
      },
    });
    fireEvent.blur(phoneInput);

    expect(screen.getByText("Số điện thoại không hợp lệ")).toBeInTheDocument();
  });

  it("should show password length error", () => {
    render(<RegisterPage />);

    const passwordInput = screen.getByPlaceholderText("Tối thiểu 8 ký tự");

    fireEvent.change(passwordInput, {
      target: {
        name: "password",
        value: "Aa1",
      },
    });
    fireEvent.blur(passwordInput);

    expect(screen.getByText("Tối thiểu 8 ký tự")).toBeInTheDocument();
  });

  it("should show password complexity error", () => {
    render(<RegisterPage />);

    const passwordInput = screen.getByPlaceholderText("Tối thiểu 8 ký tự");

    fireEvent.change(passwordInput, {
      target: {
        name: "password",
        value: "password",
      },
    });
    fireEvent.blur(passwordInput);

    expect(screen.getByText("Cần chữ hoa, chữ thường và số")).toBeInTheDocument();
  });

  it("should show confirm password mismatch error", () => {
    render(<RegisterPage />);

    const passwordInput = screen.getByPlaceholderText("Tối thiểu 8 ký tự");
    const confirmInput = screen.getByPlaceholderText("Nhập lại mật khẩu");

    fireEvent.change(passwordInput, {
      target: {
        name: "password",
        value: "Password1",
      },
    });
    fireEvent.change(confirmInput, {
      target: {
        name: "confirmPassword",
        value: "Password2",
      },
    });
    fireEvent.blur(confirmInput);

    expect(screen.getByText("Mật khẩu không khớp")).toBeInTheDocument();
  });

  it("should show password strength", () => {
    render(<RegisterPage />);

    fireEvent.change(screen.getByPlaceholderText("Tối thiểu 8 ký tự"), {
      target: {
        name: "password",
        value: "Password1!",
      },
    });

    expect(screen.getByText("Mạnh")).toBeInTheDocument();
  });

  it("should not call register when form is invalid", async () => {
    render(<RegisterPage />);

    fireEvent.click(screen.getByRole("button", { name: /tạo tài khoản/i }));

    await waitFor(() => {
      expect(registerMock).not.toHaveBeenCalled();
    });
  });

  it("should register and navigate to dashboard when form is valid", async () => {
    registerMock.mockResolvedValueOnce({});

    render(<RegisterPage />);

    fireEvent.change(screen.getByPlaceholderText("Nguyễn Văn A"), {
      target: {
        name: "fullName",
        value: "Nguyen Van A",
      },
    });
    fireEvent.change(screen.getByPlaceholderText("0901234567"), {
      target: {
        name: "phone",
        value: "0901234567",
      },
    });
    fireEvent.change(screen.getByPlaceholderText("your@email.com"), {
      target: {
        name: "email",
        value: "user@test.com",
      },
    });
    fireEvent.change(screen.getByPlaceholderText("Tối thiểu 8 ký tự"), {
      target: {
        name: "password",
        value: "Password1",
      },
    });
    fireEvent.change(screen.getByPlaceholderText("Nhập lại mật khẩu"), {
      target: {
        name: "confirmPassword",
        value: "Password1",
      },
    });

    fireEvent.click(screen.getByRole("button", { name: /tạo tài khoản/i }));

    await waitFor(() => {
      expect(registerMock).toHaveBeenCalledWith({
        fullName: "Nguyen Van A",
        email: "user@test.com",
        password: "Password1",
        phone: "0901234567",
      });
    });

    expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
  });

  it("should show server error when register fails", async () => {
    registerMock.mockRejectedValueOnce(new Error("Email đã tồn tại"));

    render(<RegisterPage />);

    fireEvent.change(screen.getByPlaceholderText("Nguyễn Văn A"), {
      target: {
        name: "fullName",
        value: "Nguyen Van A",
      },
    });
    fireEvent.change(screen.getByPlaceholderText("your@email.com"), {
      target: {
        name: "email",
        value: "user@test.com",
      },
    });
    fireEvent.change(screen.getByPlaceholderText("Tối thiểu 8 ký tự"), {
      target: {
        name: "password",
        value: "Password1",
      },
    });
    fireEvent.change(screen.getByPlaceholderText("Nhập lại mật khẩu"), {
      target: {
        name: "confirmPassword",
        value: "Password1",
      },
    });

    fireEvent.click(screen.getByRole("button", { name: /tạo tài khoản/i }));

    expect(await screen.findByText("Email đã tồn tại")).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("should disable submit button and show spinner when loading", () => {
    useAuth.mockReturnValue({
      register: registerMock,
      loading: true,
    });

    const { container } = render(<RegisterPage />);

    const submitButton = screen.getByRole("button");

    expect(submitButton).toBeDisabled();
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });
});
