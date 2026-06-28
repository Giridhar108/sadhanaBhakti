import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import { ModulePage } from '../ModulePage/ModulePage';
import panelStyles from '../ModulePage/modulePanels.module.css';

export default function ProfilePage() {
  useDocumentTitle('Профиль - Путь практики');

  return (
    <ModulePage
      eyebrow="Профиль"
      title="Ананда дас"
      description="Личный кабинет для профиля, друзей и будущей загрузки изображений через signed upload URL."
      metrics={[
        { label: 'друзей', value: '5', tone: 'violet' },
        { label: 'кругов всего', value: '192', tone: 'green' },
        { label: 'дней практики', value: '31', tone: 'gold' },
      ]}
      aside={
        <article className={panelStyles.panel}>
          <h3>Хранение файлов</h3>
          <p>Загрузка изображений вынесена в отдельную feature-зону и позже подключится к Object Storage.</p>
        </article>
      }
    >
      <article className={panelStyles.panel}>
        <h2>Настройки профиля</h2>
        <div className={panelStyles.stack}>
          <label className={panelStyles.field}>
            <span>Имя</span>
            <input defaultValue="Ананда дас" />
          </label>
          <label className={panelStyles.field}>
            <span>Email</span>
            <input defaultValue="ananda@example.com" />
          </label>
          <button className={panelStyles.button} type="button">Сохранить</button>
        </div>
      </article>
    </ModulePage>
  );
}
