import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ConfirmScreen from "../ConfirmScreen";

const mockUser = {
  fullName: "Nguyễn Văn A",
  email: "vana@email.com",
  phone: "0901234567",
};

const mockRoom = {
  hotelName: "Mường Thanh Luxury",
  roomNumber: "101",
  roomTypeName: "Deluxe",
};

const mockServices = [
  { id: 1, name: "Bữa sáng", price: 150000 },
  { id: 2, name: "Đưa đón sân bay", price: 300000 },
  { id: 3, name: "Spa", price: 500000 },
];

const baseProps = {
  room: mockRoom,
  checkIn: "2024-06-01",
  checkOut: "2024-06-03",
  nights: 2,
  services: mockServices,
  selectedSvcs: {},
  payMethod: "CASH",
  roomTotal: 1_000_000,
  svcsTotal: 0,
  grandTotal: 1_000_000,
  onBack: jest.fn(),
  onConfirm: jest.fn(),
};

const renderScreen = (props = {}) =>
  render(<ConfirmScreen {...baseProps} {...props} />);

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.setItem("user", JSON.stringify(mockUser));
});

afterEach(() => {
  localStorage.clear();
});

describe("ConfirmScreen – thông tin khách hàng", () => {
  it("hiển thị họ tên, email, SĐT từ localStorage", () => {
    renderScreen();
    expect(screen.getByText("Nguyễn Văn A")).toBeInTheDocument();
    expect(screen.getByText("vana@email.com")).toBeInTheDocument();
    expect(screen.getByText("0901234567")).toBeInTheDocument();
  });

  it("hiển thị '—' khi localStorage không có user", () => {
    localStorage.clear();
    renderScreen();
    expect(screen.getAllByText("—").length).toBeGreaterThanOrEqual(3);
  });

  it("hiển thị '—' khi user thiếu một số trường", () => {
    localStorage.setItem("user", JSON.stringify({ fullName: "Trần B" }));
    renderScreen();
    expect(screen.getByText("Trần B")).toBeInTheDocument();
    expect(screen.getAllByText("—").length).toBeGreaterThanOrEqual(2);
  });
});

describe("ConfirmScreen – thông tin phòng", () => {
  it("hiển thị tên khách sạn", () => {
    renderScreen();
    expect(screen.getByText("Mường Thanh Luxury")).toBeInTheDocument();
  });

  it("hiển thị số phòng và loại phòng", () => {
    renderScreen();
    expect(screen.getByText("Phòng 101 - Deluxe")).toBeInTheDocument();
  });

  it("hiển thị số đêm", () => {
    renderScreen();
    expect(screen.getByText("2 đêm")).toBeInTheDocument();
  });

  it("định dạng ngày check-in theo tiếng Việt", () => {
    renderScreen();
    // "2024-06-01" → "1/6/2024" theo vi-VN
    expect(screen.getByText("1/6/2024")).toBeInTheDocument();
  });

  it("định dạng ngày check-out theo tiếng Việt", () => {
    renderScreen();
    expect(screen.getByText("3/6/2024")).toBeInTheDocument();
  });
});


describe("ConfirmScreen – dịch vụ thêm", () => {
  it("KHÔNG hiển thị section Dịch vụ thêm khi không chọn dịch vụ nào", () => {
    renderScreen({ selectedSvcs: {} });
    expect(screen.queryByText(/dịch vụ thêm/i)).not.toBeInTheDocument();
  });

  it("hiển thị section Dịch vụ thêm khi có dịch vụ được chọn", () => {
    renderScreen({ selectedSvcs: { 1: 2 } });
    expect(screen.getByText(/dịch vụ thêm/i)).toBeInTheDocument();
  });

  it("hiển thị đúng tên, số lượng và thành tiền của dịch vụ", () => {
    renderScreen({ selectedSvcs: { 1: 2 } }); // Bữa sáng × 2 = 300.000₫
    expect(screen.getByText("Bữa sáng × 2")).toBeInTheDocument();
    expect(screen.getByText("300.000₫")).toBeInTheDocument();
  });

  it("chỉ hiển thị dịch vụ có số lượng > 0", () => {
    renderScreen({ selectedSvcs: { 1: 1, 2: 0, 3: 2 } });
    expect(screen.getByText("Bữa sáng × 1")).toBeInTheDocument();
    expect(screen.queryByText(/Đưa đón sân bay/)).not.toBeInTheDocument();
    expect(screen.getByText("Spa × 2")).toBeInTheDocument();
  });

  it("hiển thị nhiều dịch vụ cùng lúc", () => {
    renderScreen({ selectedSvcs: { 1: 1, 2: 1 } });
    expect(screen.getByText("Bữa sáng × 1")).toBeInTheDocument();
    expect(screen.getByText("Đưa đón sân bay × 1")).toBeInTheDocument();
  });
});

describe("ConfirmScreen – thanh toán", () => {
  it("định dạng tiền phòng đúng (vi-VN)", () => {
    renderScreen({ roomTotal: 1_000_000 });
    expect(screen.getAllByText("1.000.000₫")).toHaveLength(2);
  });

  it("hiển thị Tiền mặt khi payMethod là CASH", () => {
    renderScreen({ payMethod: "CASH" });
    expect(screen.getByText(/tiền mặt/i)).toBeInTheDocument();
  });

  it("hiển thị VNPay khi payMethod là VNPAY", () => {
    renderScreen({ payMethod: "VNPAY" });
    expect(screen.getAllByText(/vnpay/i)).toHaveLength(2);
  });

  it("KHÔNG hiển thị dòng Dịch vụ khi svcsTotal = 0", () => {
    renderScreen({ svcsTotal: 0 });
    // Chỉ tìm trong section Thanh toán
    const labels = screen.queryAllByText("Dịch vụ");
    expect(labels).toHaveLength(0);
  });

  it("hiển thị dòng Dịch vụ khi svcsTotal > 0", () => {
    renderScreen({ svcsTotal: 450_000, selectedSvcs: { 1: 1, 3: 1 } });
    expect(screen.getByText("450.000₫")).toBeInTheDocument();
  });

  it("hiển thị grandTotal đúng", () => {
    renderScreen({ grandTotal: 1_450_000 });
    expect(screen.getByText("1.450.000₫")).toBeInTheDocument();
  });
});

describe("ConfirmScreen – nút Quay lại / Xác nhận", () => {
  it("gọi onBack khi nhấn 'Quay lại chỉnh sửa'", () => {
    const onBack = jest.fn();
    renderScreen({ onBack });
    fireEvent.click(screen.getByRole("button", { name: /quay lại/i }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("gọi onConfirm khi nhấn nút xác nhận", () => {
    const onConfirm = jest.fn();
    renderScreen({ onConfirm });
    fireEvent.click(screen.getByRole("button", { name: /xác nhận đặt phòng/i }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("hiển thị 'Xác nhận đặt phòng' khi payMethod là CASH", () => {
    renderScreen({ payMethod: "CASH" });
    expect(
      screen.getByRole("button", { name: /xác nhận đặt phòng/i })
    ).toBeInTheDocument();
  });

  it("hiển thị 'Thanh toán VNPay' khi payMethod là VNPAY", () => {
    renderScreen({ payMethod: "VNPAY" });
    expect(
      screen.getByRole("button", { name: /thanh toán vnpay/i })
    ).toBeInTheDocument();
  });

  it("KHÔNG gọi onConfirm khi nhấn nút Quay lại", () => {
    const onConfirm = jest.fn();
    renderScreen({ onConfirm });
    fireEvent.click(screen.getByRole("button", { name: /quay lại/i }));
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("KHÔNG gọi onBack khi nhấn nút xác nhận", () => {
    const onBack = jest.fn();
    renderScreen({ payMethod: "CASH", onBack });
    fireEvent.click(screen.getByRole("button", { name: /xác nhận đặt phòng/i }));
    expect(onBack).not.toHaveBeenCalled();
  });
});