import friend1 from '../../shared/assets/images/friend1.png';
import friend2 from '../../shared/assets/images/friend2.png';
import friend3 from '../../shared/assets/images/friend3.png';
import friend4 from '../../shared/assets/images/friend4.png';
import friend5 from '../../shared/assets/images/friend5.png';
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
  { name: 'Говинда дас', subtitle: '16 кругов сегодня', right: 'серия', value: '31 д.', img: friend1 },
  { name: 'Радха даси', subtitle: 'читает БГ', right: 'страниц', value: '24', img: friend2 },
  { name: 'Мадхава дас', subtitle: 'повторяет стихи', right: 'стихов', value: '5', img: friend3 },
  { name: 'Лалита даси', subtitle: '12 кругов сегодня', right: 'серия', value: '18 д.', img: friend4 },
  { name: 'Нитай дас', subtitle: 'мягкий ритм', right: 'дней', value: '9', img: friend5 },
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
