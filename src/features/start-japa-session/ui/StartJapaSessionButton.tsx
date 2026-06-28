import { useUiStore } from '../../../app/store/useUiStore';
import styles from '../../../pages/ModulePage/modulePanels.module.css';

export function StartJapaSessionButton() {
  const isActive = useUiStore((state) => state.isJapaSessionActive);
  const startJapaSession = useUiStore((state) => state.startJapaSession);
  const stopJapaSession = useUiStore((state) => state.stopJapaSession);

  return (
    <button className={isActive ? styles.buttonSecondary : styles.button} type="button" onClick={isActive ? stopJapaSession : startJapaSession}>
      {isActive ? 'Завершить сессию' : 'Начать джапу'}
    </button>
  );
}
