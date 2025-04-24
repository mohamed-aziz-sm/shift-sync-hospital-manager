
export type DoctorGroup = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface Doctor {
  id: string;
  name: string;
  email: string;
  specialty: string;
  group: DoctorGroup;
  unavailableDates: string[]; // ISO date strings
}

export interface Station {
  id: string;
  name: string;
  allowedGroups: DoctorGroup[];
}

export type ShiftType = 'weekday' | 'weekend';

export interface Shift {
  id: string;
  stationId: string;
  doctorId: string;
  date: string; // ISO date string
  startTime: string; // ISO datetime string
  endTime: string; // ISO datetime string
  type: ShiftType;
}

export interface Schedule {
  id: string;
  month: number; // 0-11
  year: number;
  shifts: Shift[];
}

// Mock data
export const STATIONS: Station[] = [
  {
    id: '1',
    name: 'Réanimation',
    allowedGroups: [1, 2],
  },
  {
    id: '2',
    name: 'Weaning',
    allowedGroups: [1, 2],
  },
  {
    id: '3',
    name: 'Urgence',
    allowedGroups: [1, 2, 3],
  },
  {
    id: '4',
    name: 'Périphérie',
    allowedGroups: [1, 2, 3, 4],
  },
  {
    id: '5',
    name: 'Visite MedI',
    allowedGroups: [1, 2, 3, 4, 5, 6, 7, 8],
  },
  {
    id: '6',
    name: 'Visite MedH',
    allowedGroups: [1, 2, 3, 4, 5, 6, 7, 8],
  },
];

export const MOCK_DOCTORS: Doctor[] = [
  {
    id: '1',
    name: 'Dr. John Doe',
    email: 'john.doe@hospital.com',
    specialty: 'Cardiology',
    group: 1,
    unavailableDates: [],
  },
  {
    id: '2',
    name: 'Dr. Jane Smith',
    email: 'jane.smith@hospital.com',
    specialty: 'Neurology',
    group: 2,
    unavailableDates: [],
  },
  {
    id: '3',
    name: 'Dr. Michael Johnson',
    email: 'michael.johnson@hospital.com',
    specialty: 'Pulmonology',
    group: 3,
    unavailableDates: [],
  },
  {
    id: '4',
    name: 'Dr. Sarah Williams',
    email: 'sarah.williams@hospital.com',
    specialty: 'Endocrinology',
    group: 4,
    unavailableDates: [],
  },
];
