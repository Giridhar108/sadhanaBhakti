import kaliImage from '../../../shared/assets/images/kali.jpg';
import styles from './KaliModal.module.css';

type KaliModalProps = {
  onClose: () => void;
};

export function KaliModal({ onClose }: KaliModalProps) {
  return (
    <div
      className={styles.kaliModalBackdrop}
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section className={styles.kaliModal} role="dialog" aria-modal="true" aria-labelledby="kali-modal-title">
        <img className={styles.kaliModalImage} src={kaliImage} alt="Кали-Сантарана-упанишада" />
      </section>
    </div>
  );
}
