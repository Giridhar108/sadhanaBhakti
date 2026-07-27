import type { Verse } from './types';

export const verseCatalog: Verse[] = [
  {
    id: 'bhagavad-gita-2-27',
    source: 'bhagavadGita',
    sourceTitle: 'Бхагавад-гита',
    reference: '2.27',
    chapterTitle: 'Содержание Гиты в сжатом изложении',
    sanskritCyrillicLines: [
      'джатасйа хи дхруво мритйур',
      'дхрувам джанма мритасйа ча',
      'тасмад апарихарйе ’ртхе',
      'на твам шочитум архаси',
    ],
    translationLines: [
      'Тот, кто родился, обязательно умрёт,',
      'а после смерти вновь появится на свет.',
      'Поэтому исполняй свой долг',
      'и не предавайся скорби.',
    ],
    fullTranslation:
      'Тот, кто родился, обязательно умрёт, а после смерти вновь появится на свет. Поэтому исполняй свой долг и не предавайся скорби.',
    status: 'learning',
    progress: 36,
    nextReviewAt: new Date().toISOString().slice(0, 10),
    isFavorite: false,
  },
  {
    id: 'bhagavad-gita-3-27',
    source: 'bhagavadGita',
    sourceTitle: 'Бхагавад-гита',
    reference: '3.27',
    chapterTitle: 'Карма-йога',
    sanskritCyrillicLines: [
      'пракритех крийаманани',
      'гунаих кармани сарвашах',
      'аханкара-вимудхатма',
      'картахам ити манйате',
    ],
    translationLines: [
      'Душа, введённая в заблуждение ложным эго,',
      'считает себя совершающей действия,',
      'хотя на самом деле эти действия',
      'выполняются гунами материальной природы.',
    ],
    fullTranslation:
      'Душа, введённая в заблуждение ложным эго, считает себя совершающей действия, хотя на самом деле они выполняются гунами материальной природы.',
    status: 'new',
    progress: 0,
    isFavorite: false,
  },
];
