import { PracticeCard, type PracticeCardData } from '../PracticeCard/PracticeCard';
import styles from './PracticeCardsGrid.module.css';

const cards: PracticeCardData[] = [
  {
    title: 'Джапа',
    icon: 'mala',
    tone: 'green',
    current: '12',
    ringLabel: '/ 16\nкругов',
    goalLabel: 'Следующая цель',
    goalValue: '16 кругов',
    progress: 75,
    stats: [
      { label: 'Сегодня', value: '192' },
      { label: 'Дней подряд', value: '25', suffix: '🔥' },
    ],
    actionLabel: 'Добавить круг',
  },
  {
    title: 'Чтение книг',
    icon: 'book',
    tone: 'purple',
    current: '120',
    ringLabel: '/ 200\nстр.',
    goalLabel: 'Цель на сегодня',
    goalValue: '200 стр.',
    progress: 60,
    stats: [
      { label: 'Сегодня', value: '8' },
      { label: 'Дней подряд', value: '14', suffix: '🔥' },
    ],
    actionLabel: 'Добавить чтение',
  },
  {
    title: 'Изучение стихов',
    icon: 'scroll',
    tone: 'gold',
    current: '3',
    ringLabel: '/ 5\nстихов',
    goalLabel: 'Цель на сегодня',
    goalValue: '5 стихов',
    progress: 60,
    stats: [
      { label: 'Выучено стихов', value: '28' },
      { label: 'Дней подряд', value: '11', suffix: '🔥' },
    ],
    actionLabel: 'Добавить стих',
  },
];

export function PracticeCardsGrid() {
  return (
    <section className={styles.grid}>
      {cards.map((card) => <PracticeCard key={card.title} card={card} />)}
    </section>
  );
}
