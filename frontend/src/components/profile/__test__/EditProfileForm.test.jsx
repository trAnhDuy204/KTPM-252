import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

import EditProfileForm from "../EditProfileForm";
import { profileApi } from "@/services/profileApi";

jest.mock("@/services/profileApi", () => ({
  profileApi: {
    updateProfile: jest.fn(),
  },
}));

const profile = {
  fullName: "Nguyen Van A",
  email: "user@test.com",
  phone: "0901234567",
  role: "CUSTOMER",
  createdAt: "01/05/2026",
};

describe("EditProfileForm", () => {
  const onSuccess = jest.fn();
  const onError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render profile data", () => {
    render(
      <EditProfileForm
        profile={profile}
        onSuccess={onSuccess}
        onError={onError}
      />
    );

    expect(screen.getByText("Thông tin cá nhân")).toBeInTheDocument();
    expect(screen.getByDisplayValue("user@test.com")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Nguyen Van A")).toBeInTheDocument();
    expect(screen.getByDisplayValue("0901234567")).toBeInTheDocument();
    expect(screen.getByText("CUSTOMER")).toBeInTheDocument();
    expect(screen.getByText("Thành viên từ 01/05/2026")).toBeInTheDocument();
  });

  it("should render empty values when profile is missing", () => {
    render(
      <EditProfileForm
        profile={null}
        onSuccess={onSuccess}
        onError={onError}
      />
    );

    expect(screen.getByText("Thông tin cá nhân")).toBeInTheDocument();
    expect(screen.getAllByDisplayValue("")).toHaveLength(3);
  });

  it("should make email input readonly", () => {
    render(
      <EditProfileForm
        profile={profile}
        onSuccess={onSuccess}
        onError={onError}
      />
    );

    expect(screen.getByDisplayValue("user@test.com")).toHaveAttribute("readonly");
  });

  it("should show required error when full name is empty", () => {
    render(
      <EditProfileForm
        profile={profile}
        onSuccess={onSuccess}
        onError={onError}
      />
    );

    const fullNameInput = screen.getByDisplayValue("Nguyen Van A");

    fireEvent.change(fullNameInput, { target: { value: "" } });
    fireEvent.submit(document.querySelector("form"));

    expect(screen.getByText("Họ tên là bắt buộc")).toBeInTheDocument();
    expect(profileApi.updateProfile).not.toHaveBeenCalled();
  });

  it("should show min length error when full name has less than 2 characters", () => {
    render(
      <EditProfileForm
        profile={profile}
        onSuccess={onSuccess}
        onError={onError}
      />
    );

    const fullNameInput = screen.getByDisplayValue("Nguyen Van A");

    fireEvent.change(fullNameInput, { target: { value: "A" } });
    fireEvent.submit(document.querySelector("form"));

    expect(screen.getByText("Tối thiểu 2 ký tự")).toBeInTheDocument();
    expect(profileApi.updateProfile).not.toHaveBeenCalled();
  });

  it("should show invalid phone error", () => {
    render(
      <EditProfileForm
        profile={profile}
        onSuccess={onSuccess}
        onError={onError}
      />
    );

    const phoneInput = screen.getByDisplayValue("0901234567");

    fireEvent.change(phoneInput, { target: { value: "abc123" } });
    fireEvent.submit(document.querySelector("form"));

    expect(screen.getByText("Số điện thoại không hợp lệ")).toBeInTheDocument();
    expect(profileApi.updateProfile).not.toHaveBeenCalled();
  });

  it("should clear full name error when user changes full name", () => {
    render(
      <EditProfileForm
        profile={profile}
        onSuccess={onSuccess}
        onError={onError}
      />
    );

    const fullNameInput = screen.getByDisplayValue("Nguyen Van A");

    fireEvent.change(fullNameInput, { target: { value: "" } });
    fireEvent.submit(document.querySelector("form"));

    expect(screen.getByText("Họ tên là bắt buộc")).toBeInTheDocument();

    fireEvent.change(fullNameInput, { target: { value: "Nguyen Van B" } });

    expect(screen.queryByText("Họ tên là bắt buộc")).not.toBeInTheDocument();
  });

  it("should clear phone error when user changes phone", () => {
    render(
      <EditProfileForm
        profile={profile}
        onSuccess={onSuccess}
        onError={onError}
      />
    );

    const phoneInput = screen.getByDisplayValue("0901234567");

    fireEvent.change(phoneInput, { target: { value: "abc123" } });
    fireEvent.submit(document.querySelector("form"));

    expect(screen.getByText("Số điện thoại không hợp lệ")).toBeInTheDocument();

    fireEvent.change(phoneInput, { target: { value: "0987654321" } });

    expect(screen.queryByText("Số điện thoại không hợp lệ")).not.toBeInTheDocument();
  });

  it("should submit trimmed data and call onSuccess", async () => {
    profileApi.updateProfile.mockResolvedValueOnce({
      data: {
        fullName: "Nguyen Van B",
        phone: "0987654321",
      },
    });

    render(
      <EditProfileForm
        profile={profile}
        onSuccess={onSuccess}
        onError={onError}
      />
    );

    const fullNameInput = screen.getByDisplayValue("Nguyen Van A");
    const phoneInput = screen.getByDisplayValue("0901234567");

    fireEvent.change(fullNameInput, { target: { value: "  Nguyen Van B  " } });
    fireEvent.change(phoneInput, { target: { value: "0987654321" } });

    fireEvent.submit(document.querySelector("form"));

    await waitFor(() => {
      expect(profileApi.updateProfile).toHaveBeenCalledWith({
        fullName: "Nguyen Van B",
        phone: "0987654321",
      });
    });

    expect(onSuccess).toHaveBeenCalledWith({
      fullName: "Nguyen Van B",
      phone: "0987654321",
    });
    expect(onError).not.toHaveBeenCalled();
  });

  it("should submit null phone when phone is blank", async () => {
    profileApi.updateProfile.mockResolvedValueOnce({
      data: {
        fullName: "Nguyen Van A",
        phone: null,
      },
    });

    render(
      <EditProfileForm
        profile={profile}
        onSuccess={onSuccess}
        onError={onError}
      />
    );

    const phoneInput = screen.getByDisplayValue("0901234567");

    fireEvent.change(phoneInput, { target: { value: "" } });
    fireEvent.submit(document.querySelector("form"));

    await waitFor(() => {
      expect(profileApi.updateProfile).toHaveBeenCalledWith({
        fullName: "Nguyen Van A",
        phone: null,
      });
    });

    expect(onSuccess).toHaveBeenCalledWith({
      fullName: "Nguyen Van A",
      phone: null,
    });
  });

  it("should call onError with backend message when update fails", async () => {
    profileApi.updateProfile.mockRejectedValueOnce({
      response: {
        data: {
          message: "Tên không hợp lệ",
        },
      },
    });

    render(
      <EditProfileForm
        profile={profile}
        onSuccess={onSuccess}
        onError={onError}
      />
    );

    fireEvent.submit(document.querySelector("form"));

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith("Tên không hợp lệ");
    });

    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("should call onError with default message when update fails without backend message", async () => {
    profileApi.updateProfile.mockRejectedValueOnce({});

    render(
      <EditProfileForm
        profile={profile}
        onSuccess={onSuccess}
        onError={onError}
      />
    );

    fireEvent.submit(document.querySelector("form"));

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith("Cập nhật thất bại");
    });

    expect(onSuccess).not.toHaveBeenCalled();
  });
});
