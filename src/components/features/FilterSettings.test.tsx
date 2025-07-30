import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterSettings } from './FilterSettings';
import { useFilterStore } from '@/stores/filterStore';

jest.mock('@/stores/filterStore');

const mockUseFilterStore = useFilterStore as jest.MockedFunction<typeof useFilterStore>;

describe('FilterSettings', () => {
  const mockToggleFilter = jest.fn();
  const mockSetStrength = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseFilterStore.mockReturnValue({
      isEnabled: true,
      strength: 'moderate',
      customBlocklist: [],
      stats: undefined,
      toggleFilter: mockToggleFilter,
      setStrength: mockSetStrength,
      addToBlocklist: jest.fn(),
      removeFromBlocklist: jest.fn(),
      updateStats: jest.fn(),
    });
  });

  it('renders the filter settings component', () => {
    render(<FilterSettings />);
    expect(screen.getByText('Content Filter')).toBeInTheDocument();
  });

  it('displays the correct shield icon when disabled', () => {
    mockUseFilterStore.mockReturnValue({
      isEnabled: false,
      strength: 'moderate',
      customBlocklist: [],
      stats: undefined,
      toggleFilter: mockToggleFilter,
      setStrength: mockSetStrength,
      addToBlocklist: jest.fn(),
      removeFromBlocklist: jest.fn(),
      updateStats: jest.fn(),
    });

    render(<FilterSettings />);
    // eslint-disable-next-line testing-library/no-node-access
    const shield = screen.getByText('Content Filter').parentElement?.querySelector('svg');
    expect(shield).toHaveClass('text-gray-400');
  });

  it('displays the correct shield icon for strict mode', () => {
    mockUseFilterStore.mockReturnValue({
      isEnabled: true,
      strength: 'strict',
      customBlocklist: [],
      stats: undefined,
      toggleFilter: mockToggleFilter,
      setStrength: mockSetStrength,
      addToBlocklist: jest.fn(),
      removeFromBlocklist: jest.fn(),
      updateStats: jest.fn(),
    });

    render(<FilterSettings />);
    // eslint-disable-next-line testing-library/no-node-access
    const shield = screen.getByText('Content Filter').parentElement?.querySelector('svg');
    expect(shield).toHaveClass('text-red-500');
  });

  it('displays the correct shield icon for moderate mode', () => {
    render(<FilterSettings />);
    // eslint-disable-next-line testing-library/no-node-access
    const shield = screen.getByText('Content Filter').parentElement?.querySelector('svg');
    expect(shield).toHaveClass('text-green-500');
  });

  it('toggles filter when switch is clicked', async () => {
    render(<FilterSettings />);
    
    const toggle = screen.getByLabelText('Toggle content filter');
    await userEvent.click(toggle);
    
    expect(mockToggleFilter).toHaveBeenCalledTimes(1);
  });

  it('shows strength selector when filter is enabled', () => {
    render(<FilterSettings />);
    
    expect(screen.getByText('Minimal - Only explicit content')).toBeInTheDocument();
    expect(screen.getByText('Moderate - Balanced filtering')).toBeInTheDocument();
    expect(screen.getByText('Strict - Maximum safety')).toBeInTheDocument();
  });

  it('hides strength selector when filter is disabled', () => {
    mockUseFilterStore.mockReturnValue({
      isEnabled: false,
      strength: 'moderate',
      customBlocklist: [],
      stats: undefined,
      toggleFilter: mockToggleFilter,
      setStrength: mockSetStrength,
      addToBlocklist: jest.fn(),
      removeFromBlocklist: jest.fn(),
      updateStats: jest.fn(),
    });

    render(<FilterSettings />);
    
    expect(screen.queryByText('Minimal - Only explicit content')).not.toBeInTheDocument();
    expect(screen.queryByText('Moderate - Balanced filtering')).not.toBeInTheDocument();
    expect(screen.queryByText('Strict - Maximum safety')).not.toBeInTheDocument();
  });

  it('changes filter strength when option is selected', () => {
    render(<FilterSettings />);
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'strict' } });
    
    expect(mockSetStrength).toHaveBeenCalledWith('strict');
  });

  it('displays filter statistics when available', () => {
    mockUseFilterStore.mockReturnValue({
      isEnabled: true,
      strength: 'moderate',
      customBlocklist: [],
      stats: {
        totalChecked: 100,
        totalBlocked: 15,
        blockedByCategory: {},
        lastChecked: new Date(),
      },
      toggleFilter: mockToggleFilter,
      setStrength: mockSetStrength,
      addToBlocklist: jest.fn(),
      removeFromBlocklist: jest.fn(),
      updateStats: jest.fn(),
    });

    render(<FilterSettings />);
    
    expect(screen.getByText('Jokes filtered: 15 / 100')).toBeInTheDocument();
  });

  it('does not display statistics when not available', () => {
    render(<FilterSettings />);
    
    expect(screen.queryByText(/Jokes filtered:/)).not.toBeInTheDocument();
  });
});