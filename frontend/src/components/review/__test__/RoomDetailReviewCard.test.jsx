import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import RoomDetailReviewCard from "../RoomDetailReviewCard";

const baseReview = {
  userFullName: "Nguyễn Văn An",
  createdAt: "2024-03-15T08:00:00.000Z",
  rating: 4,
  comment: "Phòng sạch sẽ, nhân viên thân thiện.",
};

const longComment = "A".repeat(161);

const setup = (reviewOverrides = {}, index = 0) =>
  render(
    <RoomDetailReviewCard
      review={{ ...baseReview, ...reviewOverrides }}
      index={index}
    />
  );

describe("RoomDetailReviewCard – Avatar initials", () => {
  it("hiển thị 2 chữ cái đầu viết hoa của tên", () => {
    setup({ userFullName: "Nguyễn Văn An" });
    expect(screen.getByText("NV")).toBeInTheDocument();
  });

  it("hiển thị 1 chữ cái nếu tên chỉ có 1 từ", () => {
    setup({ userFullName: "Admin" });
    expect(screen.getByText("A")).toBeInTheDocument();
  });

  it("hiển thị '?' khi userFullName là null", () => {
    setup({ userFullName: null });
    expect(screen.getByText("?")).toBeInTheDocument();
  });

  it("hiển thị '?' khi userFullName là undefined", () => {
    setup({ userFullName: undefined });
    expect(screen.getByText("?")).toBeInTheDocument();
  });
});

describe("RoomDetailReviewCard – tên người dùng", () => {
  it("hiển thị userFullName", () => {
    setup();
    expect(screen.getByText("Nguyễn Văn An")).toBeInTheDocument();
  });

  it("fallback về 'Khách hàng' khi userFullName là null", () => {
    setup({ userFullName: null });
    expect(screen.getByText("Khách hàng")).toBeInTheDocument();
  });
});

describe("RoomDetailReviewCard – ngày tạo", () => {
  it("định dạng ngày theo vi-VN", () => {
    setup({ createdAt: "2024-03-15T08:00:00.000Z" });
    // toLocaleDateString('vi-VN') trả về dạng "ngày 15 tháng 3 năm 2024"
    const dateEl = screen.getByText(/tháng/i);
    expect(dateEl).toBeInTheDocument();
    expect(dateEl.textContent).toMatch(/2024/);
  });

  it("không hiển thị ngày khi createdAt là null", () => {
    setup({ createdAt: null });
    expect(screen.queryByText(/tháng/i)).not.toBeInTheDocument();
  });
});

describe("RoomDetailReviewCard – rating", () => {
  it("hiển thị đúng giá trị rating", () => {
    setup({ rating: 5 });
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("hiển thị rating = 1", () => {
    setup({ rating: 1 });
    expect(screen.getByText("1")).toBeInTheDocument();
  });
});

describe("RoomDetailReviewCard – comment ngắn (≤ 160 ký tự)", () => {
  it("hiển thị toàn bộ nội dung comment", () => {
    setup();
    expect(
      screen.getByText("Phòng sạch sẽ, nhân viên thân thiện.")
    ).toBeInTheDocument();
  });

  it("không hiển thị nút 'Đọc thêm'", () => {
    setup();
    expect(screen.queryByText(/đọc thêm/i)).not.toBeInTheDocument();
  });
});

describe("RoomDetailReviewCard – comment dài (> 160 ký tự)", () => {
  it("cắt bớt và thêm '…' ban đầu", () => {
    setup({ comment: longComment });
    const p = screen.getByText(/…$/);
    expect(p.textContent.length).toBeLessThanOrEqual(164); // 160 + "…"
  });

  it("hiển thị nút 'Đọc thêm' ban đầu", () => {
    setup({ comment: longComment });
    expect(screen.getByText(/đọc thêm/i)).toBeInTheDocument();
  });

  it("click 'Đọc thêm' → hiển thị toàn bộ comment", () => {
    setup({ comment: longComment });
    fireEvent.click(screen.getByText(/đọc thêm/i));
    expect(screen.getByText(longComment)).toBeInTheDocument();
  });

  it("click 'Đọc thêm' → nút đổi thành 'Thu gọn'", () => {
    setup({ comment: longComment });
    fireEvent.click(screen.getByText(/đọc thêm/i));
    expect(screen.getByText(/thu gọn/i)).toBeInTheDocument();
  });

  it("click 'Thu gọn' → comment bị cắt lại", () => {
    setup({ comment: longComment });
    fireEvent.click(screen.getByText(/đọc thêm/i));
    fireEvent.click(screen.getByText(/thu gọn/i));
    expect(screen.getByText(/…$/)).toBeInTheDocument();
    expect(screen.queryByText(longComment)).not.toBeInTheDocument();
  });

  it("click 'Thu gọn' → nút trở lại 'Đọc thêm'", () => {
    setup({ comment: longComment });
    fireEvent.click(screen.getByText(/đọc thêm/i));
    fireEvent.click(screen.getByText(/thu gọn/i));
    expect(screen.getByText(/đọc thêm/i)).toBeInTheDocument();
  });
});

describe("RoomDetailReviewCard – comment rỗng / null", () => {
  it("hiển thị 'Không có nhận xét.' khi comment là chuỗi rỗng", () => {
    setup({ comment: "" });
    expect(screen.getByText("Không có nhận xét.")).toBeInTheDocument();
  });

  it("hiển thị 'Không có nhận xét.' khi comment là null", () => {
    setup({ comment: null });
    expect(screen.getByText("Không có nhận xét.")).toBeInTheDocument();
  });

  it("không hiển thị nút 'Đọc thêm' khi comment rỗng", () => {
    setup({ comment: "" });
    expect(screen.queryByText(/đọc thêm/i)).not.toBeInTheDocument();
  });
});

describe("RoomDetailReviewCard – animationDelay", () => {
  it("áp dụng animationDelay đúng theo index", () => {
    const { container } = render(
      <RoomDetailReviewCard review={baseReview} index={3} />
    );
    const card = container.firstChild;
    expect(card.style.animationDelay).toBe("180ms"); // 3 * 60
  });

  it("animationDelay = 0ms khi index = 0", () => {
    const { container } = render(
      <RoomDetailReviewCard review={baseReview} index={0} />
    );
    expect(container.firstChild.style.animationDelay).toBe("0ms");
  });
});