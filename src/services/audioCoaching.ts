/**
 * Audio coaching service for real-time voice cues during runs.
 * Uses expo-speech for text-to-speech announcements.
 */

import type { RunSegment } from '@/types/workout';

export interface AudioCoachingConfig {
  enabled: boolean;
  paceAlerts: boolean;
  distanceAlerts: boolean;
  segmentAlerts: boolean;
  encouragement: boolean;
  voiceRate: number; // 0.5 - 2.0
}

const DEFAULT_CONFIG: AudioCoachingConfig = {
  enabled: true,
  paceAlerts: true,
  distanceAlerts: true,
  segmentAlerts: true,
  encouragement: true,
  voiceRate: 1.0,
};

let _speak: ((text: string, options?: { rate?: number }) => void) | null = null;

async function loadSpeech() {
  if (_speak) return;
  try {
    const Speech = await import('expo-speech');
    _speak = (text: string, options?: { rate?: number }) => {
      Speech.speak(text, {
        rate: options?.rate ?? 1.0,
        pitch: 1.0,
        language: 'en-US',
      });
    };
  } catch {
    // expo-speech not available, use no-op
    _speak = () => {};
  }
}

function speak(text: string, config: AudioCoachingConfig) {
  if (!config.enabled || !_speak) return;
  _speak(text, { rate: config.voiceRate });
}

function formatPaceForSpeech(paceMinPerKm: number): string {
  if (paceMinPerKm <= 0) return 'no pace data';
  const minutes = Math.floor(paceMinPerKm);
  const seconds = Math.round((paceMinPerKm - minutes) * 60);
  if (seconds === 0) return `${minutes} minutes per k`;
  return `${minutes} ${seconds} per k`;
}

function formatDistanceForSpeech(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} meters`;
  }
  const rounded = Math.round(km * 10) / 10;
  return `${rounded} k`;
}

class AudioCoachingService {
  private config: AudioCoachingConfig = { ...DEFAULT_CONFIG };
  private lastDistanceAnnouncement = 0;
  private lastPaceCheck = 0;
  private initialized = false;

  async initialize(config?: Partial<AudioCoachingConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
    await loadSpeech();
    this.initialized = true;
    this.lastDistanceAnnouncement = 0;
    this.lastPaceCheck = 0;
  }

  updateConfig(config: Partial<AudioCoachingConfig>) {
    this.config = { ...this.config, ...config };
  }

  getConfig(): AudioCoachingConfig {
    return { ...this.config };
  }

  announceSegmentStart(segment: RunSegment, segmentIndex: number, totalSegments: number) {
    if (!this.config.segmentAlerts) return;

    const typeNames: Record<string, string> = {
      warmup: 'warm up',
      interval: 'interval',
      recovery: 'recovery',
      steady: 'steady',
      tempo: 'tempo',
      cooldown: 'cool down',
      easy: 'easy',
    };

    const typeName = typeNames[segment.type] || segment.type;
    const targetPace = formatPaceForSpeech(segment.target_pace_min_km);
    const distance = formatDistanceForSpeech(segment.distance_km);

    let message = '';
    if (segmentIndex === 0) {
      message = `Starting your run. ${typeName} for ${distance} at ${targetPace}.`;
    } else if (segmentIndex === totalSegments - 1) {
      message = `Last segment. ${typeName} for ${distance} at ${targetPace}.`;
    } else {
      message = `Segment ${segmentIndex + 1}. ${typeName} for ${distance} at ${targetPace}.`;
    }

    speak(message, this.config);
  }

  checkPace(currentPace: number, targetPace: number, elapsedSeconds: number) {
    if (!this.config.paceAlerts) return;
    // Only check pace every 30 seconds
    if (elapsedSeconds - this.lastPaceCheck < 30) return;
    this.lastPaceCheck = elapsedSeconds;

    if (currentPace <= 0 || targetPace <= 0) return;

    const diff = currentPace - targetPace;
    const threshold = targetPace * 0.08; // 8% tolerance

    if (diff > threshold) {
      speak('Pick it up a little. You\'re behind target pace.', this.config);
    } else if (diff < -threshold) {
      speak('Ease up. You\'re ahead of target pace.', this.config);
    } else if (this.config.encouragement && Math.random() < 0.15) {
      const encouragements = [
        'Great pace. Keep it up.',
        'You\'re right on target.',
        'Looking strong.',
        'Perfect rhythm.',
      ];
      speak(encouragements[Math.floor(Math.random() * encouragements.length)], this.config);
    }
  }

  checkDistance(distanceKm: number, totalDistanceKm: number) {
    if (!this.config.distanceAlerts) return;

    // Announce every kilometer
    const currentKm = Math.floor(distanceKm);
    if (currentKm > this.lastDistanceAnnouncement && currentKm > 0) {
      this.lastDistanceAnnouncement = currentKm;
      const remaining = totalDistanceKm - distanceKm;

      if (remaining < 0.5) {
        speak(`${currentKm} k. Almost there. Less than 500 meters to go.`, this.config);
      } else {
        speak(`${currentKm} k completed. ${formatDistanceForSpeech(remaining)} remaining.`, this.config);
      }
    }
  }

  announceWorkoutComplete(durationSeconds: number, distanceKm: number) {
    const minutes = Math.floor(durationSeconds / 60);
    const distance = formatDistanceForSpeech(distanceKm);
    speak(
      `Workout complete. ${distance} in ${minutes} minutes. Great job.`,
      this.config,
    );
  }

  reset() {
    this.lastDistanceAnnouncement = 0;
    this.lastPaceCheck = 0;
  }
}

export const audioCoaching = new AudioCoachingService();
