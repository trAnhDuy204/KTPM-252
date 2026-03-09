import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import RoomStatusFilter from '../RoomStatusFilter';

describe('RoomStatusFilter', () => {
  it('renders all status options plus "Tất cả"', () => {
    render(<RoomStatusFilter value="" onChange={vi.fn()} />);

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(6); // "Tất cả" + 5 statuses

    expect(screen.getByText('Tất cả')).toBeInTheDocument();
    expect(screen.getByText('Trống')).toBeInTheDocument();
    expect(screen.getByText('Đã đặt')).toBeInTheDocument();
    expect(screen.getByText('Đang ở')).toBeInTheDocument();
    expect(screen.getByText('Đang dọn')).toBeInTheDocument();
    expect(screen.getByText('Bảo trì')).toBeInTheDocument();
  });

  it('shows correct selected value', () => {
    render(<RoomStatusFilter value="OCCUPIED" onChange={vi.fn()} />);

    const select = screen.getByRole('combobox');
    expect(select.value).toBe('OCCUPIED');
  });

  it('calls onChange when option is selected', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<RoomStatusFilter value="" onChange={onChange} />);

    await user.selectOptions(screen.getByRole('combobox'), 'AVAILABLE');
    expect(onChange).toHaveBeenCalledWith('AVAILABLE');
  });

  it('shows "Tất cả" as default when value is empty', () => {
    render(<RoomStatusFilter value="" onChange={vi.fn()} />);

    const select = screen.getByRole('combobox');
    expect(select.value).toBe('');
    expect(screen.getByText('Tất cả').selected).toBe(true);
  });
});
