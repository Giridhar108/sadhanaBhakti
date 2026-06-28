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
      { label: 'Сегодня', value: '12' },
      { label: 'Осталось', value: '4' },
      { label: 'Серия', value: '25' },
    ],
    actionLabel: 'Добавить круг',
  },
  {
    title: 'Чтение книг',
    icon: 'book',
    tone: 'purple',
    current: '18',
    ringLabel: '/ 30\nстр.',
    goalLabel: 'Цель на день',
    goalValue: '30 страниц',
    progress: 60,
    stats: [
      { label: 'Книга', value: 'БГ' },
      { label: 'Неделя', value: '94' },
      { label: 'Серия', value: '12' },
    ],
    actionLabel: 'Отметить чтение',
  },
  {
    title: 'Стихи',
    icon: 'scroll',
    tone: 'gold',
    current: '3',
    ringLabel: '/ 5\nстихов',
    goalLabel: 'Цель недели',
    goalValue: '5 стихов',
    progress: 60,
    stats: [
      { label: 'Учишь', value: '3' },
      { label: 'Повтор', value: '8' },
      { label: 'Серия', value: '9' },
    ],
    actionLabel: 'Повторить стих',
  },
];

export function PracticeCardsGrid() {
  return (
    <section className={styles.grid}>
      {cards.map((card) => <PracticeCard key={card.title} card={card} />)}
    </section>
  );
}
