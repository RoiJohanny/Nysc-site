import { db } from './firebase';
import { doc, setDoc, getDocs, collection, deleteDoc } from 'firebase/firestore';

export interface NyscCalendarEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  startDate: string; // ISO string or YYYYMMDDTHHMMSSZ
  endDate: string;
  allDay?: boolean;
  eventType: 'cds' | 'clearance' | 'pop' | 'swearing_in' | 'custom';
  recurrenceRule?: string; // e.g. 'RRULE:FREQ=WEEKLY;BYDAY=TH'
  syncedToGoogle?: boolean;
  googleCalendarUrl?: string;
}

/**
 * Format date for Google Calendar Web Template: YYYYMMDDTHHMMSSZ or YYYYMMDD
 */
export function formatGoogleCalendarDate(dateStr: string, isAllDay: boolean = false): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';

  const pad = (n: number) => (n < 10 ? '0' + n : n.toString());
  const year = d.getUTCFullYear();
  const month = pad(d.getUTCMonth() + 1);
  const day = pad(d.getUTCDate());

  if (isAllDay) {
    return `${year}${month}${day}`;
  }

  const hours = pad(d.getUTCHours());
  const minutes = pad(d.getUTCMinutes());
  const seconds = pad(d.getUTCSeconds());
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

/**
 * Generates an instant, frictionless 1-tap "Add to Google Calendar" link
 */
export function createGoogleCalendarTemplateUrl(event: NyscCalendarEvent): string {
  const startFormatted = formatGoogleCalendarDate(event.startDate, event.allDay);
  const endFormatted = formatGoogleCalendarDate(event.endDate, event.allDay);

  const datesParam = `${startFormatted}/${endFormatted}`;
  const baseUrl = 'https://calendar.google.com/calendar/render';
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: datesParam,
    details: `${event.description}\n\nOrganized via My NYSC Companion PWA`,
    location: event.location
  });

  if (event.recurrenceRule) {
    params.set('recur', event.recurrenceRule);
  }

  return `${baseUrl}?${params.toString()}`;
}

/**
 * Generate default NYSC calendar events based on Corper profile and schedule
 */
export function generateDefaultNyscEvents(profile: {
  ppa_name: string;
  ppa_address: string;
  cds_group: string;
  swearing_in_date: string;
  pop_date: string;
  state_of_deployment: string;
  lga: string;
}): NyscCalendarEvent[] {
  const events: NyscCalendarEvent[] = [];

  // 1. Weekly CDS Meeting (e.g. Every Thursday 9:00 AM)
  const nextThursday = new Date();
  nextThursday.setDate(nextThursday.getDate() + ((4 + 7 - nextThursday.getDay()) % 7 || 7));
  nextThursday.setHours(9, 0, 0, 0);
  const thursEnd = new Date(nextThursday);
  thursEnd.setHours(12, 0, 0, 0);

  events.push({
    id: 'cds-weekly-meeting',
    title: `NYSC CDS: ${profile.cds_group}`,
    description: `Official Community Development Service (CDS) weekly attendance and community outreach meeting for ${profile.cds_group} in ${profile.lga} LGA.`,
    location: `${profile.lga} NYSC Secretariat, ${profile.state_of_deployment} State`,
    startDate: nextThursday.toISOString(),
    endDate: thursEnd.toISOString(),
    eventType: 'cds',
    recurrenceRule: 'RRULE:FREQ=WEEKLY;BYDAY=TH'
  });

  // 2. Monthly Biometric Clearance Window (1st to 25th of current/next month)
  const now = new Date();
  const clearanceStart = new Date(now.getFullYear(), now.getMonth(), 1, 8, 0, 0);
  const clearanceEnd = new Date(now.getFullYear(), now.getMonth(), 25, 17, 0, 0);

  events.push({
    id: 'monthly-biometric-clearance',
    title: 'NYSC Monthly Biometric Clearance Window',
    description: `Submit signed PPA employer endorsement letter and complete biometric thumbprint capture at ${profile.lga} LGI office to guarantee ₦77,000 monthly alawee disbursement.`,
    location: `${profile.lga} Local Government Inspector (LGI) Office, ${profile.state_of_deployment}`,
    startDate: clearanceStart.toISOString(),
    endDate: clearanceEnd.toISOString(),
    eventType: 'clearance',
    recurrenceRule: 'RRULE:FREQ=MONTHLY;BYMONTHDAY=1'
  });

  // 3. Passing Out Parade (POP)
  if (profile.pop_date) {
    const popStart = new Date(`${profile.pop_date}T08:00:00`);
    const popEnd = new Date(`${profile.pop_date}T16:00:00`);

    events.push({
      id: 'pop-graduation-day',
      title: 'NYSC Passing Out Parade (POP) & Certificate Collection',
      description: 'Grand ceremonial graduation parade, submission of final clearance, and collection of official NYSC Discharge Certificate!',
      location: `State Capital Parade Ground, ${profile.state_of_deployment} State`,
      startDate: popStart.toISOString(),
      endDate: popEnd.toISOString(),
      eventType: 'pop'
    });
  }

  // 4. Swearing-In Ceremony
  if (profile.swearing_in_date) {
    const swearStart = new Date(`${profile.swearing_in_date}T08:00:00`);
    const swearEnd = new Date(`${profile.swearing_in_date}T14:00:00`);

    events.push({
      id: 'swearing-in-ceremony',
      title: 'NYSC Camp Swearing-In Ceremony',
      description: 'Official swearing of the NYSC National Pledge and administration of oath by Chief Judge at Orientation Camp.',
      location: `NYSC Permanent Orientation Camp, ${profile.state_of_deployment} State`,
      startDate: swearStart.toISOString(),
      endDate: swearEnd.toISOString(),
      eventType: 'swearing_in'
    });
  }

  return events;
}

/**
 * Save Calendar Event to Firestore
 */
export async function saveCalendarEventToFirestore(userId: string, event: NyscCalendarEvent): Promise<void> {
  try {
    const docRef = doc(db, 'calendar_events', event.id);
    await setDoc(docRef, {
      ...event,
      user_id: userId,
      updated_at: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.error('Error saving event to Firestore:', error);
  }
}

/**
 * Generates an RFC 5545 iCalendar (.ics) string for importing into Google Calendar
 */
export function generateIcsCalendar(events: NyscCalendarEvent[]): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//My NYSC Companion//NONSGML v1.0//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ];

  events.forEach((event) => {
    const start = formatGoogleCalendarDate(event.startDate, event.allDay);
    const end = formatGoogleCalendarDate(event.endDate, event.allDay);
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${event.id}@mynysccompanion.ng`);
    lines.push(`DTSTAMP:${start}`);
    lines.push(`DTSTART:${start}`);
    lines.push(`DTEND:${end}`);
    lines.push(`SUMMARY:${event.title.replace(/[,;]/g, ' ')}`);
    lines.push(`DESCRIPTION:${event.description.replace(/[\n\r]+/g, ' ')}`);
    lines.push(`LOCATION:${event.location.replace(/[,;]/g, ' ')}`);
    if (event.recurrenceRule) {
      lines.push(event.recurrenceRule);
    }
    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}
