import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, Clock, Sparkles, HeartHandshake, Plane, FileText } from 'lucide-react';

interface StudioSOPModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StudioSOPModal: React.FC<StudioSOPModalProps> = ({ isOpen, onClose }) => {
  const sopSections = [
    {
      id: "SOP-01",
      icon: <FileText className="text-luxury-gold" size={22} />,
      title: "Booking & Retainer Policy",
      subtitle: "Securing your bespoke appointment",
      details: [
        "A 50% non-refundable reservation deposit is required to lock your desired date and time slot.",
        "Bookings operate on a strict first-to-deposit basis. No date will be reserved without confirmed payment.",
        "The remaining balance must be settled on or before the day of service prior to final touches.",
        "Rescheduling requests must be sent at least 7 days before the event date, subject to slot availability."
      ]
    },
    {
      id: "SOP-02",
      icon: <Sparkles className="text-luxury-gold" size={22} />,
      title: "Pre-Appointment Skin Preparation",
      subtitle: "Preparing the ultimate canvas",
      details: [
        "Arrive with clean, bare skin—free of mascara, eyeliner, heavy creams, or sunscreens with white cast.",
        "Exfoliate gently 24-48 hours before the session and ensure ample hydration for flawless application.",
        "Avoid aggressive facial treatments, chemical peels, or new active serums within 7 days of the appointment.",
        "Wear a button-down shirt, robe, or wide-neck top to avoid disrupting makeup when changing clothes."
      ]
    },
    {
      id: "SOP-03",
      icon: <Clock className="text-luxury-gold" size={22} />,
      title: "Punctuality & Grace Periods",
      subtitle: "Respecting creative timelines",
      details: [
        "Please arrive exactly at your scheduled time. Sessions are strictly scheduled to allow thorough prep.",
        "A 15-minute grace period is accommodated. Beyond 15 minutes, service duration may be adjusted.",
        "Late arrivals exceeding 30 minutes may be subject to cancellation or a late fee to preserve subsequent client schedules."
      ]
    },
    {
      id: "SOP-04",
      icon: <HeartHandshake className="text-luxury-gold" size={22} />,
      title: "Sanitation & Inclusive Artistry",
      subtitle: "Hospital-grade safety & gender-affirming beauty",
      details: [
        "100% sanitized brush protocol. Disposables used for mascara, lips, and applicators for every single client.",
        "Cruelty-free, hypoallergenic, and dermatologically tested global luxury cosmetic brands only.",
        "A proudly inclusive space: Welcoming all genders (Women, Men, Transgender, Non-Binary, Queer, and Drag artists) with customized facial contouring and personalized styling."
      ]
    },
    {
      id: "SOP-05",
      icon: <Plane className="text-luxury-gold" size={22} />,
      title: "Destination & On-Location Engagements",
      subtitle: "Worldwide & Out-of-Town Artistry",
      details: [
        "Available for local, regional, and international destination weddings, pageants, and high-fashion editorial shoots.",
        "Client covers travel (flights/land transport), comfortable lodging, and per diem for out-of-town bookings.",
        "On-location setups require an adequate workspace: well-lit area (or natural window light), accessible electrical outlets, and sturdy table/chair setup."
      ]
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-luxury-ink/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="relative w-full max-w-4xl max-h-[90vh] bg-luxury-cream rounded-3xl border border-luxury-gold/30 shadow-2xl flex flex-col overflow-hidden z-10"
          >
            {/* Header */}
            <div className="p-6 sm:p-8 border-b border-luxury-ink/10 flex items-center justify-between bg-white/60 backdrop-blur-sm">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-[0.35em] text-luxury-gold font-semibold">
                    Global Standards
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-luxury-gold" />
                  <span className="text-[10px] uppercase tracking-[0.25em] text-luxury-ink/50">
                    Official Protocol
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif italic text-luxury-ink">
                  Studio Operating Procedures (SOP)
                </h2>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full border border-luxury-ink/15 flex items-center justify-center text-luxury-ink/60 hover:text-luxury-ink hover:border-luxury-gold hover:bg-white transition-all cursor-pointer"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 sm:p-8 md:p-10 overflow-y-auto space-y-8 divide-y divide-luxury-ink/10">
              <div className="bg-luxury-ink text-white p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-luxury-gold text-xs uppercase tracking-widest font-medium">
                    <ShieldCheck size={16} /> Certified Professional Excellence
                  </div>
                  <p className="text-xs text-white/70 font-light leading-relaxed max-w-xl">
                    Haus of Von adheres to international makeup hygiene, skin safety, and inclusive ethical practices. Please review our SOP guidelines before confirming reservations.
                  </p>
                </div>
                <div className="text-[11px] font-mono tracking-widest text-luxury-gold/80 border border-luxury-gold/30 px-3 py-1.5 rounded-full whitespace-nowrap">
                  VER. 2026.GLOBAL
                </div>
              </div>

              {sopSections.map((sec) => (
                <div key={sec.id} className="pt-6 first:pt-0 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-luxury-gold/10 border border-luxury-gold/25 flex items-center justify-center shrink-0">
                      {sec.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-luxury-gold font-bold">
                          {sec.id}
                        </span>
                        <h3 className="text-lg sm:text-xl font-serif italic text-luxury-ink font-medium">
                          {sec.title}
                        </h3>
                      </div>
                      <p className="text-xs text-luxury-ink/50 tracking-wide mt-0.5">
                        {sec.subtitle}
                      </p>
                    </div>
                  </div>

                  <ul className="grid sm:grid-cols-2 gap-3 pl-14">
                    {sec.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-luxury-ink/75 leading-relaxed bg-white/70 p-3.5 rounded-xl border border-luxury-ink/5">
                        <span className="w-1.5 h-1.5 rounded-full bg-luxury-gold shrink-0 mt-1.5" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-6 bg-white/80 border-t border-luxury-ink/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-[11px] text-luxury-ink/50 text-center sm:text-left">
                By booking a session with Haus of Von, clients implicitly agree to all SOP provisions.
              </p>
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-8 py-3 rounded-full bg-luxury-ink text-white hover:bg-luxury-gold hover:text-luxury-ink transition-colors text-xs uppercase tracking-[0.25em] font-medium cursor-pointer"
              >
                Understood & Agree
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
