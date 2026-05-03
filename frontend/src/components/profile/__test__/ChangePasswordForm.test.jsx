import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

import ChangePasswordForm from "../ChangePasswordForm";
import { profileApi } from "@/services/profileApi";

jest.mock("@/services/profileApi", () => ({
  profileApi: {
    changePassword: jest.fn(),
  },
}));

jest.mock("lucide-react", () => ({
  Eye: () => <svg data-testid="eye-icon" />,
  EyeClosed: () => <svg data-testid="eye-closed-icon" />,
}));

const getPasswordInputs = (container) =>
  Array.from(
    container.querySelectorAll('input[type="password"], input[type="text"]')
  );

describe("ChangePasswordForm", () => {
  const onSuccess = jest.fn();
  const onError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render form fields and submit button", () => {
    render(<ChangePasswordForm onSuccess={onSuccess} onError={onError} />);

    expect(
      screen.getByRole("heading", { name: "Đổi mật khẩu" })
    ).toBeInTheDocument();

    expect(screen.getByText("Mật khẩu hiện tại")).toBeInTheDocument();
    expect(screen.getByText("Mật khẩu mới")).toBeInTheDocument();
    expect(screen.getByText("Xác nhận mật khẩu mới")).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /đổi mật khẩu/i })
    ).toBeInTheDocument();
  });


  it("should show required errors when submitting empty form", () => {
    render(<ChangePasswordForm onSuccess={onSuccess} onError={onError} />);

    fireEvent.click(screen.getByRole("button", { name: /đổi mật khẩu/i }));

    expect(screen.getAllByText("Bắt buộc")).toHaveLength(3);
    expect(profileApi.changePassword).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("should show error when new password is shorter than 8 characters", () => {
    const { container } = render(
      <ChangePasswordForm onSuccess={onSuccess} onError={onError} />
    );

    const inputs = getPasswordInputs(container);

    fireEvent.change(inputs[0], { target: { value: "oldPassword1" } });
    fireEvent.change(inputs[1], { target: { value: "Aa1" } });
    fireEvent.change(inputs[2], { target: { value: "Aa1" } });

    fireEvent.click(screen.getByRole("button", { name: /đổi mật khẩu/i }));

    expect(screen.getByText("Tối thiểu 8 ký tự")).toBeInTheDocument();
    expect(profileApi.changePassword).not.toHaveBeenCalled();
  });

  it("should show error when new password does not contain uppercase lowercase and number", () => {
    const { container } = render(
      <ChangePasswordForm onSuccess={onSuccess} onError={onError} />
    );

    const inputs = getPasswordInputs(container);

    fireEvent.change(inputs[0], { target: { value: "oldPassword1" } });
    fireEvent.change(inputs[1], { target: { value: "password" } });
    fireEvent.change(inputs[2], { target: { value: "password" } });

    fireEvent.click(screen.getByRole("button", { name: /đổi mật khẩu/i }));

    expect(screen.getByText("Cần chữ hoa, chữ thường và số")).toBeInTheDocument();
    expect(profileApi.changePassword).not.toHaveBeenCalled();
  });

  it("should show error when confirm password does not match", () => {
    const { container } = render(
      <ChangePasswordForm onSuccess={onSuccess} onError={onError} />
    );

    const inputs = getPasswordInputs(container);

    fireEvent.change(inputs[0], { target: { value: "oldPassword1" } });
    fireEvent.change(inputs[1], { target: { value: "NewPassword1" } });
    fireEvent.change(inputs[2], { target: { value: "OtherPassword1" } });

    fireEvent.click(screen.getByRole("button", { name: /đổi mật khẩu/i }));

    expect(screen.getByText("Không khớp")).toBeInTheDocument();
    expect(profileApi.changePassword).not.toHaveBeenCalled();
  });

  it("should clear field error when user changes that field", () => {
    const { container } = render(
      <ChangePasswordForm onSuccess={onSuccess} onError={onError} />
    );

    fireEvent.click(screen.getByRole("button", { name: /đổi mật khẩu/i }));

    expect(screen.getAllByText("Bắt buộc")).toHaveLength(3);

    const inputs = getPasswordInputs(container);

    fireEvent.change(inputs[0], { target: { value: "oldPassword1" } });

    expect(screen.getAllByText("Bắt buộc")).toHaveLength(2);
  });

  it("should show password strength meter for new password", () => {
    const { container } = render(
      <ChangePasswordForm onSuccess={onSuccess} onError={onError} />
    );

    const inputs = getPasswordInputs(container);

    fireEvent.change(inputs[1], { target: { value: "NewPassword1!" } });

    expect(screen.getByText("Mạnh")).toBeInTheDocument();
  });

  it("should toggle password visibility", () => {
    const { container } = render(
      <ChangePasswordForm onSuccess={onSuccess} onError={onError} />
    );

    const inputs = getPasswordInputs(container);
    const toggleButtons = screen
      .getAllByRole("button")
      .filter((button) => button.getAttribute("type") === "button");

    expect(inputs[0]).toHaveAttribute("type", "password");

    fireEvent.click(toggleButtons[0]);

    expect(inputs[0]).toHaveAttribute("type", "text");
    expect(screen.getAllByTestId("eye-closed-icon")[0]).toBeInTheDocument();
  });

  it("should submit valid form and call onSuccess", async () => {
    profileApi.changePassword.mockResolvedValueOnce({});

    const { container } = render(
      <ChangePasswordForm onSuccess={onSuccess} onError={onError} />
    );

    const inputs = getPasswordInputs(container);

    fireEvent.change(inputs[0], { target: { value: "oldPassword1" } });
    fireEvent.change(inputs[1], { target: { value: "NewPassword1" } });
    fireEvent.change(inputs[2], { target: { value: "NewPassword1" } });

    fireEvent.click(screen.getByRole("button", { name: /đổi mật khẩu/i }));

    await waitFor(() => {
      expect(profileApi.changePassword).toHaveBeenCalledWith({
        currentPassword: "oldPassword1",
        newPassword: "NewPassword1",
        confirmPassword: "NewPassword1",
      });
    });

    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onError).not.toHaveBeenCalled();
  });

  it("should reset form after successful submit", async () => {
    profileApi.changePassword.mockResolvedValueOnce({});

    const { container } = render(
      <ChangePasswordForm onSuccess={onSuccess} onError={onError} />
    );

    const inputs = getPasswordInputs(container);

    fireEvent.change(inputs[0], { target: { value: "oldPassword1" } });
    fireEvent.change(inputs[1], { target: { value: "NewPassword1" } });
    fireEvent.change(inputs[2], { target: { value: "NewPassword1" } });

    fireEvent.click(screen.getByRole("button", { name: /đổi mật khẩu/i }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });

    expect(inputs[0]).toHaveValue("");
    expect(inputs[1]).toHaveValue("");
    expect(inputs[2]).toHaveValue("");
  });

  it("should call onError with backend message when submit fails", async () => {
    profileApi.changePassword.mockRejectedValueOnce({
      response: {
        data: {
          message: "Mật khẩu hiện tại không đúng",
        },
      },
    });

    const { container } = render(
      <ChangePasswordForm onSuccess={onSuccess} onError={onError} />
    );

    const inputs = getPasswordInputs(container);

    fireEvent.change(inputs[0], { target: { value: "oldPassword1" } });
    fireEvent.change(inputs[1], { target: { value: "NewPassword1" } });
    fireEvent.change(inputs[2], { target: { value: "NewPassword1" } });

    fireEvent.click(screen.getByRole("button", { name: /đổi mật khẩu/i }));

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith("Mật khẩu hiện tại không đúng");
    });

    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("should call onError with default message when submit fails without backend message", async () => {
    profileApi.changePassword.mockRejectedValueOnce({});

    const { container } = render(
      <ChangePasswordForm onSuccess={onSuccess} onError={onError} />
    );

    const inputs = getPasswordInputs(container);

    fireEvent.change(inputs[0], { target: { value: "oldPassword1" } });
    fireEvent.change(inputs[1], { target: { value: "NewPassword1" } });
    fireEvent.change(inputs[2], { target: { value: "NewPassword1" } });

    fireEvent.click(screen.getByRole("button", { name: /đổi mật khẩu/i }));

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith("Đổi mật khẩu thất bại");
    });

    expect(onSuccess).not.toHaveBeenCalled();
  });
});
