import { z } from 'zod';

export const createVerseSchema = z.object({
  bookTitle: z.string().trim().min(1, 'Укажи название книги').max(120, 'Название слишком длинное'),
  chapter: z.string().trim().max(120, 'Название главы слишком длинное'),
  verseNumber: z.string().trim().min(1, 'Укажи номер стиха').max(50, 'Номер стиха слишком длинный'),
  sanskritCyrillic: z.string().min(1, 'Добавь текст стиха').max(5000, 'Текст стиха слишком длинный'),
  translation: z.string().min(1, 'Добавь перевод').max(10000, 'Перевод слишком длинный'),
});
