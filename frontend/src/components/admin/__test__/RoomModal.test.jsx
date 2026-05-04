import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RoomModal from "../RoomModal";
import "@testing-library/jest-dom";
import { adminApi } from "@/services/adminApi";


jest.mock("@/services/adminApi", () => ({
  adminApi: {
    getRoomTypes: jest.fn(),
    getHotels: jest.fn(),
  },
}));


const mockHotels = [
  { id: 1, name: "Khách sạn A" },
  { id: 2, name: "Khách sạn B" },
];

const mockRoomTypes = [
  { id: 10, hotelId: 1, name: "Deluxe",  capacity: 2, basePrice: 500000, description: "Phòng Deluxe 2 người" },
  { id: 11, hotelId: 1, name: "Deluxe",  capacity: 4, basePrice: 800000, description: "Phòng Deluxe 4 người" },
  { id: 12, hotelId: 1, name: "Suite",   capacity: 2, basePrice: 1200000, description: "Phòng Suite sang trọng" },
  { id: 20, hotelId: 2, name: "Standard",capacity: 2, basePrice: 300000, description: "Phòng tiêu chuẩn" },
];

const mockSelectedRoom = {
  roomNumber: "101",
  status: "AVAILABLE",
  hotelId: 1,
  roomType: { id: 10, name: "Deluxe", basePrice: 500000, description: "Phòng Deluxe 2 người" },
  customPrice: 500000,
  description: "Phòng Deluxe 2 người",
};


const setup = (props = {}) => {
  const defaults = {
    isOpen: true,
    onClose: jest.fn(),
    onSave: jest.fn(),
    selectedRoom: null,
  };
  return render(<RoomModal {...defaults} {...props} />);
};

beforeEach(() => {
  adminApi.getRoomTypes.mockResolvedValue({ data: mockRoomTypes });
  adminApi.getHotels.mockResolvedValue({ data: mockHotels });
});

afterEach(() => {
  jest.clearAllMocks();
});



describe("RoomModal – visibility", () => {
  it("không render khi isOpen = false", () => {
    setup({ isOpen: false });
    expect(screen.queryByText(/tạo phòng mới/i)).not.toBeInTheDocument();
  });

  it("render khi isOpen = true", async () => {
    setup();
    await waitFor(() => {
      expect(screen.getByText(/tạo phòng mới/i)).toBeInTheDocument();
    });
  });
});


describe("RoomModal – chế độ tạo mới", () => {
  it("hiển thị tiêu đề 'Tạo phòng mới'", async () => {
    setup();
    await waitFor(() =>
      expect(screen.getByText(/tạo phòng mới/i)).toBeInTheDocument()
    );
  });

  it("load danh sách khách sạn và hiển thị trong select", async () => {
    setup();
    await waitFor(() => {
      expect(screen.getByText("Khách sạn A")).toBeInTheDocument();
      expect(screen.getByText("Khách sạn B")).toBeInTheDocument();
    });
  });

  it("select loại phòng bị disabled khi chưa chọn khách sạn", async () => {
    setup();
    await waitFor(() => screen.getByText("Khách sạn A"));

    // Tìm tất cả các select, select thứ 3 là "Loại phòng"
    const selects = screen.getAllByRole("combobox");
    const roomTypeSelect = selects[2];
    expect(roomTypeSelect).toBeDisabled();
  });

  it("select sức chứa bị disabled khi chưa chọn loại phòng", async () => {
    setup();
    await waitFor(() => screen.getByText("Khách sạn A"));

    const selects = screen.getAllByRole("combobox");
    const capacitySelect = selects[3];
    expect(capacitySelect).toBeDisabled();
  });

  it("chọn khách sạn → select loại phòng được bật và hiện đúng loại", async () => {
    setup();
    await waitFor(() => screen.getByText("Khách sạn A"));

    const selects = screen.getAllByRole("combobox");
    const hotelSelect = selects[0];

    fireEvent.change(hotelSelect, { target: { value: "1" } });

    await waitFor(() => {
      const roomTypeSelect = screen.getAllByRole("combobox")[2];
      expect(roomTypeSelect).not.toBeDisabled();
      // Khách sạn 1 có: Deluxe, Suite
      expect(screen.getByRole("option", { name: "Deluxe" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "Suite" })).toBeInTheDocument();
      // Khách sạn 2 (Standard) không hiện
      expect(screen.queryByRole("option", { name: "Standard" })).not.toBeInTheDocument();
    });
  });

  it("chọn loại phòng → select sức chứa được bật", async () => {
    setup();
    await waitFor(() => screen.getByText("Khách sạn A"));

    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[0], { target: { value: "1" } });

    await waitFor(() => screen.getByRole("option", { name: "Deluxe" }));
    fireEvent.change(screen.getAllByRole("combobox")[2], { target: { value: "Deluxe" } });

    await waitFor(() => {
      const capacitySelect = screen.getAllByRole("combobox")[3];
      expect(capacitySelect).not.toBeDisabled();
    });
  });

  it("chọn sức chứa → hiển thị đúng giá và mô tả", async () => {
    setup();
    await waitFor(() => screen.getByText("Khách sạn A"));

    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[0], { target: { value: "1" } });

    await waitFor(() => screen.getByRole("option", { name: "Deluxe" }));
    fireEvent.change(screen.getAllByRole("combobox")[2], { target: { value: "Deluxe" } });

    await waitFor(() => screen.getByRole("option", { name: "2 người" }));
    fireEvent.change(screen.getAllByRole("combobox")[3], { target: { value: "10" } });

    await waitFor(() => {
      expect(screen.getByText(/500\.000/)).toBeInTheDocument();
      expect(screen.getByText("Phòng Deluxe 2 người")).toBeInTheDocument();
    });
  });

  it("nhập số phòng được chuyển thành chữ hoa", async () => {
    setup();
    await waitFor(() => screen.getByText(/tạo phòng mới/i));

    const roomNumberInput = screen.getByRole("textbox");
    fireEvent.change(roomNumberInput, { target: { value: "a101" } });

    expect(roomNumberInput.value).toBe("A101");
  });

  it("nhấn Hủy gọi onClose", async () => {
    const onClose = jest.fn();
    setup({ onClose });
    await waitFor(() => screen.getByText(/tạo phòng mới/i));

    fireEvent.click(screen.getByText("Hủy"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("nhấn Lưu gọi onSave với roomData hiện tại", async () => {
    const onSave = jest.fn();
    setup({ onSave });
    await waitFor(() => screen.getByText(/tạo phòng mới/i));

    fireEvent.click(screen.getByText("Lưu"));
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        roomNumber: "",
        status: "AVAILABLE",
        hotelId: "",
      })
    );
  });
});


describe("RoomModal – chế độ chỉnh sửa (selectedRoom)", () => {
  it("hiển thị tiêu đề 'Cập nhật phòng'", async () => {
    setup({ selectedRoom: mockSelectedRoom });
    await waitFor(() =>
      expect(screen.getByText(/cập nhật phòng/i)).toBeInTheDocument()
    );
  });

  it("điền sẵn số phòng từ selectedRoom", async () => {
    setup({ selectedRoom: mockSelectedRoom });
    await waitFor(() => {
      const input = screen.getByRole("textbox");
      expect(input.value).toBe("101");
    });
  });

  it("điền sẵn trạng thái từ selectedRoom", async () => {
    setup({ selectedRoom: mockSelectedRoom });
    await waitFor(() => {
      const selects = screen.getAllByRole("combobox");
      const statusSelect = selects[1];
      expect(statusSelect.value).toBe("AVAILABLE");
    });
  });

  it("hiển thị đúng giá từ selectedRoom", async () => {
    setup({ selectedRoom: mockSelectedRoom });
    await waitFor(() => {
      expect(screen.getByText(/500\.000/)).toBeInTheDocument();
    });
  });

  it("hiển thị đúng mô tả từ selectedRoom", async () => {
    setup({ selectedRoom: mockSelectedRoom });
    await waitFor(() => {
      expect(screen.getByText("Phòng Deluxe 2 người")).toBeInTheDocument();
    });
  });

  it("hiển thị tên khách sạn tương ứng với hotelId", async () => {
    setup({ selectedRoom: mockSelectedRoom });
    await waitFor(() => {
      const selects = screen.getAllByRole("combobox");
      expect(selects[0].value).toBe("1");
    });
  });
});


describe("RoomModal – xử lý lỗi API", () => {
  it("khi API thất bại, roomTypes và hotels trở thành mảng rỗng", async () => {
    adminApi.getRoomTypes.mockRejectedValue(new Error("Network error"));
    adminApi.getHotels.mockRejectedValue(new Error("Network error"));

    setup();

    await waitFor(() => {
      // Không crash, select khách sạn chỉ có option mặc định
      const selects = screen.getAllByRole("combobox");
      expect(selects[0].querySelectorAll("option").length).toBe(1); // chỉ "Chọn"
    });
  });
});


describe("RoomModal – reset state khi đổi khách sạn", () => {
  it("khi chọn lại khách sạn khác, loại phòng và giá bị reset", async () => {
    setup();
    await waitFor(() => screen.getByText("Khách sạn A"));

    const selects = screen.getAllByRole("combobox");
    // Chọn khách sạn A
    fireEvent.change(selects[0], { target: { value: "1" } });
    await waitFor(() => screen.getByRole("option", { name: "Deluxe" }));
    fireEvent.change(screen.getAllByRole("combobox")[2], { target: { value: "Deluxe" } });
    await waitFor(() => screen.getByRole("option", { name: "2 người" }));
    fireEvent.change(screen.getAllByRole("combobox")[3], { target: { value: "10" } });
    await waitFor(() => screen.getByText(/500\.000/));

    fireEvent.change(screen.getAllByRole("combobox")[0], { target: { value: "2" } });

    await waitFor(() => {
      expect(screen.getByText(/^0\s*đ/)).toBeInTheDocument();
    });
  });
});