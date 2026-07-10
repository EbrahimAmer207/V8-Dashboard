export const SESSION_STATUSES = ['Scheduled', 'Live', 'Completed', 'Cancelled'] as const;
export type SessionStatus = (typeof SESSION_STATUSES)[number];

export const CLINICAL_SESSION_TYPES = [
  'Individual',
  'Group',
  'Couple',
  'Video',
  'Consultation',
  'Podcast',
] as const;

const LEGACY_STATUS_TYPES = new Set<string>(['Cancelled', 'Completed']);

/** Encodes clinical type + admin status in SessionType (no DB migration). */
export function encodeSessionType(clinicalType: string, status: SessionStatus): string {
  const type = clinicalType?.trim() || 'Individual';
  const st = SESSION_STATUSES.includes(status as SessionStatus) ? status : 'Scheduled';
  return `${type}|${st}`;
}

export function decodeSessionType(
  rawType: string | null | undefined,
  isStarted: boolean,
): { clinicalType: string; status: SessionStatus } {
  const raw = (rawType ?? '').trim() || 'Individual';

  if (raw.includes('|')) {
    const [clinicalType, statusPart] = raw.split('|');
    const status = SESSION_STATUSES.includes(statusPart as SessionStatus)
      ? (statusPart as SessionStatus)
      : isStarted
        ? 'Live'
        : 'Scheduled';
    return {
      clinicalType: clinicalType?.trim() || 'Individual',
      status,
    };
  }

  if (LEGACY_STATUS_TYPES.has(raw)) {
    return { clinicalType: 'Individual', status: raw as SessionStatus };
  }

  if (isStarted) {
    return { clinicalType: raw, status: 'Live' };
  }

  return { clinicalType: raw, status: 'Scheduled' };
}

export function statusToFlags(status: SessionStatus): { isStarted: boolean } {
  return { isStarted: status === 'Live' };
}
