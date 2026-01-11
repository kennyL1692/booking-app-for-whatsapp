
export interface Doctor {
  id: number;
  name: string;
  specialty: string;
  image: string;
  experience: string;
  patients: string;
  rating: number;
}

export type AppointmentType = 'consultation' | 'follow-up' | 'urgent-care';

export interface FormData {
  patientName: string;
  phoneNumber: string;
  email: string;
  reasonForVisit: string;
  appointmentDate: string | null;
  appointmentTime: string;
  doctorId: number | null;
  appointmentType: AppointmentType;
}

export enum Step {
  Welcome = 0,
  PatientInfo = 1,
  DoctorSelection = 2,
  DateTimeSelection = 3,
  Review = 4,
  Confirmation = 5
}
