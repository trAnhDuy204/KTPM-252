import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import RoomDetailReview from "../RoomDetailReview";
import { reviewApi } from "@/services/reviewApi";

// ─── Mock dependencies ────────────────────────────────────────────────────────
jest.mock("@/services/reviewApi", () => ({
  reviewApi: {
    getHotelReviews: jest.fn(),
    getHotelRating: jest.fn(),
  },
}));

jest.mock("../RoomDetailReviewCard", () => ({
  __esModule: true,
  default: ({ review }) => (
    <div data-testid="review-card">{review.userFullName}</div>
  ),
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────
const mockReviews = [
  { id: 1, userFullName: "Nguyễn Văn A", rating: 5, comment: "Tuyệt vời", createdAt: "2024-03-15T08:00:00.000Z" },
  { id: 2, userFullName: "Trần Thị B",   rating: 4, comment: "Rất tốt",   createdAt: "2024-02-10T10:00:00.000Z" },
  { id: 3, userFullName: "Lê Văn C",     rating: 3, comment: "Bình thường", createdAt: "2024-01-05T06:00:00.000Z" },
  { id: 4, userFullName: "Phạm Thị D",   rating: 5, comment: "Xuất sắc",  createdAt: "2024-04-01T12:00:00.000Z" },
];

const mockRating = { averageRating: 4.25, totalReviews: 4 };

const setup = (props = {}) => {
  const defaults = { hotelId: 1, hotelName: "Khách sạn Test" };
  return render(<RoomDetailReview {...defaults} {...props} />);
};

beforeEach(() => {
  reviewApi.getHotelReviews.mockResolvedValue({ data: mockReviews });
  reviewApi.getHotelRating.mockResolvedValue({ data: mockRating });
});

afterEach(() => jest.clearAllMocks());

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("RoomDetailReview – loading state", () => {
  it("hiển thị skeleton khi đang tải", () => {
    // Giữ promise pending để ở trạng thái loading
    reviewApi.getHotelReviews.mockReturnValue(new Promise(() => {}));
    reviewApi.getHotelRating.mockReturnValue(new Promise(() => {}));

    setup();
    // Skeleton dùng animate-pulse
    const pulseEls = document.querySelectorAll(".animate-pulse");
    expect(pulseEls.length).toBeGreaterThan(0);
  });

  it("không hiển thị review cards khi đang tải", () => {
    reviewApi.getHotelReviews.mockReturnValue(new Promise(() => {}));
    reviewApi.getHotelRating.mockReturnValue(new Promise(() => {}));

    setup();
    expect(screen.queryByTestId("review-card")).not.toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("RoomDetailReview – error state", () => {
  beforeEach(() => {
    reviewApi.getHotelReviews.mockRejectedValue(new Error("Network error"));
    reviewApi.getHotelRating.mockRejectedValue(new Error("Network error"));
  });

  it("hiển thị thông báo lỗi khi API thất bại", async () => {
    setup();
    await waitFor(() => {
      expect(
        screen.getByText("Không tải được đánh giá. Vui lòng thử lại.")
      ).toBeInTheDocument();
    });
  });

  it("hiển thị nút 'Thử lại'", async () => {
    setup();
    await waitFor(() => {
      expect(screen.getByText("Thử lại")).toBeInTheDocument();
    });
  });

  it("nhấn 'Thử lại' gọi lại reviewApi.getHotelReviews", async () => {
    reviewApi.getHotelReviews
      .mockRejectedValueOnce(new Error("fail"))
      .mockResolvedValue({ data: mockReviews });
    reviewApi.getHotelRating
      .mockRejectedValueOnce(new Error("fail"))
      .mockResolvedValue({ data: mockRating });

    setup();
    await waitFor(() => screen.getByText("Thử lại"));
    fireEvent.click(screen.getByText("Thử lại"));

    await waitFor(() => {
      expect(reviewApi.getHotelReviews).toHaveBeenCalledTimes(2);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("RoomDetailReview – empty state", () => {
  beforeEach(() => {
    reviewApi.getHotelReviews.mockResolvedValue({ data: [] });
    reviewApi.getHotelRating.mockResolvedValue({ data: { averageRating: 0, totalReviews: 0 } });
  });

  it("hiển thị 'Chưa có đánh giá nào'", async () => {
    setup();
    await waitFor(() => {
      expect(screen.getByText("Chưa có đánh giá nào")).toBeInTheDocument();
    });
  });

  it("hiển thị tên khách sạn trong empty state", async () => {
    setup({ hotelName: "Grand Hotel" });
    await waitFor(() => {
      expect(screen.getByText(/Grand Hotel/)).toBeInTheDocument();
    });
  });

  it("fallback 'khách sạn này' khi hotelName không có", async () => {
    setup({ hotelName: null });
    await waitFor(() => {
      expect(screen.getByText(/khách sạn này/)).toBeInTheDocument();
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("RoomDetailReview – không có hotelId", () => {
  it("không gọi API khi hotelId là falsy", () => {
    render(<RoomDetailReview hotelId={null} hotelName="Test" />);
    expect(reviewApi.getHotelReviews).not.toHaveBeenCalled();
    expect(reviewApi.getHotelRating).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("RoomDetailReview – hiển thị dữ liệu bình thường", () => {
  it("render đúng số review cards", async () => {
    setup();
    await waitFor(() => {
      expect(screen.getAllByTestId("review-card")).toHaveLength(mockReviews.length);
    });
  });

  it("hiển thị điểm trung bình từ rating API", async () => {
    setup();
    await waitFor(() => {
      expect(screen.getByText("4.3")).toBeInTheDocument(); // toFixed(1) của 4.25
    });
  });

  it("hiển thị tổng số đánh giá", async () => {
    setup();
    await waitFor(() => {
      expect(screen.getAllByText(/4 đánh giá/)).toBeInTheDocument();
    });
  });

  it("hiển thị tên khách sạn trong header", async () => {
    setup({ hotelName: "Khách sạn Test" });
    await waitFor(() => {
      expect(screen.getByText("Khách sạn Test")).toBeInTheDocument();
    });
  });

  it("hiển thị sentiment label 'Rất tốt' khi avg >= 4.0", async () => {
    setup();
    await waitFor(() => {
      expect(screen.getByText("Rất tốt")).toBeInTheDocument();
    });
  });

  it("hiển thị '—' khi avg = 0", async () => {
    reviewApi.getHotelRating.mockResolvedValue({ data: { averageRating: 0, totalReviews: 0 } });
    reviewApi.getHotelReviews.mockResolvedValue({ data: mockReviews });
    setup();
    await waitFor(() => {
      expect(screen.getByText("—")).toBeInTheDocument();
    });
  });

  it("hiển thị count summary ở cuối", async () => {
    setup();
    await waitFor(() => {
      expect(screen.getByText(/Hiển thị 4 \/ 4 đánh giá/)).toBeInTheDocument();
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("RoomDetailReview – sentiment labels", () => {
  const cases = [
    { avg: 4.8, label: "Xuất sắc" },
    { avg: 4.2, label: "Rất tốt"  },
    { avg: 3.7, label: "Tốt"      },
    { avg: 3.2, label: "Khá"      },
    { avg: 2.5, label: "Trung bình" },
  ];

  cases.forEach(({ avg, label }) => {
    it(`avg = ${avg} → label '${label}'`, async () => {
      reviewApi.getHotelRating.mockResolvedValue({ data: { averageRating: avg, totalReviews: 10 } });
      setup();
      await waitFor(() => {
        expect(screen.getByText(label)).toBeInTheDocument();
      });
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("RoomDetailReview – filter theo sao", () => {
  it("click chip '5 sao' chỉ hiển thị review 5 sao", async () => {
    setup();
    await waitFor(() => screen.getAllByTestId("review-card"));

    fireEvent.click(screen.getByRole("button", { name: /5\s*\(\d+\)/ }));

    await waitFor(() => {
      const cards = screen.getAllByTestId("review-card");
      // mockReviews có 2 review 5 sao
      expect(cards).toHaveLength(2);
    });
  });

  it("click cùng chip reset về tất cả", async () => {
    setup();
    await waitFor(() => screen.getAllByTestId("review-card"));

    const fiveStarBtn = screen.getByRole("button", { name: /5\s*\(\d+\)/ });
    fireEvent.click(fiveStarBtn); // bật filter
    fireEvent.click(fiveStarBtn); // tắt filter

    await waitFor(() => {
      expect(screen.getAllByTestId("review-card")).toHaveLength(4);
    });
  });

  it("click 'Tất cả' hiển thị lại toàn bộ", async () => {
    setup();
    await waitFor(() => screen.getAllByTestId("review-card"));

    fireEvent.click(screen.getByRole("button", { name: /5\s*\(\d+\)/ }));
    fireEvent.click(screen.getByRole("button", { name: /tất cả/i }));

    await waitFor(() => {
      expect(screen.getAllByTestId("review-card")).toHaveLength(4);
    });
  });

  it("hiển thị 'Không có đánh giá X sao nào' khi lọc không có kết quả", async () => {
    setup();
    await waitFor(() => screen.getAllByTestId("review-card"));

    // Lọc sao 2 — không có review nào
    fireEvent.click(screen.getByRole("button", { name: /2\s*\(\d+\)/ }));

    await waitFor(() => {
      expect(screen.getByText(/Không có đánh giá 2 sao nào/)).toBeInTheDocument();
    });
  });

  it("nút 'Xem tất cả' trong empty filter reset filterStar", async () => {
    setup();
    await waitFor(() => screen.getAllByTestId("review-card"));

    fireEvent.click(screen.getByRole("button", { name: /2\s*\(\d+\)/ }));
    await waitFor(() => screen.getByText(/Không có đánh giá 2 sao nào/));

    fireEvent.click(screen.getByRole("button", { name: /xem tất cả/i }));

    await waitFor(() => {
      expect(screen.getAllByTestId("review-card")).toHaveLength(4);
    });
  });

  it("count summary hiển thị ghi chú lọc khi filter đang bật", async () => {
    setup();
    await waitFor(() => screen.getAllByTestId("review-card"));

    fireEvent.click(screen.getByRole("button", { name: /5\s*\(\d+\)/ }));

    await waitFor(() => {
      expect(screen.getByText(/lọc 5 sao/)).toBeInTheDocument();
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("RoomDetailReview – sort", () => {
  it("sort 'Mới nhất' — review mới nhất hiển thị đầu tiên", async () => {
    setup();
    await waitFor(() => screen.getAllByTestId("review-card"));

    const cards = screen.getAllByTestId("review-card");
    // createdAt mới nhất: Phạm Thị D (2024-04-01)
    expect(cards[0].textContent).toBe("Phạm Thị D");
  });

  it("sort 'Điểm cao nhất' — rating cao nhất đứng đầu", async () => {
    setup();
    await waitFor(() => screen.getAllByTestId("review-card"));

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "highest" } });

    await waitFor(() => {
      const cards = screen.getAllByTestId("review-card");
      // 2 review 5 sao đứng đầu
      expect(["Nguyễn Văn A", "Phạm Thị D"]).toContain(cards[0].textContent);
      expect(["Nguyễn Văn A", "Phạm Thị D"]).toContain(cards[1].textContent);
    });
  });

  it("sort 'Điểm thấp nhất' — rating thấp nhất đứng đầu", async () => {
    setup();
    await waitFor(() => screen.getAllByTestId("review-card"));

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "lowest" } });

    await waitFor(() => {
      const cards = screen.getAllByTestId("review-card");
      // rating 3 thấp nhất → Lê Văn C đứng đầu
      expect(cards[0].textContent).toBe("Lê Văn C");
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("RoomDetailReview – RatingBar distribution", () => {
  it("hiển thị đủ 5 bar (sao 1-5)", async () => {
    setup();
    await waitFor(() => screen.getByText("4.3"));

    // Mỗi bar có số sao hiển thị (1, 2, 3, 4, 5)
    [1, 2, 3, 4, 5].forEach(star => {
      expect(screen.getAllByText(star.toString()).length).toBeGreaterThanOrEqual(1);
    });
  });

  it("click RatingBar cũng filter review", async () => {
    setup();
    await waitFor(() => screen.getAllByTestId("review-card"));

    // RatingBar cho sao 5 là button đầu tiên trong distribution
    const ratingBarBtns = screen
      .getAllByRole("button")
      .filter(b => b.className.includes("w-full flex items-center gap-3"));

    fireEvent.click(ratingBarBtns[0]); // sao 5

    await waitFor(() => {
      expect(screen.getAllByTestId("review-card")).toHaveLength(2);
    });
  });
});