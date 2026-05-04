import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import AdminRoomManagement, { getStatusVn } from "../AdminRoomManagement";
import { adminApi } from "@/services/adminApi";

jest.mock("@/services/adminApi");
jest.mock("@/components/admin/RoomModal", () => () => <div data-testid="room-modal" />);

const mockRooms = [
    {
        id: 1,
        roomNumber: "P101",
        hotelId: 1,
        status: "AVAILABLE",
        roomType: { id: 1, name: "Deluxe", capacity: 2, basePrice: 500000 }
    },
    {
        id: 2,
        roomNumber: "P102",
        hotelId: 2,
        status: "OCCUPIED",
        roomType: { id: 2, name: "Suite", capacity: 4, basePrice: 1000000 }
    }
];

const mockHotels = [
    { id: 1, name: "Hotel A", city: "HCM" },
    { id: 2, name: "Hotel B", city: "HN" }
];

describe("getStatusVn", () => {
    it("trả về đúng tiếng Việt", () => {
        expect(getStatusVn("AVAILABLE")).toBe("Trống");
        expect(getStatusVn("OCCUPIED")).toBe("Có khách");
        expect(getStatusVn("UNKNOWN")).toBe("Trống");
    });
});

describe("AdminRoomManagement", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        adminApi.getAllRooms.mockResolvedValue({ data: mockRooms });
        adminApi.getHotels.mockResolvedValue({ data: mockHotels });
    });

    it("render danh sách phòng sau khi fetch", async () => {
        render(<AdminRoomManagement />);

        await waitFor(() => {
            expect(screen.getByText("P101")).toBeInTheDocument();
            expect(screen.getByText("P102")).toBeInTheDocument();
        });
    });
    it("filter theo số phòng", async () => {
        render(<AdminRoomManagement />);

        await waitFor(() => screen.getByText("P101"));

        fireEvent.change(
            screen.getByPlaceholderText(/tìm theo số phòng/i),
            { target: { value: "P101" } }
        );

        expect(screen.getByText("P101")).toBeInTheDocument();
        expect(screen.queryByText("P102")).not.toBeInTheDocument();
    });
    it("filter theo khách sạn", async () => {
        render(<AdminRoomManagement />);

        await waitFor(() => screen.getByText("P101"));

        fireEvent.change(screen.getByRole("combobox"), {
            target: { value: "1" }
        });

        expect(screen.getByText("P101")).toBeInTheDocument();
        expect(screen.queryByText("P102")).not.toBeInTheDocument();
    });
    it("click thêm phòng mở modal", async () => {
        render(<AdminRoomManagement />);

        fireEvent.click(screen.getByRole("button", { name: /thêm phòng/i }));

        expect(screen.getByTestId("room-modal")).toBeInTheDocument();
    });
    it("click sửa mở modal với room", async () => {
        render(<AdminRoomManagement />);

        await waitFor(() => screen.getByText("P101"));

        fireEvent.click(screen.getAllByText("Sửa")[0]);

        expect(screen.getByTestId("room-modal")).toBeInTheDocument();
    });
    it("xóa phòng gọi API", async () => {
        window.confirm = jest.fn(() => true);
        adminApi.deleteRoom.mockResolvedValue({});

        render(<AdminRoomManagement />);

        await waitFor(() => screen.getByText("P101"));

        fireEvent.click(screen.getAllByText("Xóa")[0]);

        await waitFor(() => {
            expect(adminApi.deleteRoom).toHaveBeenCalledWith(1);
        });
    });
    it("không xóa nếu user cancel", async () => {
        window.confirm = jest.fn(() => false);

        render(<AdminRoomManagement />);

        await waitFor(() => screen.getByText("P101"));

        fireEvent.click(screen.getAllByText("Xóa")[0]);

        expect(adminApi.deleteRoom).not.toHaveBeenCalled();
    });
    it("hiển thị trạng thái đúng", async () => {
        render(<AdminRoomManagement />);

        await waitFor(() => {
            expect(screen.getByText("Trống")).toBeInTheDocument();
            expect(screen.getByText("Có khách")).toBeInTheDocument();
        });
    });
});