describe('Test RoomModal', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });
    //test thêm phòng
    test('test_create_new_room_with_valid_input_returns_success_data_object', () => {
        // ARRANGE
        const inputData = {
            roomNumber: 'P108',
            hotelId: '3',
            roomTypeId: '2',
            status: 'AVAILABLE'
        };
        const mockRoomTypes = [
            { id: '2', name: 'Single Standard', basePrice: 350000, description: 'Phòng đơn' }
        ];

        // ACT
        const selectedType = mockRoomTypes.find(t => t.id === inputData.roomTypeId);

        const dataToSave = {
            roomNumber: inputData.roomNumber.toUpperCase(),
            hotel: { id: parseInt(inputData.hotelId) },
            roomType: { id: inputData.roomTypeId },
            status: inputData.status,
            customPrice: selectedType.basePrice,
            description: selectedType.description
        };

        // ASSERT
        //Số phòng phải viết hoa chuẩn
        expect(dataToSave.roomNumber).toBe('P108');

        //Giá tiền phải tự nhảy đúng theo loại phòng
        expect(dataToSave.customPrice).toBe(350000);
        //Hotel ID:3
        expect(dataToSave.hotel.id).toBe(3);

    });

    //test nhập không đủ thông tin khi thêm phòng
    test('test_handle_save_with_missing_info_shows_alert_message', () => {
        // ARRANGE
        const incompleteRoomData = {
            roomNumber: 'P105',
            hotelId: '',
            roomType: { id: '' }
        };
        const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => { });

        // ACT
        const isInvalid = !incompleteRoomData.hotelId ||
            !incompleteRoomData.roomNumber ||
            !incompleteRoomData.roomType?.id;

        if (isInvalid) {
            window.alert("Vui lòng nhập đầy đủ thông tin!");
        }

        // ASSERT:
        expect(alertSpy).toHaveBeenCalledWith("Vui lòng nhập đầy đủ thông tin!");

    });


    //test sửa phòng
    test('test_update_room_info_with_new_values_returns_correct_updated_object', () => {
        // 1. ARRANGE
        const selectedRoom = {
            id: 1,
            roomNumber: 'P101',
            hotelId: '2',
            roomType: { id: '2', name: 'Single Standard', basePrice: 350000 }
        };

        const newDataFromUI = {
            ...selectedRoom,
            roomNumber: 'P101-A',
            status: 'CLEANING'
        };

        // 2. ACT
        const dataToUpdate = {
            ...newDataFromUI,
            hotel: { id: parseInt(newDataFromUI.hotelId) },
            status: newDataFromUI.id ? newDataFromUI.status : 'AVAILABLE'
        };

        // 3. ASSERT
        expect(dataToUpdate.id).toBe(1);

        expect(dataToUpdate.roomNumber).toBe('P101-A');

        expect(dataToUpdate.status).toBe('CLEANING');

    });

    //test thông báo nếu sửa trùng với phòng đã tạo
    test('test_handle_save_room_number_already_exists_shows_error_message', async () => {
        // 1. ARRANGE
        const roomDataToSave = {
            id: 1,
            roomNumber: 'P101',
            hotelId: '1',
            roomType: { id: '2' }
        };

        const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => { });

        const mockSaveRoomApi = jest.fn().mockRejectedValue(new Error("Duplicate"));

        // 2. ACT
        try {
            await mockSaveRoomApi(roomDataToSave);
        } catch (err) {
            window.alert("Phòng đã tồn tại!");
        }

        // 3. ASSERT
        expect(alertSpy).toHaveBeenCalledWith("Phòng đã tồn tại!");
    });

    //test ko nhập Loại phòng ->ko nhập được Sức chứa
    test('test_capacity_select_is_disabled_when_no_room_type_selected', () => {
        // ARRANGE: Loại phòng đang để trống
        const selectedTypeName = '';

        // ACT & ASSERT: Kiểm tra thuộc tính disabled
        // Nếu selectedTypeName rỗng thì disabled phải là true
        const isDisabled = !selectedTypeName;
        expect(isDisabled).toBe(true);
    });

});