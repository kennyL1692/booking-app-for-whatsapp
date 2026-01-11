
import React, { useState, useCallback, useMemo } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  Calendar, 
  User, 
  Clock, 
  Phone, 
  CheckCircle2, 
  MessageCircle,
  AlertCircle,
  ShieldCheck,
  Star,
  Users,
  Briefcase,
  Zap
} from 'lucide-react';
import { Step, FormData, Doctor } from './types';
import { DOCTORS, CLINIC_CONFIG, APPOINTMENT_TYPES } from './constants';
import { summarizeHealthReason } from './services/geminiService';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<Step>(Step.Welcome);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [formData, setFormData] = useState<FormData>({
    patientName: '',
    phoneNumber: '',
    email: '',
    reasonForVisit: '',
    appointmentDate: new Date().toISOString().split('T')[0],
    appointmentTime: '',
    doctorId: null,
    appointmentType: 'consultation'
  });

  const selectedDoctor = useMemo(() => 
    DOCTORS.find(d => d.id === formData.doctorId), 
  [formData.doctorId]);

  const handleNext = async () => {
    if (currentStep === Step.PatientInfo && !aiSummary) {
      setIsSummarizing(true);
      const summary = await summarizeHealthReason(formData.reasonForVisit);
      setAiSummary(summary);
      setIsSummarizing(false);
    }
    setCurrentStep(prev => (prev + 1) as Step);
  };

  const handleBack = () => setCurrentStep(prev => (prev - 1) as Step);

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const isStepValid = useMemo(() => {
    switch (currentStep) {
      case Step.PatientInfo:
        return formData.patientName.length >= 2 && 
               formData.phoneNumber.length >= 8 && 
               formData.reasonForVisit.length >= 10;
      case Step.DoctorSelection:
        return formData.doctorId !== null;
      case Step.DateTimeSelection:
        return !!formData.appointmentDate && !!formData.appointmentTime;
      default:
        return true;
    }
  }, [currentStep, formData]);

  const generateWhatsAppURL = () => {
    const message = `*HEALTHPLUS CONFIRMATION*
    
*Patient:* ${formData.patientName}
*Phone:* ${formData.phoneNumber}
*Specialist:* ${selectedDoctor?.name}
*Schedule:* ${formData.appointmentDate} @ ${formData.appointmentTime}

*Symptoms:*
${formData.reasonForVisit}

*Clinical Summary:*
${aiSummary}`;

    return `https://wa.me/${CLINIC_CONFIG.phone}?text=${encodeURIComponent(message)}`;
  };

  const renderStep = () => {
    switch (currentStep) {
      case Step.Welcome: return <WelcomeStep onStart={() => setCurrentStep(Step.PatientInfo)} />;
      case Step.PatientInfo: return <PatientInfoStep data={formData} update={updateFormData} />;
      case Step.DoctorSelection: return <DoctorSelectionStep data={formData} update={updateFormData} />;
      case Step.DateTimeSelection: return <DateTimeStep data={formData} update={updateFormData} />;
      case Step.Review: return <ReviewStep data={formData} selectedDoctor={selectedDoctor} aiSummary={aiSummary} />;
      case Step.Confirmation: return <ConfirmationStep data={formData} selectedDoctor={selectedDoctor} whatsappUrl={generateWhatsAppURL()} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-4">
      {/* Neo-Brutalist Header */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-10 bg-white border-4 border-black p-4 neo-shadow-sm rotate-[-1deg]">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 border-2 border-black rotate-3">
            <ShieldCheck size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-black tracking-tighter uppercase italic">HealthPlus</h1>
        </div>
        {currentStep > Step.Welcome && currentStep < Step.Confirmation && (
          <div className="px-3 py-1 bg-black text-white text-xs font-black uppercase">
            Phase {currentStep}/4
          </div>
        )}
      </div>

      {/* Progress Bar (Chunky) */}
      {currentStep > Step.Welcome && currentStep < Step.Confirmation && (
        <div className="w-full max-w-2xl h-8 bg-black border-4 border-black mb-8 flex p-1">
          <div 
            className="h-full bg-blue-500 transition-all duration-300 border-r-4 border-black"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          />
        </div>
      )}

      {/* Main Content Card */}
      <main className="w-full max-w-2xl bg-white border-4 border-black p-8 md:p-12 neo-shadow mb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
            <Zap size={120} className="text-black" />
        </div>
        
        <div className="relative z-10">
            {renderStep()}
        </div>
        
        {/* Navigation */}
        {currentStep > Step.Welcome && currentStep < Step.Confirmation && (
          <div className="mt-12 flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleBack}
              className="neo-button flex-1 py-4 px-6 border-4 border-black bg-white text-black font-black uppercase text-sm flex items-center justify-center gap-2 neo-shadow-sm transition-all"
            >
              <ChevronLeft size={20} strokeWidth={3} /> Back
            </button>
            <button
              disabled={!isStepValid || isSummarizing}
              onClick={handleNext}
              className={`neo-button flex-[2] py-4 px-6 border-4 border-black font-black uppercase text-sm flex items-center justify-center gap-2 transition-all neo-shadow-sm
                ${isStepValid && !isSummarizing ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'}`}
            >
              {isSummarizing ? 'Analyzing...' : (currentStep === Step.Review ? 'Book Now' : 'Next Step')}
              <ChevronRight size={20} strokeWidth={3} />
            </button>
          </div>
        )}
      </main>

      <footer className="text-black font-black text-xs uppercase tracking-widest flex items-center gap-4 bg-yellow-400 border-4 border-black p-4 neo-shadow-sm rotate-[1deg]">
        <AlertCircle size={16} /> Data Encryption Protocol Active // 2025 Standard
      </footer>
    </div>
  );
};

// --- Step Components ---

const WelcomeStep: React.FC<{ onStart: () => void }> = ({ onStart }) => (
  <div className="text-left">
    <div className="mb-8 border-4 border-black p-2 neo-shadow-sm rotate-[-2deg] bg-white">
      <img 
        src="https://picsum.photos/seed/neo-med/1200/600" 
        alt="Clinic" 
        className="w-full h-56 object-cover grayscale contrast-125"
      />
    </div>
    <h2 className="text-5xl font-black text-black mb-4 uppercase tracking-tighter leading-none italic">
        Digital Health <span className="text-blue-600">Revolution.</span>
    </h2>
    <p className="text-black font-bold mb-10 max-w-md leading-tight text-lg">
      Stop waiting. Get premium specialist access through our high-speed clinical intake system.
    </p>
    <button 
      onClick={onStart}
      className="neo-button w-full py-6 bg-blue-600 text-white border-4 border-black font-black text-2xl uppercase tracking-tighter italic neo-shadow transition-all"
    >
      Initialize Booking
    </button>
  </div>
);

const PatientInfoStep: React.FC<{ data: FormData, update: (u: Partial<FormData>) => void }> = ({ data, update }) => (
  <div className="space-y-8">
    <div>
      <h2 className="text-4xl font-black text-black uppercase italic tracking-tighter">01. Identity</h2>
      <div className="h-2 w-20 bg-blue-600 mt-2"></div>
    </div>
    <div className="grid gap-6">
      <div className="group">
        <label className="block text-sm font-black text-black uppercase mb-2 tracking-widest">Full Name</label>
        <input 
          type="text" 
          placeholder="TYPE NAME HERE..."
          className="w-full px-6 py-4 border-4 border-black bg-white text-black font-black uppercase outline-none focus:bg-yellow-200 transition-colors neo-shadow-sm"
          value={data.patientName}
          onChange={e => update({ patientName: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-sm font-black text-black uppercase mb-2 tracking-widest">Phone Number</label>
        <input 
          type="tel" 
          placeholder="+00 000 0000"
          className="w-full px-6 py-4 border-4 border-black bg-white text-black font-black uppercase outline-none focus:bg-yellow-200 transition-colors neo-shadow-sm"
          value={data.phoneNumber}
          onChange={e => update({ phoneNumber: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-sm font-black text-black uppercase mb-2 tracking-widest">Symptoms / Reason</label>
        <textarea 
          placeholder="DESCRIBE CONDITION IN DETAIL..."
          rows={4}
          className="w-full p-6 border-4 border-black bg-white text-black font-black uppercase outline-none focus:bg-yellow-200 transition-colors neo-shadow-sm resize-none"
          value={data.reasonForVisit}
          onChange={e => update({ reasonForVisit: e.target.value })}
        />
      </div>
    </div>
  </div>
);

const DoctorSelectionStep: React.FC<{ data: FormData, update: (u: Partial<FormData>) => void }> = ({ data, update }) => (
  <div className="space-y-8">
    <div>
      <h2 className="text-4xl font-black text-black uppercase italic tracking-tighter">02. Expert</h2>
      <div className="h-2 w-20 bg-yellow-400 mt-2"></div>
    </div>
    <div className="grid gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
      {DOCTORS.map(doc => (
        <button
          key={doc.id}
          onClick={() => update({ doctorId: doc.id })}
          className={`flex items-center p-4 border-4 transition-all text-left relative
            ${data.doctorId === doc.id ? 'border-black bg-yellow-400 neo-shadow-sm' : 'border-black bg-white hover:bg-slate-50'}`}
        >
          <img src={doc.image} alt={doc.name} className="w-20 h-20 border-2 border-black object-cover mr-6 grayscale contrast-150" />
          <div className="flex-1">
            <h3 className="text-xl font-black text-black uppercase italic leading-none">{doc.name}</h3>
            <p className="text-xs font-black text-blue-600 uppercase mb-2 tracking-widest">{doc.specialty}</p>
            <div className="flex gap-4">
               <div className="bg-black text-white px-2 py-0.5 text-[10px] font-black uppercase italic">EXP: {doc.experience}</div>
               <div className="bg-white border-2 border-black px-2 py-0.5 text-[10px] font-black uppercase italic">RTG: {doc.rating}</div>
            </div>
          </div>
        </button>
      ))}
    </div>
  </div>
);

const DateTimeStep: React.FC<{ data: FormData, update: (u: Partial<FormData>) => void }> = ({ data, update }) => (
  <div className="space-y-8">
    <div>
      <h2 className="text-4xl font-black text-black uppercase italic tracking-tighter">03. Timing</h2>
      <div className="h-2 w-20 bg-green-500 mt-2"></div>
    </div>
    <div className="grid gap-8">
      <div>
        <label className="block text-sm font-black text-black uppercase mb-4 tracking-widest">Select Date</label>
        <input 
          type="date" 
          className="w-full px-6 py-6 border-4 border-black bg-white text-black font-black uppercase text-xl outline-none focus:bg-yellow-200 transition-colors neo-shadow-sm"
          value={data.appointmentDate || ''}
          onChange={e => update({ appointmentDate: e.target.value })}
        />
      </div>
      <div>
        <label className="block text-sm font-black text-black uppercase mb-4 tracking-widest">Select Slot</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {CLINIC_CONFIG.availableHours.map(time => (
            <button
              key={time}
              onClick={() => update({ appointmentTime: time })}
              className={`py-4 border-4 font-black uppercase text-xs transition-all
                ${data.appointmentTime === time ? 'bg-black text-white border-black neo-shadow-sm translate-y-[-2px]' : 'bg-white border-black hover:bg-slate-100'}`}
            >
              {time}
            </button>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const ReviewStep: React.FC<{ data: FormData, selectedDoctor?: Doctor, aiSummary: string }> = ({ data, selectedDoctor, aiSummary }) => (
  <div className="space-y-8">
    <div>
      <h2 className="text-4xl font-black text-black uppercase italic tracking-tighter">04. Finalize</h2>
      <div className="h-2 w-20 bg-blue-600 mt-2"></div>
    </div>
    <div className="border-4 border-black p-8 space-y-8 bg-white neo-shadow-sm relative">
      <div className="absolute top-0 right-0 p-2 bg-black text-white text-[10px] font-black uppercase tracking-widest italic">Review Panel</div>
      
      <div className="flex flex-col md:flex-row items-center gap-8">
        <img src={selectedDoctor?.image} alt="" className="w-32 h-32 border-4 border-black object-cover grayscale contrast-150 rotate-[-3deg]" />
        <div className="text-center md:text-left">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Specialist</p>
          <p className="text-3xl font-black text-black uppercase italic tracking-tighter">{selectedDoctor?.name}</p>
          <div className="inline-block mt-2 px-3 py-1 bg-blue-600 text-white font-black text-xs uppercase italic">
            {selectedDoctor?.specialty}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t-4 border-black pt-8">
        <div className="space-y-4">
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Time Slot</p>
            <p className="text-xl font-black text-black italic uppercase">{data.appointmentDate} // {data.appointmentTime}</p>
          </div>
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Patient</p>
            <p className="text-xl font-black text-black italic uppercase">{data.patientName}</p>
          </div>
        </div>
        <div className="bg-yellow-200 border-4 border-black p-4 rotate-[1deg]">
          <p className="text-[10px] font-black text-black uppercase tracking-widest mb-2 border-b-2 border-black inline-block">Diagnostic AI Summary</p>
          <p className="text-sm text-black font-bold leading-tight italic">"{aiSummary}"</p>
        </div>
      </div>
    </div>
  </div>
);

const ConfirmationStep: React.FC<{ data: FormData, selectedDoctor?: Doctor, whatsappUrl: string }> = ({ data, selectedDoctor, whatsappUrl }) => {
  return (
    <div className="text-center py-4">
      <div className="w-24 h-24 bg-green-500 border-4 border-black text-white flex items-center justify-center mx-auto mb-8 neo-shadow rotate-3">
        <CheckCircle2 size={56} strokeWidth={3} />
      </div>
      <h2 className="text-5xl font-black text-black mb-4 uppercase italic tracking-tighter">Verified.</h2>
      <p className="text-black font-bold mb-10 max-w-sm mx-auto uppercase text-xs tracking-widest leading-loose">
        Booking system synchronized. Final verification required via encrypted WhatsApp channel.
      </p>
      
      <button 
        onClick={() => window.open(whatsappUrl, '_blank')}
        className="neo-button w-full py-8 bg-green-500 text-white border-4 border-black font-black text-2xl uppercase tracking-tighter italic neo-shadow transition-all flex items-center justify-center gap-4 group"
      >
        <MessageCircle size={32} strokeWidth={3} />
        Initialize WhatsApp
        <ChevronRight size={32} strokeWidth={3} className="group-hover:translate-x-2 transition-transform" />
      </button>
      
      <div className="mt-12 p-4 bg-black text-white font-black text-[10px] uppercase tracking-widest italic">
        Transmission Secure // Project HealthPlus 2025
      </div>
    </div>
  );
};

export default App;
