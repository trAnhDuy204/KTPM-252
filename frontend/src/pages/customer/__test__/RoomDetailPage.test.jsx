import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

import RoomDetailPage from "../RoomDetailPage";

const MockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  useParams: () => ({ id: "5" }),
  useNavigate: () => MockNavigate,
}));

jest.mock("lucide-react", () => ({
  Hotel: () => <svg data-testid="hotel-icon" />,
  MapPinHouse: () => <svg data-testid="map-icon" />,
  BedSingle: () => <svg data-testid="bed-icon" />,
  User: () => <svg data-testid="user-icon" />,
  DoorClosed: () => <svg data-testid="door-icon" />,
  CheckCircle: () => <svg data-testid="check-icon" />,
  Wifi: () => <svg data-testid="wifi-icon" />,
  Snowflake: () => <svg data-testid="snowflake-icon" />,
  Tv: () => <svg data-testid="tv-icon" />,
  Bath: () => <svg data-testid="bath-icon" />,
  Coffee: () => <svg data-testid="coffee-icon" />,
  Sparkles: () => <svg data-testid="sparkles-icon" />,
  ZoomIn: () => <svg data-testid="zoom-icon" />,
  ChevronLeft: () => <svg data-testid="chevron-left-icon" />,
  ChevronRight: () => <svg data-testid="chevron-right-icon" />,
  X: () => <svg data-testid="x-icon" />,
}));

const room = {
  id: 5,
  roomNumber: "101",
  status: "AVAILABLE",
  hotelName: "Lumiere Hotel",
  hotelCity: "Da Nang",
  hotelAddress: "123 Beach Street",
  roomTypeName: "Deluxe",
  capacity: 2,
  basePrice: 500000,
  description: "Phòng đẹp, view biển.",
  images: [
    {
      id: 1,
      url: "primary.jpg",
      caption: "Ảnh chính",
      isPrimary: true,
    },
    {
      id: 2,
      url: "second.jpg",
      caption: "Ảnh phụ",
      isPrimary: false,
    },
  ],
};

describe("RoomDetailPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(room),
    });
  });

  afterEach(() => {
    delete global.fetch;
  });

  // ✅ FIX: "Deluxe" xuất hiện 2 lần trong DOM (subtitle heading + info grid).
  // getByText throw "Found multiple elements" → dùng getAllByText thay thế.
  it("should fetch and render room detail", async () => {
    render(<RoomDetailPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8080/api/public/rooms/5"
      );
    });

    expect(await screen.findByText("Phòng 101")).toBeInTheDocument();
    expect(screen.getAllByText("Deluxe").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Lumiere Hotel/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Da Nang/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/123 Beach Street/)).toBeInTheDocument();
    expect(screen.getByText("Phòng đẹp, view biển.")).toBeInTheDocument();
    expect(screen.getAllByText("Còn trống").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("500.000₫")).toBeInTheDocument();
  });

  it("should show loading spinner before fetch completes", () => {
    global.fetch = jest.fn().mockReturnValue(new Promise(() => {}));

    const { container } = render(<RoomDetailPage />);

    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("should show error screen when fetch fails", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
    });

    render(<RoomDetailPage />);

    expect(await screen.findByText("Phòng không tồn tại")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /quay lại/i }));

    expect(MockNavigate).toHaveBeenCalledWith(-1);
  });

  it("should render no images placeholder when room has no images", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        ...room,
        images: [],
      }),
    });

    render(<RoomDetailPage />);

    expect(await screen.findByText("Chưa có ảnh phòng")).toBeInTheDocument();
  });

  it("should use primary image as active image", async () => {
    render(<RoomDetailPage />);

    const image = await screen.findByAltText("Ảnh chính");

    expect(image).toHaveAttribute("src", "primary.jpg");
    expect(screen.getByText("1 / 2")).toBeInTheDocument();
  });

  it("should change active image when clicking next and previous arrows", async () => {
    render(<RoomDetailPage />);

    await screen.findByAltText("Ảnh chính");

    const nextButtons = screen.getAllByTestId("chevron-right-icon");
    fireEvent.click(nextButtons[0].closest("button"));

    expect(screen.getByAltText("Ảnh phụ")).toHaveAttribute("src", "second.jpg");
    expect(screen.getByText("2 / 2")).toBeInTheDocument();

    const prevButtons = screen.getAllByTestId("chevron-left-icon");
    fireEvent.click(prevButtons[0].closest("button"));

    expect(screen.getByAltText("Ảnh chính")).toHaveAttribute("src", "primary.jpg");
    expect(screen.getByText("1 / 2")).toBeInTheDocument();
  });

  // ✅ FIX: getAllByRole("img").filter(alt === "") trả về undefined ở index 1
  // vì thumbnail buttons có thể không tìm được đúng theo alt="".
  // Dùng querySelectorAll trực tiếp trên thumbnail strip để lấy chắc button thứ 2.
  it("should change active image when clicking thumbnail", async () => {
    const { container } = render(<RoomDetailPage />);

    await screen.findByAltText("Ảnh chính");

    // Thumbnail strip là hàng button chứa img với alt=""
    // Query tất cả button có chứa img[alt=""] để lấy đúng thumbnail
    const thumbnailButtons = container.querySelectorAll(
      'button > img[alt=""]'
    );

    // Click vào button cha của thumbnail thứ 2 (index 1 = "second.jpg")
    fireEvent.click(thumbnailButtons[1].closest("button"));

    expect(screen.getByAltText("Ảnh phụ")).toHaveAttribute("src", "second.jpg");
  });

  it("should open and close lightbox", async () => {
    render(<RoomDetailPage />);

    const mainImage = await screen.findByAltText("Ảnh chính");

    fireEvent.click(mainImage);

    expect(screen.getAllByText("1 / 2").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByAltText("Ảnh chính").length).toBeGreaterThanOrEqual(2);

    const closeButtons = screen.getAllByTestId("x-icon");
    fireEvent.click(closeButtons[0].closest("button"));

    expect(screen.getAllByAltText("Ảnh chính")).toHaveLength(1);
  });

  it("should navigate lightbox with keyboard arrows and close with escape", async () => {
    render(<RoomDetailPage />);

    const mainImage = await screen.findByAltText("Ảnh chính");
    fireEvent.click(mainImage);

    fireEvent.keyDown(window, { key: "ArrowRight" });

    expect(screen.getAllByAltText("Ảnh phụ").length).toBeGreaterThanOrEqual(1);

    fireEvent.keyDown(window, { key: "ArrowLeft" });

    expect(screen.getAllByAltText("Ảnh chính").length).toBeGreaterThanOrEqual(2);

    fireEvent.keyDown(window, { key: "Escape" });

    expect(screen.getAllByAltText("Ảnh chính")).toHaveLength(1);
  });

  it("should navigate to login when booking without token", async () => {
    render(<RoomDetailPage />);

    await screen.findByText("Phòng 101");

    fireEvent.click(screen.getByRole("button", { name: /đặt phòng ngay/i }));

    expect(MockNavigate).toHaveBeenCalledWith("/login");
  });

  it("should navigate to booking page when booking with token", async () => {
    localStorage.setItem("accessToken", "token");

    render(<RoomDetailPage />);

    await screen.findByText("Phòng 101");

    fireEvent.click(screen.getByRole("button", { name: /đặt phòng ngay/i }));

    expect(MockNavigate).toHaveBeenCalledWith("/dashboard/booking", {
      state: { room },
    });
  });

  it("should disable booking button when room is not available", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        ...room,
        status: "OCCUPIED",
      }),
    });

    render(<RoomDetailPage />);

    const button = await screen.findByRole("button", {
      name: /phòng không khả dụng/i,
    });

    expect(button).toBeDisabled();
    expect(screen.getAllByText("Đang dùng").length).toBeGreaterThanOrEqual(1);
  });
});