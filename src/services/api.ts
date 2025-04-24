
/**
 * API service for making requests to the backend
 * This is a placeholder for future backend integration
 */

import { Doctor, Shift, Schedule, Station } from '@/types';
import { MOCK_DOCTORS, STATIONS } from '@/types';

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

// Mock API response delay
const mockDelay = () => new Promise(resolve => setTimeout(resolve, 500));

// API methods for doctors
export const doctorsApi = {
  // Get all doctors
  getAll: async (): Promise<Doctor[]> => {
    await mockDelay();
    // This would be replaced with actual API call:
    // const response = await fetch(`${API_URL}/doctors`, { headers: getAuthHeaders() });
    // return response.json();
    return MOCK_DOCTORS;
  },
  
  // Get doctor by ID
  getById: async (id: string): Promise<Doctor | undefined> => {
    await mockDelay();
    // This would be replaced with actual API call:
    // const response = await fetch(`${API_URL}/doctors/${id}`, { headers: getAuthHeaders() });
    // return response.json();
    return MOCK_DOCTORS.find(doctor => doctor.id === id);
  },
  
  // Create a new doctor
  create: async (doctor: Omit<Doctor, 'id'>): Promise<Doctor> => {
    await mockDelay();
    // This would be replaced with actual API call:
    // const response = await fetch(`${API_URL}/doctors`, { 
    //   method: 'POST',
    //   headers: getAuthHeaders(),
    //   body: JSON.stringify(doctor)
    // });
    // return response.json();
    
    // Mock implementation
    const newDoctor = {
      ...doctor,
      id: `doctor-${Date.now()}`
    };
    return newDoctor;
  },
  
  // Update a doctor
  update: async (id: string, doctor: Partial<Doctor>): Promise<Doctor> => {
    await mockDelay();
    // This would be replaced with actual API call:
    // const response = await fetch(`${API_URL}/doctors/${id}`, { 
    //   method: 'PUT',
    //   headers: getAuthHeaders(),
    //   body: JSON.stringify(doctor)
    // });
    // return response.json();
    
    // Mock implementation
    const existingDoctor = MOCK_DOCTORS.find(d => d.id === id);
    if (!existingDoctor) {
      throw new Error('Doctor not found');
    }
    return { ...existingDoctor, ...doctor };
  },
  
  // Delete a doctor
  delete: async (id: string): Promise<void> => {
    await mockDelay();
    // This would be replaced with actual API call:
    // await fetch(`${API_URL}/doctors/${id}`, { 
    //   method: 'DELETE',
    //   headers: getAuthHeaders()
    // });
    
    // Mock implementation
    console.log(`Doctor ${id} would be deleted`);
  },
  
  // Update doctor availability
  updateAvailability: async (id: string, unavailableDates: string[]): Promise<Doctor> => {
    await mockDelay();
    // This would be replaced with actual API call:
    // const response = await fetch(`${API_URL}/doctors/${id}/availability`, { 
    //   method: 'PUT',
    //   headers: getAuthHeaders(),
    //   body: JSON.stringify({ unavailableDates })
    // });
    // return response.json();
    
    // Mock implementation
    const existingDoctor = MOCK_DOCTORS.find(d => d.id === id);
    if (!existingDoctor) {
      throw new Error('Doctor not found');
    }
    return { ...existingDoctor, unavailableDates };
  }
};

// API methods for stations
export const stationsApi = {
  // Get all stations
  getAll: async (): Promise<Station[]> => {
    await mockDelay();
    return STATIONS;
  }
};

// API methods for shifts
export const shiftsApi = {
  // Get shifts for a specific month and year
  getByMonth: async (month: number, year: number): Promise<Shift[]> => {
    await mockDelay();
    // This would be replaced with actual API call:
    // const response = await fetch(`${API_URL}/shifts?month=${month}&year=${year}`, { 
    //   headers: getAuthHeaders() 
    // });
    // return response.json();
    
    // Mock implementation - generate some random shifts
    const shifts: Shift[] = [];
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isWeekendDay = date.getDay() === 0 || date.getDay() === 6;
      
      // Create a shift for each station on this day
      STATIONS.forEach(station => {
        const randomDoctorIndex = Math.floor(Math.random() * MOCK_DOCTORS.length);
        const doctor = MOCK_DOCTORS[randomDoctorIndex];
        
        // Only assign a doctor if they are in an allowed group for this station
        if (station.allowedGroups.includes(doctor.group)) {
          let startTime, endTime;
          
          if (isWeekendDay) {
            // Weekend shift: 08:00 to 08:00 the next day
            startTime = `${year}-${month + 1}-${day}T08:00:00`;
            const nextDay = day + 1 > daysInMonth ? 1 : day + 1;
            const nextMonth = day + 1 > daysInMonth ? month + 1 : month;
            endTime = `${year}-${nextMonth + 1}-${nextDay}T08:00:00`;
          } else {
            // Weekday shift: 16:00 to 09:00 the next day
            startTime = `${year}-${month + 1}-${day}T16:00:00`;
            const nextDay = day + 1 > daysInMonth ? 1 : day + 1;
            const nextMonth = day + 1 > daysInMonth ? month + 1 : month;
            endTime = `${year}-${nextMonth + 1}-${nextDay}T09:00:00`;
          }
          
          shifts.push({
            id: `shift-${date.toISOString()}-${station.id}`,
            stationId: station.id,
            doctorId: doctor.id,
            date: `${year}-${month + 1}-${day}`,
            startTime,
            endTime,
            type: isWeekendDay ? 'weekend' : 'weekday',
          });
        }
      });
    }
    
    return shifts;
  },
  
  // Generate schedule for a specific month and year
  generateSchedule: async (month: number, year: number): Promise<Schedule> => {
    await mockDelay();
    // This would be replaced with actual API call:
    // const response = await fetch(`${API_URL}/schedules/generate`, { 
    //   method: 'POST',
    //   headers: getAuthHeaders(),
    //   body: JSON.stringify({ month, year })
    // });
    // return response.json();
    
    // Mock implementation
    const shifts = await shiftsApi.getByMonth(month, year);
    return {
      id: `schedule-${month}-${year}`,
      month,
      year,
      shifts
    };
  }
};

// Authentication API
export const authApi = {
  // Login user
  login: async (email: string, password: string) => {
    await mockDelay();
    // This would be replaced with actual API call:
    // const response = await fetch(`${API_URL}/auth/login`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ email, password })
    // });
    // return response.json();
    
    // Mock implementation - uses the mockUsers in AuthContext
    // The actual implementation would be done in the AuthContext
    return { message: 'Login would be handled by the backend' };
  },
  
  // Register user (admin only in a real implementation)
  register: async (userData: { name: string, email: string, password: string, role: 'admin' | 'doctor' }) => {
    await mockDelay();
    // This would be replaced with actual API call:
    // const response = await fetch(`${API_URL}/auth/register`, {
    //   method: 'POST',
    //   headers: getAuthHeaders(),
    //   body: JSON.stringify(userData)
    // });
    // return response.json();
    
    // Mock implementation
    return { message: 'Registration would be handled by the backend' };
  }
};
