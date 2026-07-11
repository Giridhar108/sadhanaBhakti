-- Store the standard verse as real user data so users can edit or delete it.
ALTER TABLE "User"
ALTER COLUMN "dailyVerses"
SET DEFAULT '[{"id":"default-daily-verse","text":"Мой дорогой ум, ты избрал путь самосознания, однако, в своем безрассудстве ты считаешь, что купание в претенциозности, обмане и придирчивости, которые сродни ослиной моче, очень очищает.<br> Так ты губишь и себя, и меня. Прошу тебя, остановись! <br>Лучше давай погрузимся в океан нектара любовного служения лотосным стопам Шри&nbsp;Шри&nbsp;Гандхарвики&nbsp;Гиридхари и так принесем нам обоим нескончаемое счастье.","source":"Манах Шикша. Стих 6"}]'::jsonb;

-- Preserve an existing matching verse (including its uploaded image) and make
-- it the user's standard verse instead of adding a duplicate.
UPDATE "User"
SET "dailyVerses" = (
  SELECT jsonb_agg(
    CASE
      WHEN verse->>'text' LIKE 'Мой дорогой ум,%'
        THEN jsonb_set(verse, '{id}', '"default-daily-verse"'::jsonb)
      ELSE verse
    END
  )
  FROM jsonb_array_elements("dailyVerses") AS verse
)
WHERE NOT "dailyVerses" @> '[{"id":"default-daily-verse"}]'::jsonb
  AND EXISTS (
    SELECT 1
    FROM jsonb_array_elements("dailyVerses") AS verse
    WHERE verse->>'text' LIKE 'Мой дорогой ум,%'
  );

-- Add the standard verse to every remaining existing user.
UPDATE "User"
SET "dailyVerses" =
  '[{"id":"default-daily-verse","text":"Мой дорогой ум, ты избрал путь самосознания, однако, в своем безрассудстве ты считаешь, что купание в претенциозности, обмане и придирчивости, которые сродни ослиной моче, очень очищает.<br> Так ты губишь и себя, и меня. Прошу тебя, остановись! <br>Лучше давай погрузимся в океан нектара любовного служения лотосным стопам Шри&nbsp;Шри&nbsp;Гандхарвики&nbsp;Гиридхари и так принесем нам обоим нескончаемое счастье.","source":"Манах Шикша. Стих 6"}]'::jsonb
  || "dailyVerses"
WHERE NOT "dailyVerses" @> '[{"id":"default-daily-verse"}]'::jsonb;
