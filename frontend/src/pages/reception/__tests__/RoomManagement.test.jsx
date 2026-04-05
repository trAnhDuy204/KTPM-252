import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import RoomManagement from '../RoomManagement';

vi.mock('@/services/roomApi', () => ({
  getRooms: vi.fn(),
  createRoom: vi.fn(),
  updateRoomStatus: vi.fn(),
  deleteRoom: vi.fn(),
  getHotels: vi.fn(),
  getRoomTypes: vi.fn(),
}));

import { getRooms, createRoom, updateRoomStatus, getHotels, getRoomTypes } from '@/services/roomApi';

const mockRooms = [
  { id: 1, roomNumber: '101', status: 'AVAILABLE', hotelId: 1, roomTypeId: 10 },
  { id: 2, roomNumber: '102', status: 'OCCUPIED', hotelId: 1, roomTypeId: 10 },
  { id: 3, roomNumber: '201', status: 'CLEANING', hotelId: 1, roomTypeId: 20 },
];

const renderPage = () => render(<MemoryRouter><RoomManagement /></MemoryRouter>);

describe('RoomManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getRooms.mockResolvedValue({ data: mockRooms });
    createRoom.mockResolvedValue({ data: {} });
    updateRoomStatus.mockResolvedValue({ data: {} });
    getHotels.mockResolvedValue({ data: [{ id: 1, name: 'Hotel A', city: 'HN' }] });
    getRoomTypes.mockResolvedValue({ data: [{ id: 10, name: 'Standard', capacity: 2, basePrice: 500000 }] });
  });

  it('renders page title', async () => {
    renderPage();
    expect(screen.getByText('Quản lý phòng')).toBeInTheDocument();
  });

  it('loads and displays rooms', async () => {
    renderPage();

    expect(await screen.findByText('Phòng 101')).toBeInTheDocument();
    expect(screen.getByText('Phòng 102')).toBeInTheDocument();
    expect(screen.getByText('Phòng 201')).toBeInTheDocument();
  });

  it('shows error message on API failure', async () => {
    getRooms.mockRejectedValue(new Error('Network error'));
    renderPage();

    expect(await screen.findByText('Network error')).toBeInTheDocument();
  });

  it('filters rooms by status', async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText('Phòng 101');

    // Click the "Trống" filter button
    const filterButtons = screen.getAllByText('Trống');
    const filterButton = filterButtons.find(el => el.tagName === 'BUTTON' && !el.closest('[class*="flex-wrap gap-1.5"]'));
    await user.click(filterButton);

    await waitFor(() => {
      expect(getRooms).toHaveBeenCalledWith(1, 'AVAILABLE');
    });
  });

  it('toggles create form when button is clicked', async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText('Phòng 101');

    // Click "Thêm phòng" to open form
    await user.click(screen.getByText('Thêm phòng'));

    // Click "Đóng" to close form
    await user.click(screen.getByText('Đóng'));

    // The button should say "Thêm phòng" again
    expect(screen.getByText('Thêm phòng')).toBeInTheDocument();
  });

  it('creates room and refreshes list', async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText('Phòng 101');

    // Open create form
    await user.click(screen.getByText('Thêm phòng'));
    await screen.findByText('Thêm phòng mới');

    // Wait for hotels to load
    await screen.findByText('Hotel A (HN)');

    const form = screen.getByPlaceholderText('VD: 101').closest('form');
    const selects = within(form).getAllByRole('combobox');
    const hotelSelect = selects[0];
    await user.selectOptions(hotelSelect, '1');

    // Wait for room types
    await screen.findByText(/Standard/);

    const roomTypeSelect = selects[1];
    await user.selectOptions(roomTypeSelect, '10');

    const roomNumberInput = within(form).getByPlaceholderText('VD: 101');
    await user.type(roomNumberInput, '301');

    // Submit
    await user.click(screen.getByText('Tạo phòng'));

    await waitFor(() => {
      expect(createRoom).toHaveBeenCalledWith({
        hotelId: 1,
        roomTypeId: 10,
        roomNumber: '301',
      });
    });

    // Should refetch rooms after creation
    await waitFor(() => {
      expect(getRooms.mock.calls.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('updates room status', async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText('Phòng 101');

    // Room 101 is AVAILABLE, find the "Đã đặt" button in room cards (not filter)
    const reserveButtons = screen.getAllByText('Đã đặt');
    const reserveButton = reserveButtons.find((el) => el.tagName === 'BUTTON' && el.closest('[class*="flex-wrap gap-1.5"]'));
    await user.click(reserveButton);

    await waitFor(() => {
      expect(updateRoomStatus).toHaveBeenCalledWith(1, 'RESERVED');
    });

    // Should refetch rooms after status update
    await waitFor(() => {
      expect(getRooms.mock.calls.length).toBeGreaterThanOrEqual(2);
    });
  });
});
