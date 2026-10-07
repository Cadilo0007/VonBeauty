import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from './lib/firebase';
import { useFirebase } from './components/FirebaseProvider';
import { Contact } from './components/Contact';
import { Booking } from './components/Booking';
import { Navigation } from './components/Navigation';
import { Hero } from './components/Hero';
import { AuthModal } from './components/AuthModal';
import { Dashboard } from './components/Dashboard';
import { About } from './components/About';
import { Services } from './components/Services';
import { Portfolio, FullGallery } from './components/Portfolio';
import { Testimonials } from './components/Testimonials';
import { Footer } from './components/Footer';
import { StudioSOPModal } from './components/StudioSOPModal';
import { UploadedImage, BookingData, Testimonial, CategoryItem } from './types';

export default function App() {
  const { user, role, isAdmin, loading } = useFirebase();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSOPModalOpen, setIsSOPModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'dashboard'>('home');
  const [selectedImage, setSelectedImage] = useState<{ src: string; category?: string; gender?: string; title?: string } | null>(null);
  
  // Lifted state (synced with Firebase)
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [customCategories, setCustomCategories] = useState<CategoryItem[]>([]);

  // Default core categories combined with dynamic admin categories
  const defaultCategories = ['Bridal Makeup', 'Event Makeup', 'Pageant Makeup', 'Photoshoot Makeup', 'Transformation'];
  const categories = useMemo(() => {
    const customNames = customCategories.map(c => c.name);
    return Array.from(new Set([...defaultCategories, ...customNames]));
  }, [customCategories]);

  // Simple routing for /admin
  useEffect(() => {
    if (window.location.pathname === '/admin') {
      if (isAdmin) {
        setCurrentView('dashboard');
      } else {
        setIsAuthModalOpen(true);
      }
    }
  }, [isAdmin]);

  useEffect(() => {
    if (loading) return;

    // --- Firebase Real-time Sync ---
    // 1. Sync Gallery
    const galleryQuery = isAdmin 
      ? query(collection(db, 'gallery'), orderBy('createdAt', 'desc'))
      : query(collection(db, 'gallery'), where('isHidden', '==', false), orderBy('createdAt', 'desc'));
    
    const unsubscribeGallery = onSnapshot(galleryQuery, (snapshot) => {
      const images = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UploadedImage));
      setUploadedImages(images);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'gallery');
    });

    // 2. Sync Bookings
    let unsubscribeBookings = () => {};
    if (isAdmin) {
      const bookingsQuery = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
      unsubscribeBookings = onSnapshot(bookingsQuery, (snapshot) => {
        const bks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BookingData));
        setBookings(bks);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'bookings');
      });
    } else if (user?.email) {
      const bookingsQuery = query(collection(db, 'bookings'), where('email', '==', user.email), orderBy('createdAt', 'desc'));
      unsubscribeBookings = onSnapshot(bookingsQuery, (snapshot) => {
        const bks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BookingData));
        setBookings(bks);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'bookings');
      });
    } else {
      setBookings([]);
    }

    // 3. Sync Testimonials
    const testimonialsQuery = isAdmin
      ? query(collection(db, 'testimonials'), orderBy('createdAt', 'desc'))
      : query(collection(db, 'testimonials'), where('status', '==', 'approved'), orderBy('createdAt', 'desc'));

    const unsubscribeTestimonials = onSnapshot(testimonialsQuery, (snapshot) => {
      const tests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Testimonial));
      setTestimonials(tests);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'testimonials');
    });

    // 4. Sync Custom Categories
    const categoriesQuery = query(collection(db, 'categories'), orderBy('createdAt', 'desc'));
    const unsubscribeCategories = onSnapshot(categoriesQuery, (snapshot) => {
      const cats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CategoryItem));
      setCustomCategories(cats);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'categories');
    });

    return () => {
      unsubscribeGallery();
      unsubscribeBookings();
      unsubscribeTestimonials();
      unsubscribeCategories();
    };
  }, [user, role, isAdmin, loading]);

  const isAuthenticated = !!user;

  const handleLogout = async () => {
    await auth.signOut();
    setCurrentView('home');
  };

  const [copied, setCopied] = useState(false);

  const handleShare = (src: string) => {
    navigator.clipboard.writeText(src);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen overflow-x-hidden selection:bg-luxury-gold selection:text-white">
      {currentView !== 'dashboard' && (
        <Navigation
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          onAuthRequest={() => setIsAuthModalOpen(true)}
          onDashboardRequest={() => setCurrentView('dashboard')}
          userRole={role}
          onLogout={handleLogout}
          onOpenSOP={() => setIsSOPModalOpen(true)}
        />
      )}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => setCurrentView('dashboard')}
      />

      {/* Studio SOP Modal */}
      <StudioSOPModal
        isOpen={isSOPModalOpen}
        onClose={() => setIsSOPModalOpen(false)}
      />

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="fixed inset-0 bg-luxury-ink z-45 flex flex-col items-center justify-center gap-7 text-white text-xl sm:text-2xl font-serif italic"
          >
            <button 
              onClick={() => setIsMenuOpen(false)}
              className="absolute top-8 right-8 text-white hover:text-luxury-gold transition-colors"
            >
              <X size={32} />
            </button>
            <a href="#home" onClick={() => setIsMenuOpen(false)} className="text-white hover:text-luxury-gold transition-colors">Home</a>
            <a href="#about" onClick={() => setIsMenuOpen(false)} className="text-white hover:text-luxury-gold transition-colors">About</a>
            <a href="#services" onClick={() => setIsMenuOpen(false)} className="text-white hover:text-luxury-gold transition-colors">Services</a>
            <a href="#gallery" onClick={() => setIsMenuOpen(false)} className="text-white hover:text-luxury-gold transition-colors">Gallery</a>
            <button 
              onClick={() => {
                setIsMenuOpen(false);
                setIsSOPModalOpen(true);
              }}
              className="text-luxury-gold hover:text-white transition-colors cursor-pointer"
            >
              Studio SOP
            </button>
            <a href="#testimonials" onClick={() => setIsMenuOpen(false)} className="text-white hover:text-luxury-gold transition-colors">Reviews</a>
            <a href="#booking" onClick={() => setIsMenuOpen(false)} className="text-white hover:text-luxury-gold transition-colors">Reserve</a>
            <a href="#contact" onClick={() => setIsMenuOpen(false)} className="text-white hover:text-luxury-gold transition-colors">Contact</a>

            {role !== 'guest' && (
              <div className="flex flex-col items-center gap-4 pt-4 border-t border-white/10 w-48">
                {isAdmin && (
                  <button
                    onClick={() => {
                      setCurrentView('dashboard');
                      setIsMenuOpen(false);
                    }}
                    className="text-luxury-gold uppercase tracking-[0.3em] hover:text-white transition-colors text-sm"
                  >
                    Go to Dashboard
                  </button>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="text-white uppercase tracking-[0.3em] border border-white/20 rounded-full px-5 py-2 hover:border-luxury-gold transition-colors text-xs"
                >
                  Logout
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {currentView === 'dashboard' ? (
        <Dashboard
          role={role}
          email={user?.email || null}
          onBack={() => setCurrentView('home')}
          onLogout={handleLogout}
          bookings={bookings}
          testimonials={testimonials}
          uploadedImages={uploadedImages}
          categories={categories}
          customCategories={customCategories}
          onOpenSOP={() => setIsSOPModalOpen(true)}
        />
      ) : (
        <>
          <Hero />

          <About />
          <Services 
            uploadedImages={uploadedImages} 
            setSelectedImage={setSelectedImage}
          />
          <Portfolio
            setIsGalleryOpen={setIsGalleryOpen}
            setSelectedImage={setSelectedImage}
            isAuthenticated={isAuthenticated}
            userRole={role}
            uploadedImages={uploadedImages}
            categories={categories}
          />
          <Testimonials 
            testimonials={testimonials} 
          />
          <Booking 
            categories={categories}
            onOpenSOP={() => setIsSOPModalOpen(true)}
          />
          <Contact />
          <Footer 
            onOpenSOP={() => setIsSOPModalOpen(true)}
          />
        </>
      )}

      {/* Full Gallery Modal */}
      <FullGallery 
        isOpen={isGalleryOpen} 
        onClose={() => setIsGalleryOpen(false)} 
        setSelectedImage={setSelectedImage} 
        isAuthenticated={isAuthenticated}
        userRole={role}
        uploadedImages={uploadedImages}
        categories={categories}
      />

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-110 bg-luxury-ink/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-12 cursor-zoom-out"
          >
            <motion.button
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute top-8 right-8 text-white hover:text-luxury-gold transition-colors z-120 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(null);
              }}
            >
              <X size={36} strokeWidth={1.5} />
            </motion.button>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative max-w-full max-h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage.src}
                className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl border border-white/10"
                alt={selectedImage.title || "Enlarged Portfolio"}
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-24 left-0 right-0 flex flex-col items-center gap-3">
                <div className="flex items-center gap-2">
                  {selectedImage.category && (
                    <span className="text-luxury-gold text-xs uppercase tracking-[0.3em] font-semibold">
                      {selectedImage.category}
                    </span>
                  )}
                  {selectedImage.gender && (
                    <span className="text-white/60 text-xs uppercase tracking-[0.2em] font-light">
                      • {selectedImage.gender}
                    </span>
                  )}
                </div>
                {selectedImage.title && (
                  <p className="text-white text-sm font-serif italic max-w-md text-center">
                    {selectedImage.title}
                  </p>
                )}
                <div className="flex gap-3 mt-1">
                  <button 
                    onClick={() => {
                      setSelectedImage(null);
                      setIsGalleryOpen(false);
                      document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-6 py-2 rounded-full bg-luxury-gold text-luxury-ink font-medium text-[10px] uppercase tracking-widest hover:bg-white transition-colors cursor-pointer"
                  >
                    Book This Look
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShare(selectedImage.src);
                    }}
                    className="px-6 py-2 border border-white/20 rounded-full text-white text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all min-w-[100px] cursor-pointer"
                  >
                    {copied ? 'Copied!' : 'Share'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
