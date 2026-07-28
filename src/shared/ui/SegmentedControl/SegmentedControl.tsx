import type { KeyboardEvent } from 'react';
import styles from './SegmentedControl.module.css';

type SegmentedControlOption = {
  value: string;
  label: string;
};

type SegmentedControlProps = {
  value: string;
  options: SegmentedControlOption[];
  ariaLabel: string;
  onChange: (value: string) => void;
  className?: string;
};

export function SegmentedControl({
  value,
  options,
  ariaLabel,
  onChange,
  className,
}: SegmentedControlProps) {
  const selectAdjacent = (
    event: KeyboardEvent<HTMLButtonElement>,
    optionIndex: number,
  ) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;

    event.preventDefault();
    const lastIndex = options.length - 1;
    const nextIndex = event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? lastIndex
        : event.key === 'ArrowRight'
          ? (optionIndex + 1) % options.length
          : (optionIndex - 1 + options.length) % options.length;
    const nextOption = options[nextIndex];

    if (nextOption) {
      onChange(nextOption.value);
      event.currentTarget.parentElement
        ?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
        [nextIndex]?.focus();
    }
  };

  return (
    <div
      className={`${styles.control} ${className ?? ''}`}
      role="tablist"
      aria-label={ariaLabel}
    >
      {options.map((option, optionIndex) => {
        const isActive = option.value === value;

        return (
          <button
            className={isActive ? styles.active : ''}
            type="button"
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            key={option.value}
            onClick={() => onChange(option.value)}
            onKeyDown={(event) => selectAdjacent(event, optionIndex)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
