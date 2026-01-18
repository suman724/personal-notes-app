import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useTheme } from '../hooks/useTheme';

const THEME_KEY = 'personal-notes-theme';

describe('useTheme', () => {
  beforeEach(() => {
    window.localStorage.clear();
    delete document.documentElement.dataset.theme;
  });

  it('defaults to dawn and persists it', () => {
    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe('dawn');
    expect(document.documentElement.dataset.theme).toBe('dawn');
    expect(window.localStorage.getItem(THEME_KEY)).toBe('dawn');
  });

  it('hydrates from localStorage and updates the document theme', () => {
    window.localStorage.setItem(THEME_KEY, 'cobalt');

    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe('cobalt');
    expect(document.documentElement.dataset.theme).toBe('cobalt');
  });

  it('updates theme and persists changes', () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.setTheme('sage');
    });

    expect(result.current.theme).toBe('sage');
    expect(document.documentElement.dataset.theme).toBe('sage');
    expect(window.localStorage.getItem(THEME_KEY)).toBe('sage');
  });

  it('syncs theme updates from other tabs', () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', { key: THEME_KEY, newValue: 'clay' }),
      );
    });

    expect(result.current.theme).toBe('clay');
    expect(document.documentElement.dataset.theme).toBe('clay');
  });

  it('uses prefers-color-scheme when no stored theme', () => {
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = vi.fn().mockReturnValue({ matches: true }) as unknown as typeof window.matchMedia;

    const { result } = renderHook(() => useTheme());

    expect(result.current.theme).toBe('cobalt');

    window.matchMedia = originalMatchMedia;
  });
});
