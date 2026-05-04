import { renderHook, act } from "@testing-library/react";
import { useForm } from "../useForm";

describe("useForm", () => {
  const initialValues = { email: "", password: "" };

  const validate = (values) => {
    const errors = {};
    if (!values.email) errors.email = "Email required";
    if (values.password.length < 6) errors.password = "Min 6 chars";
    return errors;
  };

  it("khởi tạo đúng state ban đầu", () => {
    const { result } = renderHook(() => useForm(initialValues, validate));

    expect(result.current.values).toEqual(initialValues);
    expect(result.current.errors).toEqual({});
    expect(result.current.touched).toEqual({});
  });

  it("handleChange cập nhật values", () => {
    const { result } = renderHook(() => useForm(initialValues, validate));

    act(() => {
      result.current.handleChange({
        target: { name: "email", value: "test@gmail.com" }
      });
    });

    expect(result.current.values.email).toBe("test@gmail.com");
  });

  it("handleChange validate nếu field đã touched", () => {
    const { result } = renderHook(() => useForm(initialValues, validate));

    act(() => {
      result.current.handleBlur({
        target: { name: "email" }
      });
    });

    act(() => {
      result.current.handleChange({
        target: { name: "email", value: "" }
      });
    });

    expect(result.current.errors.email).toBe("Email required");
  });

  it("handleBlur set touched", () => {
    const { result } = renderHook(() => useForm(initialValues, validate));

    act(() => {
      result.current.handleBlur({
        target: { name: "email" }
      });
    });

    expect(result.current.touched.email).toBe(true);
  });

  it("handleBlur trigger validate", () => {
    const { result } = renderHook(() => useForm(initialValues, validate));

    act(() => {
      result.current.handleBlur({
        target: { name: "email" }
      });
    });

    expect(result.current.errors.email).toBe("Email required");
  });

  it("setFieldError set error thủ công", () => {
    const { result } = renderHook(() => useForm(initialValues, validate));

    act(() => {
      result.current.setFieldError("email", "Custom error");
    });

    expect(result.current.errors.email).toBe("Custom error");
  });

  it("setFieldErrors merge errors", () => {
    const { result } = renderHook(() => useForm(initialValues, validate));

    act(() => {
      result.current.setFieldErrors({
        email: "Err1",
        password: "Err2"
      });
    });

    expect(result.current.errors).toEqual({
      email: "Err1",
      password: "Err2"
    });
  });

  it("isValid trả false nếu có lỗi", () => {
    const { result } = renderHook(() => useForm(initialValues, validate));

    let valid;
    act(() => {
      valid = result.current.isValid();
    });

    expect(valid).toBe(false);
    expect(result.current.errors.email).toBe("Email required");
    expect(result.current.touched.email).toBe(true);
  });

  it("isValid trả true nếu hợp lệ", () => {
    const { result } = renderHook(() => useForm(
      { email: "a@gmail.com", password: "123456" },
      validate
    ));

    let valid;
    act(() => {
      valid = result.current.isValid();
    });

    expect(valid).toBe(true);
  });

  it("reset đưa state về ban đầu", () => {
    const { result } = renderHook(() => useForm(initialValues, validate));

    act(() => {
      result.current.handleChange({
        target: { name: "email", value: "abc" }
      });
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.values).toEqual(initialValues);
    expect(result.current.errors).toEqual({});
    expect(result.current.touched).toEqual({});
  });

  it("isValid luôn true nếu không có validate", () => {
    const { result } = renderHook(() => useForm(initialValues));

    let valid;
    act(() => {
      valid = result.current.isValid();
    });

    expect(valid).toBe(true);
  });
});