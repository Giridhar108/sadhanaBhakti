import { Card } from '../../shared/ui/Card/Card';
import styles from './FriendsCard.module.css';

type Friend = {
  name: string;
  subtitle: string;
  right: string;
  value: string;
  img: string;
};

const friends: Friend[] = [
  { name: 'Говинда дас', subtitle: '16 кругов сегодня', right: 'серия', value: '31 д.', img: '' },
  { name: 'Радха даси', subtitle: 'читает БГ', right: 'страниц', value: '24', img: '' },
  { name: 'Мадхава дас', subtitle: 'повторяет стихи', right: 'стихов', value: '5', img: '' },
  { name: 'Лалита даси', subtitle: '12 кругов сегодня', right: 'серия', value: '18 д.', img: '' },
  { name: 'Нитай дас', subtitle: 'мягкий ритм', right: 'дней', value: '9', img: '' },
];

export function FriendsCard() {
  return (
    <Card className={styles.panel}>
      <div className={styles.head}>
        <h2>Друзья</h2>
        <a href="#">Все</a>
      </div>

      <div className={styles.list}>
        {friends.map((friend) => (
          <div className={styles.friend} key={friend.name}>
            <img src={friend.img} alt={friend.name} />
            <div>
              <strong>{friend.name}</strong>
              <span>{friend.subtitle}</span>
            </div>
            <div className={styles.right}>{friend.right}<b>{friend.value}</b></div>
          </div>
        ))}
      </div>
    </Card>
  );
}
