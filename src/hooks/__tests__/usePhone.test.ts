/* eslint-disable @typescript-eslint/no-empty-function */
import { act, renderHook } from '@testing-library/react-hooks/dom';
import * as React from 'react';

import { usePhone } from '../usePhone';

const createChangeEvent = (options: {
  value: string;
  isDeletion?: boolean;
}) => {
  return {
    preventDefault: () => {},
    nativeEvent: { inputType: options.isDeletion ? 'delete' : 'another-type' },
    target: { value: options.value },
  } as unknown as React.ChangeEvent<HTMLInputElement>;
};

describe('usePhone', () => {
  it('Should set initial value', () => {
    const { result: fullPhone } = renderHook(() =>
      usePhone('+1 (444) 444-4444'),
    );
    expect(fullPhone.current.phone).toBe('+1 (444) 444-4444');

    const { result: notFullPhone } = renderHook(() => usePhone('+1 (444)'));
    expect(notFullPhone.current.phone).toBe('+1 (444) ');
  });

  it('Should format phone with handlePhoneValueChange', () => {
    const { result } = renderHook(() => usePhone(''));

    act(() => {
      result.current.handlePhoneValueChange(
        createChangeEvent({ value: '380123456789' }),
      );
    });
    expect(result.current.phone).toBe('+380 (12) 345 67 89');

    act(() => {
      result.current.handlePhoneValueChange(
        createChangeEvent({ value: '111111' }),
      );
    });
    expect(result.current.phone).toBe('+1 (111) 11');

    act(() => {
      result.current.handlePhoneValueChange(
        createChangeEvent({ value: '+1111111' }),
      );
    });
    expect(result.current.phone).toBe('+1 (111) 111-');

    act(() => {
      result.current.handlePhoneValueChange(
        createChangeEvent({ value: '+1111', isDeletion: true }),
      );
    });
    expect(result.current.phone).toBe('+1 (111');

    act(() => {
      result.current.handlePhoneValueChange(createChangeEvent({ value: '' }));
    });
    expect(result.current.phone).toBe('');
  });

  it('Should not prefill init value with dialCode if disableDialCodePrefill is true', () => {
    const { result: resultWithoutPrefill } = renderHook(() =>
      usePhone('', { country: 'us', disableDialCodePrefill: true }),
    );
    expect(resultWithoutPrefill.current.phone).toBe('');
    act(() => {
      resultWithoutPrefill.current.handlePhoneValueChange(
        createChangeEvent({ value: '' }),
      );
    });
    expect(resultWithoutPrefill.current.phone).toBe('');

    const { result: resultWithPrefill } = renderHook(() =>
      usePhone('', { country: 'us', disableDialCodePrefill: false }),
    );
    expect(resultWithPrefill.current.phone).toBe('+1 ');

    act(() => {
      resultWithPrefill.current.handlePhoneValueChange(
        createChangeEvent({ value: '' }),
      );
    });
    expect(resultWithPrefill.current.phone).toBe('');
  });

  it('Should not guess country when disableCountryGuess is true', () => {
    const { result } = renderHook(() =>
      usePhone('+123', { country: 'us', disableCountryGuess: true }),
    );
    expect(result.current.phone).toBe('+1 (23');

    act(() => {
      result.current.handlePhoneValueChange(
        createChangeEvent({ value: '+987' }),
      );
    });
    expect(result.current.phone).toBe('+9 (87');
  });
});
