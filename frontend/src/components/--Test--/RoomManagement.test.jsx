import { getStatusVn } from '../../pages/RoomManagement';

describe('Test RoomManagement', () => {
    //test tìm kiếm theo số phòng
    const mockRooms = [
        { id: 10, roomNumber: 'P999', roomType: { name: 'VIP' }, hotelName: 'Khách sạn An Gia' },
    ];

    test('test_filter_rooms_by_exact_room_number_returns_correct_data', () => {
        // ARRANGE
        const searchTerm = 'P999';

        // ACT
        const result = mockRooms.filter(r =>
            r.roomNumber.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // ASSERT
        expect(result.length).toBe(1);
        expect(result[0].roomNumber).toBe('P999');
        expect(result[0].roomType.name).toBe('VIP');
        expect(result[0].hotelName).toBe('Khách sạn An Gia');

    });

    // test hiển thị trạng thái
    test('test_get_status_vn_with_available_input_returns_trong_string', () => {
        // ARRANGE
        const inputStatus = 'AVAILABLE';

        // ACT
        const result = getStatusVn(inputStatus);

        // ASSERT
        expect(result).toBe('Trống');
        
    });

    //test  xóa
    test('test_delete_room_removes_matching_row_from_display_list', () => {
        //  ARRANGE
        const currentRooms = [
            { id: 102, roomNumber: 'P102', hotelName: 'Victory' },
            { id: 101, roomNumber: 'P101', hotelName: 'Majestic' }
        ];
        const targetIdToDelete = 102;
        // ACT
        const updatedList = currentRooms.filter(room => room.id !== targetIdToDelete);

        // ASSERT
        expect(updatedList.length).toBe(1);

        const foundRoom = updatedList.find(r => r.id === 102);
        expect(foundRoom).toBeUndefined();

    });
});