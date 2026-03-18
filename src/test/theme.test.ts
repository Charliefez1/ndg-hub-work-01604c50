import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getStoredTheme, getStoredAccent } from '@/lib/theme';

describe('theme utilities', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns system as default theme when nothing stored', () => {
    expect(getStoredTheme()).toBe('system');
  });

  it('returns steel as default accent when nothing stored', () => {
    expect(getStoredAccent()).toBe('steel');
  });

  it('returns stored theme', () => {
    localStorage.setItem('ndg-theme', 'dark');
    expect(getStoredTheme()).toBe('dark');
  });

  it('returns stored accent', () => {
    localStorage.setItem('ndg-accent', 'purple');
    expect(getStoredAccent()).toBe('purple');
  });
});
