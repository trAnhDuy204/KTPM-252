import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

import ProfilePage from "../ProfilePage";
import { profileApi } from "@/services/profileApi";

const mockNavigate = jest.fn();
const mockShowToast = jest.fn();

jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

jest.mock("@/services/profileApi", () => ({
  profileApi: {
    getProfile: jest.fn(),
    getBookings: jest.fn(),
    getBookingSummary: jest.fn(),
  },
}));

jest.mock("@/components/review/Toast", () => ({
  useToast: () => ({
    showToast: mockShowToast,
    ToastContainer: () => <div data-testid="toast-container" />,
  }),
}));

jest.mock("@/components/profile/EditProfileForm", () => ({
  __esModule: true,
  default: ({ profile, onSuccess, onError }) => (
    <div data-testid="edit-profile-form">
      Edit profile: {profile?.fullName}
      <button
        onClick={() =>
          onSuccess({
            fullName: "Nguyen Van B",
            email: "new@test.com",
            role: "CUSTOMER",
            createdAt: "02/05/2026",
          })
        }
      >
        Mock update profile success
      </button>
      <button onClick={() => onError("Update error")}>
        Mock update profile error
      </button>
    </div>
  ),
}));

jest.mock("@/components/profile/ChangePasswordForm", () => ({
  __esModule: true,
  default: ({ onSuccess, onError }) => (
    <div data-testid="change-password-form">
      Change password form
      <button onClick={onSuccess}>Mock change password success</button>
      <button onClick={() => onError("Password error")}>
        Mock change password error
      </button>
    </div>
  ),
}));

jest.mock("@/components/profile/BookingHistory", () => ({
  __esModule: true,
  default: ({ bookings, onReview }) => (
    <div data-testid="booking-history">
      Booking history: {bookings.length}
      <button onClick={() => onReview(bookings[0])}>Mock review</button>
    </div>
  ),
}));

jest.mock("lucide-react", () => ({
  User: () => <svg data-testid="user-icon" />,
  Lock: () => <svg data-testid="lock-icon" />,
  CalendarDays: () => <svg data-testid="calendar-icon" />,
}));

const profile = {
  fullName: "Nguyen Van A",
  email: "user@test.com",
  role: "CUSTOMER",
  createdAt: "01/05/2026",
};

const bookings = [
  {
    id: 1,
    hotelName: "Lumiere Hotel",
  },
  {
    id: 2,
    hotelName: "Ocean Hotel",
  },
];

const summary = {
  total: 2,
  pending: 1,
  confirmed: 0,
  checkedIn: 0,
  completed: 1,
  cancelled: 0,
};

describe("ProfilePage", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    profileApi.getProfile.mockResolvedValue({ data: profile });
    profileApi.getBookings.mockResolvedValue({ data: bookings });
    profileApi.getBookingSummary.mockResolvedValue({ data: summary });
  });

  it("should load and render profile data", async () => {
    render(<ProfilePage />);

    await waitFor(() => {
      expect(profileApi.getProfile).toHaveBeenCalledTimes(1);
      expect(profileApi.getBookings).toHaveBeenCalledTimes(1);
      expect(profileApi.getBookingSummary).toHaveBeenCalledTimes(1);
    });

    expect(await screen.findByText("Nguyen Van A")).toBeInTheDocument();
    expect(screen.getByText("user@test.com")).toBeInTheDocument();
    expect(screen.getByText("CUSTOMER")).toBeInTheDocument();
    expect(screen.getByText("01/05/2026")).toBeInTheDocument();
    expect(screen.getByText("Edit profile: Nguyen Van A")).toBeInTheDocument();
    expect(screen.getByTestId("toast-container")).toBeInTheDocument();
  });

  it("should render booking summary stats", async () => {
    render(<ProfilePage />);

    expect(await screen.findByText("Tổng")).toBeInTheDocument();
    expect(screen.getByText("Chờ xác nhận")).toBeInTheDocument();
    expect(screen.getByText("Đã xác nhận")).toBeInTheDocument();
    expect(screen.getByText("Đang ở")).toBeInTheDocument();
    expect(screen.getByText("Hoàn thành")).toBeInTheDocument();
    expect(screen.getByText("Đã hủy")).toBeInTheDocument();

    expect(screen.getAllByText("0")).toHaveLength(3);
    expect(screen.getAllByText("1")).toHaveLength(2);
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("should show toast when loading data fails", async () => {
    profileApi.getProfile.mockRejectedValueOnce(new Error("Network error"));

    render(<ProfilePage />);

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(
        "Không tải được dữ liệu. Vui lòng thử lại.",
        "error"
      );
    });
  });

  it("should render info tab by default", async () => {
    render(<ProfilePage />);

    expect(await screen.findByTestId("edit-profile-form")).toBeInTheDocument();
    expect(screen.queryByTestId("change-password-form")).not.toBeInTheDocument();
    expect(screen.queryByTestId("booking-history")).not.toBeInTheDocument();
  });

  it("should switch to password tab", async () => {
    render(<ProfilePage />);

    await screen.findByTestId("edit-profile-form");

    fireEvent.click(screen.getByRole("button", { name: /đổi mật khẩu/i }));

    expect(screen.getByTestId("change-password-form")).toBeInTheDocument();
    expect(screen.queryByTestId("edit-profile-form")).not.toBeInTheDocument();
  });

  it("should switch to bookings tab", async () => {
    render(<ProfilePage />);

    await screen.findByTestId("edit-profile-form");

    fireEvent.click(
      screen.getByRole("button", { name: /lịch sử đặt phòng \(2\)/i })
    );

    expect(screen.getByTestId("booking-history")).toHaveTextContent(
      "Booking history: 2"
    );
    expect(screen.queryByTestId("edit-profile-form")).not.toBeInTheDocument();
  });

  it("should update profile and show success toast", async () => {
    render(<ProfilePage />);

    await screen.findByTestId("edit-profile-form");

    fireEvent.click(screen.getByRole("button", { name: /mock update profile success/i }));

    expect(mockShowToast).toHaveBeenCalledWith(
      "Cập nhật hồ sơ thành công!",
      "success"
    );
    expect(screen.getByText("Nguyen Van B")).toBeInTheDocument();
    expect(screen.getByText("new@test.com")).toBeInTheDocument();
  });

  it("should show error toast when profile update fails", async () => {
    render(<ProfilePage />);

    await screen.findByTestId("edit-profile-form");

    fireEvent.click(screen.getByRole("button", { name: /mock update profile error/i }));

    expect(mockShowToast).toHaveBeenCalledWith("Update error", "error");
  });

  it("should show success toast when password change succeeds", async () => {
    render(<ProfilePage />);

    await screen.findByTestId("edit-profile-form");

    fireEvent.click(screen.getByRole("button", { name: /đổi mật khẩu/i }));
    fireEvent.click(screen.getByRole("button", { name: /mock change password success/i }));

    expect(mockShowToast).toHaveBeenCalledWith(
      "Đổi mật khẩu thành công!",
      "success"
    );
  });

  it("should show error toast when password change fails", async () => {
    render(<ProfilePage />);

    await screen.findByTestId("edit-profile-form");

    fireEvent.click(screen.getByRole("button", { name: /đổi mật khẩu/i }));
    fireEvent.click(screen.getByRole("button", { name: /mock change password error/i }));

    expect(mockShowToast).toHaveBeenCalledWith("Password error", "error");
  });

  it("should navigate to reviews page when booking review is clicked", async () => {
    render(<ProfilePage />);

    await screen.findByTestId("edit-profile-form");

    fireEvent.click(
      screen.getByRole("button", { name: /lịch sử đặt phòng \(2\)/i })
    );
    fireEvent.click(screen.getByRole("button", { name: /mock review/i }));

    expect(mockNavigate).toHaveBeenCalledWith("/dashboard/reviews");
  });
});
