import { EmergencyContact } from '../types/nysc';

export interface StateEmergencyRecord {
  state: string;
  coordinator_phone: string;
  secretariat_address: string;
  police_phone: string;
  hospital_name: string;
  hospital_phone: string;
}

export const STATE_EMERGENCY_DATA: Record<string, StateEmergencyRecord> = {
  Lagos: {
    state: 'Lagos',
    coordinator_phone: '08023190821',
    secretariat_address: 'NYSC State Secretariat, Babs Animashaun Street, Surulere, Lagos',
    police_phone: '08033011052',
    hospital_name: 'Lagos State Emergency & Trauma Center / Ikeja General Hospital',
    hospital_phone: '08028419330'
  },
  'FCT (Abuja)': {
    state: 'FCT (Abuja)',
    coordinator_phone: '08033124509',
    secretariat_address: 'NYSC FCT Secretariat, Maitama, Abuja',
    police_phone: '08061581938',
    hospital_name: 'National Hospital Trauma Center, Central Business District, Abuja',
    hospital_phone: '08033140510'
  },
  Abuja: {
    state: 'Abuja',
    coordinator_phone: '08033124509',
    secretariat_address: 'NYSC FCT Secretariat, Maitama, Abuja',
    police_phone: '08061581938',
    hospital_name: 'National Hospital Trauma Center, Central Business District, Abuja',
    hospital_phone: '08033140510'
  },
  Rivers: {
    state: 'Rivers',
    coordinator_phone: '08037088921',
    secretariat_address: 'NYSC State Secretariat, 40 Ikwerre Road, Port Harcourt',
    police_phone: '08032003514',
    hospital_name: 'Rivers State University Teaching Hospital Emergency Desk',
    hospital_phone: '08033104822'
  },
  Oyo: {
    state: 'Oyo',
    coordinator_phone: '08034567812',
    secretariat_address: 'NYSC State Secretariat, Agodi GRA, Ibadan',
    police_phone: '08081768614',
    hospital_name: 'University College Hospital (UCH) Emergency Department, Ibadan',
    hospital_phone: '08033123456'
  },
  Kano: {
    state: 'Kano',
    coordinator_phone: '08065432109',
    secretariat_address: 'NYSC State Secretariat, Gwarzo Road, Kano',
    police_phone: '08032419754',
    hospital_name: 'Aminu Kano Teaching Hospital Trauma Unit',
    hospital_phone: '08035987654'
  },
  Kaduna: {
    state: 'Kaduna',
    coordinator_phone: '08023456789',
    secretariat_address: 'NYSC Secretariat, Independence Way, Kaduna South',
    police_phone: '08075391105',
    hospital_name: 'Barau Dikko Teaching Hospital Emergency Unit',
    hospital_phone: '08034512345'
  },
  Ogun: {
    state: 'Ogun',
    coordinator_phone: '08035678901',
    secretariat_address: 'NYSC State Secretariat, Federal Secretariat Complex, Abeokuta',
    police_phone: '08081770416',
    hospital_name: 'Federal Medical Centre (FMC) Emergency Wing, Abeokuta',
    hospital_phone: '08036789012'
  },
  Enugu: {
    state: 'Enugu',
    coordinator_phone: '08036789012',
    secretariat_address: 'NYSC Secretariat, 2 Garden Avenue, GRA, Enugu',
    police_phone: '08032003702',
    hospital_name: 'University of Nigeria Teaching Hospital (UNTH) Emergency Unit',
    hospital_phone: '08037890123'
  },
  Edo: {
    state: 'Edo',
    coordinator_phone: '08037890123',
    secretariat_address: 'NYSC Secretariat, 2 Benin-Auchi Road, Aduwawa, Benin City',
    police_phone: '08037646272',
    hospital_name: 'University of Benin Teaching Hospital (UBTH) Emergency',
    hospital_phone: '08038901234'
  },
  Delta: {
    state: 'Delta',
    coordinator_phone: '08038901234',
    secretariat_address: 'NYSC Secretariat, Federal Secretariat Complex, Asaba',
    police_phone: '08036684974',
    hospital_name: 'Federal Medical Centre Emergency Desk, Asaba',
    hospital_phone: '08039012345'
  },
  Anambra: {
    state: 'Anambra',
    coordinator_phone: '08039012345',
    secretariat_address: 'NYSC Secretariat, Progressive Bank Building, Awka',
    police_phone: '07039194332',
    hospital_name: 'Chukwuemeka Odumegwu Ojukwu University Teaching Hospital, Awka',
    hospital_phone: '08030123456'
  },
  'Akwa Ibom': {
    state: 'Akwa Ibom',
    coordinator_phone: '08031234567',
    secretariat_address: 'NYSC Secretariat, 2 Ikot Ekpene Road, Uyo',
    police_phone: '08039213071',
    hospital_name: 'University of Uyo Teaching Hospital Emergency Unit',
    hospital_phone: '08031234568'
  },
  Plateau: {
    state: 'Plateau',
    coordinator_phone: '08032345678',
    secretariat_address: 'NYSC Secretariat, 15 Bukuru Road, Jos',
    police_phone: '08038691156',
    hospital_name: 'Jos University Teaching Hospital (JUTH) Trauma Center',
    hospital_phone: '08032345679'
  },
  Kwara: {
    state: 'Kwara',
    coordinator_phone: '08033456789',
    secretariat_address: 'NYSC Secretariat, Ahmadu Bello Way, Ilorin',
    police_phone: '08125275046',
    hospital_name: 'University of Ilorin Teaching Hospital Emergency Wing',
    hospital_phone: '08033456780'
  },
  Imo: {
    state: 'Imo',
    coordinator_phone: '08034567890',
    secretariat_address: 'NYSC Secretariat, Port Harcourt Road, Owerri',
    police_phone: '08034773600',
    hospital_name: 'Federal Medical Centre Emergency Desk, Owerri',
    hospital_phone: '08034567891'
  },
  Ondo: {
    state: 'Ondo',
    coordinator_phone: '08035678902',
    secretariat_address: 'NYSC Secretariat, Federal Secretariat, Igbatoro Road, Akure',
    police_phone: '08033477614',
    hospital_name: 'University of Medical Sciences Teaching Hospital (UNIMEDTH), Akure',
    hospital_phone: '08035678903'
  },
  Osun: {
    state: 'Osun',
    coordinator_phone: '08036789013',
    secretariat_address: 'NYSC Secretariat, New Secretariat Complex, Gbongan Road, Osogbo',
    police_phone: '08039580795',
    hospital_name: 'UNIOSUN Teaching Hospital Emergency Care, Osogbo',
    hospital_phone: '08036789014'
  }
};

/**
 * Generate state-specific emergency desk and inspectorate contacts tailored to the individual profile
 */
export function generateStateEmergencyContacts(
  stateName: string,
  lgaName: string,
  userId: string
): EmergencyContact[] {
  const normState = stateName.trim();
  const info = STATE_EMERGENCY_DATA[normState] || {
    state: normState,
    coordinator_phone: '08033107873',
    secretariat_address: `NYSC State Secretariat, ${normState} State Capital`,
    police_phone: '08033011052',
    hospital_name: `${normState} State Specialist / General Hospital Emergency Unit`,
    hospital_phone: '08033107873'
  };

  return [
    {
      id: `emg-nat-${userId}`,
      user_id: userId,
      contact_name: 'NYSC National Distress Call Centre',
      role_title: 'NYSC Headquarters Toll-Free Rapid Response',
      phone_number: '08033107873',
      is_default: true,
      notes: 'Available 24/7 nationwide for emergency distress, banditry alert, or severe illness in camp/PPA.'
    },
    {
      id: `emg-coord-${normState}-${userId}`,
      user_id: userId,
      contact_name: `${normState} NYSC State Coordinator Secretariat`,
      role_title: `NYSC State Coordinator Emergency Desk (${normState})`,
      phone_number: info.coordinator_phone,
      is_default: true,
      state: normState,
      notes: info.secretariat_address
    },
    {
      id: `emg-lgi-${lgaName}-${userId}`,
      user_id: userId,
      contact_name: `${lgaName} Local Government Inspector (LGI)`,
      role_title: `LGI Desk - ${lgaName} LGA (${normState})`,
      phone_number: '08034091288',
      is_default: true,
      state: normState,
      lga: lgaName,
      notes: `Official LGI supervision desk for monthly biometric sign-offs and corper welfare in ${lgaName} LGA.`
    },
    {
      id: `emg-police-${normState}-${userId}`,
      user_id: userId,
      contact_name: `${normState} Police State Command Control Room`,
      role_title: `NPF Emergency Desk - ${normState} State`,
      phone_number: info.police_phone,
      is_default: true,
      state: normState,
      notes: 'State Police Command rapid response distress line.'
    },
    {
      id: `emg-hosp-${normState}-${userId}`,
      user_id: userId,
      contact_name: info.hospital_name,
      role_title: `24/7 Trauma & Emergency Center (${normState})`,
      phone_number: info.hospital_phone,
      is_default: true,
      state: normState,
      lga: lgaName,
      notes: 'Government accredited emergency medical care for active corps members with NHIA/NYSC health cover.'
    }
  ];
}
