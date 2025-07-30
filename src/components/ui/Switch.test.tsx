import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Switch } from './Switch';

describe('Switch', () => {
  it('renders a switch component', () => {
    render(<Switch />);
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toBeInTheDocument();
  });

  it('toggles checked state when clicked', async () => {
    const handleChange = jest.fn();
    render(<Switch onCheckedChange={handleChange} />);
    
    const switchElement = screen.getByRole('switch');
    await userEvent.click(switchElement);
    
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('respects checked prop', () => {
    render(<Switch checked={true} />);
    
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toHaveAttribute('data-state', 'checked');
  });

  it('respects unchecked prop', () => {
    render(<Switch checked={false} />);
    
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toHaveAttribute('data-state', 'unchecked');
  });

  it('applies custom className', () => {
    render(<Switch className="custom-class" />);
    
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toHaveClass('custom-class');
  });

  it('forwards ref to the root element', () => {
    const ref = jest.fn();
    render(<Switch ref={ref} />);
    
    expect(ref).toHaveBeenCalled();
  });

  it('applies disabled state', () => {
    render(<Switch disabled />);
    
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toBeDisabled();
  });

  it('supports aria-label', () => {
    render(<Switch aria-label="Toggle feature" />);
    
    const switchElement = screen.getByLabelText('Toggle feature');
    expect(switchElement).toBeInTheDocument();
  });
});