import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import RoomCard from "../RoomCard";

describe("RoomCard", () => {
  const baseRoom = {
    id: 1,
    roomNumber: "101",
    status: "AVAILABLE",
    hotelId: 10,
    roomTypeId: 20,
  };

  it("renders room number and status", () => {
    render(<RoomCard room={baseRoom} onStatusChange={jest.fn()} />);

    expect(screen.getByText("Phòng 101")).toBeInTheDocument();

    // fix: tránh trùng với option
    const badge = screen.getByText("Trống", { selector: "span" });
    expect(badge).toBeInTheDocument();
  });

  it("shows correct options for AVAILABLE status", () => {
    render(<RoomCard room={baseRoom} onStatusChange={jest.fn()} />);

    expect(screen.getByRole("option", { name: "Đã đặt" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Đang ở" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Đang dọn" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Bảo trì" })).toBeInTheDocument();
  });

  it("shows correct options for OCCUPIED room", () => {
    const room = { ...baseRoom, status: "OCCUPIED" };

    render(<RoomCard room={room} onStatusChange={jest.fn()} />);

    expect(screen.getByRole("option", { name: "Đang dọn" })).toBeInTheDocument();
  });

  it("shows correct options for MAINTENANCE room", () => {
    const room = { ...baseRoom, status: "MAINTENANCE" };

    render(
      <RoomCard
        room={room}
        onStatusChange={jest.fn()}
        onDelete={jest.fn()}
      />
    );

    expect(screen.getByRole("option", { name: "Trống" })).toBeInTheDocument();
  });

  it("calls onStatusChange when selecting new status", async () => {
    const user = userEvent.setup();
    const onStatusChange = jest.fn();

    render(<RoomCard room={baseRoom} onStatusChange={onStatusChange} />);

    const select = screen.getByRole("combobox");

    await user.selectOptions(select, "RESERVED");

    expect(onStatusChange).toHaveBeenCalledWith(1, "RESERVED");
  });

  it("shows hotel and room type info", () => {
    render(<RoomCard room={baseRoom} onStatusChange={jest.fn()} />);

    expect(screen.getByText("Khách sạn")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("Loại phòng")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();
  });

  it("shows correct options for RESERVED status", () => {
    const room = { ...baseRoom, status: "RESERVED" };

    render(<RoomCard room={room} onStatusChange={jest.fn()} />);

    expect(screen.getByRole("option", { name: "Trống" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Đang ở" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Bảo trì" })).toBeInTheDocument();
  });

  it("shows correct options for CLEANING status", () => {
    const room = { ...baseRoom, status: "CLEANING" };

    render(<RoomCard room={room} onStatusChange={jest.fn()} />);

    expect(screen.getByRole("option", { name: "Trống" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Bảo trì" })).toBeInTheDocument();
  });
});