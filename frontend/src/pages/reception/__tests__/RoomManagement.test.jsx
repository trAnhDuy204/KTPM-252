import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RoomManagement from '../RoomManagement';

vi.mock('@/services/roomApi', () => ({
  getRooms: vi.fn(),
  createRoom: vi.fn(),
  updateRoomStatus: vi.fn(),
  getHotels: vi.fn(),
  getRoomTypes: vi.fn(),
}));

import { getRooms, createRoom, updateRoomStatus, getHotels, getRoomTypes } from '@/services/roomApi';

const mockRooms = [
  { id: 1, roomNumber: '101', status: 'AVAILABLE', hotelId: 1, roomTypeId: 10 },
  { id: 2, roomNumber: '102', status: 'OCCUPIED', hotelId: 1, roomTypeId: 10 },
  { id: 3, roomNumber: '201', status: 'CLEANING', hotelId: 1, roomTypeId: 20 },
];

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
    render(<RoomManagement />);
    expect(screen.getByText('Quản lý phòng - Lễ tân')).toBeInTheDocument();
  });

  it('loads and displays rooms', async () => {
    render(<RoomManagement />);

    expect(await screen.findByText('Phòng 101')).toBeInTheDocument();
    expect(screen.getByText('Phòng 102')).toBeInTheDocument();
    expect(screen.getByText('Phòng 201')).toBeInTheDocument();
    expect(getRooms).toHaveBeenCalledWith(1, undefined);
  });

  it('shows error message on API failure', async () => {
    getRooms.mockRejectedValue(new Error('Network error'));
    render(<RoomManagement />);

    expect(await screen.findByText('Network error')).toBeInTheDocument();
  });

  it('filters rooms by status', async () => {
    const user = userEvent.setup();
    render(<RoomManagement />);

    await screen.findByText('Phòng 101');

    // Change filter to AVAILABLE
    const filterSelect = screen.getByRole('combobox');
    await user.selectOptions(filterSelect, 'AVAILABLE');

    await waitFor(() => {
      expect(getRooms).toHaveBeenCalledWith(1, 'AVAILABLE');
    });
  });

  it('opens create form when button is clicked', async () => {
    const user = userEvent.setup();
    render(<RoomManagement />);

    await screen.findByText('Phòng 101');

    expect(screen.queryByText('Thêm phòng mới')).not.toBeInTheDocument();

    await user.click(screen.getByText('+ Thêm phòng'));

    expect(screen.getByText('Thêm phòng mới')).toBeInTheDocument();
  });

  it('creates room and refreshes list', async () => {
    const user = userEvent.setup();
    render(<RoomManagement />);

    await screen.findByText('Phòng 101');

    // Open create form
    await user.click(screen.getByText('+ Thêm phòng'));
    await screen.findByText('Thêm phòng mới');

    // Wait for hotels to load
    await screen.findByText('Hotel A (HN)');

    // Fill form
    const selects = screen.getAllByRole('combobox');
    // The first combobox is the status filter, the second is hotel select
    const hotelSelect = selects[1];
    await user.selectOptions(hotelSelect, '1');

    // Wait for room types
    await screen.findByText(/Standard/);

    const roomTypeSelect = selects[2];
    await user.selectOptions(roomTypeSelect, '10');

    const roomNumberInput = screen.getByPlaceholderText('VD: 101');
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
      // Initial load + after create
      expect(getRooms.mock.calls.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('updates room status', async () => {
    const user = userEvent.setup();
    render(<RoomManagement />);

    await screen.findByText('Phòng 101');

    // Room 101 is AVAILABLE, should have "Đã đặt" and "Bảo trì" buttons
    // Click "Đã đặt" for room 101
    const reserveButtons = screen.getAllByText('Đã đặt');
    // The first "Đã đặt" button in the actions area (not the summary label)
    // We need the button element
    const reserveButton = reserveButtons.find((el) => el.tagName === 'BUTTON');
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
