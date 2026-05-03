import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ServicesCard from "../ServiceCard";
import "@testing-library/jest-dom";

const mockServices = [
  { id: 1, name: "Bữa sáng", price: 150_000 },
  { id: 2, name: "Đưa đón sân bay", price: 300_000 },
  { id: 3, name: "Spa", price: 500_000 },
];

const baseProps = {
  services: mockServices,
  loading: false,
  selected: {},
  onToggle: jest.fn(),
  onQtyChange: jest.fn(),
};

const renderCard = (props = {}) =>
  render(<ServicesCard {...baseProps} {...props} />);

beforeEach(() => jest.clearAllMocks());


describe("ServicesCard – render", () => {
  it("hiển thị tiêu đề 'Dịch vụ thêm'", () => {
    renderCard();
    expect(screen.getByText("Dịch vụ thêm")).toBeInTheDocument();
  });

  it("hiển thị label 'Tùy chọn'", () => {
    renderCard();
    expect(screen.getByText(/tùy chọn/i)).toBeInTheDocument();
  });

  it("hiển thị đủ danh sách dịch vụ", () => {
    renderCard();
    expect(screen.getByText("Bữa sáng")).toBeInTheDocument();
    expect(screen.getByText("Đưa đón sân bay")).toBeInTheDocument();
    expect(screen.getByText("Spa")).toBeInTheDocument();
  });

  it("hiển thị giá dịch vụ định dạng vi-VN", () => {
    renderCard();
    expect(screen.getByText("150.000₫ / lần")).toBeInTheDocument();
    expect(screen.getByText("300.000₫ / lần")).toBeInTheDocument();
    expect(screen.getByText("500.000₫ / lần")).toBeInTheDocument();
  });
});


describe("ServicesCard – loading", () => {
  it("hiển thị skeleton khi loading = true", () => {
    const { container } = renderCard({ loading: true });
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThanOrEqual(1);
  });

  it("KHÔNG hiển thị danh sách dịch vụ khi loading", () => {
    renderCard({ loading: true });
    expect(screen.queryByText("Bữa sáng")).not.toBeInTheDocument();
  });

  it("KHÔNG hiển thị thông báo trống khi loading", () => {
    renderCard({ loading: true });
    expect(
      screen.queryByText(/không có dịch vụ thêm/i)
    ).not.toBeInTheDocument();
  });
});


describe("ServicesCard – danh sách rỗng", () => {
  it("hiển thị thông báo khi services = []", () => {
    renderCard({ services: [] });
    expect(
      screen.getByText(/không có dịch vụ thêm/i)
    ).toBeInTheDocument();
  });

  it("KHÔNG render dịch vụ nào khi services = []", () => {
    renderCard({ services: [] });
    expect(screen.queryByText("Bữa sáng")).not.toBeInTheDocument();
  });
});


describe("ServicesCard – trạng thái checked", () => {
  it("KHÔNG hiển thị stepper khi dịch vụ chưa được chọn (qty = 0)", () => {
    renderCard({ selected: {} });
    expect(screen.queryByText("−")).not.toBeInTheDocument();
    expect(screen.queryByText("+")).not.toBeInTheDocument();
  });

  it("hiển thị stepper khi dịch vụ được chọn (qty > 0)", () => {
    renderCard({ selected: { 1: 2 } });
    expect(screen.getByText("−")).toBeInTheDocument();
    expect(screen.getByText("+")).toBeInTheDocument();
  });

  it("hiển thị đúng qty trong stepper", () => {
    renderCard({ selected: { 1: 3 } });
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("hiển thị stepper cho đúng dịch vụ được chọn, ẩn với dịch vụ chưa chọn", () => {
    // Chỉ chọn dịch vụ id=1, id=2 và id=3 không chọn
    renderCard({ selected: { 1: 1, 2: 1 } });
    // Có 2 stepper (mỗi dịch vụ 1 cặp − +)
    expect(screen.getAllByText("−")).toHaveLength(2);
    expect(screen.getAllByText("+")).toHaveLength(2);
  });

  it("dịch vụ chưa chọn có border zinc, dịch vụ đã chọn có border yellow", () => {
    const { container } = renderCard({ selected: { 1: 1 } });
    const cards = container.querySelectorAll("[class*='rounded-xl border']");
    const checkedCard = [...cards].find(el =>
      el.className.includes("border-yellow-600")
    );
    expect(checkedCard).toBeTruthy();
  });
});


describe("ServicesCard – onToggle", () => {
  it("gọi onToggle với đúng svc.id khi click vào card", () => {
    const onToggle = jest.fn();
    renderCard({ onToggle });
    fireEvent.click(screen.getByText("Bữa sáng").closest("[class*='rounded-xl']"));
    expect(onToggle).toHaveBeenCalledWith(1);
  });

  it("gọi onToggle với id khác nhau cho từng dịch vụ", () => {
    const onToggle = jest.fn();
    renderCard({ onToggle });

    fireEvent.click(screen.getByText("Bữa sáng").closest("[class*='rounded-xl']"));
    fireEvent.click(screen.getByText("Spa").closest("[class*='rounded-xl']"));

    expect(onToggle).toHaveBeenNthCalledWith(1, 1);
    expect(onToggle).toHaveBeenNthCalledWith(2, 3);
  });
});


describe("ServicesCard – onQtyChange (stepper)", () => {
  it("gọi onQtyChange(id, qty - 1) khi nhấn nút −", () => {
    const onQtyChange = jest.fn();
    renderCard({ selected: { 1: 3 }, onQtyChange });
    fireEvent.click(screen.getByText("−"));
    expect(onQtyChange).toHaveBeenCalledWith(1, 2);
  });

  it("gọi onQtyChange(id, qty + 1) khi nhấn nút +", () => {
    const onQtyChange = jest.fn();
    renderCard({ selected: { 1: 3 }, onQtyChange });
    fireEvent.click(screen.getByText("+"));
    expect(onQtyChange).toHaveBeenCalledWith(1, 4);
  });

  it("KHÔNG gọi onToggle khi nhấn nút stepper (stopPropagation)", () => {
    const onToggle = jest.fn();
    const onQtyChange = jest.fn();
    renderCard({ selected: { 1: 2 }, onToggle, onQtyChange });

    fireEvent.click(screen.getByText("+"));

    expect(onToggle).not.toHaveBeenCalled();
  });

  it("KHÔNG gọi onToggle khi nhấn nút − (stopPropagation)", () => {
    const onToggle = jest.fn();
    const onQtyChange = jest.fn();
    renderCard({ selected: { 1: 2 }, onToggle, onQtyChange });

    fireEvent.click(screen.getByText("−"));

    expect(onToggle).not.toHaveBeenCalled();
  });

  it("gọi đúng onQtyChange cho từng dịch vụ riêng biệt khi chọn nhiều", () => {
    const onQtyChange = jest.fn();
    renderCard({ selected: { 1: 2, 2: 5 }, onQtyChange });

    const minusBtns = screen.getAllByText("−");
    fireEvent.click(minusBtns[1]); // dịch vụ thứ 2 (id=2, qty=5)

    expect(onQtyChange).toHaveBeenCalledWith(2, 4);
  });
});