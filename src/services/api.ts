
/**
 * API service for making requests to the backend
 */

import { Doctor, Station, Shift, Schedule, ShiftType, DoctorGroup } from '@/types';
import { supabase } from '@/integrations/supabase/client';

// Base URL for API requests - would be replaced with actual backend URL
const API_URL = '/api';

// Headers for authenticated requests
const getAuthHeaders = () => {
  const user = localStorage.getItem('user');
  if (!user) return {};
  
  try {
    const parsedUser = JSON.parse(user);
    return {
      'Authorization': `Bearer ${parsedUser.token}`,
      'Content-Type': 'application/json'
    };
  } catch (error) {
    console.error('Failed to parse user data', error);
    return { 'Content-Type': 'application/json' };
  }
};

// API methods for doctors
export const doctorsApi = {
  // Get all doctors
  getAll: async (): Promise<Doctor[]> => {
    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .order('name');
      
    if (error) throw error;
    
    // Convert the numeric group_id to DoctorGroup type
    return (data || []).map(doc => ({
      ...doc,
      group_id: doc.group_id as DoctorGroup
    }));
  },
  
  // Get doctor by ID
  getById: async (id: string): Promise<Doctor | undefined> => {
    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error && error.code !== 'PGRST116') throw error;
    
    return data ? {
      ...data,
      group_id: data.group_id as DoctorGroup
    } : undefined;
  },
  
  // Create a new doctor
  create: async (doctor: Omit<Doctor, 'id' | 'created_at' | 'updated_at'>): Promise<Doctor> => {
    const { data, error } = await supabase
      .from('doctors')
      .insert({
        name: doctor.name,
        email: doctor.email,
        specialty: doctor.specialty,
        group_id: doctor.group_id,
        user_id: '00000000-0000-0000-0000-000000000000'
      })
      .select()
      .single();
      
    if (error) throw error;
    
    return {
      ...data,
      group_id: data.group_id as DoctorGroup
    };
  },
  
  // Update a doctor
  update: async (id: string, doctor: Partial<Doctor>): Promise<Doctor> => {
    const { data, error } = await supabase
      .from('doctors')
      .update(doctor)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    
    return {
      ...data,
      group_id: data.group_id as DoctorGroup
    };
  },
  
  // Delete a doctor
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('doctors')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
  }
};

// API methods for stations
export const stationsApi = {
  // Get all stations
  getAll: async (): Promise<Station[]> => {
    const { data, error } = await supabase
      .from('stations')
      .select('*')
      .order('name');
      
    if (error) throw error;
    
    return (data || []).map(station => ({
      ...station,
      allowed_groups: station.allowed_groups as DoctorGroup[]
    }));
  }
};

// API methods for shifts
export const shiftsApi = {
  // Get shifts for a specific month and year
  getByMonth: async (month: number, year: number): Promise<Shift[]> => {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    
    const { data, error } = await supabase
      .from('shifts')
      .select(`
        *,
        doctor:doctors(*),
        station:stations(*)
      `)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0]);
      
    if (error) throw error;
    
    return (data || []).map(shift => ({
      ...shift,
      type: shift.type as ShiftType,
      doctor: shift.doctor ? {
        ...shift.doctor,
        group_id: shift.doctor.group_id as DoctorGroup
      } : undefined,
      station: shift.station ? {
        ...shift.station,
        allowed_groups: shift.station.allowed_groups as DoctorGroup[]
      } : undefined
    }));
  }
};

// Create a new shift
export const createShift = async (
  station_id: string,
  doctor_id: string,
  date: string,
  start_time: string,
  end_time: string,
  type: ShiftType
): Promise<Shift> => {
  const { data, error } = await supabase
    .from('shifts')
    .insert({
      station_id,
      doctor_id,
      date,
      start_time,
      end_time,
      type
    })
    .select()
    .single();

  if (error) throw error;
  
  return {
    ...data,
    type: data.type as ShiftType
  };
};
