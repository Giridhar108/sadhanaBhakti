import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useUiStore } from '../../app/store/useUiStore';
import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import { ModulePage } from '../ModulePage/ModulePage';
import panelStyles from '../ModulePage/modulePanels.module.css';

const settingsSchema = z.object({
  dailyReminder: z.string().min(4),
  dailyGoal: z.coerce.number().min(1).max(64),
});

type SettingsForm = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  useDocumentTitle('Настройки - Путь практики');
  const theme = useUiStore((state) => state.theme);
  const setTheme = useUiStore((state) => state.setTheme);
  const { register, handleSubmit } = useForm<SettingsForm>({
    defaultValues: {
      dailyReminder: '05:30',
      dailyGoal: 16,
    },
  });

  const onSubmit = (data: SettingsForm) => {
    settingsSchema.parse(data);
  };

  return (
    <ModulePage
      eyebrow="Система"
      title="Настройки"
      description="Локальные настройки интерфейса и будущая точка подключения `/settings` на backend."
      metrics={[
        { label: 'тема', value: theme === 'soft' ? 'soft' : 'light', tone: 'violet' },
        { label: 'цель', value: '16', tone: 'green' },
        { label: 'напоминания', value: '2', tone: 'gold' },
      ]}
      aside={
        <article className={panelStyles.panel}>
          <h3>Валидация</h3>
          <p>Форма уже использует React Hook Form и Zod, как заложено в архитектуре.</p>
        </article>
      }
    >
      <form className={`${panelStyles.panel} ${panelStyles.stack}`} onSubmit={handleSubmit(onSubmit)}>
        <h2>Практика</h2>
        <label className={panelStyles.field}>
          <span>Ежедневное напоминание</span>
          <input {...register('dailyReminder')} />
        </label>
        <label className={panelStyles.field}>
          <span>Цель кругов</span>
          <input type="number" {...register('dailyGoal')} />
        </label>
        <button className={panelStyles.button} type="submit">Сохранить настройки</button>
      </form>
      <article className={panelStyles.panel}>
        <h2>Тема</h2>
        <div className={panelStyles.stack}>
          <button className={theme === 'soft' ? panelStyles.button : panelStyles.buttonSecondary} type="button" onClick={() => setTheme('soft')}>
            Мягкая
          </button>
          <button className={theme === 'light' ? panelStyles.button : panelStyles.buttonSecondary} type="button" onClick={() => setTheme('light')}>
            Светлая
          </button>
        </div>
      </article>
    </ModulePage>
  );
}
