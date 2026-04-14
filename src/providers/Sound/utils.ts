export const toWindowWithWebkitAudio = (
  value: Window,
): Window & { webkitAudioContext?: typeof AudioContext } =>
  value as Window & { webkitAudioContext?: typeof AudioContext };
