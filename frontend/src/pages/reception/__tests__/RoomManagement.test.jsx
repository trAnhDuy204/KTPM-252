import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import RoomManagement from '../RoomManagement';

jest.mock('@/services/roomApi', () => ({
  getRooms: jest.fn(),
  createRoom: jest.fn(),
  updateRoomStatus: jest.fn(),
  deleteRoom: jest.fn(),
  getHotels: jest.fn(),
  getRoomTypes: jest.fn(),
}));

jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn(() => ({
    user: { id: 1, fullName: 'Test User', role: 'ADMIN', hotelId: 1 },
    logout: jest.fn(),
  })),
}));

jest.mock('@/context/ThemeContext', () => ({
  useTheme: jest.fn(() => ({ theme: 'dark', toggleTheme: jest.fn() })),
}));

const {
  getRooms,
  createRoom,
  updateRoomStatus,
  getHotels,
  getRoomTypes,
} = require('@/services/roomApi');

const mockRooms = [
  { id: 1, roomNumber: '101', status: 'AVAILABLE', hotelId: 1, roomTypeId: 10 },
  { id: 2, roomNumber: '102', status: 'OCCUPIED', hotelId: 1, roomTypeId: 10 },
  { id: 3, roomNumber: '201', status: 'CLEANING', hotelId: 1, roomTypeId: 20 },
];

const renderPage = () => render(<MemoryRouter><RoomManagement /></MemoryRouter>);

describe('RoomManagement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

  it('DEBUG - prints all buttons to identify filter and status button text', async () => {
    const { container } = renderPage();
    await screen.findByText('Phòng 101');

    const allButtons = container.querySelectorAll('button');
    console.log('=== ALL BUTTONS ===');
    allButtons.forEach((btn, i) => {
      console.log(`Button[${i}]: "${btn.textContent.trim()}" | class: "${btn.className.substring(0, 80)}"`);
    });

    // In tất cả elements có text chứa "Trống" để xem tagName
    const allElements = container.querySelectorAll('*');
    console.log('=== ELEMENTS WITH "Trống" ===');
    allElements.forEach(el => {
      if (el.childElementCount === 0 && el.textContent.trim() === 'Trống') {
        console.log(`tagName: ${el.tagName} | class: "${el.className.substring(0, 80)}"`);
      }
    });

    console.log('=== ELEMENTS WITH "Đã đặt" ===');
    allElements.forEach(el => {
      if (el.childElementCount === 0 && el.textContent.trim() === 'Đã đặt') {
        console.log(`tagName: ${el.tagName} | class: "${el.className.substring(0, 80)}"`);
      }
    });

    expect(true).toBe(true);
  });

  it('toggles create form when button is clicked', async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText('Phòng 101');

    await user.click(screen.getByText('Thêm phòng'));
    await user.click(screen.getByText('Đóng'));

    expect(screen.getByText('Thêm phòng')).toBeInTheDocument();
  });

  it('creates room and refreshes list', async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText('Phòng 101');

    await user.click(screen.getByText('Thêm phòng'));
    await screen.findByText('Thêm phòng mới');

    await screen.findByText('Hotel A (HN)');

    const form = screen.getByPlaceholderText('VD: 101').closest('form');
    const selects = within(form).getAllByRole('combobox');
    const hotelSelect = selects[0];
    await user.selectOptions(hotelSelect, '1');

    await screen.findByText(/Standard/);

    const roomTypeSelect = selects[1];
    await user.selectOptions(roomTypeSelect, '10');

    const roomNumberInput = within(form).getByPlaceholderText('VD: 101');
    await user.type(roomNumberInput, '301');

    await user.click(screen.getByText('Tạo phòng'));

    await waitFor(() => {
      expect(createRoom).toHaveBeenCalledWith({
        hotelId: 1,
        roomTypeId: 10,
        roomNumber: '301',
      });
    });

    await waitFor(() => {
      expect(getRooms.mock.calls.length).toBeGreaterThanOrEqual(2);
    });
  });
});