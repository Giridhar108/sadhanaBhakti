import { type ChangeEvent, type PointerEvent, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { useUiStore } from '../../app/store/useUiStore';
import { audioApi } from '../../entities/audio/api/audioApi';
import { audioTracksQueryKey, useAudioTracks } from '../../entities/audio/model/audioQueries';
import { maxUserAudioFileSize, maxUserAudioTracks } from '../../entities/audio/model/defaultAudioTracks';
import type { AudioTrack } from '../../entities/audio/model/types';
import { defaultGoals, defaultSettings, readAuthUser, writeAuthUser } from '../../entities/user/model/auth';
import type { AuthUser } from '../../entities/user/model/types';
import { endpoints } from '../../shared/api/endpoints';
import { httpClient } from '../../shared/api/httpClient';
import lotusSoft from '../../shared/assets/images/lotus-soft.png';
import {
  readCalendarEvents,
  type CalendarEvent,
  calendarEventsChanged,
} from '../../shared/lib/calendarEvents';
import {
  defaultDailyVerse,
  readDailyVerses,
  type DailyVerse,
  dailyVerseChanged,
} from '../../shared/lib/dailyVerse';
import { useDocumentTitle } from '../../shared/hooks/useDocumentTitle';
import { Icon } from '../../shared/ui/Icon/Icon';
import { ModulePage } from '../ModulePage/ModulePage';
import { SettingsCardHeader } from './components/SettingsCardHeader';
import {
  type AudioUploadDraft,
  type CropOffset,
  type DragState,
  type EventForm,
  type SettingsForm,
  type VerseForm,
  createCroppedCircle,
  cropFrameSize,
  eventSchema,
  eventTypeLabels,
  formatFileSize,
  getNextJapaGoalHistory,
  getTitleFromAudioFile,
  readFileAsDataUrl,
  settingsSchema,
  toDateKey,
  verseSchema,
} from './model/settingsPageModel';
import styles from './SettingsPage.module.css';

export default function SettingsPage() {
  useDocumentTitle('Настройки - Садхана Бхакти');
  const theme = useUiStore((state) => state.theme);
  const setTheme = useUiStore((state) => state.setTheme);
  const queryClient = useQueryClient();
  const [events, setEvents] = useState<CalendarEvent[]>(() => readCalendarEvents());
  const [dailyVerses, setDailyVerses] = useState<DailyVerse[]>(() => readDailyVerses());
  const [verseImage, setVerseImage] = useState<string | undefined>();
  const [editingVerseId, setEditingVerseId] = useState<string | null>(null);
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropOffset, setCropOffset] = useState<CropOffset>({ x: 0, y: 0 });
  const [authUser, setAuthUser] = useState(() => readAuthUser());
  const [practiceStatus, setPracticeStatus] = useState<string | null>(null);
  const [verseStatus, setVerseStatus] = useState<string | null>(null);
  const [audioDrafts, setAudioDrafts] = useState<AudioUploadDraft[]>([]);
  const [audioStatus, setAudioStatus] = useState<string | null>(null);
  const [isAudioUploading, setIsAudioUploading] = useState(false);
  const { data: audioTracks = [], isError: isAudioTracksError } = useAudioTracks();
  const userAudioTracks = audioTracks.filter((track) => !track.isDefault);
  const remainingAudioSlots = Math.max(0, maxUserAudioTracks - userAudioTracks.length - audioDrafts.length);
  const dragState = useRef<DragState | null>(null);
  const savedJapaGoal = authUser?.goals.japaRounds ?? defaultGoals.japaRounds;
  const savedDailyReminder = authUser?.settings.dailyReminder ?? defaultSettings.dailyReminder;
  const savedJapaStartDate = authUser?.settings.japaStartDate ?? '';

  const { register, handleSubmit, reset, watch, formState: { isSubmitting } } = useForm<SettingsForm>({
    defaultValues: {
      dailyReminder: savedDailyReminder,
      dailyGoal: savedJapaGoal,
      japaStartDate: savedJapaStartDate,
    },
  });
  const currentDailyGoal = watch('dailyGoal', savedJapaGoal);

  const {
    register: registerEvent,
    handleSubmit: handleEventSubmit,
    reset: resetEvent,
  } = useForm<EventForm>({
    defaultValues: {
      date: toDateKey(new Date()),
      title: '',
      type: 'japa',
    },
  });

  const {
    register: registerVerse,
    handleSubmit: handleVerseSubmit,
    reset: resetVerseForm,
    formState: { isSubmitting: isVerseSubmitting },
  } = useForm<VerseForm>({
    defaultValues: {
      text: '',
      source: '',
    },
  });

  useEffect(() => {
    if (authUser?.settings.theme) {
      setTheme(authUser.settings.theme);
    }
  }, [authUser?.settings.theme, setTheme]);

  useEffect(() => {
    setEvents(readCalendarEvents());
    setDailyVerses(readDailyVerses());
  }, []);

  useEffect(() => {
    if (isAudioTracksError) {
      setAudioStatus('Не удалось загрузить список аудио.');
    }
  }, [isAudioTracksError]);

  const onSubmit = async (data: SettingsForm) => {
    const settings = settingsSchema.parse(data);
    const currentUser = readAuthUser();

    if (!currentUser) {
      setPracticeStatus('Не удалось сохранить: пользователь не найден.');
      return;
    }

    setPracticeStatus(null);

    try {
      const nextJapaGoalHistory = getNextJapaGoalHistory(
        currentUser.settings.japaGoalHistory,
        currentUser.goals.japaRounds,
        settings.dailyGoal,
      );
      const user = await httpClient.patch<AuthUser>(endpoints.users.me, {
        goals: {
          ...currentUser.goals,
          japaRounds: settings.dailyGoal,
        },
        settings: {
          ...currentUser.settings,
          dailyReminder: settings.dailyReminder,
          japaStartDate: settings.japaStartDate || null,
          theme,
          japaGoalHistory: nextJapaGoalHistory,
        },
      });

      writeAuthUser(user);
      setAuthUser(user);
      reset({
        dailyReminder: settings.dailyReminder,
        dailyGoal: user.goals.japaRounds,
        japaStartDate: user.settings.japaStartDate ?? '',
      });
      setPracticeStatus('Практика сохранена.');
    } catch {
      setPracticeStatus('Не удалось сохранить практику. Проверь backend-сессию.');
    }
  };

  const saveSettingsPatch = async (settingsPatch: Partial<AuthUser['settings']>) => {
    const currentUser = readAuthUser();

    if (!currentUser) {
      setPracticeStatus('Не удалось сохранить: пользователь не найден.');
      return false;
    }

    try {
      const user = await httpClient.patch<AuthUser>(endpoints.users.me, {
        settings: {
          ...currentUser.settings,
          ...settingsPatch,
        },
      });

      writeAuthUser(user);
      setAuthUser(user);
      return true;
    } catch {
      setPracticeStatus('Не удалось сохранить настройки. Проверь backend-сессию.');
      return false;
    }
  };

  const saveTheme = async (nextTheme: 'light' | 'soft') => {
    setTheme(nextTheme);
    await saveSettingsPatch({ theme: nextTheme });
  };

  const onEventSubmit = (data: EventForm) => {
    const eventData = eventSchema.parse(data);
    const nextEvents = [
      ...events,
      {
        id: `${eventData.date}-${Date.now()}`,
        ...eventData,
      },
    ].sort((firstEvent, secondEvent) => firstEvent.date.localeCompare(secondEvent.date));

    setEvents(nextEvents);
    void saveSettingsPatch({ calendarEvents: nextEvents }).then((isSaved) => {
      if (isSaved) {
        window.dispatchEvent(new Event(calendarEventsChanged));
      }
    });
    resetEvent({ date: eventData.date, title: '', type: eventData.type });
  };

  const deleteEvent = (eventId: string) => {
    const nextEvents = events.filter((event) => event.id !== eventId);

    setEvents(nextEvents);
    void saveSettingsPatch({ calendarEvents: nextEvents }).then((isSaved) => {
      if (isSaved) {
        window.dispatchEvent(new Event(calendarEventsChanged));
      }
    });
  };

  const onVerseImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const image = await readFileAsDataUrl(file);
    setCropImage(image);
    setCropZoom(1);
    setCropOffset({ x: 0, y: 0 });
    event.target.value = '';
  };

  const onCropPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragState.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      offsetX: cropOffset.x,
      offsetY: cropOffset.y,
    };
  };

  const onCropPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const currentDrag = dragState.current;

    if (!currentDrag || currentDrag.pointerId !== event.pointerId) {
      return;
    }

    setCropOffset({
      x: currentDrag.offsetX + event.clientX - currentDrag.startX,
      y: currentDrag.offsetY + event.clientY - currentDrag.startY,
    });
  };

  const onCropPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (dragState.current?.pointerId === event.pointerId) {
      dragState.current = null;
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const saveCroppedImage = async () => {
    if (!cropImage) {
      return;
    }

    const croppedImage = await createCroppedCircle(cropImage, cropZoom, cropOffset);

    setVerseImage(croppedImage);
    setCropImage(null);
  };

  const onVerseSubmit = async (data: VerseForm) => {
    const verseResult = verseSchema.safeParse(data);

    if (!verseResult.success) {
      setVerseStatus('Заполни текст стиха и его источник.');
      return;
    }

    const verseData = verseResult.data;
    const editedVerse = editingVerseId
      ? dailyVerses.find((verse) => verse.id === editingVerseId)
      : undefined;
    const nextVerse: DailyVerse = {
      id: editedVerse?.id ?? `${Date.now()}`,
      image: verseImage ?? editedVerse?.image,
      ...verseData,
    };
    const nextVerses = editedVerse
      ? dailyVerses.map((verse) => (verse.id === editedVerse.id ? nextVerse : verse))
      : [...dailyVerses, nextVerse];
    setVerseStatus('Сохраняем стих...');
    const isSaved = await saveSettingsPatch({ dailyVerses: nextVerses });

    if (!isSaved) {
      setVerseStatus('Не удалось сохранить стих. Попробуй ещё раз.');
      return;
    }

    setDailyVerses(nextVerses);
    window.dispatchEvent(new Event(dailyVerseChanged));
    setVerseImage(undefined);
    setEditingVerseId(null);
    resetVerseForm({ text: '', source: '' });
    setVerseStatus(editedVerse ? 'Изменения сохранены.' : 'Стих сохранён.');
  };

  const resetDailyVerse = async () => {
    setVerseStatus('Очищаем список...');
    const isSaved = await saveSettingsPatch({ dailyVerses: [] });

    if (!isSaved) {
      setVerseStatus('Не удалось очистить список. Попробуй ещё раз.');
      return;
    }

    setDailyVerses([]);
    window.dispatchEvent(new Event(dailyVerseChanged));
    setVerseImage(undefined);
    setEditingVerseId(null);
    resetVerseForm({ text: '', source: '' });
    setVerseStatus('Список стихов очищен.');
  };

  const editDailyVerse = (verse: DailyVerse) => {
    setEditingVerseId(verse.id);
    setVerseImage(verse.image ?? (verse.id === defaultDailyVerse.id ? defaultDailyVerse.image : undefined));
    resetVerseForm({ text: verse.text, source: verse.source });
    setVerseStatus('Редактирование стиха.');
  };

  const cancelVerseEditing = () => {
    setEditingVerseId(null);
    setVerseImage(undefined);
    resetVerseForm({ text: '', source: '' });
    setVerseStatus(null);
  };

  const deleteDailyVerse = async (verseId: string) => {
    const nextVerses = dailyVerses.filter((verse) => verse.id !== verseId);
    setVerseStatus('Удаляем стих...');
    const isSaved = await saveSettingsPatch({ dailyVerses: nextVerses });

    if (!isSaved) {
      setVerseStatus('Не удалось удалить стих. Попробуй ещё раз.');
      return;
    }

    if (editingVerseId === verseId) {
      cancelVerseEditing();
    }
    setDailyVerses(nextVerses);
    window.dispatchEvent(new Event(dailyVerseChanged));
    setVerseStatus('Стих удалён.');
  };

  const onAudioFilesChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    if (files.length === 0) {
      return;
    }

    const validAudioFiles = files.filter((file) => file.type.startsWith('audio/'));
    const filesWithinSizeLimit = validAudioFiles.filter((file) => file.size <= maxUserAudioFileSize);
    const acceptedFiles = filesWithinSizeLimit.slice(0, remainingAudioSlots);

    setAudioDrafts((currentDrafts) => [
      ...currentDrafts,
      ...acceptedFiles.map((file, index) => ({
        id: `${file.name}-${file.lastModified}-${index}-${Date.now()}`,
        file,
        title: getTitleFromAudioFile(file.name),
        subtitle: 'Мягкое повторение',
      })),
    ]);

    if (validAudioFiles.length !== files.length) {
      setAudioStatus('Можно выбирать только аудиофайлы.');
    } else if (filesWithinSizeLimit.length !== validAudioFiles.length) {
      setAudioStatus('Размер одного аудиофайла не должен превышать 50 МБ.');
    } else if (acceptedFiles.length !== filesWithinSizeLimit.length) {
      setAudioStatus('Можно добавить не больше трёх своих аудиозаписей.');
    } else {
      setAudioStatus(null);
    }

    event.target.value = '';
  };

  const updateAudioDraft = (draftId: string, field: 'title' | 'subtitle', value: string) => {
    setAudioDrafts((currentDrafts) =>
      currentDrafts.map((draft) => (draft.id === draftId ? { ...draft, [field]: value } : draft)),
    );
  };

  const removeAudioDraft = (draftId: string) => {
    setAudioDrafts((currentDrafts) => currentDrafts.filter((draft) => draft.id !== draftId));
  };

  const uploadAudioDrafts = async () => {
    if (audioDrafts.length === 0) {
      setAudioStatus('Выбери аудиофайл.');
      return;
    }

    if (userAudioTracks.length + audioDrafts.length > maxUserAudioTracks) {
      setAudioStatus('Можно добавить не больше трёх своих аудиозаписей.');
      return;
    }

    if (audioDrafts.some((draft) => draft.file.size > maxUserAudioFileSize)) {
      setAudioStatus('Размер одного аудиофайла не должен превышать 50 МБ.');
      return;
    }

    const invalidDraft = audioDrafts.find((draft) => draft.title.trim().length < 2);

    if (invalidDraft) {
      setAudioStatus('У каждого аудио должно быть название.');
      return;
    }

    setIsAudioUploading(true);
    setAudioStatus(null);

    try {
      const uploadedTracks: AudioTrack[] = [];

      for (const draft of audioDrafts) {
        const track = await audioApi.upload({
          title: draft.title.trim(),
          subtitle: draft.subtitle.trim(),
          file: draft.file,
        });

        uploadedTracks.push(track);
        queryClient.setQueryData<AudioTrack[]>(audioTracksQueryKey, (currentTracks = []) => [
          ...currentTracks,
          track,
        ]);
      }

      setAudioDrafts([]);
      setAudioStatus(uploadedTracks.length === 1 ? 'Аудио загружено.' : 'Аудиозаписи загружены.');
    } catch {
      void queryClient.invalidateQueries({ queryKey: audioTracksQueryKey });
      setAudioStatus('Не удалось загрузить аудио. Проверь backend-сессию и формат файла.');
    } finally {
      setIsAudioUploading(false);
    }
  };

  const deleteAudioTrack = async (trackId: string) => {
    try {
      await audioApi.delete(trackId);
      queryClient.setQueryData<AudioTrack[]>(audioTracksQueryKey, (currentTracks = []) =>
        currentTracks.filter((track) => track.id !== trackId),
      );
      setAudioStatus('Аудио удалено.');
    } catch {
      setAudioStatus('Не удалось удалить аудио.');
    }
  };

  return (
    <ModulePage
      eyebrow="Личный ритм"
      title="Настройки"
      description="Тихое место для настройки практики, календаря, стиха дня и мягкого визуального режима."
      metrics={[
        { label: 'тема', value: theme === 'soft' ? 'soft' : 'light', tone: 'violet' },
        { label: 'цель кругов', value: String(currentDailyGoal || savedJapaGoal), tone: 'green' },
        { label: 'стихи', value: String(dailyVerses.length), tone: 'gold' },
      ]}
      aside={
        <aside className={styles.asideStack}>
          <article className={`${styles.devotionalNote} ${styles.goldNote}`}>
            <img src={lotusSoft} alt="" aria-hidden="true" />
            <span>Стих дня</span>
            <p>Добавленный стих сразу появится в нижнем блоке главной страницы.</p>
          </article>
          <article className={`${styles.devotionalNote} ${styles.violetNote}`}>
            <Icon name="calendar" />
            <span>Календарь</span>
            <p>События сохраняются локально и подсвечиваются в календаре практики.</p>
          </article>
        </aside>
      }
    >
      <section className={styles.settingsBoard}>
        <form className={`${styles.settingsCard} ${styles.practiceCard}`} onSubmit={handleSubmit(onSubmit)}>
          <SettingsCardHeader
            icon="target"
            title="Практика"
            description="Ежедневный ритм, напоминание и цель кругов."
            tone="green"
          />
          <img className={styles.cardLotus} src={lotusSoft} alt="" aria-hidden="true" />
          <div className={styles.formGrid}>
            <label className={styles.field}>
              <span>Ежедневное напоминание</span>
              <input {...register('dailyReminder')} />
            </label>
            <label className={styles.field}>
              <span>Цель кругов</span>
              <input type="number" {...register('dailyGoal')} />
            </label>
          </div>
          <div className={styles.japaStartBlock}>
            <label className={styles.field}>
              <span>Дата начала ежедневной практики</span>
              <input type="date" {...register('japaStartDate')} />
            </label>
          </div>
          <button className={styles.primaryButton} type="submit">
            {isSubmitting ? 'Сохраняем...' : 'Сохранить практику'}
          </button>
          {practiceStatus ? <p className={styles.statusText}>{practiceStatus}</p> : null}
        </form>

        <article className={`${styles.settingsCard} ${styles.audioSettingsCard} ${styles.wideCard}`}>
          <SettingsCardHeader
            icon="music"
            title="Аудио для джапы"
            description="Три записи Шрилы Прабхупады доступны всем. Дополнительно можно загрузить до трёх своих аудиозаписей размером не больше 50 МБ каждая."
            tone="violet"
          />
          <img className={styles.cardLotus} src={lotusSoft} alt="" aria-hidden="true" />
          <label className={`${styles.audioDropzone} ${remainingAudioSlots === 0 ? styles.audioDropzoneDisabled : ''}`}>
            <input
              type="file"
              accept="audio/*"
              multiple
              disabled={remainingAudioSlots === 0 || isAudioUploading}
              onChange={onAudioFilesChange}
            />
            <Icon name="plus" />
            <span>{remainingAudioSlots > 0 ? 'Выбрать аудиофайлы' : 'Лимит личных записей достигнут'}</span>
            <small>
              {remainingAudioSlots > 0
                ? `Осталось мест: ${remainingAudioSlots} · до 50 МБ на файл`
                : 'Чтобы загрузить другую запись, сначала удали одну из своих'}
            </small>
          </label>

          {audioDrafts.length > 0 ? (
            <div className={styles.audioDraftList}>
              {audioDrafts.map((draft) => (
                <div className={styles.audioDraft} key={draft.id}>
                  <div className={styles.audioFileMeta}>
                    <strong>{draft.file.name}</strong>
                    <small>{formatFileSize(draft.file.size)}</small>
                  </div>
                  <label className={styles.field}>
                    <span>Название</span>
                    <input value={draft.title} onChange={(event) => updateAudioDraft(draft.id, 'title', event.target.value)} />
                  </label>
                  <label className={styles.field}>
                    <span>Подпись</span>
                    <input value={draft.subtitle} onChange={(event) => updateAudioDraft(draft.id, 'subtitle', event.target.value)} />
                  </label>
                  <button className={styles.removeButton} type="button" onClick={() => removeAudioDraft(draft.id)}>
                    Убрать
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          <div className={styles.actions}>
            <button className={styles.primaryButton} type="button" onClick={uploadAudioDrafts} disabled={isAudioUploading}>
              {isAudioUploading ? 'Загружаем...' : 'Загрузить аудио'}
            </button>
            <button className={styles.secondaryButton} type="button" onClick={() => setAudioDrafts([])}>
              Очистить выбор
            </button>
          </div>
          {audioStatus ? <p className={styles.statusText}>{audioStatus}</p> : null}

          <div className={styles.audioTrackList}>
            {audioTracks.length > 0 ? (
              audioTracks.map((track) => (
                <div className={styles.audioTrackRow} key={track.id}>
                  <span>
                    <Icon name="music" />
                  </span>
                  <div>
                    <strong>{track.title}</strong>
                    <small>
                      {track.subtitle || track.originalName} · {formatFileSize(track.size)}
                    </small>
                  </div>
                  {track.isDefault ? (
                    <div className={styles.defaultAudioBadge}>По умолчанию</div>
                  ) : (
                    <button type="button" onClick={() => deleteAudioTrack(track.id)}>
                      Удалить
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p className={styles.emptyText}>Пока нет загруженного аудио. После загрузки треки появятся в плеере на странице джапы.</p>
            )}
          </div>
        </article>

        <form className={`${styles.settingsCard} ${styles.verseForm} ${styles.wideCard}`} onSubmit={handleVerseSubmit(onVerseSubmit)}>
          <SettingsCardHeader
            icon="lotus"
            title="Стих дня"
            description="Добавляй любое количество стихов: на главной они будут мягко сменяться каждые 2 минуты."
            tone="violet"
          />
          <img className={styles.cardLotus} src={lotusSoft} alt="" aria-hidden="true" />
          <div className={styles.verseLayout}>
            <div className={styles.imageColumn}>
              <label className={styles.filePicker}>
                <input type="file" accept="image/*" onChange={onVerseImageChange} />
                {verseImage ? <img className={styles.versePreview} src={verseImage} alt="" /> : <Icon name="plus" />}
                <span>{verseImage ? 'Изменить картинку' : 'Добавить картинку'}</span>
              </label>
            </div>
            <div className={styles.verseFields}>
              <label className={styles.field}>
                <span>Стих</span>
                <textarea className={styles.textarea} {...registerVerse('text')} />
              </label>
              <label className={styles.field}>
                <span>Откуда стих</span>
                <input placeholder="Например, Бхагавад-гита 2.47" {...registerVerse('source')} />
              </label>
            </div>
          </div>
          <div className={styles.actions}>
            <button className={styles.primaryButton} type="submit" disabled={isVerseSubmitting}>
              {isVerseSubmitting ? 'Сохраняем...' : editingVerseId ? 'Сохранить изменения' : 'Добавить стих'}
            </button>
            <button
              className={styles.secondaryButton}
              type="button"
              onClick={editingVerseId ? cancelVerseEditing : resetDailyVerse}
            >
              {editingVerseId ? 'Отменить редактирование' : 'Очистить список'}
            </button>
          </div>
          {verseStatus ? <p className={styles.statusText}>{verseStatus}</p> : null}
          <div className={styles.verseList}>
            {dailyVerses.length > 0 ? (
              dailyVerses.map((verse) => (
                <div className={styles.verseItem} key={verse.id}>
                  <img
                    src={verse.image ?? (verse.id === defaultDailyVerse.id ? defaultDailyVerse.image : lotusSoft)}
                    alt=""
                  />
                  <div>
                    <strong>{verse.text}</strong>
                    <small>{verse.source}</small>
                  </div>
                  <div className={styles.verseItemActions}>
                    <button type="button" onClick={() => editDailyVerse(verse)}>Редактировать</button>
                    <button type="button" onClick={() => deleteDailyVerse(verse.id)}>Удалить</button>
                  </div>
                </div>
              ))
            ) : (
              <p className={styles.emptyText}>Пока нет добавленных стихов. Блок стиха на главной будет скрыт.</p>
            )}
          </div>
        </form>

        <form className={`${styles.settingsCard} ${styles.eventForm}`} onSubmit={handleEventSubmit(onEventSubmit)}>
          <SettingsCardHeader
            icon="calendar"
            title="События календаря"
            description="Добавь памятные даты, экадаши, встречи и личные отметки."
            tone="gold"
          />
          <img className={styles.cardLotus} src={lotusSoft} alt="" aria-hidden="true" />
          <label className={styles.field}>
            <span>Дата</span>
            <input type="date" {...registerEvent('date')} />
          </label>
          <label className={styles.field}>
            <span>Название события</span>
            <input placeholder="Например, экадаши или встреча" {...registerEvent('title')} />
          </label>
          <label className={styles.field}>
            <span>Тип</span>
            <select className={styles.select} {...registerEvent('type')}>
              {Object.entries(eventTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <button className={styles.primaryButton} type="submit">
            Добавить событие
          </button>
        </form>

        <article className={styles.settingsCard}>
          <SettingsCardHeader
            icon="scroll"
            title="Мои события"
            description="Ближайшие сохраненные даты для практики."
            tone="violet"
          />
          <img className={styles.cardLotus} src={lotusSoft} alt="" aria-hidden="true" />
          <div className={styles.eventsList}>
            {events.length > 0 ? (
              events.map((event) => (
                <div className={styles.eventRow} key={event.id}>
                  <div>
                    <strong>{event.title}</strong>
                    <small>
                      {event.date} · {eventTypeLabels[event.type]}
                    </small>
                  </div>
                  <button type="button" onClick={() => deleteEvent(event.id)}>
                    Удалить
                  </button>
                </div>
              ))
            ) : (
              <p className={styles.emptyText}>Пока нет событий. Добавь первое, и день появится в календаре.</p>
            )}
          </div>
        </article>

        <article className={`${styles.settingsCard} ${styles.themeCard} ${styles.wideCard}`}>
          <SettingsCardHeader
            icon="settings"
            title="Внешний вид"
            description="Выбери мягкий режим оформления интерфейса."
            tone="green"
          />
          <img className={styles.cardLotus} src={lotusSoft} alt="" aria-hidden="true" />
          <div className={styles.themeOptions}>
            <button
              className={`${styles.themeOption} ${theme === 'soft' ? styles.themeActive : ''}`}
              type="button"
              onClick={() => void saveTheme('soft')}
            >
              <span>Мягкая</span>
              <small>Теплее, спокойнее, больше devotional-настроения.</small>
            </button>
            <button
              className={`${styles.themeOption} ${theme === 'light' ? styles.themeActive : ''}`}
              type="button"
              onClick={() => void saveTheme('light')}
            >
              <span>Светлая</span>
              <small>Чище и нейтральнее для ежедневной работы.</small>
            </button>
          </div>
        </article>
      </section>

      {cropImage ? (
        <div className={styles.modalOverlay} role="presentation">
          <div className={styles.cropModal} role="dialog" aria-modal="true" aria-label="Выбор круглой картинки">
            <h2>Выбери кружок</h2>
            <div
              className={styles.cropFrame}
              onPointerDown={onCropPointerDown}
              onPointerMove={onCropPointerMove}
              onPointerUp={onCropPointerUp}
              onPointerCancel={onCropPointerUp}
            >
              <img
                className={styles.cropImage}
                src={cropImage}
                alt=""
                draggable={false}
                style={{
                  transform: `translate(${cropOffset.x}px, ${cropOffset.y}px) scale(${cropZoom})`,
                }}
              />
            </div>
            <label className={styles.zoomField}>
              <span>Масштаб</span>
              <input
                type="range"
                min="1"
                max="2.6"
                step="0.05"
                value={cropZoom}
                onChange={(event) => setCropZoom(Number(event.target.value))}
              />
            </label>
            <div className={styles.actions}>
              <button className={styles.primaryButton} type="button" onClick={saveCroppedImage}>
                Сохранить кружок
              </button>
              <button className={styles.secondaryButton} type="button" onClick={() => setCropImage(null)}>
                Отмена
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </ModulePage>
  );
}
