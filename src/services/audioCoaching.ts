// services/audioCoaching.ts
// Audio coaching cues during runs - voice alerts for pace, segments, milestones
import * as Speech from 'expo-speech';

export type CueType =
  | 'segment_start'
  | 'segment_end'
  | 'pace_too_fast'
  | 'pace_too_slow'
  | 'pace_on_target'
  | 'distance_milestone'
  | 'halfway'
  | 'final_push'
  | 'workout_complete'
  | 'heart_rate_high'
  | 'heart_rate_low';

export interface AudioCoachingSettings {
  enabled: boolean;
  volume: number;
  voiceRate: number;
  language: string;
  paceAlerts: boolean;
  segmentAlerts: boolean;
  distanceMilestones: boolean;
  heartRateAlerts: boolean;
  encouragement: boolean;
  paceAlertIntervalSeconds: number;
  distanceMilestoneKm: number;
}

export const DEFAULT_COACHING_SETTINGS: AudioCoachingSettings = {
  enabled: true,
  volume: 1.0,
  voiceRate: 1.0,
  language: 'en-IE',
  paceAlerts: true,
  segmentAlerts: true,
  distanceMilestones: true,
  heartRateAlerts: true,
  encouragement: true,
  paceAlertIntervalSeconds: 30,
  distanceMilestoneKm: 1,
};

function formatPace(paceMinPerKm: number): string {
  const mins = Math.floor(paceMinPerKm);
  const secs = Math.round((paceMinPerKm - mins) * 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) return `${hrs} hour${hrs > 1 ? 's' : ''} ${mins} minutes`;
  if (mins > 0) return `${mins} minute${mins > 1 ? 's' : ''} ${secs} seconds`;
  return `${secs} seconds`;
}

function buildMessage(
  cueType: CueType,
  context: {
    currentPace?: number;
    targetPace?: number;
    segmentName?: string;
    segmentDistance?: number;
    segmentPace?: number;
    distanceKm?: number;
    totalDistanceKm?: number;
    elapsedSeconds?: number;
    heartRate?: number;
    heartRateZone?: number;
    segmentNumber?: number;
    totalSegments?: number;
  }
): string {
  const { currentPace, targetPace, segmentName, segmentDistance, segmentPace,
    distanceKm, totalDistanceKm, elapsedSeconds, heartRate, heartRateZone,
    segmentNumber, totalSegments } = context;

  switch (cueType) {
    case 'segment_start': {
      const paceStr = segmentPace ? `Target pace: ${formatPace(segmentPace)} per K.` : '';
      const distStr = segmentDistance
        ? segmentDistance >= 1 ? `${segmentDistance} K.` : `${segmentDistance * 1000} metres.`
        : '';
      const segStr = segmentNumber && totalSegments ? `Segment ${segmentNumber} of ${totalSegments}.` : '';
      return `${segmentName || 'Next segment'}. ${distStr} ${paceStr} ${segStr}`;
    }
    case 'segment_end':
      return `Segment complete. ${segmentName ? `Nice work on the ${segmentName.toLowerCase()}.` : 'Well done.'}`;
    case 'pace_too_fast': {
      if (!currentPace || !targetPace) return 'Ease off the pace.';
      const diff = targetPace - currentPace;
      if (diff > 0.5) return `Way too fast at ${formatPace(currentPace)}. Target is ${formatPace(targetPace)}. Slow down.`;
      return `Slightly fast at ${formatPace(currentPace)}. Ease off to ${formatPace(targetPace)}.`;
    }
    case 'pace_too_slow': {
      if (!currentPace || !targetPace) return 'Pick it up a bit.';
      const diff = currentPace - targetPace;
      if (diff > 0.5) return `Dropped off to ${formatPace(currentPace)}. Need ${formatPace(targetPace)}. Push.`;
      return `Touch slow at ${formatPace(currentPace)}. Target is ${formatPace(targetPace)}.`;
    }
    case 'pace_on_target':
      return currentPace ? `On pace at ${formatPace(currentPace)}. Keep it steady.` : 'Pace is on target.';
    case 'distance_milestone': {
      if (!distanceKm) return '';
      const remaining = totalDistanceKm ? totalDistanceKm - distanceKm : null;
      const timeStr = elapsedSeconds ? `Time: ${formatDuration(elapsedSeconds)}.` : '';
      const remainStr = remaining && remaining > 0 ? `${remaining.toFixed(1)} K to go.` : '';
      return `${distanceKm} kilometres. ${timeStr} ${remainStr}`;
    }
    case 'halfway':
      return totalDistanceKm
        ? `Halfway. ${(totalDistanceKm / 2).toFixed(1)} K down, ${(totalDistanceKm / 2).toFixed(1)} to go.`
        : 'Halfway. Keep pushing.';
    case 'final_push': {
      const remaining = totalDistanceKm && distanceKm ? totalDistanceKm - distanceKm : null;
      if (remaining && remaining <= 0.5) return 'Final 500 metres. Give it everything.';
      if (remaining && remaining <= 1) return 'Last kilometre. Finish strong.';
      return 'Final stretch. Push through.';
    }
    case 'workout_complete': {
      const timeStr = elapsedSeconds ? `Total time: ${formatDuration(elapsedSeconds)}.` : '';
      const distStr = distanceKm ? `Distance: ${distanceKm.toFixed(2)} K.` : '';
      return `Workout complete. ${distStr} ${timeStr} Great session.`;
    }
    case 'heart_rate_high':
      return heartRate ? `Heart rate high at ${heartRate}. ${heartRateZone ? `Zone ${heartRateZone}.` : ''} Ease off.` : 'Heart rate elevated.';
    case 'heart_rate_low':
      return heartRate ? `Heart rate ${heartRate}. Room to push harder.` : 'Heart rate low.';
    default:
      return '';
  }
}

class AudioCoachingService {
  private settings: AudioCoachingSettings;
  private isSpeaking = false;
  private queue: string[] = [];
  private lastPaceAlertTime = 0;
  private lastDistanceMilestone = 0;
  private hasAnnouncedHalfway = false;

  constructor(settings?: Partial<AudioCoachingSettings>) {
    this.settings = { ...DEFAULT_COACHING_SETTINGS, ...settings };
  }

  updateSettings(settings: Partial<AudioCoachingSettings>) {
    this.settings = { ...this.settings, ...settings };
  }

  private async speak(message: string): Promise<void> {
    if (!this.settings.enabled || !message.trim()) return;
    if (this.isSpeaking) { this.queue.push(message); return; }
    this.isSpeaking = true;
    return new Promise((resolve) => {
      Speech.speak(message, {
        language: this.settings.language,
        rate: this.settings.voiceRate,
        volume: this.settings.volume,
        onDone: () => {
          this.isSpeaking = false;
          if (this.queue.length > 0) this.speak(this.queue.shift()!);
          resolve();
        },
        onError: () => { this.isSpeaking = false; resolve(); },
      });
    });
  }

  announceSegmentStart(ctx: { segmentName: string; segmentDistance?: number; segmentPace?: number; segmentNumber?: number; totalSegments?: number }) {
    if (!this.settings.segmentAlerts) return;
    this.speak(buildMessage('segment_start', ctx));
  }

  announceSegmentEnd(segmentName?: string) {
    if (!this.settings.segmentAlerts) return;
    this.speak(buildMessage('segment_end', { segmentName }));
  }

  checkPace(ctx: { currentPace: number; targetPace: number; targetPaceTolerance?: number; elapsedSeconds: number }) {
    if (!this.settings.paceAlerts) return;
    const now = ctx.elapsedSeconds;
    if (now - this.lastPaceAlertTime < this.settings.paceAlertIntervalSeconds) return;
    const tolerance = ctx.targetPaceTolerance ?? 0.15;
    const diff = ctx.currentPace - ctx.targetPace;
    let cueType: CueType;
    if (diff < -tolerance) cueType = 'pace_too_fast';
    else if (diff > tolerance) cueType = 'pace_too_slow';
    else {
      if (now - this.lastPaceAlertTime < this.settings.paceAlertIntervalSeconds * 3) return;
      cueType = 'pace_on_target';
    }
    this.lastPaceAlertTime = now;
    this.speak(buildMessage(cueType, { currentPace: ctx.currentPace, targetPace: ctx.targetPace }));
  }

  checkDistance(ctx: { distanceKm: number; totalDistanceKm: number; elapsedSeconds: number }) {
    if (!this.settings.distanceMilestones) return;
    const { distanceKm, totalDistanceKm, elapsedSeconds } = ctx;
    const nextMilestone = this.lastDistanceMilestone + this.settings.distanceMilestoneKm;
    if (distanceKm >= nextMilestone) {
      this.lastDistanceMilestone = Math.floor(distanceKm / this.settings.distanceMilestoneKm) * this.settings.distanceMilestoneKm;
      this.speak(buildMessage('distance_milestone', { distanceKm: this.lastDistanceMilestone, totalDistanceKm, elapsedSeconds }));
    }
    if (!this.hasAnnouncedHalfway && distanceKm >= totalDistanceKm / 2) {
      this.hasAnnouncedHalfway = true;
      this.speak(buildMessage('halfway', { totalDistanceKm }));
    }
    const remaining = totalDistanceKm - distanceKm;
    if (remaining <= 1 && remaining > 0.9) this.speak(buildMessage('final_push', { distanceKm, totalDistanceKm }));
    else if (remaining <= 0.5 && remaining > 0.4) this.speak(buildMessage('final_push', { distanceKm, totalDistanceKm }));
  }

  checkHeartRate(ctx: { heartRate: number; maxHeartRate: number }) {
    if (!this.settings.heartRateAlerts) return;
    const hrPercent = (ctx.heartRate / ctx.maxHeartRate) * 100;
    const zone = hrPercent >= 90 ? 5 : hrPercent >= 80 ? 4 : hrPercent >= 70 ? 3 : hrPercent >= 60 ? 2 : 1;
    if (hrPercent >= 92) this.speak(buildMessage('heart_rate_high', { heartRate: ctx.heartRate, heartRateZone: zone }));
  }

  announceWorkoutComplete(ctx: { elapsedSeconds: number; distanceKm?: number }) {
    this.speak(buildMessage('workout_complete', ctx));
  }

  reset() {
    this.lastPaceAlertTime = 0;
    this.lastDistanceMilestone = 0;
    this.hasAnnouncedHalfway = false;
    this.queue = [];
    Speech.stop();
    this.isSpeaking = false;
  }

  stop() {
    Speech.stop();
    this.isSpeaking = false;
    this.queue = [];
  }
}

export const audioCoaching = new AudioCoachingService();
export default AudioCoachingService;
