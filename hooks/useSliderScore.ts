import { useCallback, useState } from "react";

const DEFAULT_MIN = 1;
const DEFAULT_MAX = 10;
const DEFAULT_THUMB = 34;

export function useSliderScore(
  initial = 8.9,
  opts?: { min?: number; max?: number; thumbSize?: number },
) {
  const min = opts?.min ?? DEFAULT_MIN;
  const max = opts?.max ?? DEFAULT_MAX;
  const thumbSize = opts?.thumbSize ?? DEFAULT_THUMB;

  const [score, setScore] = useState(initial);
  const [trackWidth, setTrackWidth] = useState(1);

  const scoreProgress = ((score - min) / (max - min)) * 100;

  const thumbLeft = Math.max(
    0,
    Math.min(
      (scoreProgress / 100) * trackWidth - thumbSize / 2,
      trackWidth - thumbSize,
    ),
  );

  const updateFromPosition = useCallback(
    (positionX: number) => {
      if (!trackWidth) return;
      const clamped = Math.min(Math.max(positionX, 0), trackWidth);
      const ratio = clamped / trackWidth;
      const next = min + ratio * (max - min);
      setScore(Number(next.toFixed(1)));
    },
    [trackWidth, min, max],
  );

  return {
    score,
    setScore,
    trackWidth,
    setTrackWidth,
    scoreProgress,
    thumbLeft,
    updateFromPosition,
    min,
    max,
    thumbSize,
  };
}
