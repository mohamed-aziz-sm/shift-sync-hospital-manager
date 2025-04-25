
import { supabase } from '@/integrations/supabase/client';

// Sample doctors grouped by their group number
const sampleDoctors = [
  // Group 1
  {
    name: 'Anna Müller',
    email: 'anna.mueller@hospital.com',
    specialty: 'Internal Medicine',
    group_id: 1
  },
  {
    name: 'Max Schmidt',
    email: 'max.schmidt@hospital.com',
    specialty: 'Surgery',
    group_id: 1
  },
  {
    name: 'Lisa Becker',
    email: 'lisa.becker@hospital.com',
    specialty: 'Cardiology',
    group_id: 1
  },
  {
    name: 'Paul Wagner',
    email: 'paul.wagner@hospital.com',
    specialty: 'Neurology',
    group_id: 1
  },
  {
    name: 'Julia Weber',
    email: 'julia.weber@hospital.com',
    specialty: 'Pediatrics',
    group_id: 1
  },
  {
    name: 'Tim Hoffmann',
    email: 'tim.hoffmann@hospital.com',
    specialty: 'Orthopedics',
    group_id: 1
  },
  {
    name: 'Laura Koch',
    email: 'laura.koch@hospital.com',
    specialty: 'Gynecology',
    group_id: 1
  },
  {
    name: 'Felix Bauer',
    email: 'felix.bauer@hospital.com',
    specialty: 'Urology',
    group_id: 1
  },
  
  // Group 2
  {
    name: 'Smati Dorra',
    email: 'smati.dorra@hospital.com',
    specialty: 'Internal Medicine',
    group_id: 2
  },
  {
    name: 'Jonas Schulz',
    email: 'jonas.schulz@hospital.com',
    specialty: 'Surgery',
    group_id: 2
  },
  {
    name: 'Emma Richter',
    email: 'emma.richter@hospital.com',
    specialty: 'Cardiology',
    group_id: 2
  },
  {
    name: 'Leon Wolf',
    email: 'leon.wolf@hospital.com',
    specialty: 'Neurology',
    group_id: 2
  },
  {
    name: 'Marie Neumann',
    email: 'marie.neumann@hospital.com',
    specialty: 'Pediatrics',
    group_id: 2
  },
  {
    name: 'Noah Hartmann',
    email: 'noah.hartmann@hospital.com',
    specialty: 'Orthopedics',
    group_id: 2
  },
  {
    name: 'Sophie Zimmermann',
    email: 'sophie.zimmermann@hospital.com',
    specialty: 'Gynecology',
    group_id: 2
  },
  {
    name: 'Ben Lehmann',
    email: 'ben.lehmann@hospital.com',
    specialty: 'Urology',
    group_id: 2
  },
  {
    name: 'Mia Krause',
    email: 'mia.krause@hospital.com',
    specialty: 'Dermatology',
    group_id: 2
  },
  {
    name: 'Larissa Goncharova',
    email: 'larissa.goncharova@hospital.com',
    specialty: 'Psychiatry',
    group_id: 2
  },
  {
    name: 'Sarah Schwarz',
    email: 'sarah.schwarz@hospital.com',
    specialty: 'Ophthalmology',
    group_id: 2
  },
  {
    name: 'Elias Lorenz',
    email: 'elias.lorenz@hospital.com',
    specialty: 'ENT',
    group_id: 2
  },
  {
    name: 'Hanna Braun',
    email: 'hanna.braun@hospital.com',
    specialty: 'Radiology',
    group_id: 2
  },
  
  // Group 3
  {
    name: 'Finn Werner',
    email: 'finn.werner@hospital.com',
    specialty: 'Internal Medicine',
    group_id: 3
  },
  {
    name: 'Clara Lange',
    email: 'clara.lange@hospital.com',
    specialty: 'Surgery',
    group_id: 3
  },
  {
    name: 'Tom Frank',
    email: 'tom.frank@hospital.com',
    specialty: 'Cardiology',
    group_id: 3
  },
  {
    name: 'Amelie Keller',
    email: 'amelie.keller@hospital.com',
    specialty: 'Neurology',
    group_id: 3
  },
  {
    name: 'David Roth',
    email: 'david.roth@hospital.com',
    specialty: 'Pediatrics',
    group_id: 3
  },
  {
    name: 'Johanna Seidel',
    email: 'johanna.seidel@hospital.com',
    specialty: 'Orthopedics',
    group_id: 3
  },
  {
    name: 'Louis Jäger',
    email: 'louis.jaeger@hospital.com',
    specialty: 'Gynecology',
    group_id: 3
  },
  {
    name: 'Ella Fuchs',
    email: 'ella.fuchs@hospital.com',
    specialty: 'Urology',
    group_id: 3
  },
  {
    name: 'Henry Weiß',
    email: 'henry.weiss@hospital.com',
    specialty: 'Dermatology',
    group_id: 3
  },
  {
    name: 'Lea Kuhn',
    email: 'lea.kuhn@hospital.com',
    specialty: 'Psychiatry',
    group_id: 3
  },
  {
    name: 'Julian Kraus',
    email: 'julian.kraus@hospital.com',
    specialty: 'Ophthalmology',
    group_id: 3
  },
  {
    name: 'Lina Martin',
    email: 'lina.martin@hospital.com',
    specialty: 'ENT',
    group_id: 3
  },
  {
    name: 'Anton Busch',
    email: 'anton.busch@hospital.com',
    specialty: 'Radiology',
    group_id: 3
  },
  
  // Group 4
  {
    name: 'Carla Albrecht',
    email: 'carla.albrecht@hospital.com',
    specialty: 'Internal Medicine',
    group_id: 4
  },
  {
    name: 'Theo Simon',
    email: 'theo.simon@hospital.com',
    specialty: 'Surgery',
    group_id: 4
  },
  {
    name: 'Nina Brandt',
    email: 'nina.brandt@hospital.com',
    specialty: 'Cardiology',
    group_id: 4
  },
  {
    name: 'Samuel Herrmann',
    email: 'samuel.herrmann@hospital.com',
    specialty: 'Neurology',
    group_id: 4
  },
  {
    name: 'Ida Vogel',
    email: 'ida.vogel@hospital.com',
    specialty: 'Pediatrics',
    group_id: 4
  },
  {
    name: 'Erik Schröder',
    email: 'erik.schroeder@hospital.com',
    specialty: 'Orthopedics',
    group_id: 4
  },
  // Group 4 duplicates from group 2
  {
    name: 'Emma Richter',
    email: 'emma.richter2@hospital.com',
    specialty: 'Gynecology',
    group_id: 4
  },
  {
    name: 'Leon Wolf',
    email: 'leon.wolf2@hospital.com',
    specialty: 'Urology',
    group_id: 4
  },
  
  // Group 5
  {
    name: 'Marie Neumann',
    email: 'marie.neumann2@hospital.com',
    specialty: 'Internal Medicine',
    group_id: 5
  },
  {
    name: 'Noah Hartmann',
    email: 'noah.hartmann2@hospital.com',
    specialty: 'Surgery',
    group_id: 5
  },
  {
    name: 'Sophie Zimmermann',
    email: 'sophie.zimmermann2@hospital.com',
    specialty: 'Cardiology',
    group_id: 5
  },
  {
    name: 'Ben Lehmann',
    email: 'ben.lehmann2@hospital.com',
    specialty: 'Neurology',
    group_id: 5
  },
  {
    name: 'Mia Krause',
    email: 'mia.krause2@hospital.com',
    specialty: 'Pediatrics',
    group_id: 5
  },
  
  // Group 6
  {
    name: 'Luca Schmid',
    email: 'luca.schmid@hospital.com',
    specialty: 'Internal Medicine',
    group_id: 6
  },
  {
    name: 'Sarah Schwarz',
    email: 'sarah.schwarz2@hospital.com',
    specialty: 'Surgery',
    group_id: 6
  },
  {
    name: 'Elias Lorenz',
    email: 'elias.lorenz2@hospital.com',
    specialty: 'Cardiology',
    group_id: 6
  },
  {
    name: 'Hanna Braun',
    email: 'hanna.braun2@hospital.com',
    specialty: 'Neurology',
    group_id: 6
  },
  
  // Group 7
  {
    name: 'Finn Werner',
    email: 'finn.werner2@hospital.com',
    specialty: 'Internal Medicine',
    group_id: 7
  },
  {
    name: 'Clara Lange',
    email: 'clara.lange2@hospital.com',
    specialty: 'Surgery',
    group_id: 7
  },
  
  // Group 8
  {
    name: 'Tom Frank',
    email: 'tom.frank2@hospital.com',
    specialty: 'Cardiology',
    group_id: 8
  },
  {
    name: 'Amelie Keller',
    email: 'amelie.keller2@hospital.com',
    specialty: 'Neurology',
    group_id: 8
  }
];

// Function to seed the database with sample doctors
export const seedDoctors = async () => {
  try {
    // Check if doctors already exist
    const { data: existingDoctors, error: checkError } = await supabase
      .from('doctors')
      .select('count')
      .single();

    if (checkError) {
      console.error('Error checking doctors:', checkError);
      return false;
    }

    // If we already have doctors, don't seed
    if (existingDoctors?.count > 0) {
      console.log('Doctors already exist, skipping seeding');
      return false;
    }

    // Add placeholder user_id to all doctors (in production, these would be real user IDs)
    const doctorsWithUserId = sampleDoctors.map(doctor => ({
      ...doctor,
      user_id: '00000000-0000-0000-0000-000000000000' // placeholder
    }));

    // Insert all sample doctors
    const { error: insertError } = await supabase
      .from('doctors')
      .insert(doctorsWithUserId);

    if (insertError) {
      console.error('Error seeding doctors:', insertError);
      return false;
    }

    console.log('Successfully seeded doctors');
    return true;
  } catch (error) {
    console.error('Unexpected error during doctor seeding:', error);
    return false;
  }
};
