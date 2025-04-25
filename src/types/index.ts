
export type DoctorGroup = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface Doctor {
  id: string;
  name: string;
  email: string;
  specialty: string;
  group_id: DoctorGroup;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Station {
  id: string;
  name: string;
  allowed_groups: DoctorGroup[];
  created_at?: string;
  updated_at?: string;
}

export type ShiftType = 'weekday' | 'weekend';

export interface Shift {
  id: string;
  station_id: string;
  doctor_id: string;
  date: string;
  start_time: string;
  end_time: string;
  type: ShiftType;
  created_at?: string;
  updated_at?: string;
}

export interface Schedule {
  id: string;
  month: number; // 0-11
  year: number;
  shifts: Shift[];
}

// Remove mock data as it's no longer needed
