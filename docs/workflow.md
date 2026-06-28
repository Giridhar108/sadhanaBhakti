# Workflow

## Правка отдельного компонента

1. Открыть страницу `/ ?preview=components` без пробела: `/?preview=components`.
2. Найти нужный компонент.
3. Править только его папку в `src/widgets/` или `src/shared/ui/`.
4. Проверить компонент отдельно.
5. Проверить общий dashboard на `/`.

## Пример

Задача: «Поработаем над карточкой Джапа».

Правим только:

```txt
src/widgets/PracticeCard/PracticeCard.tsx
src/widgets/PracticeCard/PracticeCard.module.css
```

или данные этой карточки в:

```txt
src/widgets/PracticeCardsGrid/PracticeCardsGrid.tsx
```

Если нужно поменять общие цвета — только тогда трогаем:

```txt
src/shared/styles/tokens.css
```
