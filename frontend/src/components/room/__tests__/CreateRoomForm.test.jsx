import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CreateRoomForm from '../CreateRoomForm';

vi.mock('@/services/roomApi', () => ({
  getHotels: vi.fn(),
  getRoomTypes: vi.fn(),
}));

import { getHotels, getRoomTypes } from '@/services/roomApi';

const mockHotels = [
  { id: 1, name: 'Hotel A', city: 'Ha Noi' },
  { id: 2, name: 'Hotel B', city: 'HCM' },
];

const mockRoomTypes = [
  { id: 10, name: 'Standard', capacity: 2, basePrice: 500000 },
  { id: 20, name: 'Deluxe', capacity: 4, basePrice: 1000000 },
];

describe('CreateRoomForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getHotels.mockResolvedValue({ data: mockHotels });
    getRoomTypes.mockResolvedValue({ data: mockRoomTypes });
  });

  it('renders form with all fields', async () => {
    render(<CreateRoomForm onSubmit={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByText('Thêm phòng mới')).toBeInTheDocument();
    expect(screen.getByText('Khách sạn')).toBeInTheDocument();
    expect(screen.getByText('Loại phòng')).toBeInTheDocument();
    expect(screen.getByText('Số phòng')).toBeInTheDocument();
    expect(screen.getByText('Tạo phòng')).toBeInTheDocument();
    expect(screen.getByText('Hủy')).toBeInTheDocument();
  });

  it('loads hotels on mount', async () => {
    render(<CreateRoomForm onSubmit={vi.fn()} onCancel={vi.fn()} />);

    await waitFor(() => {
      expect(getHotels).toHaveBeenCalledTimes(1);
    });

    expect(await screen.findByText('Hotel A (Ha Noi)')).toBeInTheDocument();
    expect(screen.getByText('Hotel B (HCM)')).toBeInTheDocument();
  });

  it('loads room types when hotel is selected', async () => {
    const user = userEvent.setup();
    render(<CreateRoomForm onSubmit={vi.fn()} onCancel={vi.fn()} />);

    await screen.findByText('Hotel A (Ha Noi)');

    const hotelSelect = screen.getAllByRole('combobox')[0];
    await user.selectOptions(hotelSelect, '1');

    await waitFor(() => {
      expect(getRoomTypes).toHaveBeenCalledWith('1');
    });

    expect(await screen.findByText(/Standard/)).toBeInTheDocument();
    expect(screen.getByText(/Deluxe/)).toBeInTheDocument();
  });

  it('disables room type dropdown when no hotel is selected', () => {
    render(<CreateRoomForm onSubmit={vi.fn()} onCancel={vi.fn()} />);

    const selects = screen.getAllByRole('combobox');
    const roomTypeSelect = selects[1];
    expect(roomTypeSelect).toBeDisabled();
  });

  it('calls onSubmit with correct data', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<CreateRoomForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    await screen.findByText('Hotel A (Ha Noi)');

    // Select hotel
    const hotelSelect = screen.getAllByRole('combobox')[0];
    await user.selectOptions(hotelSelect, '1');

    // Wait for room types to load
    await screen.findByText(/Standard/);

    // Select room type
    const roomTypeSelect = screen.getAllByRole('combobox')[1];
    await user.selectOptions(roomTypeSelect, '10');

    // Enter room number
    const roomNumberInput = screen.getByPlaceholderText('VD: 101');
    await user.type(roomNumberInput, '301');

    // Submit
    await user.click(screen.getByText('Tạo phòng'));

    expect(onSubmit).toHaveBeenCalledWith({
      hotelId: 1,
      roomTypeId: 10,
      roomNumber: '301',
    });
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<CreateRoomForm onSubmit={vi.fn()} onCancel={onCancel} />);

    await user.click(screen.getByText('Hủy'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('resets room type when hotel changes', async () => {
    const user = userEvent.setup();
    render(<CreateRoomForm onSubmit={vi.fn()} onCancel={vi.fn()} />);

    await screen.findByText('Hotel A (Ha Noi)');

    // Select hotel 1
    const hotelSelect = screen.getAllByRole('combobox')[0];
    await user.selectOptions(hotelSelect, '1');

    await screen.findByText(/Standard/);

    // Select a room type
    const roomTypeSelect = screen.getAllByRole('combobox')[1];
    await user.selectOptions(roomTypeSelect, '10');
    expect(roomTypeSelect.value).toBe('10');

    // Change hotel - room type should reset
    await user.selectOptions(hotelSelect, '2');

    await waitFor(() => {
      expect(roomTypeSelect.value).toBe('');
    });
  });
});
