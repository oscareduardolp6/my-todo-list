import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { makeTask } from '../../../../test/factories';
import { renderApp } from '../../../../test/render-app';
import { buildBackup, serializeBackup } from '../../domain/backup';

const project = { id: 'work', name: 'Trabajo', color: '#3b82f6', order: 0, createdAt: 1, updatedAt: 1 };
const fileOf = (content: string) => new File([content], 'respaldo.json', { type: 'application/json' });

describe('Respaldo en Ajustes', () => {
  it('exportar descarga un archivo con las tareas y proyectos actuales', async () => {
    const user = userEvent.setup();
    const { downloads } = renderApp({ tasks: [makeTask({ id: 'a', title: 'Pagar luz', projectId: 'work' })], projects: [project] }, '#/ajustes');

    await user.click(await screen.findByRole('button', { name: /Exportar/ }));

    await waitFor(() => expect(downloads).toHaveLength(1));
    expect(downloads[0]?.filename).toBe('todo-respaldo-2026-09-29.json');
    const saved = JSON.parse(downloads[0]?.content ?? '{}');
    expect(saved.tasks.map((t: { id: string }) => t.id)).toEqual(['a']);
    expect(saved.projects.map((p: { id: string }) => p.id)).toEqual(['work']);
  });

  it('importar pide confirmar y luego reemplaza todo', async () => {
    const user = userEvent.setup();
    const { taskRepository, projectRepository } = renderApp(
      { tasks: [makeTask({ id: 'vieja', title: 'Vieja' }), makeTask({ id: 'a', title: 'Antes' })], projects: [project] },
      '#/ajustes',
    );
    const backup = buildBackup([makeTask({ id: 'a', title: 'Del respaldo' }), makeTask({ id: 'nueva', title: 'Nueva' })], [], 5);

    await user.upload(await screen.findByLabelText('Archivo de respaldo'), fileOf(serializeBackup(backup)));
    expect(await screen.findByText(/2 tareas y 0 proyectos/)).toBeInTheDocument();
    expect(taskRepository.snapshot()).toHaveLength(2); // aún no se escribió nada

    await user.click(screen.getByRole('button', { name: 'Reemplazar todo' }));

    await waitFor(() => expect(taskRepository.snapshot().map((t) => t.id).sort()).toEqual(['a', 'nueva']));
    expect(taskRepository.snapshot().find((t) => t.id === 'a')?.title).toBe('Del respaldo');
    expect(projectRepository.snapshot()).toHaveLength(0);
  });

  it('un archivo inválido no escribe nada y avisa', async () => {
    const user = userEvent.setup();
    const { taskRepository } = renderApp({ tasks: [makeTask({ id: 'a' })] }, '#/ajustes');

    await user.upload(await screen.findByLabelText('Archivo de respaldo'), fileOf('{"hola":1}'));

    expect(await screen.findByText('El archivo no es un respaldo válido')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Reemplazar todo' })).toBeNull();
    expect(taskRepository.snapshot()).toHaveLength(1);
  });

  it('cancelar la confirmación no cambia nada', async () => {
    const user = userEvent.setup();
    const { taskRepository } = renderApp({ tasks: [makeTask({ id: 'a' })] }, '#/ajustes');

    await user.upload(await screen.findByLabelText('Archivo de respaldo'), fileOf(serializeBackup(buildBackup([], [], 5))));
    await user.click(await screen.findByRole('button', { name: 'Cancelar' }));

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(taskRepository.snapshot()).toHaveLength(1);
  });
});
