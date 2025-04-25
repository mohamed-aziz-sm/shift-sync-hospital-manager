
/**
 * API service for making requests to the backend
 */

import { Doctor, Station, Shift, Schedule, ShiftType } from '@/types';
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
    return data || [];
  },
  
  // Get doctor by ID
  getById: async (id: string): Promise<Doctor | undefined> => {
    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },
  
  // Create a new doctor
  create: async (doctor: Omit<Doctor, 'id'>): Promise<Doctor> => {
    const { data, error } = await supabase
      .from('doctors')
      .insert(doctor)
      .select()
      .single();
      
    if (error) throw error;
    return data;
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
    return data;
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
    return data || [];
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
    return data || [];
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
  return data;
};
