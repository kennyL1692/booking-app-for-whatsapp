
import { Doctor } from './types';

export const CLINIC_CONFIG = {
  name: "Health Plus Medical Center",
  phone: "1234567890", // Example WhatsApp number
  email: "appointments@healthplus.com",
  address: "123 Medical Drive, Health City",
  availableHours: [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", 
    "11:00 AM", "11:30 AM", "02:00 PM", "02:30 PM", 
    "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM"
  ]
};

export const DOCTORS: Doctor[] = [
  { 
    id: 1, 
    name: "Dr. Sarah Johnson", 
    specialty: "General Practice", 
    image: "https://picsum.photos/seed/doc1/200/200",
    experience: "12 Years",
    patients: "4.5k+",
    rating: 4.9
  },
  { 
    id: 2, 
    name: "Dr. Michael Chen", 
    specialty: "Pediatrics", 
    image: "https://picsum.photos/seed/doc2/200/200",
    experience: "8 Years",
    patients: "3.2k+",
    rating: 4.8
  },
  { 
    id: 3, 
    name: "Dr. Emily Rodriguez", 
    specialty: "Cardiology", 
    image: "https://picsum.photos/seed/doc3/200/200",
    experience: "15 Years",
    patients: "2.1k+",
    rating: 5.0
  },
  { 
    id: 4, 
    name: "Dr. James Wilson", 
    specialty: "Dermatology", 
    image: "https://picsum.photos/seed/doc4/200/200",
    experience: "10 Years",
    patients: "5k+",
    rating: 4.7
  }
];

export const APPOINTMENT_TYPES = [
  { id: 'consultation', label: 'Regular Consultation', description: 'General health check or initial visit' },
  { id: 'follow-up', label: 'Follow-up Visit', description: 'Checking progress after previous treatment' },
  { id: 'urgent-care', label: 'Urgent Care', description: 'Immediate attention for non-life-threatening issues' }
];
