import { useCallback, useEffect, useMemo, useRef } from "react";
import { useLocalStorage } from "@hooks";
import { useFeatureFlags } from "@providers/FeatureFlags";
import { SoundContext } from "./SoundContext";
import type { ProviderProps } from "../types";
import type {
  PlaySoundOptions,
  SoundContextType,
  SoundEvent,
  ToneDefinition,
} from "./types";
import {
  MIN_GAIN,
  DEFAULT_ATTACK_MS,
  DEFAULT_RELEASE_MS,
  SOUND_ENABLED_STORAGE_KEY,
  SOUND_VOLUME_STORAGE_KEY,
  SOUND_MUTED_STORAGE_KEY,
} from "./constants";
import { toWindowWithWebkitAudio } from "./utils";

const SoundProvider = ({ children }: ProviderProps) => {
  const [soundEnabled, setSoundEnabled] = useLocalStorage<boolean>(
    SOUND_ENABLED_STORAGE_KEY,
    true,
  );
  const [volume, setVolume] = useLocalStorage<number>(
    SOUND_VOLUME_STORAGE_KEY,
    100,
  );
  const [muted, setMuted] = useLocalStorage<boolean>(
    SOUND_MUTED_STORAGE_KEY,
    false,
  );
  const { soundEnabled: soundFeatureEnabled } = useFeatureFlags();
  const audioContextRef = useRef<AudioContext | null>(null);
  const hasUserInteractedRef = useRef(false);

  const getAudioContext = useCallback((): AudioContext | null => {
    if (typeof window === "undefined") {
      return null;
    }

    if (audioContextRef.current) {
      return audioContextRef.current;
    }

    const windowWithWebkitAudio = toWindowWithWebkitAudio(window);
    const AudioContextConstructor =
      window.AudioContext ?? windowWithWebkitAudio.webkitAudioContext;

    if (!AudioContextConstructor) {
      return null;
    }

    audioContextRef.current = new AudioContextConstructor();
    return audioContextRef.current;
  }, []);

  const unlockAudio = useCallback(() => {
    hasUserInteractedRef.current = true;
    const context = getAudioContext();

    if (!context || context.state !== "suspended") {
      return;
    }

    void context.resume().catch(() => undefined);
  }, [getAudioContext]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.addEventListener("pointerdown", unlockAudio, { passive: true });
    window.addEventListener("keydown", unlockAudio);
    window.addEventListener("touchstart", unlockAudio, { passive: true });

    return () => {
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
      window.removeEventListener("touchstart", unlockAudio);

      const context = audioContextRef.current;
      if (!context) {
        return;
      }

      void context.close().catch(() => undefined);
      audioContextRef.current = null;
    };
  }, [unlockAudio]);

  const scheduleTone = useCallback(
    (tone: ToneDefinition) => {
      const context = getAudioContext();

      if (!context) {
        return;
      }

      if (!hasUserInteractedRef.current && context.state === "suspended") {
        return;
      }

      if (context.state === "suspended") {
        void context.resume().catch(() => undefined);
      }

      const oscillatorNode = context.createOscillator();
      const gainNode = context.createGain();

      const delayMs = tone.delayMs ?? 0;
      const attackMs = tone.attackMs ?? DEFAULT_ATTACK_MS;
      const releaseMs = tone.releaseMs ?? DEFAULT_RELEASE_MS;

      const startTime = context.currentTime + delayMs / 1000;
      const attackEndTime = startTime + attackMs / 1000;
      const noteEndTime = attackEndTime + tone.durationMs / 1000;
      const releaseEndTime = noteEndTime + releaseMs / 1000;

      const scaledGain = tone.gain * (volume / 100);

      oscillatorNode.type = tone.waveform;
      oscillatorNode.frequency.setValueAtTime(tone.frequency, startTime);

      gainNode.gain.setValueAtTime(MIN_GAIN, startTime);
      gainNode.gain.linearRampToValueAtTime(scaledGain, attackEndTime);
      gainNode.gain.exponentialRampToValueAtTime(MIN_GAIN, releaseEndTime);

      oscillatorNode.connect(gainNode);
      gainNode.connect(context.destination);

      oscillatorNode.start(startTime);
      oscillatorNode.stop(releaseEndTime);
    },
    [getAudioContext, volume],
  );

  const playToneSequence = useCallback(
    (tones: ToneDefinition[], baseDelayMs: number) => {
      tones.forEach((tone) => {
        scheduleTone({
          ...tone,
          delayMs: baseDelayMs + (tone.delayMs ?? 0),
        });
      });
    },
    [scheduleTone],
  );

  const playSound = useCallback(
    (event: SoundEvent, options: PlaySoundOptions = {}) => {
      if (!soundFeatureEnabled || !soundEnabled || muted) {
        return;
      }

      const baseDelayMs = options.delayMs ?? 0;

      if (event === "letter_put") {
        playToneSequence(
          [
            {
              frequency: 720,
              durationMs: 28,
              gain: 0.03,
              waveform: "triangle",
            },
          ],
          baseDelayMs,
        );
        return;
      }

      if (event === "letter_delete") {
        playToneSequence(
          [{ frequency: 260, durationMs: 36, gain: 0.03, waveform: "square" }],
          baseDelayMs,
        );
        return;
      }

      if (event === "line_change") {
        playToneSequence(
          [
            {
              frequency: 480,
              durationMs: 32,
              gain: 0.03,
              waveform: "triangle",
            },
            {
              frequency: 620,
              durationMs: 34,
              gain: 0.028,
              waveform: "triangle",
              delayMs: 42,
            },
          ],
          baseDelayMs,
        );
        return;
      }

      if (event === "round_start") {
        playToneSequence(
          [
            {
              frequency: 440,
              durationMs: 72,
              gain: 0.028,
              waveform: "triangle",
            },
            {
              frequency: 554,
              durationMs: 72,
              gain: 0.028,
              waveform: "triangle",
              delayMs: 85,
            },
            {
              frequency: 659,
              durationMs: 90,
              gain: 0.03,
              waveform: "triangle",
              delayMs: 170,
            },
          ],
          baseDelayMs,
        );
        return;
      }

      if (event === "guess_invalid") {
        playToneSequence(
          [
            { frequency: 220, durationMs: 52, gain: 0.03, waveform: "square" },
            {
              frequency: 170,
              durationMs: 74,
              gain: 0.03,
              waveform: "square",
              delayMs: 45,
            },
          ],
          baseDelayMs,
        );
        return;
      }

      if (event === "hint_use") {
        playToneSequence(
          [
            {
              frequency: 600,
              durationMs: 52,
              gain: 0.03,
              waveform: "triangle",
            },
            {
              frequency: 840,
              durationMs: 58,
              gain: 0.03,
              waveform: "triangle",
              delayMs: 65,
            },
          ],
          baseDelayMs,
        );
        return;
      }

      if (event === "tile_present") {
        playToneSequence(
          [{ frequency: 520, durationMs: 46, gain: 0.03, waveform: "square" }],
          baseDelayMs,
        );
        return;
      }

      if (event === "tile_correct") {
        playToneSequence(
          [{ frequency: 760, durationMs: 54, gain: 0.032, waveform: "square" }],
          baseDelayMs,
        );
        return;
      }

      if (event === "tile_absent") {
        playToneSequence(
          [{ frequency: 180, durationMs: 58, gain: 0.025, waveform: "sine" }],
          baseDelayMs,
        );
        return;
      }

      if (event === "round_win") {
        playToneSequence(
          [
            {
              frequency: 523,
              durationMs: 90,
              gain: 0.028,
              waveform: "triangle",
            },
            {
              frequency: 659,
              durationMs: 90,
              gain: 0.028,
              waveform: "triangle",
              delayMs: 110,
            },
            {
              frequency: 784,
              durationMs: 110,
              gain: 0.03,
              waveform: "triangle",
              delayMs: 220,
            },
            {
              frequency: 1047,
              durationMs: 140,
              gain: 0.03,
              waveform: "triangle",
              delayMs: 360,
            },
          ],
          baseDelayMs,
        );
        return;
      }

      playToneSequence(
        [
          { frequency: 392, durationMs: 110, gain: 0.026, waveform: "sine" },
          {
            frequency: 311,
            durationMs: 110,
            gain: 0.026,
            waveform: "sine",
            delayMs: 120,
          },
          {
            frequency: 233,
            durationMs: 140,
            gain: 0.027,
            waveform: "sine",
            delayMs: 240,
          },
        ],
        baseDelayMs,
      );
    },
    [muted, playToneSequence, soundEnabled, soundFeatureEnabled],
  );

  const contextValue = useMemo<SoundContextType>(
    () => ({
      soundEnabled,
      setSoundEnabled,
      volume,
      setVolume,
      muted,
      setMuted,
      playSound,
    }),
    [
      muted,
      playSound,
      setMuted,
      setSoundEnabled,
      setVolume,
      soundEnabled,
      volume,
    ],
  );

  return (
    <SoundContext.Provider value={contextValue}>
      {children}
    </SoundContext.Provider>
  );
};

export { SoundProvider };
