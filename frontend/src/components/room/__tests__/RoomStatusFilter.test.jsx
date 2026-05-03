import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import RoomStatusFilter from "../RoomStatusFilter";

describe("RoomStatusFilter", () => {
  it('renders select with all options', () => {
    render(<RoomStatusFilter value="" onChange={jest.fn()} />);

    const select = screen.getByRole("combobox");
    expect(select).toBeInTheDocument();

    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(6);

    expect(screen.getByText("Tất cả")).toBeInTheDocument();
    expect(screen.getByText("Trống")).toBeInTheDocument();
    expect(screen.getByText("Đã đặt")).toBeInTheDocument();
    expect(screen.getByText("Đang ở")).toBeInTheDocument();
    expect(screen.getByText("Đang dọn")).toBeInTheDocument();
    expect(screen.getByText("Bảo trì")).toBeInTheDocument();
  });

  it("selects correct value", () => {
    render(<RoomStatusFilter value="OCCUPIED" onChange={jest.fn()} />);

    const select = screen.getByRole("combobox");
    expect(select.value).toBe("OCCUPIED");
  });

  it("calls onChange when selecting option", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();

    render(<RoomStatusFilter value="" onChange={onChange} />);

    const select = screen.getByRole("combobox");

    await user.selectOptions(select, "AVAILABLE");

    expect(onChange).toHaveBeenCalledWith("AVAILABLE");
  });

  it('defaults to "Tất cả" when value is empty', () => {
    render(<RoomStatusFilter value="" onChange={jest.fn()} />);

    const select = screen.getByRole("combobox");
    expect(select.value).toBe("");
  });
});