import { ICommonRequestFields } from "./utils";

export type NylasEvent<T> = {
  start: any;
  end: any;
  busy: boolean;
  description: string | null;
  location: string | null;
  participants: EventParticipants[];
  title: string;
  updated_at: number;
  when: T;
  conferencing: object;
  recurrence?: Recurrence;
  metadata?: Record<string, string>;
  grant_id: string;
  calendar_id: string;
  ical_uid: string | null;
  id: string;
  original_start_time: string;
  object: "event";
  owner: string;
  organizer_email: string;
  organizer_name: string;
  read_only: boolean;
  status: "confirmed" | "cancelled" | "tenative";
  visibility: "private" | "public" | "normal";
};

export type NylasMessage = {
  snippet: string;
  id: string;
  to: any[];
  from: any[];
  cc: any[];
  bcc: any[];
  starred: boolean;
  unread: boolean;
  grant_id: string;
  files: any[];
  attachments: any[];
  body: string;
  subject: string;
  folders: any[];
  received_at: number;
  date: number;
};

export type EventTime = TimeSpan | Time | DateSpan | Date;

export type TimeSpan = {
  start_time: number;
  end_time: number;
  object: "timespan";
};
type Time = {
  time: number;
  timezone: string;
  object: "time";
};
type DateSpan = {
  start_date: string;
  end_date: string;
  object: "datespan";
};
type Date = {
  date: string;
  object: "date";
};

type Recurrence = {
  rrule: string[];
  timezone: string;
};

interface Grant {
  id: string;
  provider: string;
  grant_status: string;
  email: string;
}

type EventParticipants = {
  name: string;
  email: string;
  status: "yes" | "no" | "maybe" | "noreply";
  comment?: string;
  phone_number: string | null;
};

type GoogleLabel = {};
