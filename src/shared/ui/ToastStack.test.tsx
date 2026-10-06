import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ToastStack } from './ToastStack';

const toast = { id: 't1', message: 'Tarea completada', kind: 'info' as const };

const swipe = (el: HTMLElement, dx: number) => {
  fireEvent.touchStart(el, { touches: [{ clientX: 200, clientY: 100 }] });
  fireEvent.touchMove(el, { touches: [{ clientX: 200 + dx, clientY: 100 }] });
  fireEvent.touchEnd(el);
};

describe('ToastStack', () => {
  it('un clic sobre el toast lo descarta', async () => {
    const onDismiss = vi.fn();
    render(<ToastStack toasts={[toast]} onDismiss={onDismiss} />);
    await userEvent.setup().click(screen.getByText('Tarea completada'));
    expect(onDismiss).toHaveBeenCalledWith('t1');
  });

  it.each([-120, 120])('deslizar %i px lo descarta', (dx) => {
    const onDismiss = vi.fn();
    render(<ToastStack toasts={[toast]} onDismiss={onDismiss} />);
    swipe(screen.getByRole('status'), dx);
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledWith('t1');
  });

  it('un deslizamiento corto no lo descarta, ni el click posterior', () => {
    const onDismiss = vi.fn();
    render(<ToastStack toasts={[toast]} onDismiss={onDismiss} />);
    const el = screen.getByRole('status');
    swipe(el, 30);
    fireEvent.click(el);
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('pulsar la acción la ejecuta y descarta una sola vez', async () => {
    const run = vi.fn();
    const onDismiss = vi.fn();
    render(<ToastStack toasts={[{ ...toast, action: { label: 'Deshacer', run } }]} onDismiss={onDismiss} />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Deshacer' }));
    expect(run).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
