import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import DatePickerCard from "../DatePickerCard";

const defaultProps = {
  checkIn: "2024-06-10",
  checkOut: "2024-06-12",
  nights: 2,
  setCheckIn: jest.fn(),
  setCheckOut: jest.fn(),
};

const renderCard = (props = {}) =>
  render(<DatePickerCard {...defaultProps} {...props} />);

beforeEach(() => jest.clearAllMocks());

describe("DatePickerCard – render", () => {
  it("hiển thị tiêu đề 'Chọn ngày lưu trú'", () => {
    renderCard();
    expect(screen.getByText("Chọn ngày lưu trú")).toBeInTheDocument();
  });

  it("hiển thị 2 label Check-in và Check-out", () => {
    renderCard();
    expect(screen.getByText(/check-in/i)).toBeInTheDocument();
    expect(screen.getByText(/check-out/i)).toBeInTheDocument();
  });

  it("input Check-in có value đúng với checkIn prop", () => {
    renderCard();
    const inputs = screen.getAllByDisplayValue(/2024/);
    expect(inputs[0]).toHaveValue("2024-06-10");
  });

  it("input Check-out có value đúng với checkOut prop", () => {
    renderCard();
    const inputs = screen.getAllByDisplayValue(/2024/);
    expect(inputs[1]).toHaveValue("2024-06-12");
  });

  it("hiển thị số đêm đúng", () => {
    renderCard({ nights: 5 });
    expect(screen.getByText("5 đêm lưu trú")).toBeInTheDocument();
  });

  it("hiển thị ngày check-in định dạng vi-VN trong badge", () => {
    renderCard({ checkIn: "2024-06-10" });
    // "2024-06-10" --> "10/6/2024"
    expect(screen.getByText(/10\/6\/2024/)).toBeInTheDocument();
  });

  it("hiển thị ngày check-out định dạng vi-VN trong badge", () => {
    renderCard({ checkOut: "2024-06-12" });
    // "2024-06-12" --> "12/6/2024"
    expect(screen.getByText(/12\/6\/2024/)).toBeInTheDocument();
  });

  it("badge hiển thị đúng dạng 'checkIn → checkOut'", () => {
    renderCard({ checkIn: "2024-06-10", checkOut: "2024-06-12" });
    expect(screen.getByText(/10\/6\/2024.*→.*12\/6\/2024/)).toBeInTheDocument();
  });
});

describe("DatePickerCard – thuộc tính min", () => {
  it("input Check-in có min là ngày hôm nay (sv-SE)", () => {
    renderCard();
    const todayISO = new Date().toLocaleDateString("sv-SE");
    const checkInInput = screen.getAllByDisplayValue(/2024/)[0];
    expect(checkInInput).toHaveAttribute("min", todayISO);
  });

  it("input Check-out có min bằng giá trị checkIn hiện tại", () => {
    renderCard({ checkIn: "2024-06-10" });
    const checkOutInput = screen.getAllByDisplayValue(/2024/)[1];
    expect(checkOutInput).toHaveAttribute("min", "2024-06-10");
  });
});

describe("DatePickerCard – onChange Check-in", () => {
  it("gọi setCheckIn với giá trị mới khi thay đổi ngày check-in", () => {
    const setCheckIn = jest.fn();
    renderCard({ setCheckIn });
    const checkInInput = screen.getAllByDisplayValue(/2024/)[0];

    fireEvent.change(checkInInput, { target: { value: "2024-06-15" } });

    expect(setCheckIn).toHaveBeenCalledWith("2024-06-15");
  });

  it("KHÔNG gọi setCheckOut khi check-in mới < check-out hiện tại", () => {
    const setCheckOut = jest.fn();
    // checkIn mới = 06-11, checkOut = 06-12 --> không cần điều chỉnh
    renderCard({ checkIn: "2024-06-10", checkOut: "2024-06-12", setCheckOut });
    const checkInInput = screen.getAllByDisplayValue(/2024/)[0];

    fireEvent.change(checkInInput, { target: { value: "2024-06-11" } });

    expect(setCheckOut).not.toHaveBeenCalled();
  });

  it("gọi setCheckOut với ngày kế tiếp khi check-in mới = check-out", () => {
    const setCheckOut = jest.fn();
    // checkIn mới = 06-12, checkOut hiện tại = 06-12 --> cần đẩy checkOut lên 06-13
    renderCard({ checkIn: "2024-06-10", checkOut: "2024-06-12", setCheckOut });
    const checkInInput = screen.getAllByDisplayValue(/2024/)[0];

    fireEvent.change(checkInInput, { target: { value: "2024-06-12" } });

    expect(setCheckOut).toHaveBeenCalledWith("2024-06-13");
  });

  it("gọi setCheckOut với ngày kế tiếp khi check-in mới > check-out", () => {
    const setCheckOut = jest.fn();
    // checkIn mới = 06-20, checkOut = 06-12 --> cần đẩy lên 06-21
    renderCard({ checkIn: "2024-06-10", checkOut: "2024-06-12", setCheckOut });
    const checkInInput = screen.getAllByDisplayValue(/2024/)[0];

    fireEvent.change(checkInInput, { target: { value: "2024-06-20" } });

    expect(setCheckOut).toHaveBeenCalledWith("2024-06-21");
  });

  it("tự điều chỉnh check-out qua cuối tháng đúng", () => {
    const setCheckOut = jest.fn();
    // checkIn = 06-30, checkOut = 06-12 --> checkOut mới = 07-01
    renderCard({ checkIn: "2024-06-10", checkOut: "2024-06-12", setCheckOut });
    const checkInInput = screen.getAllByDisplayValue(/2024/)[0];

    fireEvent.change(checkInInput, { target: { value: "2024-06-30" } });

    expect(setCheckOut).toHaveBeenCalledWith("2024-07-01");
  });

  it("tự điều chỉnh check-out qua cuối năm đúng", () => {
    const setCheckOut = jest.fn();
    renderCard({ checkIn: "2024-06-10", checkOut: "2024-06-12", setCheckOut });
    const checkInInput = screen.getAllByDisplayValue(/2024/)[0];

    fireEvent.change(checkInInput, { target: { value: "2024-12-31" } });

    expect(setCheckOut).toHaveBeenCalledWith("2025-01-01");
  });
});

describe("DatePickerCard – onChange Check-out", () => {
  it("gọi setCheckOut với giá trị mới khi thay đổi ngày check-out", () => {
    const setCheckOut = jest.fn();
    renderCard({ setCheckOut });
    const checkOutInput = screen.getAllByDisplayValue(/2024/)[1];

    fireEvent.change(checkOutInput, { target: { value: "2024-06-20" } });

    expect(setCheckOut).toHaveBeenCalledWith("2024-06-20");
  });

  it("KHÔNG gọi setCheckIn khi thay đổi check-out", () => {
    const setCheckIn = jest.fn();
    renderCard({ setCheckIn });
    const checkOutInput = screen.getAllByDisplayValue(/2024/)[1];

    fireEvent.change(checkOutInput, { target: { value: "2024-06-20" } });

    expect(setCheckIn).not.toHaveBeenCalled();
  });
});