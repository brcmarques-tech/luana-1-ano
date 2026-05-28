export const haptic = (pattern = 40) => {
  navigator.vibrate?.(pattern);
};

export const HAPTIC = {
  tap:         40,
  match:       [40, 30, 40],
  egg:         [60, 40, 80],
  achievement: [50, 50, 100],
  special:     [80, 60, 80, 60, 120],
};
