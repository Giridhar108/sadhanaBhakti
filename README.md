# Hare Krishna Practice Dashboard

React + Vite + TypeScript версия dashboard для трекинга духовной практики.

## Запуск

```bash
npm install
npm run dev
```

Открыть dashboard:

```txt
http://localhost:5173/
```

Открыть страницу отдельных компонентов:

```txt
http://localhost:5173/?preview=components
```

## Как дальше работать

- Для общего экрана: `src/pages/DashboardPage/`
- Для отдельных компонентов: `src/widgets/` и `src/shared/ui/`
- Проектные правила: `AGENTS.md`
- Дизайн-система: `docs/design-system.md`
- Карта компонентов: `docs/components-map.md`

Главное правило итераций: когда правим один компонент, не трогаем остальные блоки без явной просьбы.

## UI baseline

- Шрифт: Nunito.
- Главный источник дизайн-токенов: `docs/design-system.md`.
- Визуальный референс дизайн-системы: `docs/assets/design-system-reference.png`.
