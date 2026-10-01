import { useMemo } from 'react';
import { useAppStore } from '../../../../app/store-context';
import { Sheet } from '../../../../shared/ui/Sheet';
import { quickDates } from '../../domain/quick-dates';
import { isRecurring } from '../../domain/task';
import { ReschedulePicker } from '../components/ReschedulePicker';

/** Hoja de reagendar (la abre deslizar una tarea a la izquierda). Siempre
 *  montada: se pinta solo si hay una tarea seleccionada. */
export function RescheduleContainer() {
  const taskId = useAppStore((s) => s.rescheduleTaskId);
  const tasks = useAppStore((s) => s.tasks);
  const today = useAppStore((s) => s.today);
  const weekStartsOn = useAppStore((s) => s.settings.weekStartsOn);
  const close = useAppStore((s) => s.closeReschedule);
  const rescheduleTask = useAppStore((s) => s.rescheduleTask);
  const task = taskId ? tasks.find((t) => t.id === taskId) : undefined;
  const options = useMemo(
    // Una recurrente exige fecha agendada: no se le ofrece "Sin fecha".
    () => quickDates(today, weekStartsOn).filter((o) => o.value !== null || !(task && isRecurring(task))),
    [today, weekStartsOn, task],
  );

  if (!task) return null;
  return (
    <Sheet title="Reagendar" onClose={close}>
      <ReschedulePicker
        title={task.title}
        current={task.scheduledFor}
        today={today}
        options={options}
        onPick={(date) => {
          rescheduleTask(task, date);
          close();
        }}
      />
    </Sheet>
  );
}
