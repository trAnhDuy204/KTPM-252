import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import BookingStatusFilter from "../BookingStatusFilter";

describe("BookingStatusFilter", () => {
  it("renders all status options plus 'Tất cả'", () => {
    render(<BookingStatusFilter value="" onChange={jest.fn()} />);

    expect(screen.getByText("Tất cả")).toBeInTheDocument();
    expect(screen.getByText("Chờ xác nhận")).toBeInTheDocument();
    expect(screen.getByText("Đã xác nhận")).toBeInTheDocument();
    expect(screen.getByText("Đã nhận phòng")).toBeInTheDocument();
    expect(screen.getByText("Đã trả phòng")).toBeInTheDocument();
    expect(screen.getByText("Đã hủy")).toBeInTheDocument();
  });

  it("calls onChange when a status button is clicked", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<BookingStatusFilter value="" onChange={onChange} />);

    await user.click(screen.getByText("Đã nhận phòng"));

    expect(onChange).toHaveBeenCalledWith("CHECKED_IN");
  });

  it("highlights active filter", () => {
    render(<BookingStatusFilter value="CHECKED_IN" onChange={jest.fn()} />);

    const activeBtn = screen.getByText("Đã nhận phòng");

    expect(activeBtn.className).toContain("text-white");
  });
});
