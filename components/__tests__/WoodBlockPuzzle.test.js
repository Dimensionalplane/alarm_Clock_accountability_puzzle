import React from 'react';
import { Dimensions } from 'react-native';

// Mock Dimensions
jest.spyOn(Dimensions, 'get').mockReturnValue({ width: 375, height: 667 });

import { render, fireEvent, act } from '@testing-library/react-native';
import WoodBlockPuzzle from '../WoodBlockPuzzle';

describe('WoodBlockPuzzle Component', () => {
  const mockOnSuccess = jest.fn();
  const mockOnFailure = jest.fn();
  const mockSettings = { puzzleTimer: 60, difficulty: 'easy' };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders the timer and grid', () => {
    const { getByText } = render(
      <WoodBlockPuzzle onSuccess={mockOnSuccess} onFailure={mockOnFailure} settings={mockSettings} />
    );
    expect(getByText(/Time: 60s/)).toBeTruthy();
  });

  it('calls onFailure when timer expires', () => {
    render(
      <WoodBlockPuzzle onSuccess={mockOnSuccess} onFailure={mockOnFailure} settings={mockSettings} />
    );

    act(() => {
      jest.advanceTimersByTime(60000);
    });

    expect(mockOnFailure).toHaveBeenCalledWith('Timeout');
  });

  it('calls onFailure when Give Up button is pressed', () => {
    const { getByText } = render(
      <WoodBlockPuzzle onSuccess={mockOnSuccess} onFailure={mockOnFailure} settings={mockSettings} />
    );

    const giveUpButton = getByText('Give Up & Pay');
    fireEvent.press(giveUpButton);

    expect(mockOnFailure).toHaveBeenCalledWith('User Surrender');
  });
});
