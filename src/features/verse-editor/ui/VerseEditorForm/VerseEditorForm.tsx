import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import type { VerseEditorValues } from '../../../../entities/verse';
import { createVerseSchema } from '../../model/createVerseSchema';
import { normalizeMultilineText } from '../../model/normalizeMultilineText';
import type { VerseEditorFormProps } from '../../model/types';
import { VerseLivePreview } from '../VerseLivePreview/VerseLivePreview';
import styles from './VerseEditorForm.module.css';

const emptyValues: VerseEditorValues = {
  bookTitle: '',
  chapter: '',
  verseNumber: '',
  sanskritCyrillic: '',
  translation: '',
};

const resizeTextarea = (element: HTMLTextAreaElement) => {
  element.style.height = 'auto';
  element.style.height = `${Math.min(element.scrollHeight, 520)}px`;
};

export function VerseEditorForm({
  mode,
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: VerseEditorFormProps) {
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const firstTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm<VerseEditorValues>({
    defaultValues: initialValues ?? emptyValues,
  });
  const values = watch();
  const sanskritRegistration = register('sanskritCyrillic');
  const translationRegistration = register('translation');

  useEffect(() => {
    if (initialValues) reset(initialValues);
  }, [initialValues, reset]);

  useEffect(() => {
    if (firstTextareaRef.current) resizeTextarea(firstTextareaRef.current);
  }, [initialValues]);

  const submitForm = (rawValues: VerseEditorValues) => {
    const normalizedValues: VerseEditorValues = {
      bookTitle: rawValues.bookTitle.trim(),
      chapter: rawValues.chapter.trim(),
      verseNumber: rawValues.verseNumber.trim(),
      sanskritCyrillic: normalizeMultilineText(rawValues.sanskritCyrillic),
      translation: normalizeMultilineText(rawValues.translation),
    };
    const result = createVerseSchema.safeParse(normalizedValues);

    if (!result.success) {
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof VerseEditorValues;
        setError(field, { type: 'validation', message: issue.message });
      });
      return;
    }

    onSubmit(result.data);
  };

  const requestCancel = () => {
    if (isDirty) {
      setShowDiscardDialog(true);
      return;
    }
    onCancel();
  };

  const textareaChange = (
    event: ChangeEvent<HTMLTextAreaElement>,
    originalChange: (event: ChangeEvent<HTMLTextAreaElement>) => void,
  ) => {
    originalChange(event);
    resizeTextarea(event.currentTarget);
  };

  const fieldDescription = (field: keyof VerseEditorValues) => {
    const error = errors[field];
    return error ? `${field}-hint ${field}-error` : `${field}-hint`;
  };

  return (
    <>
      <form className={styles.layout} onSubmit={handleSubmit(submitForm)} noValidate>
        <section className={styles.formCard}>
          <div className={styles.field}>
            <label htmlFor="bookTitle">Название книги</label>
            <input
              id="bookTitle"
              maxLength={120}
              placeholder="Например, Бхагавад-гита"
              aria-invalid={Boolean(errors.bookTitle)}
              aria-describedby={fieldDescription('bookTitle')}
              list="verse-book-suggestions"
              {...register('bookTitle')}
            />
            <datalist id="verse-book-suggestions">
              <option value="Бхагавад-гита" />
              <option value="Шримад-Бхагаватам" />
              <option value="Шри Ишопанишад" />
              <option value="Нектар наставлений" />
            </datalist>
            <small id="bookTitle-hint">Можно указать любую книгу, молитву или произведение.</small>
            <em id="bookTitle-error">{errors.bookTitle?.message ?? ''}</em>
          </div>

          <div className={styles.metadata}>
            <div className={styles.field}>
              <label htmlFor="chapter">Глава <span>необязательно</span></label>
              <input
                id="chapter"
                maxLength={120}
                placeholder="Например, 2"
                aria-invalid={Boolean(errors.chapter)}
                aria-describedby={fieldDescription('chapter')}
                {...register('chapter')}
              />
              <small id="chapter-hint">Можно написать «Введение» или другое название.</small>
              <em id="chapter-error">{errors.chapter?.message ?? ''}</em>
            </div>
            <div className={styles.field}>
              <label htmlFor="verseNumber">Номер стиха</label>
              <input
                id="verseNumber"
                maxLength={50}
                placeholder="Например, 23"
                aria-invalid={Boolean(errors.verseNumber)}
                aria-describedby={fieldDescription('verseNumber')}
                {...register('verseNumber')}
              />
              <small id="verseNumber-hint">Допустимы числа и текстовые обозначения.</small>
              <em id="verseNumber-error">{errors.verseNumber?.message ?? ''}</em>
            </div>
          </div>

          <div className={styles.field}>
            <div className={styles.labelRow}>
              <label htmlFor="sanskritCyrillic">Санскрит русскими буквами</label>
              <span>{values.sanskritCyrillic.length} / 5000</span>
            </div>
            <small id="sanskritCyrillic-hint">
              Вставь стих в том виде, в котором хочешь его изучать. Переносы строк сохранятся.
            </small>
            <textarea
              id="sanskritCyrillic"
              className={styles.sanskritInput}
              maxLength={5000}
              aria-invalid={Boolean(errors.sanskritCyrillic)}
              aria-describedby={fieldDescription('sanskritCyrillic')}
              {...sanskritRegistration}
              ref={(element) => {
                sanskritRegistration.ref(element);
                firstTextareaRef.current = element;
              }}
              onChange={(event) => textareaChange(event, sanskritRegistration.onChange)}
            />
            <em id="sanskritCyrillic-error">{errors.sanskritCyrillic?.message ?? ''}</em>
          </div>

          <div className={styles.field}>
            <div className={styles.labelRow}>
              <label htmlFor="translation">Перевод</label>
              <span>{values.translation.length} / 10000</span>
            </div>
            <small id="translation-hint">Добавь полный перевод стиха на русском языке.</small>
            <textarea
              id="translation"
              className={styles.translationInput}
              maxLength={10000}
              aria-invalid={Boolean(errors.translation)}
              aria-describedby={fieldDescription('translation')}
              {...translationRegistration}
              onChange={(event) => textareaChange(event, translationRegistration.onChange)}
            />
            <em id="translation-error">{errors.translation?.message ?? ''}</em>
          </div>

        </section>

        <details className={styles.previewColumn} open>
          <summary>Предварительный просмотр</summary>
          <VerseLivePreview values={values} />
        </details>

        <div className={styles.actions}>
          <button type="button" className={styles.cancelButton} onClick={requestCancel}>Отмена</button>
          <button type="submit" className={styles.saveButton} disabled={isSubmitting}>
            {isSubmitting ? 'Сохраняем...' : mode === 'create' ? 'Сохранить стих' : 'Сохранить изменения'}
          </button>
        </div>
      </form>

      {showDiscardDialog ? (
        <div className={styles.dialogBackdrop} role="presentation">
          <section className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="discard-title">
            <h2 id="discard-title">Не сохранять стих?</h2>
            <p>Введённые данные будут потеряны.</p>
            <div>
              <button type="button" onClick={() => setShowDiscardDialog(false)}>Продолжить редактирование</button>
              <button type="button" className={styles.dangerButton} onClick={onCancel}>Не сохранять</button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
