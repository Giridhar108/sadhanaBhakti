export const normalizeMultilineText = (value: string): string =>
  value
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line: string): string => line.trimEnd())
    .join('\n')
    .trim();
