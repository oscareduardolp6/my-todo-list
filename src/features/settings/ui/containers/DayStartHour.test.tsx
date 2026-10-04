import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { makeTask } from '../../../../test/factories';
import { renderApp } from '../../../../test/render-app';
import { DEFAULT_SETTINGS } from '../../domain/settings';

/** 30 de septiembre, 1:30 a. m.: ya es otro día en el calendario, pero con tiempo extra sigue siendo el 29. */
const AFTER_MIDNIGHT = new Date(2026, 8, 30, 1, 30).getTime();
const task = makeTask({ id: 'n', title: 'Terminar informe', scheduledFor: '2026-09-29' });
const withGrace = { ...DEFAULT_SETTINGS, dayStartHour: 3 as const };

describe('tiempo extra al final del día', () => {
  it('sin el ajuste, pasada la medianoche la tarea de ayer está atrasada', async () => {
    renderApp({ tasks: [task], now: AFTER_MIDNIGHT });
    expect(await screen.findByText('Atrasadas')).toBeInTheDocument();
  });

  it('con el ajuste, antes de la hora de corte la tarea sigue en Hoy y no atrasada', async () => {
    renderApp({ tasks: [task], settings: withGrace, now: AFTER_MIDNIGHT });
    expect(await screen.findByText('Terminar informe')).toBeInTheDocument();
    expect(screen.queryByText('Atrasadas')).not.toBeInTheDocument();
  });

  it('lo completado en el tiempo extra cuenta para el día anterior y el reporte lo avisa', async () => {
    const user = userEvent.setup();
    const { taskRepository } = renderApp({ tasks: [task], settings: withGrace, now: AFTER_MIDNIGHT });

    await user.click(await screen.findByRole('checkbox', { name: /Terminar informe/ }));

    await waitFor(() => expect(taskRepository.snapshot()[0]).toMatchObject({ completedOn: '2026-09-29', completedAt: AFTER_MIDNIGHT }));

    await user.click(screen.getAllByRole('button', { name: 'Reportes' })[0] as HTMLElement);
    expect(await screen.findByText(/Tiempo extra activado.*3:00 a\. m\./)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Hoy · Martes 29 de septiembre/ })).toBeInTheDocument();
  });

  it('se elige en Ajustes y se guarda', async () => {
    const user = userEvent.setup();
    const { settingsRepository } = renderApp(undefined, '#/ajustes');

    await user.click(await screen.findByRole('radio', { name: '3:00 a. m.' }));

    await waitFor(() => expect(settingsRepository.current().dayStartHour).toBe(3));
  });
});
