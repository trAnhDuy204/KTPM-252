import React from 'react';
import '@testing-library/jest-dom'; 
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import HotelManagement from '../../pages/HotelManagement'; 
import { adminApi } from '../../api/adminApi';

jest.mock('../../api/adminApi', () => ({
    adminApi: {
        getHotels: jest.fn(),
        deleteHotel: jest.fn(),
        saveHotel: jest.fn()
    }
}));

describe('Kiểm thử Component HotelManagement', () => {
    const mockHotels = [
        { id: 1, name: 'Khách Sạn Majestic', city: 'Đà Lạt', address: '01 Trần Phú', description: 'Đẹp' },
        { id: 2, name: 'Seaside Resort', city: 'Vũng Tàu', address: '88 Hạ Long', description: 'Gần biển' }
    ];

    beforeEach(() => {
        adminApi.getHotels.mockResolvedValue({ data: mockHotels });
        window.confirm = jest.fn(() => true); 
        window.alert = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('TC01: Hiển thị đúng danh sách khách sạn', async () => {
        render(<HotelManagement />);
        await waitFor(() => {
            expect(screen.getByText('Khách Sạn Majestic')).toBeInTheDocument();
        });
    });

    it('TC02: Kiểm tra chức năng tìm kiếm', async () => {
        render(<HotelManagement />);
        await waitFor(() => screen.getByText('Khách Sạn Majestic'));
        const searchInput = screen.getByPlaceholderText(/Tìm kiếm theo tên/i);
        fireEvent.change(searchInput, { target: { value: 'vũng tàu' } });
        expect(screen.getByText('Seaside Resort')).toBeInTheDocument();
        expect(screen.queryByText('Khách Sạn Majestic')).not.toBeInTheDocument();
    });

    it('TC03: Kiểm tra lọc theo thành phố', async () => {
        render(<HotelManagement />);
        await waitFor(() => screen.getByText('Khách Sạn Majestic'));
        const cityDropdown = screen.getByRole('combobox');
        fireEvent.change(cityDropdown, { target: { value: 'Đà Lạt' } });
        expect(screen.getByText('Khách Sạn Majestic')).toBeInTheDocument();
        expect(screen.queryByText('Seaside Resort')).not.toBeInTheDocument();
    });

    it('TC04: Kiểm tra mở tạo mới', async () => {
        render(<HotelManagement />);
        await waitFor(() => screen.getByText(/Khách Sạn Majestic/i));
        const createBtn = screen.getByText(/Tạo khách sạn/i);
        fireEvent.click(createBtn);
        await waitFor(() => {
            expect(screen.getByText(/Tạo khách sạn mới/i)).toBeInTheDocument(); 
        });
    });

    it('TC05: Kiểm tra chức năng xóa', async () => {
        adminApi.deleteHotel.mockResolvedValue({});
        render(<HotelManagement />);
        await waitFor(() => screen.getByText('Khách Sạn Majestic'));
        const deleteButtons = screen.getAllByText('Xóa');
        fireEvent.click(deleteButtons[0]);
        await waitFor(() => {
            expect(adminApi.deleteHotel).toHaveBeenCalledWith(1);
        });
    });
});