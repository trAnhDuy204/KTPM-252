import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

import HotelRoomsApp from "../HotelRoomApp";

jest.mock("@/components/customerBooking/CusTomerRoomCard", () => ({
  __esModule: true,
  default: ({ room }) => (
    <div data-testid="room-card">
      {room.roomNumber} - {room.roomTypeName} - {room.basePrice}
    </div>
  ),
}));

jest.mock("lucide-react", () => ({
  Hotel: () => <svg data-testid="hotel-icon" />,
  MoveDown: () => <svg data-testid="move-down-icon" />,
  MoveUp: () => <svg data-testid="move-up-icon" />,
}));

const rooms = [
  {
    id: 1,
    hotelName: "Lumiere Hotel",
    roomNumber: "101",
    roomTypeName: "Deluxe",
    basePrice: 500000,
  },
  {
    id: 2,
    hotelName: "Lumiere Hotel",
    roomNumber: "102",
    roomTypeName: "Suite",
    basePrice: 1200000,
  },
  {
    id: 3,
    hotelName: "Ocean Hotel",
    roomNumber: "201",
    roomTypeName: "Deluxe",
    basePrice: 700000,
  },
  {
    id: 4,
    hotelName: null,
    roomNumber: "301",
    roomTypeName: "Standard",
    basePrice: 300000,
  },
];

describe("HotelRoomsApp", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue(rooms),
    });
  });

  afterEach(() => {
    delete global.fetch;
  });

  it("should render header and fetch rooms", async () => {
    render(<HotelRoomsApp />);

    expect(screen.getByText("Danh sách phòng")).toBeInTheDocument();
    expect(screen.getByText("Chọn phòng phù hợp và đặt ngay")).toBeInTheDocument();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("http://localhost:8080/api/public/rooms");
    });

    // Sau khi fetch xong, 4 room card được render
    expect(await screen.findAllByTestId("room-card")).toHaveLength(4);
    expect(screen.getByText("4 phòng")).toBeInTheDocument();
  });

  it("should show loading skeleton before fetch completes", () => {
    global.fetch = jest.fn().mockReturnValue(new Promise(() => {}));

    const { container } = render(<HotelRoomsApp />);

    expect(container.querySelectorAll(".animate-pulse")).toHaveLength(3);
  });

  it("should render room cards after loading", async () => {
    render(<HotelRoomsApp />);

    expect(await screen.findAllByTestId("room-card")).toHaveLength(4);

    expect(screen.getByText("101 - Deluxe - 500000")).toBeInTheDocument();
    expect(screen.getByText("102 - Suite - 1200000")).toBeInTheDocument();
    expect(screen.getByText("201 - Deluxe - 700000")).toBeInTheDocument();
    expect(screen.getByText("301 - Standard - 300000")).toBeInTheDocument();
  });

  it("should render room type filter options from original rooms", async () => {
    render(<HotelRoomsApp />);

    await screen.findAllByTestId("room-card");

    expect(screen.getByRole("option", { name: "Tất cả loại phòng" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Deluxe" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Suite" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Standard" })).toBeInTheDocument();
  });

  it("should filter rooms by room type", async () => {
    render(<HotelRoomsApp />);

    await screen.findAllByTestId("room-card");

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "deluxe" },
    });

    expect(screen.getAllByTestId("room-card")).toHaveLength(2);
    expect(screen.getByText("101 - Deluxe - 500000")).toBeInTheDocument();
    expect(screen.getByText("201 - Deluxe - 700000")).toBeInTheDocument();

    expect(screen.queryByText("102 - Suite - 1200000")).not.toBeInTheDocument();
    expect(screen.queryByText("301 - Standard - 300000")).not.toBeInTheDocument();
    expect(screen.getByText("2 phòng")).toBeInTheDocument();
  });

  it("should show empty state when selected room type has no matching rooms", async () => {
    const roomsWithoutSuite = [
      {
        id: 1,
        hotelName: "Lumiere Hotel",
        roomNumber: "101",
        roomTypeName: "Deluxe",
        basePrice: 500000,
      },
      {
        id: 2,
        hotelName: "Ocean Hotel",
        roomNumber: "201",
        roomTypeName: "Suite",
        basePrice: 700000,
      },
    ];

    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue(roomsWithoutSuite),
    });

    render(<HotelRoomsApp />);

    await screen.findAllByTestId("room-card");

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "suite" },
    });

    expect(screen.getAllByTestId("room-card")).toHaveLength(1);

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "deluxe" },
    });

    expect(screen.getAllByTestId("room-card")).toHaveLength(1);
  });

  it("should sort rooms by ascending price", async () => {
    render(<HotelRoomsApp />);

    await screen.findAllByTestId("room-card");

    fireEvent.click(screen.getByRole("button", { name: /giá tăng dần/i }));

    const cards = screen.getAllByTestId("room-card");

    expect(cards[0]).toHaveTextContent("301 - Standard - 300000");
    expect(cards[1]).toHaveTextContent("101 - Deluxe - 500000");
    expect(cards[2]).toHaveTextContent("102 - Suite - 1200000");
    expect(cards[3]).toHaveTextContent("201 - Deluxe - 700000");

    expect(screen.getByRole("button", { name: /giá tăng dần/i }))
      .toHaveClass("text-yellow-400");
  });

  it("should sort rooms by descending price", async () => {
    render(<HotelRoomsApp />);

    await screen.findAllByTestId("room-card");

    fireEvent.click(screen.getByRole("button", { name: /giá giảm dần/i }));

    const cards = screen.getAllByTestId("room-card");

    expect(cards[0]).toHaveTextContent("102 - Suite - 1200000");
    expect(cards[1]).toHaveTextContent("101 - Deluxe - 500000");
    expect(cards[2]).toHaveTextContent("201 - Deluxe - 700000");
    expect(cards[3]).toHaveTextContent("301 - Standard - 300000");

    expect(screen.getByRole("button", { name: /giá giảm dần/i }))
      .toHaveClass("text-yellow-400");
  });

  it("should show empty state when fetch returns empty rooms", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue([]),
    });

    render(<HotelRoomsApp />);

    expect(await screen.findByText("Không có phòng nào phù hợp.")).toBeInTheDocument();
    expect(screen.getByText("0 phòng")).toBeInTheDocument();
  });

  it("should show empty state when fetch fails", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));

    render(<HotelRoomsApp />);

    expect(await screen.findByText("Không có phòng nào phù hợp.")).toBeInTheDocument();
    expect(console.error).toHaveBeenCalledWith("Error:", expect.any(Error));

    console.error.mockRestore();
  });
});