import type { VerseEditorValues } from '../../../entities/verse';

export type VerseEditorMode = 'create' | 'edit';

export type VerseEditorFormProps = {
  mode: VerseEditorMode;
  initialValues?: VerseEditorValues;
  onSubmit: (values: VerseEditorValues) => void;
  onCancel: () => void;
  isSubmitting: boolean;
};

export type VerseReferenceInput = Pick<
  VerseEditorValues,
  'bookTitle' | 'chapter' | 'verseNumber'
>;
