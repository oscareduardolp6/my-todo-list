import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SwipeableRow } from './SwipeableRow';

const setup = (props: { onReschedule?: () => void; done?: boolean } = {}) => {
  const onComplete = vi.fn();
  const onOpen = vi.fn();
  render(
    <ul>
      <SwipeableRow done={props.done ?? false} onComplete={onComplete} onReschedule={props.onReschedule}>
        <button type="button" onClick={onOpen}>
          Fila
        </button>
      </SwipeableRow>
    </ul>,
  );
  const row = screen.getByRole('listitem');
  const drag = (dx: number, dy = 0) => {
    fireEvent.touchStart(row, { touches: [{ clientX: 200, clientY: 100 }] });
    fireEvent.touchMove(row, { touches: [{ clientX: 200 + dx, clientY: 100 + dy }] });
    fireEvent.touchEnd(row);
  };
  return { onComplete, onOpen, row, drag };
};

describe('SwipeableRow', () => {
  it('deslizar a la derecha pasado el umbral completa', () => {
    const { onComplete, drag } = setup({ onReschedule: vi.fn() });
    drag(120);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('deslizar a la izquierda pasado el umbral reagenda', () => {
    const onReschedule = vi.fn();
    const { onComplete, drag } = setup({ onReschedule });
    drag(-120);
    expect(onReschedule).toHaveBeenCalledTimes(1);
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('soltar antes del umbral no ejecuta nada', () => {
    const onReschedule = vi.fn();
    const { onComplete, drag } = setup({ onReschedule });
    drag(50);
    drag(-50);
    expect(onComplete).not.toHaveBeenCalled();
    expect(onReschedule).not.toHaveBeenCalled();
  });

  it('un scroll vertical no dispara ningún gesto', () => {
    const onReschedule = vi.fn();
    const { onComplete, drag } = setup({ onReschedule });
    drag(30, 120);
    expect(onComplete).not.toHaveBeenCalled();
    expect(onReschedule).not.toHaveBeenCalled();
  });

  it('sin onReschedule el lado izquierdo no hace nada', () => {
    const { onComplete, drag } = setup();
    drag(-150);
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('el click que sigue a un arrastre no abre la fila, pero un toque normal sí', () => {
    const { onOpen, drag } = setup({ onReschedule: vi.fn() });
    drag(120);
    fireEvent.click(screen.getByRole('button', { name: 'Fila' }));
    expect(onOpen).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Fila' }));
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it('muestra la acción mientras se arrastra', () => {
    const { row } = setup({ onReschedule: vi.fn() });
    fireEvent.touchStart(row, { touches: [{ clientX: 200, clientY: 100 }] });
    fireEvent.touchMove(row, { touches: [{ clientX: 100, clientY: 100 }] });
    expect(screen.getByText('Reagendar')).toBeInTheDocument();
  });
});
