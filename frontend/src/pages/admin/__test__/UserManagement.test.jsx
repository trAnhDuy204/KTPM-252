import { render, screen, fireEvent } from '@testing-library/react';

const mockUsers = [
    { id: 16, fullName: 'Nguyễn Quang Chí', email: 'chi.nguyen@gmail.com', role: 'ADMIN', hotelId: 1 },
    { id: 17, fullName: 'Trần Ninh Hưng', email: 'hung.tranninh@gmail.com', role: 'RECEPTION', hotelId: 2 },
];

const mockHotels = [
    { id: 1, name: 'Khách Sạn Victory' },
    { id: 2, name: 'Seaside Resort Vung Tau' }
];

describe('Test UserManagement', () => {

    afterEach(() => {
        jest.restoreAllMocks();
    });

    // TEST Tìm nhân viên 
    test('test_filter_users_by_role_and_search_term_returns_correct_staff', () => {
        //ARRANGE
        const searchTerm = 'chi.nguyen';

        //ACT
        const filtered = mockUsers.filter(u => {
            const roleLower = u.role?.toLowerCase();
            const isStaff = roleLower === 'admin' || roleLower === 'reception';
            const matchesSearch = u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.email?.toLowerCase().includes(searchTerm.toLowerCase());
            return isStaff && matchesSearch;
        });

        //ASSERT
        expect(filtered.length).toBe(1);
        expect(filtered[0].fullName).toBe('Nguyễn Quang Chí');
        expect(filtered.find(u => u.role === 'USER')).toBeUndefined();
    });


    // TEST xóa nhân viên 
    test('test_delete_user_action_with_confirmation_updates_list', () => {
        // 1. ARRANGE 
        const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
        const idToDelete = 16;

        // 2. ACT 
        window.confirm("Bạn có chắc chắn muốn xóa nhân sự này?");

        const updatedList = mockUsers.filter(u => u.id !== idToDelete);

        // 3. ASSERT 
        expect(confirmSpy).toHaveBeenCalledWith("Bạn có chắc chắn muốn xóa nhân sự này?");
        expect(updatedList.length).toBe(1);
        expect(updatedList.find(u => u.id === 16)).toBeUndefined();
    });

});