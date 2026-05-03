import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

import BookingPage from "../BookingPage";
import { customerBookingApi } from "@/services/customerBookingApi";

const mockNavigate = jest.fn();
const mockUseLocation = jest.fn();
const mockShowToast = jest.fn();

jest.mock("react-router-dom", () => ({
  useLocation: () => mockUseLocation(),
  useNavigate: () => mockNavigate,
  useSearchParams: () => [new URLSearchParams(), jest.fn()],
}));

jest.mock("@/components/review/Toast", () => ({
  useToast: () => ({
    showToast: mockShowToast,
    ToastContainer: () => <div data-testid="toast-container" />,
  }),
}));

jest.mock("@/services/customerBookingApi", () => ({
  customerBookingApi: {
    getServices: jest.fn(),
    create: jest.fn(),
    addServiceUsages: jest.fn(),
    createPayment: jest.fn(),
    createVnpay: jest.fn(),
  },
}));

jest.mock("@/components/customerBooking/RoomInfoCard", () => ({
  __esModule: true,
  default: ({ room }) => <div data-testid="room-info">{room.name}</div>,
}));

jest.mock("@/components/customerBooking/DatePickerCard", () => ({
  __esModule: true,
  default: ({ checkIn, checkOut, nights, setCheckIn, setCheckOut }) => (
    <div data-testid="date-picker">
      <p>Check-in: {checkIn}</p>
      <p>Check-out: {checkOut}</p>
      <p>Nights: {nights}</p>
      <button onClick={() => setCheckIn("2026-05-02")}>Set invalid check-in</button>
      <button onClick={() => setCheckOut("2026-05-03")}>Set invalid check-out</button>
    </div>
  ),
}));

jest.mock("@/components/customerBooking/ServiceCard", () => ({
  __esModule: true,
  default: ({ services, selected, onToggle, onQtyChange }) => (
    <div data-testid="services-card">
      {services.map((svc) => (
        <div key={svc.id}>
          <span>{svc.name}</span>
          <span>Qty: {selected[svc.id] ?? 0}</span>
          <button onClick={() => onToggle(svc.id)}>Toggle {svc.name}</button>
          <button onClick={() => onQtyChange(svc.id, 2)}>Qty 2 {svc.name}</button>
        </div>
      ))}
    </div>
  ),
}));

jest.mock("@/components/customerBooking/PaymentMethodCard", () => ({
  __esModule: true,
  default: ({ method, setMethod }) => (
    <div data-testid="payment-method">
      <p>Payment: {method}</p>
      <button onClick={() => setMethod("CASH")}>Cash</button>
      <button onClick={() => setMethod("CARD")}>Card</button>
      <button onClick={() => setMethod("VNPAY")}>Vnpay</button>
    </div>
  ),
}));

jest.mock("@/components/customerBooking/OderSummary", () => ({
  __esModule: true,
  default: ({ roomTotal, svcsTotal, grandTotal }) => (
    <div data-testid="order-summary">
      <p>Room total: {roomTotal}</p>
      <p>Services total: {svcsTotal}</p>
      <p>Grand total: {grandTotal}</p>
    </div>
  ),
}));

jest.mock("@/components/customerBooking/ConfirmScreen", () => ({
  __esModule: true,
  default: ({ onBack, onConfirm, grandTotal }) => (
    <div data-testid="confirm-screen">
      <p>Confirm total: {grandTotal}</p>
      <button onClick={onBack}>Back to form</button>
      <button onClick={onConfirm}>Confirm booking</button>
    </div>
  ),
}));

jest.mock("@/components/customerBooking/SuccessScreen", () => ({
  __esModule: true,
  default: ({ booking, grandTotal }) => (
    <div data-testid="success-screen">
      Success booking #{booking.id} - {grandTotal}
    </div>
  ),
}));

jest.mock("lucide-react", () => ({
  Frown: () => <svg data-testid="frown-icon" />,
  MoveRight: () => <svg data-testid="move-right-icon" />,
}));

const room = {
  id: 5,
  hotelId: 10,
  name: "Deluxe Room",
  basePrice: 500000,
};

const services = [
  { id: 1, name: "Breakfast", price: 100000 },
  { id: 2, name: "Spa", price: 300000 },
];

describe("BookingPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-05-03T08:00:00"));

    mockUseLocation.mockReturnValue({
      state: { room },
    });

    localStorage.setItem(
      "user",
      JSON.stringify({
        id: 99,
        fullName: "Nguyen Van A",
        phone: "0901234567",
      })
    );

    customerBookingApi.getServices.mockResolvedValue({
      data: services,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    localStorage.clear();
  });

  it("should show toast when check-in date is in the past", async () => {
    render(<BookingPage />);

    await screen.findByText("Breakfast");

    fireEvent.click(screen.getByRole("button", { name: /set invalid check-in/i }));
    fireEvent.click(screen.getByRole("button", { name: /tiếp tục/i }));

    expect(mockShowToast).toHaveBeenCalledWith(
      "Ngày check-in phải từ hôm nay trở đi",
      "error"
    );
  });
});