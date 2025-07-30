import { render, screen, fireEvent } from '@testing-library/react';
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from './Select';

describe('Select', () => {
  it('renders a select element', () => {
    render(
      <Select>
        <SelectItem value="option1">Option 1</SelectItem>
        <SelectItem value="option2">Option 2</SelectItem>
      </Select>
    );
    
    const selectElement = screen.getByRole('combobox');
    expect(selectElement).toBeInTheDocument();
  });

  it('renders all options', () => {
    render(
      <Select>
        <SelectItem value="option1">Option 1</SelectItem>
        <SelectItem value="option2">Option 2</SelectItem>
        <SelectItem value="option3">Option 3</SelectItem>
      </Select>
    );
    
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(3);
    expect(options[0]).toHaveTextContent('Option 1');
    expect(options[1]).toHaveTextContent('Option 2');
    expect(options[2]).toHaveTextContent('Option 3');
  });

  it('handles value selection', () => {
    const handleChange = jest.fn();
    render(
      <Select onChange={handleChange} defaultValue="option1">
        <SelectItem value="option1">Option 1</SelectItem>
        <SelectItem value="option2">Option 2</SelectItem>
      </Select>
    );
    
    const selectElement = screen.getByRole('combobox');
    fireEvent.change(selectElement, { target: { value: 'option2' } });
    
    expect(handleChange).toHaveBeenCalled();
    expect(selectElement).toHaveValue('option2');
  });

  it('applies custom className', () => {
    render(
      <Select className="custom-select">
        <SelectItem value="test">Test</SelectItem>
      </Select>
    );
    
    const selectElement = screen.getByRole('combobox');
    expect(selectElement).toHaveClass('custom-select');
  });

  it('forwards ref to select element', () => {
    const ref = jest.fn();
    render(
      <Select ref={ref}>
        <SelectItem value="test">Test</SelectItem>
      </Select>
    );
    
    expect(ref).toHaveBeenCalled();
  });

  it('supports disabled state', () => {
    render(
      <Select disabled>
        <SelectItem value="test">Test</SelectItem>
      </Select>
    );
    
    const selectElement = screen.getByRole('combobox');
    expect(selectElement).toBeDisabled();
  });
});

describe('SelectTrigger', () => {
  it('renders children', () => {
    render(
      <SelectTrigger>
        <span>Trigger Content</span>
      </SelectTrigger>
    );
    
    expect(screen.getByText('Trigger Content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <SelectTrigger className="custom-trigger">
        Content
      </SelectTrigger>
    );
    
    // eslint-disable-next-line testing-library/no-node-access
    const trigger = container.firstChild;
    expect(trigger).toHaveClass('custom-trigger');
  });
});

describe('SelectValue', () => {
  it('renders placeholder text', () => {
    render(<SelectValue placeholder="Select an option" />);
    
    expect(screen.getByText('Select an option')).toBeInTheDocument();
  });
});

describe('SelectContent', () => {
  it('renders children', () => {
    render(
      <SelectContent>
        <div>Content</div>
      </SelectContent>
    );
    
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
});

describe('SelectItem', () => {
  it('renders as an option element', () => {
    render(
      <select>
        <SelectItem value="test">Test Option</SelectItem>
      </select>
    );
    
    const option = screen.getByRole('option');
    expect(option).toHaveValue('test');
    expect(option).toHaveTextContent('Test Option');
  });
});