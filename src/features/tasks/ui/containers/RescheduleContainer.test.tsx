import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { makeTask } from '../../../../test/factories';
import { TEST_TODAY, renderApp } from '../../../../test/render-app';

const swipe = (el: HTMLElement, dx: number) => {
  fireEvent.touchStart(el, { touches: [{ clientX: 250, clientY: 100 }] });
  fireEvent.touchMove(el, { touches: [{ clientX: 250 + dx, clientY: 100 }] });
  fireEvent.touchEnd(el);
};

const rowOf = async (title: string) => (await screen.findByText(title)).closest('li') as HTMLElement;

describe('gestos en las tareas', () => {
  it('deslizar a la izquierda abre el selector y reagenda solo scheduledFor, con Deshacer', async () => {
    const user = userEvent.setup();
    const { taskRepository } = renderApp({
      tasks: [makeTask({ id: 'a', title: 'Pagar luz', scheduledFor: TEST_TODAY, deadline: '2026-10-03' })],
    });

    swipe(await rowOf('Pagar luz'), -120);
    const sheet = await screen.findByRole('dialog', { name: 'Reagendar' });
    await user.click(within(sheet).getByRole('button', { name: /Mañana/ }));

    await waitFor(() => expect(taskRepository.snapshot()[0]).toMatchObject({ scheduledFor: '2026-09-30', deadline: '2026-10-03', rescheduleCount: 1 }));
    expect(screen.queryByRole('dialog')).toBeNull();

    const toast = screen.getByRole('status');
    await user.click(within(toast).getByRole('button', { name: 'Deshacer' }));
    await waitFor(() => expect(taskRepository.snapshot()[0]).toMatchObject({ scheduledFor: TEST_TODAY, rescheduleCount: 0 }));
  });

  it('el selector también permite elegir una fecha del calendario', async () => {
    const { taskRepository } = renderApp({ tasks: [makeTask({ id: 'a', title: 'Pagar luz', scheduledFor: TEST_TODAY })] });

    swipe(await rowOf('Pagar luz'), -120);
    fireEvent.change(await screen.findByLabelText('Elegir otra fecha'), { target: { value: '2026-10-20' } });

    await waitFor(() => expect(taskRepository.snapshot()[0]?.scheduledFor).toBe('2026-10-20'));
  });

  it('deslizar a la derecha completa la tarea con toast de Deshacer', async () => {
    const { taskRepository } = renderApp({ tasks: [makeTask({ id: 'a', title: 'Pagar luz', scheduledFor: TEST_TODAY })] });

    swipe(await rowOf('Pagar luz'), 130);

    await waitFor(() => expect(taskRepository.snapshot()[0]?.completedOn).toBe(TEST_TODAY));
    expect(within(screen.getByRole('status')).getByText('Tarea completada')).toBeInTheDocument();
  });

  it('a una recurrente no se le ofrece "Sin fecha"', async () => {
    renderApp({
      tasks: [
        makeTask({ id: 'a', title: 'Regar', scheduledFor: TEST_TODAY, recurrence: { frequency: 'daily', interval: 1, weekdays: [], mode: 'fixed' } }),
      ],
    });

    swipe(await rowOf('Regar'), -120);
    const sheet = await screen.findByRole('dialog', { name: 'Reagendar' });
    expect(within(sheet).queryByRole('button', { name: /Sin fecha/ })).toBeNull();
    expect(within(sheet).getByRole('button', { name: /Mañana/ })).toBeInTheDocument();
  });
});
