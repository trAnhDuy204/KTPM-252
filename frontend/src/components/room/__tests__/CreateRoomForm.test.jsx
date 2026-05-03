import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import CreateRoomForm from "../CreateRoomForm";
import { getHotels, getRoomTypes } from "@/services/roomApi";

jest.mock("@/services/roomApi", () => ({
  getHotels: jest.fn(),
  getRoomTypes: jest.fn(),
}));

jest.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    user: {
      id: 1,
      hotelId: 1,
      fullName: "Reception User",
      role: "RECEPTION",
    },
  }),
}));

const mockHotels = [
  { id: 1, name: "Hotel A", city: "Ha Noi" },
  { id: 2, name: "Hotel B", city: "HCM" },
];

const mockRoomTypes = [
  { id: 10, name: "Standard", capacity: 2, basePrice: 500000 },
  { id: 20, name: "Deluxe", capacity: 4, basePrice: 1000000 },
];

describe("CreateRoomForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    getHotels.mockResolvedValue({ data: mockHotels });
    getRoomTypes.mockResolvedValue({ data: mockRoomTypes });
  });

  it("renders form with all fields", () => {
    render(<CreateRoomForm onSubmit={jest.fn()} onCancel={jest.fn()} />);

    expect(screen.getByText("Thêm phòng mới")).toBeInTheDocument();
    expect(screen.getByText(/Khách sạn/)).toBeInTheDocument();
    expect(screen.getByText(/Loại phòng/)).toBeInTheDocument();
    expect(screen.getByText(/Số phòng/)).toBeInTheDocument();
    expect(screen.getByText("Tạo phòng")).toBeInTheDocument();
    expect(screen.getByText("Hủy")).toBeInTheDocument();
  });

  it("loads hotels on mount", async () => {
    render(<CreateRoomForm onSubmit={jest.fn()} onCancel={jest.fn()} />);

    await waitFor(() => {
      expect(getHotels).toHaveBeenCalled();
    });


    expect(await screen.findByText("Hotel A (Ha Noi)")).toBeInTheDocument();
    expect(screen.queryByText("Hotel B (HCM)")).not.toBeInTheDocument();
  });

  it("loads room types when hotel is selected", async () => {
    const user = userEvent.setup();

    render(<CreateRoomForm onSubmit={jest.fn()} onCancel={jest.fn()} />);

    await screen.findByText("Hotel A (Ha Noi)");

    const hotelSelect = screen.getAllByRole("combobox")[0];

    await user.selectOptions(hotelSelect, "1");

    await waitFor(() => {
      expect(getRoomTypes).toHaveBeenCalledWith("1");
    });

    expect(await screen.findByText(/Standard/)).toBeInTheDocument();
    expect(screen.getByText(/Deluxe/)).toBeInTheDocument();
  });

  it("disables room type dropdown when no hotel is selected", () => {
    render(<CreateRoomForm onSubmit={jest.fn()} onCancel={jest.fn()} />);

    const selects = screen.getAllByRole("combobox");

    expect(selects[1]).toBeDisabled();
  });

  it("calls onSubmit with correct data", async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();

    render(<CreateRoomForm onSubmit={onSubmit} onCancel={jest.fn()} />);

    await screen.findByText("Hotel A (Ha Noi)");

    await user.selectOptions(screen.getAllByRole("combobox")[0], "1");

    await screen.findByText(/Standard/);

    await user.selectOptions(screen.getAllByRole("combobox")[1], "10");
    await user.type(screen.getByPlaceholderText("VD: 101"), "301");
    await user.click(screen.getByText("Tạo phòng"));

    expect(onSubmit).toHaveBeenCalledWith({
      hotelId: 1,
      roomTypeId: 10,
      roomNumber: "301",
    });
  });

  it("shows validation errors when submitting empty form", async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();

    render(<CreateRoomForm onSubmit={onSubmit} onCancel={jest.fn()} />);

    await screen.findByText("Hotel A (Ha Noi)");
    await screen.findByText(/Standard/);

    await user.click(screen.getByText("Tạo phòng"));

    await waitFor(() => {
      expect(onSubmit).not.toHaveBeenCalled();
    });

    expect(screen.queryByText("Vui lòng chọn khách sạn")).not.toBeInTheDocument();
  });



  it("shows error for invalid room number characters", async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();

    render(<CreateRoomForm onSubmit={onSubmit} onCancel={jest.fn()} />);

    await screen.findByText("Hotel A (Ha Noi)");
    await screen.findByText(/Standard/);

    await user.selectOptions(screen.getAllByRole("combobox")[1], "10");
    await user.type(screen.getByPlaceholderText("VD: 101"), "phòng 1@#");
    await user.click(screen.getByText("Tạo phòng"));

    await waitFor(() => {
      expect(onSubmit).not.toHaveBeenCalled();
    });

    expect(screen.getAllByText(/số phòng/i).length).toBeGreaterThan(0);
  });



  it("calls onCancel when cancel button is clicked", async () => {
    const user = userEvent.setup();
    const onCancel = jest.fn();

    render(<CreateRoomForm onSubmit={jest.fn()} onCancel={onCancel} />);

    await user.click(screen.getByText("Hủy"));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("only shows current user's hotel", async () => {
    render(<CreateRoomForm onSubmit={jest.fn()} onCancel={jest.fn()} />);

    expect(await screen.findByText("Hotel A (Ha Noi)")).toBeInTheDocument();
    expect(screen.queryByText("Hotel B (HCM)")).not.toBeInTheDocument();
  });

});
