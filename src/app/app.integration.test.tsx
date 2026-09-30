import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { makeTask, noon } from '../test/factories';
import { TEST_TODAY, renderApp } from '../test/render-app';

describe('app (integración, repos en memoria)', () => {
  it('completar una tarea muestra un toast con Deshacer que la restaura', async () => {
    const user = userEvent.setup();
    const { taskRepository } = renderApp({ tasks: [makeTask({ id: 'a', title: 'Pagar luz', scheduledFor: TEST_TODAY })] });

    expect(await screen.findByText('Pagar luz')).toBeInTheDocument();
    await user.click(screen.getByRole('checkbox', { name: /Completar: Pagar luz/ }));

    // Se guardó como completada, con el día en que se hizo…
    await waitFor(() => expect(taskRepository.snapshot()[0]).toMatchObject({ completedOn: TEST_TODAY, completedAt: noon(TEST_TODAY) }));
    // …desaparece de Hoy y aparece el toast.
    expect(screen.queryByText('Pagar luz')).not.toBeInTheDocument();
    const toast = screen.getByRole('status');
    expect(within(toast).getByText('Tarea completada')).toBeInTheDocument();

    await user.click(within(toast).getByRole('button', { name: 'Deshacer' }));

    expect(await screen.findByText('Pagar luz')).toBeInTheDocument();
    expect(taskRepository.snapshot()[0]).toMatchObject({ completedAt: null, completedOn: null });
  });

  it('completar una recurrente la avanza, archiva la ocurrencia y Deshacer no deja duplicados', async () => {
    const user = userEvent.setup();
    const { taskRepository } = renderApp({
      tasks: [
        makeTask({
          id: 'r',
          title: 'Sacar basura',
          scheduledFor: TEST_TODAY,
          recurrence: { frequency: 'weekly', interval: 1, weekdays: [], mode: 'fixed' },
        }),
      ],
    });

    await user.click(await screen.findByRole('checkbox', { name: /Completar: Sacar basura/ }));

    await waitFor(() => expect(taskRepository.snapshot()).toHaveLength(2));
    const byId = Object.fromEntries(taskRepository.snapshot().map((t) => [t.id, t]));
    expect(byId.r).toMatchObject({ scheduledFor: '2026-10-06', completedAt: null, recurrence: { frequency: 'weekly' } });
    expect(byId[`r_${TEST_TODAY}`]).toMatchObject({ completedOn: TEST_TODAY, scheduledFor: TEST_TODAY, recurrence: null });
    expect(screen.queryByText('Sacar basura')).not.toBeInTheDocument();

    await user.click(within(screen.getByRole('status')).getByRole('button', { name: 'Deshacer' }));

    await waitFor(() => expect(taskRepository.snapshot()).toHaveLength(1));
    expect(taskRepository.snapshot()[0]).toMatchObject({ id: 'r', scheduledFor: TEST_TODAY, completedAt: null });
    expect(await screen.findByText('Sacar basura')).toBeInTheDocument();
  });

  it('crea una tarea recurrente desde el formulario y exige fecha agendada', async () => {
    const user = userEvent.setup();
    const { taskRepository } = renderApp();

    await user.click((await screen.findAllByRole('button', { name: /Añadir tarea/ }))[0] as HTMLElement);
    const form = within(await screen.findByRole('dialog', { name: 'Nueva tarea' }));
    await user.type(form.getByLabelText('Título'), 'Pagar renta');
    await user.click(form.getByRole('button', { name: 'Sin fecha' }));
    await user.selectOptions(form.getByLabelText('Repetir'), 'monthly');
    expect(form.getByText('Una tarea recurrente necesita fecha agendada.')).toBeInTheDocument();
    expect(form.getByRole('button', { name: 'Añadir tarea' })).toBeDisabled();

    await user.click(form.getByRole('button', { name: 'Hoy' }));
    await user.click(form.getByRole('button', { name: 'Añadir tarea' }));

    await waitFor(() => expect(taskRepository.snapshot()).toHaveLength(1));
    expect(taskRepository.snapshot()[0]).toMatchObject({
      scheduledFor: TEST_TODAY,
      recurrence: { frequency: 'monthly', interval: 1, weekdays: [], mode: 'fixed' },
    });
  });

  it('borrar una tarea también se puede deshacer', async () => {
    const user = userEvent.setup();
    const { taskRepository } = renderApp({ tasks: [makeTask({ id: 'a', title: 'Llamar', scheduledFor: TEST_TODAY })] });

    await user.click(await screen.findByText('Llamar'));
    await user.click(screen.getByRole('button', { name: 'Eliminar tarea' }));
    await waitFor(() => expect(taskRepository.snapshot()).toHaveLength(0));

    await user.click(within(screen.getByRole('status')).getByRole('button', { name: 'Deshacer' }));
    await waitFor(() => expect(taskRepository.snapshot()).toHaveLength(1));
    expect(await screen.findByText('Llamar')).toBeInTheDocument();
  });

  it('crea una tarea con prioridad, fecha agendada y fecha límite', async () => {
    const user = userEvent.setup();
    const { taskRepository } = renderApp();

    // El FAB (móvil) y el botón del sidebar (escritorio) están siempre en el DOM; jsdom no aplica media queries.
    await user.click((await screen.findAllByRole('button', { name: /Añadir tarea/ }))[0] as HTMLElement);
    const form = within(await screen.findByRole('dialog', { name: 'Nueva tarea' }));
    await user.type(form.getByLabelText('Título'), 'Entregar reporte');
    await user.click(form.getByRole('radio', { name: /Urgente/ }));
    await user.click(form.getByRole('button', { name: 'Mañana' }));
    await user.type(form.getByLabelText('Fecha límite'), '2026-10-22');
    await user.click(form.getByRole('button', { name: 'Añadir tarea' }));

    await waitFor(() => expect(taskRepository.snapshot()).toHaveLength(1));
    expect(taskRepository.snapshot()[0]).toMatchObject({
      title: 'Entregar reporte',
      priority: 1,
      scheduledFor: '2026-09-30',
      deadline: '2026-10-22',
      projectId: 'inbox',
    });
  });

  it('reagendar mueve la tarea de día, cuenta el cambio y conserva la fecha límite', async () => {
    const user = userEvent.setup();
    const { taskRepository } = renderApp({
      tasks: [makeTask({ id: 'a', title: 'Declaración', scheduledFor: TEST_TODAY, deadline: '2026-10-22' })],
    });

    await user.click(await screen.findByText('Declaración'));
    await user.click(screen.getByRole('button', { name: 'Mañana' }));
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    await waitFor(() => expect(taskRepository.snapshot()[0]?.scheduledFor).toBe('2026-09-30'));
    expect(taskRepository.snapshot()[0]).toMatchObject({ deadline: '2026-10-22', rescheduleCount: 1 });
    // Ya no está en Hoy.
    expect(screen.queryByText('Declaración')).not.toBeInTheDocument();
  });

  it('el reporte agrupa lo completado por el día en que se hizo', async () => {
    const { container } = renderApp(
      {
        tasks: [
          makeTask({ id: 'a', title: 'Hecha ayer', completedAt: noon('2026-09-28'), completedOn: '2026-09-28' }),
          makeTask({ id: 'b', title: 'Hecha hoy', completedAt: noon(TEST_TODAY), completedOn: TEST_TODAY }),
        ],
      },
      '#/reportes',
    );
    expect(await screen.findByText('Hecha ayer')).toBeInTheDocument();
    expect(screen.getByText('Hecha hoy')).toBeInTheDocument();
    expect(screen.getByText(/Hoy · Martes 29 de septiembre/)).toBeInTheDocument();
    expect(container.querySelector('[aria-label="Tareas completadas por día"]')).not.toBeNull();
  });

  it('el tema es oscuro por defecto y se puede cambiar en Ajustes', async () => {
    const user = userEvent.setup();
    const { settingsRepository } = renderApp(undefined, '#/ajustes');

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    await user.click(await screen.findByRole('radio', { name: /Claro/ }));
    await waitFor(() => expect(document.documentElement.getAttribute('data-theme')).toBe('light'));
    expect(settingsRepository.current().theme).toBe('light');
  });

  it('borrar un proyecto manda sus tareas a la bandeja de entrada', async () => {
    const user = userEvent.setup();
    const { taskRepository, projectRepository } = renderApp(
      {
        projects: [{ id: 'work', name: 'Trabajo', color: '#3b82f6', order: 0, createdAt: 1, updatedAt: 1 }],
        tasks: [makeTask({ id: 'a', title: 'Reunión', projectId: 'work' })],
      },
      '#/proyecto/work',
    );
    await screen.findByText('Reunión');
    await user.click(screen.getByRole('button', { name: 'Editar proyecto' }));
    await user.click(screen.getByRole('button', { name: 'Eliminar' }));
    await user.click(screen.getByRole('button', { name: 'Sí, eliminar' }));

    await waitFor(() => expect(projectRepository.snapshot()).toHaveLength(0));
    expect(taskRepository.snapshot()[0]?.projectId).toBe('inbox');
  });
});
