import { Card } from '../../shared/ui/Card/Card';
import { Icon } from '../../shared/ui/Icon/Icon';
import styles from './ProgressChartCard.module.css';

export function ProgressChartCard() {
  return (
    <Card className={styles.panel}>
      <div className={styles.head}>
        <h2>Мой прогресс</h2>
        <div className={styles.tabs}>
          <span className={styles.active}>Неделя</span>
          <span>Месяц</span>
          <span>Год</span>
        </div>
        <div className={styles.select}>
          Все практики <Icon name="chevron" />
        </div>
      </div>

      <div className={styles.chartWrap}>
        <svg viewBox="0 0 880 170" role="img" aria-label="График прогресса">
          <line className={styles.axis} x1="40" y1="20" x2="850" y2="20" />
          <line className={styles.axis} x1="40" y1="56" x2="850" y2="56" />
          <line className={styles.axis} x1="40" y1="92" x2="850" y2="92" />
          <line className={styles.axis} x1="40" y1="128" x2="850" y2="128" />
          <text className={styles.axisText} x="0" y="23">100%</text>
          <text className={styles.axisText} x="9" y="59">75%</text>
          <text className={styles.axisText} x="9" y="95">50%</text>
          <text className={styles.axisText} x="9" y="131">25%</text>
          <text className={styles.axisText} x="16" y="158">0%</text>
          <path className={styles.lineGreen} d="M45 146 C80 134 104 103 145 90 C190 78 220 93 275 72 C335 48 370 77 438 51 C500 27 520 45 596 36 C650 29 694 36 750 26 C792 20 820 23 846 25" />
          <path className={styles.linePurple} d="M45 151 C95 123 114 121 145 110 C201 94 228 114 275 95 C338 71 354 88 438 80 C497 70 525 80 596 72 C655 65 699 72 750 64 C792 59 821 62 846 56" />
          <path className={styles.lineGold} d="M45 154 C92 139 110 133 145 125 C205 115 227 126 275 110 C332 91 367 102 438 94 C497 88 522 94 596 88 C653 82 701 85 750 80 C794 72 821 68 846 62" />
          <g fill="var(--green)">
            {[['45','146'],['145','90'],['275','72'],['438','51'],['596','36'],['750','26'],['846','25']].map(([cx, cy]) => <circle key={`${cx}-${cy}`} className={styles.point} cx={cx} cy={cy} r="5" />)}
          </g>
          <g fill="var(--violet)">
            {[['45','151'],['145','110'],['275','95'],['438','80'],['596','72'],['750','64'],['846','56']].map(([cx, cy]) => <circle key={`${cx}-${cy}`} className={styles.point} cx={cx} cy={cy} r="5" />)}
          </g>
          <g fill="var(--gold)">
            {[['45','154'],['145','125'],['275','110'],['438','94'],['596','88'],['750','80'],['846','62']].map(([cx, cy]) => <circle key={`${cx}-${cy}`} className={styles.point} cx={cx} cy={cy} r="5" />)}
          </g>
          <g className={styles.tooltip}>
            <rect x="670" y="60" width="112" height="78" rx="10" fill="#fffefa" stroke="#eadbd8" />
            <text x="682" y="80" fontSize="12" fontWeight="800" fill="#151019">19 мая</text>
            <circle cx="684" cy="99" r="4" fill="var(--green)" /><text x="696" y="102" fontSize="11" fill="#3d3543">Джапа</text><text x="757" y="102" fontSize="11" fontWeight="700" fill="#161019">85%</text>
            <circle cx="684" cy="116" r="4" fill="var(--violet)" /><text x="696" y="119" fontSize="11" fill="#3d3543">Чтение</text><text x="757" y="119" fontSize="11" fontWeight="700" fill="#161019">60%</text>
            <circle cx="684" cy="133" r="4" fill="var(--gold)" /><text x="696" y="136" fontSize="11" fill="#3d3543">Стихи</text><text x="757" y="136" fontSize="11" fontWeight="700" fill="#161019">70%</text>
          </g>
          <g className={styles.dateText}>
            <text x="34" y="166">13 мая</text><text x="138" y="166">14 мая</text><text x="268" y="166">15 мая</text><text x="430" y="166">16 мая</text><text x="588" y="166">17 мая</text><text x="742" y="166">18 мая</text><text x="835" y="166">19 мая</text>
          </g>
        </svg>
      </div>
      <div className={styles.legend}>
        <span><i className={styles.greenDot} />Джапа</span>
        <span><i className={styles.purpleDot} />Чтение книг</span>
        <span><i className={styles.goldDot} />Изучение стихов</span>
      </div>
    </Card>
  );
}
