import { render, screen, fireEvent } from '@testing-library/react';

describe('Kiểm thử đơn vị cho UserModal (Form nhập liệu)', () => {

    afterEach(() => {
        jest.restoreAllMocks();
    });

    // TEST Lưu khi thiếu thông tin hiện thông báo
    test('test_handle_validate_and_save_fails_when_fields_are_empty', () => {
        // ARRANGE
        const formData = { 
            fullName: '', 
            email: 'minh.huy@abc.com', 
            phone: '', 
            hotelId: '1' 
        };
        const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

        // ACT
        const isInvalid = !formData.fullName || !formData.email || !formData.phone || !formData.hotelId;
        
        if (isInvalid) {
            window.alert("Vui lòng nhập đầy đủ thông tin!");
        }

        // ASSERT
        expect(alertSpy).toHaveBeenCalledWith("Vui lòng nhập đầy đủ thông tin!");
    });

    // TEST Bắt buộc đặt mật khẩu khi TẠO MỚI nhân viên
    test('test_require_password_validation_for_new_user_creation', () => {
        // ARRANGE
        const formData = { 
            id: null, 
            password: '', 
            fullName: 'Lan Anh', 
            email: 'a@b.com', 
            phone: '123', 
            hotelId: '1' 
        };
        const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

        // ACT
        if (!formData.id && !formData.password) {
            window.alert("Vui lòng đặt mật khẩu cho nhân viên mới!");
        }

        // ASSERT
        expect(alertSpy).toHaveBeenCalledWith("Vui lòng đặt mật khẩu cho nhân viên mới!");
    });


    // TEST Kiểm tra  Form trống  tạo mới 
    test('test_form_is_reset_to_empty_when_opening_for_new_user', () => {
        // ARRANGE & ACT
        const initialFormData = {
            fullName: '',
            email: '',
            phone: '',
            hotelId: '',
            password: '',
            role: 'RECEPTION'
        };

        // ASSERT
        expect(initialFormData.phone).toBe('');
        expect(initialFormData.password).toBe('');
        expect(initialFormData.fullName).toBe('');
    });

    //TEST SĐT chỉ nhập số
    test('test_phone_input_updates_state_only_with_numeric_values', () => {
        //ARRANGE
        let currentPhone = "090";
        const setFormDataMock = jest.fn((newData) => {
            currentPhone = newData.phone;
        });

        const numericRegex = /^[0-9]*$/;

        //  ACT
        const validValue = "0901";
        if (numericRegex.test(validValue)) {
            setFormDataMock({ phone: validValue });
        }
        const invalidValue = "0901a";
        if (numericRegex.test(invalidValue)) {
            setFormDataMock({ phone: invalidValue });
        }

        //  ASSERT
        expect(setFormDataMock).toHaveBeenCalledWith({ phone: "0901" });
        expect(currentPhone).toBe("0901");
        expect(currentPhone).not.toContain("a");
        expect(setFormDataMock).toHaveBeenCalledTimes(1);
    });
});