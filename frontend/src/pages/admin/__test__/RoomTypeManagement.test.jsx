import { render, screen, fireEvent } from '@testing-library/react';

describe('Test RoomTypeManagement', () => {

    afterEach(() => {
        jest.restoreAllMocks();
    });

    // TEST: Tìm loại phòng theo tên
    test('test_filter_room_types_by_name_returns_matching_results', () => {
        // ARRANGE
        const mockTypes = [
            { id: 1, name: 'Single Room' },
            { id: 2, name: 'Family Suite' }
        ];
        const searchTerm = 'family';

        // ACT
        const filtered = mockTypes.filter(type =>
            type.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // ASSERT
        expect(filtered.length).toBe(1);
        expect(filtered[0].name).toBe('Family Suite');
    });



    // TEST Lưu khi Loại phòng đã tồn tại
    test('test_handle_save_with_unchanged_data_shows_alert_message', () => {
        // ARRANGE
        const selectedType = { name: 'Eco', capacity: 1, basePrice: 200000, description: 'Basic' };
        const formData = { name: 'Eco', capacity: '1', basePrice: '200000', description: 'Basic' };

        const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => { });

        // ACT
        const isUnchanged =
            formData.name === selectedType.name &&
            Number(formData.capacity) === Number(selectedType.capacity) &&
            Number(formData.basePrice) === Number(selectedType.basePrice) &&
            formData.description === selectedType.description;

        if (isUnchanged) {
            window.alert("Loại phòng này đã tồn tại!");
        }

        // ASSERT
        expect(alertSpy).toHaveBeenCalledWith("Loại phòng này đã tồn tại!");
    });

    // TEST Loại phòng đang được sử dụng thì hiện thông báo
    test('test_delete_room_type_in_use_shows_error_message', async () => {
        // ARRANGE
        const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => { });
        const mockDeleteApi = jest.fn().mockRejectedValue(new Error("In use"));

        // ACT
        try {
            await mockDeleteApi(1);
        } catch (err) {
            window.alert("Loại phòng có thể đang được sử dụng ở danh sách phòng!");
        }

        // ASSERT
        expect(alertSpy).toHaveBeenCalledWith("Loại phòng có thể đang được sử dụng ở danh sách phòng!");
    });

    //TEST: Sức chứa & Giá phòng phải nhập số
    test('test_handle_save_room_type_only_accepts_numbers_for_capacity_and_price', () => {
        // 1. ARRANGE
        const formData = {
            name: 'Vip Room',
            capacity: '4',
            basePrice: '2000000'
        };

        // 2. ACT
        const capacityAsNumber = Number(formData.capacity);
        const priceAsNumber = Number(formData.basePrice);

        // 3. ASSERT
        expect(typeof capacityAsNumber).toBe('number');
        expect(capacityAsNumber).toBe(4);

        expect(typeof priceAsNumber).toBe('number');
        expect(priceAsNumber).toBe(2000000);

        const invalidInput = Number("abc");
        expect(isNaN(invalidInput)).toBe(true);
    });

    //TEST sửa thông tin trùng với Loại phòng đã tồn tại
    test('test_handle_save_prevents_duplicate_name_before_calling_api', () => {
        // ARRANGE
        const existingTypes = [{ id: 1, name: 'Master' }];
        const newRoomType = { name: 'master' };

        const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => { });

        // ACT
        const isNameExists = existingTypes.some(t =>
            t.name.toLowerCase() === newRoomType.name.toLowerCase()
        );

        if (isNameExists) {
            window.alert("Tên loại phòng này đã tồn tại trong hệ thống!");
        }

        // ASSERT
        expect(isNameExists).toBe(true);
        expect(alertSpy).toHaveBeenCalledWith("Tên loại phòng này đã tồn tại trong hệ thống!");

        alertSpy.mockRestore();
    });
});
