import { render, screen, fireEvent } from "@testing-library/react";
import CusTomerRoomCard from "../CusTomerRoomCard";
import "@testing-library/jest-dom";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));


const baseRoom = {
  id: 42,
  roomNumber: "101",
  roomTypeName: "Deluxe",
  hotelName: "Mường Thanh Luxury",
  hotelCity: "Hà Nội",
  basePrice: 1_200_000,
  status: "AVAILABLE",
};

const renderCard = (room = baseRoom) =>
  render(<CusTomerRoomCard room={room} />);

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});

describe("CusTomerRoomCard – render", () => {
  it("hiển thị số phòng", () => {
    renderCard();
    expect(screen.getByText("Phòng 101")).toBeInTheDocument();
  });

  it("hiển thị loại phòng", () => {
    renderCard();
    expect(screen.getByText("Deluxe")).toBeInTheDocument();
  });

  it("hiển thị thành phố khách sạn", () => {
    renderCard();
    expect(screen.getByText("Hà Nội")).toBeInTheDocument();
  });

  it("hiển thị giá đúng định dạng vi-VN", () => {
    renderCard();
    expect(screen.getByText("1.200.000₫ / đêm")).toBeInTheDocument();
  });

  it("hiển thị nút 'Xem chi tiết' và 'Đặt phòng'", () => {
    renderCard();
    expect(screen.getByRole("button", { name: /xem chi tiết/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /đặt phòng/i })).toBeInTheDocument();
  });

  it("không hiển thị icon thành phố khi hotelName bị undefined", () => {
    renderCard({ ...baseRoom, hotelName: undefined });
    expect(screen.queryByText("Hà Nội")).not.toBeInTheDocument();
  });
});

describe("CusTomerRoomCard – status label", () => {
  const cases = [
    { status: "AVAILABLE",   label: "Còn trống" },
    { status: "RESERVED",    label: "Đã được đặt trước" },
    { status: "OCCUPIED",    label: "Đang sử dụng" },
    { status: "CLEANING",    label: "Đang dọn" },
    { status: "MAINTENANCE", label: "Bảo trì" },
  ];

  test.each(cases)("status $status → label '$label'", ({ status, label }) => {
    renderCard({ ...baseRoom, status });
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it("trả về status gốc khi status không khớp bất kỳ key nào", () => {
    renderCard({ ...baseRoom, status: "UNKNOWN_STATUS" });
    expect(screen.getByText("UNKNOWN_STATUS")).toBeInTheDocument();
  });

  it("badge AVAILABLE có class màu emerald", () => {
    renderCard({ ...baseRoom, status: "AVAILABLE" });
    const badge = screen.getByText("Còn trống");
    expect(badge.className).toMatch(/emerald/);
  });

  it("badge OCCUPIED có class màu red", () => {
    renderCard({ ...baseRoom, status: "OCCUPIED" });
    const badge = screen.getByText("Đang sử dụng");
    expect(badge.className).toMatch(/red/);
  });

  it("badge CLEANING có class màu sky", () => {
    renderCard({ ...baseRoom, status: "CLEANING" });
    const badge = screen.getByText("Đang dọn");
    expect(badge.className).toMatch(/sky/);
  });

  it("badge MAINTENANCE có class màu amber", () => {
    renderCard({ ...baseRoom, status: "MAINTENANCE" });
    const badge = screen.getByText("Bảo trì");
    expect(badge.className).toMatch(/amber/);
  });
});

describe("CusTomerRoomCard – nút Đặt phòng (disabled/enabled)", () => {
  it("nút Đặt phòng ENABLED khi status là AVAILABLE", () => {
    renderCard({ ...baseRoom, status: "AVAILABLE" });
    expect(screen.getByRole("button", { name: /đặt phòng/i })).not.toBeDisabled();
  });

  const nonBookable = ["OCCUPIED", "CLEANING", "MAINTENANCE", "RESERVED"];
  test.each(nonBookable)("nút Đặt phòng DISABLED khi status là %s", (status) => {
    renderCard({ ...baseRoom, status });
    expect(screen.getByRole("button", { name: /đặt phòng/i })).toBeDisabled();
  });
});

describe("CusTomerRoomCard – nút Xem chi tiết", () => {
  it("navigate đúng route /dashboard/room-detail/:id khi nhấn", () => {
    renderCard();
    fireEvent.click(screen.getByRole("button", { name: /xem chi tiết/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard/room-detail/42");
  });

  it("navigate với đúng id của phòng", () => {
    renderCard({ ...baseRoom, id: 99 });
    fireEvent.click(screen.getByRole("button", { name: /xem chi tiết/i }));
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard/room-detail/99");
  });
});

describe("CusTomerRoomCard – handleBook", () => {
  beforeEach(() => {
    jest.spyOn(window, "alert").mockImplementation(() => {});
  });

  afterEach(() => {
    window.alert.mockRestore();
  });

  it("hiện alert và navigate đến /login khi chưa đăng nhập", () => {
    renderCard();
    fireEvent.click(screen.getByRole("button", { name: /đặt phòng/i }));

    expect(window.alert).toHaveBeenCalledWith("Vui lòng đăng nhập để đặt phòng");
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("KHÔNG navigate /login khi đã có accessToken", () => {
    localStorage.setItem("accessToken", "mock-token-abc");
    renderCard();
    fireEvent.click(screen.getByRole("button", { name: /đặt phòng/i }));

    expect(window.alert).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalledWith("/login");
  });

  it("navigate đến /dashboard/booking với state chứa room khi đã đăng nhập", () => {
    localStorage.setItem("accessToken", "mock-token-abc");
    renderCard();
    fireEvent.click(screen.getByRole("button", { name: /đặt phòng/i }));

    expect(mockNavigate).toHaveBeenCalledWith("/dashboard/booking", {
      state: { room: baseRoom },
    });
  });

  it("truyền đúng object room vào state khi navigate", () => {
    localStorage.setItem("accessToken", "tok");
    const customRoom = { ...baseRoom, id: 7, roomNumber: "205" };
    renderCard(customRoom);
    fireEvent.click(screen.getByRole("button", { name: /đặt phòng/i }));

    expect(mockNavigate).toHaveBeenCalledWith(
      "/dashboard/booking",
      expect.objectContaining({ state: { room: customRoom } })
    );
  });

  it("không làm gì cả khi nhấn nút disabled (OCCUPIED)", () => {
    renderCard({ ...baseRoom, status: "OCCUPIED" });
    fireEvent.click(screen.getByRole("button", { name: /đặt phòng/i }));

    expect(window.alert).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});