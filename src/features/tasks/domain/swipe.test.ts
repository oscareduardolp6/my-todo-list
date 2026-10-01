import { describe, expect, it } from 'vitest';
import { clampSwipe, isHorizontalDrag, swipeAction } from './swipe';

describe('swipe', () => {
  it('solo dispara la acción al pasar el umbral', () => {
    expect(swipeAction(79)).toBeNull();
    expect(swipeAction(80)).toBe('complete');
    expect(swipeAction(-79)).toBeNull();
    expect(swipeAction(-80)).toBe('reschedule');
  });

  it('distingue arrastre horizontal de scroll vertical', () => {
    expect(isHorizontalDrag(30, 5)).toBe(true);
    expect(isHorizontalDrag(30, 40)).toBe(false);
    expect(isHorizontalDrag(4, 0)).toBe(false);
  });

  it('acota el desplazamiento y anula el lado sin acción', () => {
    const both = { complete: true, reschedule: true };
    expect(clampSwipe(500, both)).toBe(140);
    expect(clampSwipe(-500, both)).toBe(-140);
    expect(clampSwipe(-50, { complete: true, reschedule: false })).toBe(0);
    expect(clampSwipe(50, { complete: false, reschedule: true })).toBe(0);
  });
});
