import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import RoomStatusFilter from '../RoomStatusFilter';

describe('RoomStatusFilter', () => {
  it('renders all status buttons plus "Tất cả"', () => {
    render(<RoomStatusFilter value="" onChange={vi.fn()} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(6); // "Tất cả" + 5 statuses

    expect(screen.getByText('Tất cả')).toBeInTheDocument();
    expect(screen.getByText('Trống')).toBeInTheDocument();
    expect(screen.getByText('Đã đặt')).toBeInTheDocument();
    expect(screen.getByText('Đang ở')).toBeInTheDocument();
    expect(screen.getByText('Đang dọn')).toBeInTheDocument();
    expect(screen.getByText('Bảo trì')).toBeInTheDocument();
  });

  it('highlights active filter button', () => {
    render(<RoomStatusFilter value="OCCUPIED" onChange={vi.fn()} />);

    const activeBtn = screen.getByText('Đang ở');
    expect(activeBtn.className).toContain('text-white');
  });

  it('calls onChange when a status button is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<RoomStatusFilter value="" onChange={onChange} />);

    await user.click(screen.getByText('Trống'));
    expect(onChange).toHaveBeenCalledWith('AVAILABLE');
  });

  it('highlights "Tất cả" when value is empty', () => {
    render(<RoomStatusFilter value="" onChange={vi.fn()} />);

    const allBtn = screen.getByText('Tất cả');
    expect(allBtn.className).toContain('text-white');
  });
});
