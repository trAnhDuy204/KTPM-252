import React from "react";
import { render, screen } from "@testing-library/react";
import OrderSummary from "../OderSummary";
import "@testing-library/jest-dom";
const mockRoom = {
  roomNumber: "101",
  basePrice: 1_200_000,
};

const mockServices = [
  { id: 1, name: "Bữa sáng", price: 150_000 },
  { id: 2, name: "Đưa đón sân bay", price: 300_000 },
  { id: 3, name: "Spa", price: 500_000 },
];

const baseProps = {
  room: mockRoom,
  nights: 2,
  services: mockServices,
  selectedSvcs: {},
  roomTotal: 2_400_000,
  svcsTotal: 0,
  grandTotal: 2_400_000,
  checkIn: "2024-06-10",
  checkOut: "2024-06-12",
};

const renderSummary = (props = {}) =>
  render(<OrderSummary {...baseProps} {...props} />);

describe("OrderSummary – render", () => {
  it("hiển thị tiêu đề 'Tóm tắt đơn'", () => {
    renderSummary();
    expect(screen.getByText("Tóm tắt đơn")).toBeInTheDocument();
  });

  it("hiển thị số phòng đúng", () => {
    renderSummary();
    expect(screen.getByText("Phòng 101")).toBeInTheDocument();
  });

  it("hiển thị giá phòng gốc định dạng vi-VN", () => {
    renderSummary();
    expect(screen.getByText("1.200.000₫")).toBeInTheDocument();
  });

  it("hiển thị số đêm", () => {
    renderSummary({ nights: 3 });
    expect(screen.getByText("× 3 đêm")).toBeInTheDocument();
  });

  it("hiển thị roomTotal đúng", () => {
    renderSummary({ roomTotal: 2_400_000 });

    expect(screen.getAllByText("2.400.000₫")).toHaveLength(2);
  });


  it("hiển thị grandTotal đúng với màu vàng", () => {
    renderSummary({ grandTotal: 2_400_000 });
    const el = screen.getByText("2.400.000₫", { selector: ".text-yellow-400" });
    expect(el).toBeInTheDocument();
  });

  it("hiển thị trust badge 'Xác nhận ngay lập tức'", () => {
    renderSummary();
    expect(screen.getByText(/xác nhận ngay lập tức/i)).toBeInTheDocument();
  });

  it("hiển thị trust badge 'Hỗ trợ 24/7'", () => {
    renderSummary();
    expect(screen.getByText(/hỗ trợ 24\/7/i)).toBeInTheDocument();
  });
});

describe("OrderSummary – hiển thị ngày", () => {
  it("định dạng check-in theo vi-VN", () => {
    renderSummary({ checkIn: "2024-06-10" });
    expect(screen.getByText("10/6/2024")).toBeInTheDocument();
  });

  it("định dạng check-out theo vi-VN", () => {
    renderSummary({ checkOut: "2024-06-12" });
    expect(screen.getByText("12/6/2024")).toBeInTheDocument();
  });

  it("hiển thị label 'Check-in' và 'Check-out'", () => {
    renderSummary();
    expect(screen.getByText("Check-in")).toBeInTheDocument();
    expect(screen.getByText("Check-out")).toBeInTheDocument();
  });
});

describe("OrderSummary – dịch vụ thêm", () => {
  it("KHÔNG hiển thị section dịch vụ khi không chọn gì", () => {
    renderSummary({ selectedSvcs: {} });
    expect(screen.queryByText(/dịch vụ thêm/i)).not.toBeInTheDocument();
  });

  it("hiển thị section dịch vụ khi có ít nhất 1 dịch vụ được chọn", () => {
    renderSummary({ selectedSvcs: { 1: 1 } });
    expect(screen.getByText(/dịch vụ thêm/i)).toBeInTheDocument();
  });

  it("hiển thị tên và số lượng dịch vụ đúng", () => {
    renderSummary({ selectedSvcs: { 1: 2 } });
    expect(screen.getByText("Bữa sáng × 2")).toBeInTheDocument();
  });

  it("hiển thị thành tiền dịch vụ đúng (price × qty)", () => {
    renderSummary({ selectedSvcs: { 1: 2 } }); // 150.000 × 2 = 300.000
    expect(screen.getByText("300.000₫")).toBeInTheDocument();
  });

  it("chỉ hiển thị dịch vụ có qty > 0", () => {
    renderSummary({ selectedSvcs: { 1: 1, 2: 0, 3: 2 } });
    expect(screen.getByText("Bữa sáng × 1")).toBeInTheDocument();
    expect(screen.queryByText(/đưa đón sân bay/i)).not.toBeInTheDocument();
    expect(screen.getByText("Spa × 2")).toBeInTheDocument();
  });

  it("hiển thị nhiều dịch vụ cùng lúc", () => {
    renderSummary({ selectedSvcs: { 1: 1, 2: 1 } });
    expect(screen.getByText("Bữa sáng × 1")).toBeInTheDocument();
    expect(screen.getByText("Đưa đón sân bay × 1")).toBeInTheDocument();
  });

  it("tính đúng thành tiền cho từng dịch vụ khi qty > 1", () => {
    renderSummary({ selectedSvcs: { 3: 3 } }); // 500.000 × 3 = 1.500.000
    expect(screen.getByText("1.500.000₫")).toBeInTheDocument();
  });
});


describe("OrderSummary – tổng cộng", () => {
  it("KHÔNG hiển thị ghi chú dịch vụ khi svcsTotal = 0", () => {
    renderSummary({ svcsTotal: 0 });
    expect(screen.queryByText(/bao gồm/i)).not.toBeInTheDocument();
  });

  it("hiển thị ghi chú dịch vụ khi svcsTotal > 0", () => {
    renderSummary({
      svcsTotal: 450_000,
      grandTotal: 2_850_000,
      selectedSvcs: { 1: 1, 3: 1 },
    });
    expect(screen.getByText(/bao gồm.*dịch vụ/i)).toBeInTheDocument();
    expect(screen.getByText(/450\.000₫/)).toBeInTheDocument();
  });

  it("grandTotal bằng roomTotal khi không có dịch vụ", () => {
    renderSummary({ roomTotal: 2_400_000, svcsTotal: 0, grandTotal: 2_400_000 });
    const totals = screen.getAllByText("2.400.000₫");
    // roomTotal và grandTotal đều là 2.400.000₫ --> xuất hiện 2 lần
    expect(totals.length).toBeGreaterThanOrEqual(2);
  });

  it("hiển thị grandTotal khác roomTotal khi có dịch vụ", () => {
    renderSummary({
      roomTotal: 2_400_000,
      svcsTotal: 300_000,
      grandTotal: 2_700_000,
      selectedSvcs: { 2: 1 },
    });
    expect(screen.getByText("2.700.000₫", { selector: ".text-yellow-400" })).toBeInTheDocument();
  });
});