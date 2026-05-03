import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import HotelModal from "../HotelModal";

const defaultProps = {
  formData: { name: "", city: "", address: "", description: "" },
  setFormData: jest.fn(),
  onSave: jest.fn(),
  onClose: jest.fn(),
};

const renderModal = (props = {}) =>
  render(<HotelModal {...defaultProps} {...props} />);

const getFields = () => {
  const fields = screen.getAllByRole("textbox");

  return {
    nameInput: fields[0],
    cityInput: fields[1],
    addressInput: fields[2],
    descriptionInput: fields[3],
  };
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("HotelModal – render", () => {
  it("hiển thị tiêu đề 'Tạo khách sạn mới' khi không có id", () => {
    renderModal();

    expect(screen.getByText(/tạo khách sạn mới/i)).toBeInTheDocument();
  });

  it("hiển thị tiêu đề 'Cập nhật khách sạn' khi formData có id", () => {
    renderModal({ formData: { ...defaultProps.formData, id: 1 } });

    expect(screen.getByText(/cập nhật khách sạn/i)).toBeInTheDocument();
  });

  it("hiển thị đầy đủ 4 trường: tên, thành phố, địa chỉ, mô tả", () => {
    renderModal();

    expect(screen.getByText(/tên khách sạn/i)).toBeInTheDocument();
    expect(screen.getByText(/thành phố/i)).toBeInTheDocument();
    expect(screen.getByText(/địa chỉ/i)).toBeInTheDocument();
    expect(screen.getByText(/mô tả/i)).toBeInTheDocument();
    expect(screen.getAllByRole("textbox")).toHaveLength(4);
  });

  it("hiển thị nút Hủy và nút Lưu", () => {
    renderModal();

    expect(screen.getByRole("button", { name: /hủy/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /lưu/i })).toBeInTheDocument();
  });

  it("render giá trị từ formData lên các input", () => {
    renderModal({
      formData: {
        name: "Mường Thanh",
        city: "Hà Nội",
        address: "123 Lê Duẩn",
        description: "Khách sạn 5 sao",
      },
    });

    const { nameInput, cityInput, addressInput, descriptionInput } = getFields();

    expect(nameInput).toHaveValue("Mường Thanh");
    expect(cityInput).toHaveValue("Hà Nội");
    expect(addressInput).toHaveValue("123 Lê Duẩn");
    expect(descriptionInput).toHaveValue("Khách sạn 5 sao");
  });
});

describe("HotelModal – setFormData", () => {
  it("gọi setFormData với name mới khi nhập vào ô Tên khách sạn", async () => {
    const setFormData = jest.fn();
    renderModal({ setFormData });

    const { nameInput } = getFields();

    await userEvent.type(nameInput, "A");

    expect(setFormData).toHaveBeenCalledWith(
      expect.objectContaining({ name: "A" })
    );
  });

  it("gọi setFormData với city mới khi nhập vào ô Thành phố", async () => {
    const setFormData = jest.fn();
    renderModal({ setFormData });

    const { cityInput } = getFields();

    await userEvent.type(cityInput, "B");

    expect(setFormData).toHaveBeenCalledWith(
      expect.objectContaining({ city: "B" })
    );
  });

  it("gọi setFormData với address mới khi nhập vào ô Địa chỉ", async () => {
    const setFormData = jest.fn();
    renderModal({ setFormData });

    const { addressInput } = getFields();

    await userEvent.type(addressInput, "C");

    expect(setFormData).toHaveBeenCalledWith(
      expect.objectContaining({ address: "C" })
    );
  });

  it("gọi setFormData với description mới khi nhập vào ô Mô tả", async () => {
    const setFormData = jest.fn();
    renderModal({ setFormData });

    const { descriptionInput } = getFields();

    await userEvent.type(descriptionInput, "D");

    expect(setFormData).toHaveBeenCalledWith(
      expect.objectContaining({ description: "D" })
    );
  });
});

describe("HotelModal – validation khi nhấn Lưu", () => {
  beforeEach(() => {
    jest.spyOn(window, "alert").mockImplementation(() => {});
  });

  afterEach(() => {
    window.alert.mockRestore();
  });

  it("hiện alert và KHÔNG gọi onSave khi thiếu tên", () => {
    const onSave = jest.fn();

    renderModal({
      formData: { name: "", city: "HCM", address: "123 Lê Lợi" },
      onSave,
    });

    fireEvent.click(screen.getByRole("button", { name: /lưu/i }));

    expect(window.alert).toHaveBeenCalledWith(
      "Vui lòng nhập đầy đủ thông tin bắt buộc!"
    );
    expect(onSave).not.toHaveBeenCalled();
  });

  it("hiện alert và KHÔNG gọi onSave khi thiếu thành phố", () => {
    const onSave = jest.fn();

    renderModal({
      formData: { name: "KS A", city: "", address: "123 Lê Lợi" },
      onSave,
    });

    fireEvent.click(screen.getByRole("button", { name: /lưu/i }));

    expect(window.alert).toHaveBeenCalled();
    expect(onSave).not.toHaveBeenCalled();
  });

  it("hiện alert và KHÔNG gọi onSave khi thiếu địa chỉ", () => {
    const onSave = jest.fn();

    renderModal({
      formData: { name: "KS A", city: "HCM", address: "" },
      onSave,
    });

    fireEvent.click(screen.getByRole("button", { name: /lưu/i }));

    expect(window.alert).toHaveBeenCalled();
    expect(onSave).not.toHaveBeenCalled();
  });

  it("gọi onSave khi điền đủ 3 trường bắt buộc", () => {
    const onSave = jest.fn();

    renderModal({
      formData: { name: "KS A", city: "HCM", address: "123 Lê Lợi" },
      onSave,
    });

    fireEvent.click(screen.getByRole("button", { name: /lưu/i }));

    expect(window.alert).not.toHaveBeenCalled();
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it("gọi onSave ngay cả khi mô tả trống (mô tả không bắt buộc)", () => {
    const onSave = jest.fn();

    renderModal({
      formData: {
        name: "KS A",
        city: "HCM",
        address: "123 Lê Lợi",
        description: "",
      },
      onSave,
    });

    fireEvent.click(screen.getByRole("button", { name: /lưu/i }));

    expect(onSave).toHaveBeenCalledTimes(1);
  });
});

describe("HotelModal – nút Hủy", () => {
  it("gọi onClose khi nhấn nút Hủy", () => {
    const onClose = jest.fn();

    renderModal({ onClose });

    fireEvent.click(screen.getByRole("button", { name: /hủy/i }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("KHÔNG gọi onSave khi nhấn nút Hủy", () => {
    const onSave = jest.fn();

    renderModal({ onSave });

    fireEvent.click(screen.getByRole("button", { name: /hủy/i }));

    expect(onSave).not.toHaveBeenCalled();
  });
});
