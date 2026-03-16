import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import RoomCard from '../RoomCard';

describe('RoomCard', () => {
  const baseRoom = {
    id: 1,
    roomNumber: '101',
    status: 'AVAILABLE',
    hotelId: 10,
    roomTypeId: 20,
  };

  it('renders room number and status', () => {
    render(<RoomCard room={baseRoom} onStatusChange={vi.fn()} />);
    expect(screen.getByText('Phòng 101')).toBeInTheDocument();
    expect(screen.getByText('Trống')).toBeInTheDocument();
  });

  it('shows correct transition buttons for AVAILABLE status', () => {
    render(<RoomCard room={baseRoom} onStatusChange={vi.fn()} />);
    expect(screen.getByText('Đã đặt')).toBeInTheDocument();
    expect(screen.getByText('Đang ở')).toBeInTheDocument();
    expect(screen.getByText('Đang dọn')).toBeInTheDocument();
    expect(screen.getByText('Bảo trì')).toBeInTheDocument();
  });

  it('shows only "Đang dọn" button for OCCUPIED room', () => {
    const room = { ...baseRoom, status: 'OCCUPIED' };
    render(<RoomCard room={room} onStatusChange={vi.fn()} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(1);
    expect(buttons[0]).toHaveTextContent('Đang dọn');
  });

  it('shows only "Trống" button for MAINTENANCE room', () => {
    const room = { ...baseRoom, status: 'MAINTENANCE' };
    render(<RoomCard room={room} onStatusChange={vi.fn()} onDelete={vi.fn()} />);

    const buttons = screen.getAllByRole('button');
    // 1 transition button ("Trống") + 1 delete button ("Xóa phòng")
    expect(buttons).toHaveLength(2);
    expect(buttons[0]).toHaveTextContent('Trống');
    expect(buttons[1]).toHaveTextContent('Xóa phòng');
  });

  it('calls onStatusChange when transition button is clicked', async () => {
    const user = userEvent.setup();
    const onStatusChange = vi.fn();
    render(<RoomCard room={baseRoom} onStatusChange={onStatusChange} />);

    await user.click(screen.getByText('Đã đặt'));
    expect(onStatusChange).toHaveBeenCalledWith(1, 'RESERVED');
  });

  it('shows hotel and room type info', () => {
    render(<RoomCard room={baseRoom} onStatusChange={vi.fn()} />);
    expect(screen.getByText('Khách sạn:')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('Loại phòng:')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
  });

  it('shows correct transition buttons for RESERVED status', () => {
    const room = { ...baseRoom, status: 'RESERVED' };
    render(<RoomCard room={room} onStatusChange={vi.fn()} />);

    expect(screen.getByText('Trống')).toBeInTheDocument();
    expect(screen.getByText('Đang ở')).toBeInTheDocument();
    expect(screen.getByText('Bảo trì')).toBeInTheDocument();
  });

  it('shows correct transition buttons for CLEANING status', () => {
    const room = { ...baseRoom, status: 'CLEANING' };
    render(<RoomCard room={room} onStatusChange={vi.fn()} />);

    expect(screen.getByText('Trống')).toBeInTheDocument();
    expect(screen.getByText('Bảo trì')).toBeInTheDocument();
  });
});
