import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { 
  Search, Users, FileText, ArrowLeft, ChevronRight, 
  CheckCircle2, Clock, XCircle, Trash2, MessageSquare, 
  Star, Eye, EyeOff, LayoutDashboard, Calendar, 
  Image as ImageIcon, Sparkles, LogOut, TrendingUp, Plus, ShieldCheck, Tag
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { doc, updateDoc, deleteDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { BookingData, Testimonial, UploadedImage, CategoryItem, GenderTag } from '../types';
import { ImageUploadForm } from './ImageUploadForm';

interface DashboardProps {
  role: 'admin' | 'client' | 'guest';
  email: string | null;
  onBack: () => void;
  onLogout: () => void;
  bookings: BookingData[];
  testimonials: Testimonial[];
  uploadedImages: UploadedImage[];
  categories?: string[];
  customCategories?: CategoryItem[];
  onOpenSOP?: () => void;
}

const AdminDashboard = ({ 
  bookings, 
  testimonials, 
  uploadedImages,
  categories = ['Bridal Makeup', 'Event Makeup', 'Pageant Makeup', 'Photoshoot Makeup', 'Transformation'],
  customCategories = [],
  onOpenSOP,
  onLogout
}: { 
  bookings: BookingData[]; 
  testimonials: Testimonial[];
  uploadedImages: UploadedImage[];
  categories?: string[];
  customCategories?: CategoryItem[];
  onOpenSOP?: () => void;
  onLogout: () => void;
}) => {
  const [search, setSearch] = useState('');
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'testimonials' | 'gallery' | 'categories'>('overview');
  
  // Gallery filter states in dashboard
  const [galleryGenderFilter, setGalleryGenderFilter] = useState<'All' | GenderTag>('All');
  const [galleryCatFilter, setGalleryCatFilter] = useState<string>('All');

  // Category creation form state
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [isAddingCat, setIsAddingCat] = useState(false);
  const [catMessage, setCatMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Mock data for the chart based on bookings
  const chartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({
      name: month,
      bookings: Math.floor(Math.random() * 20) + 5,
      revenue: Math.floor(Math.random() * 5000) + 2000,
    }));
  }, []);

  const filteredBookings = useMemo(
    () => bookings.filter((booking) =>
      booking.id?.toLowerCase().includes(search.toLowerCase()) ||
      booking.name.toLowerCase().includes(search.toLowerCase()) ||
      booking.email.toLowerCase().includes(search.toLowerCase())
    ),
    [search, bookings]
  );

  const pendingTestimonials = testimonials.filter(t => t.status === 'pending');

  const totalClients = useMemo(
    () => new Set(bookings.map((booking) => booking.email)).size,
    [bookings]
  );

  const selectedBooking = bookings.find((booking) => booking.id === selectedBookingId) || filteredBookings[0] || null;

  // Filtered gallery in admin
  const filteredGalleryImages = useMemo(() => {
    return uploadedImages.filter(img => {
      const matchGender = galleryGenderFilter === 'All' || img.gender === galleryGenderFilter;
      const matchCat = galleryCatFilter === 'All' || img.category === galleryCatFilter;
      return matchGender && matchCat;
    });
  }, [uploadedImages, galleryGenderFilter, galleryCatFilter]);

  const removeUploaded = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this image permanently?')) {
      try {
        await deleteDoc(doc(db, 'gallery', id));
      } catch (error) {
        console.error(error);
        handleFirestoreError(error, OperationType.DELETE, `gallery/${id}`);
      }
    }
  };

  const toggleHideImage = async (id: string, currentHidden: boolean) => {
    try {
      await updateDoc(doc(db, 'gallery', id), { isHidden: !currentHidden });
    } catch (error) {
      console.error(error);
      handleFirestoreError(error, OperationType.UPDATE, `gallery/${id}`);
    }
  };

  const updateStatus = async (id: string, status: BookingData['status']) => {
    try {
      await updateDoc(doc(db, 'bookings', id), { status });
    } catch (error) {
      console.error(error);
      handleFirestoreError(error, OperationType.UPDATE, `bookings/${id}`);
    }
  };

  const deleteBooking = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        await deleteDoc(doc(db, 'bookings', id));
      } catch (error) {
        console.error(error);
        handleFirestoreError(error, OperationType.DELETE, `bookings/${id}`);
      }
    }
  };

  const approveTestimonial = async (id: string) => {
    try {
      await updateDoc(doc(db, 'testimonials', id), { status: 'approved' });
    } catch (error) {
      console.error(error);
      handleFirestoreError(error, OperationType.UPDATE, `testimonials/${id}`);
    }
  };

  const deleteTestimonial = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this testimonial?')) {
      try {
        await deleteDoc(doc(db, 'testimonials', id));
      } catch (error) {
        console.error(error);
        handleFirestoreError(error, OperationType.DELETE, `testimonials/${id}`);
      }
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setIsAddingCat(true);
    setCatMessage(null);
    try {
      await addDoc(collection(db, 'categories'), {
        name: newCatName.trim(),
        description: newCatDesc.trim(),
        createdAt: serverTimestamp()
      });
      setCatMessage({ type: 'success', text: `Category "${newCatName.trim()}" added successfully!` });
      setNewCatName('');
      setNewCatDesc('');
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.WRITE, 'categories');
      setCatMessage({ type: 'error', text: 'Failed to add category. Please check permissions.' });
    } finally {
      setIsAddingCat(false);
    }
  };

  const handleDeleteCategory = async (catId: string, name: string) => {
    if (window.confirm(`Delete the custom category "${name}"?`)) {
      try {
        await deleteDoc(doc(db, 'categories', catId));
      } catch (err) {
        console.error(err);
        handleFirestoreError(err, OperationType.DELETE, `categories/${catId}`);
      }
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar Navigation */}
      <aside className="lg:w-64 flex-shrink-0">
        <div className="sticky top-32 space-y-2">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl transition-all cursor-pointer ${activeTab === 'overview' ? 'bg-luxury-ink text-white shadow-lg' : 'text-luxury-ink/60 hover:bg-white hover:text-luxury-ink'}`}
          >
            <LayoutDashboard size={18} />
            <span className="text-sm font-medium">Overview</span>
          </button>
          <button 
            onClick={() => setActiveTab('bookings')}
            className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl transition-all cursor-pointer ${activeTab === 'bookings' ? 'bg-luxury-ink text-white shadow-lg' : 'text-luxury-ink/60 hover:bg-white hover:text-luxury-ink'}`}
          >
            <Calendar size={18} />
            <span className="text-sm font-medium">Bookings</span>
          </button>
          <button 
            onClick={() => setActiveTab('testimonials')}
            className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl transition-all cursor-pointer ${activeTab === 'testimonials' ? 'bg-luxury-ink text-white shadow-lg' : 'text-luxury-ink/60 hover:bg-white hover:text-luxury-ink'}`}
          >
            <MessageSquare size={18} />
            <span className="text-sm font-medium">Reviews</span>
          </button>
          <button 
            onClick={() => setActiveTab('gallery')}
            className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl transition-all cursor-pointer ${activeTab === 'gallery' ? 'bg-luxury-ink text-white shadow-lg' : 'text-luxury-ink/60 hover:bg-white hover:text-luxury-ink'}`}
          >
            <ImageIcon size={18} />
            <span className="text-sm font-medium">Gallery & Upload</span>
          </button>
          <button 
            onClick={() => setActiveTab('categories')}
            className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl transition-all cursor-pointer ${activeTab === 'categories' ? 'bg-luxury-ink text-white shadow-lg' : 'text-luxury-ink/60 hover:bg-white hover:text-luxury-ink'}`}
          >
            <Tag size={18} />
            <span className="text-sm font-medium">Makeup Categories</span>
          </button>
          
          <div className="pt-6 mt-6 border-t border-luxury-ink/10 space-y-2">
            {onOpenSOP && (
              <button 
                onClick={onOpenSOP}
                className="w-full flex items-center gap-3 px-6 py-3.5 rounded-2xl text-luxury-gold bg-luxury-ink/5 hover:bg-luxury-gold/10 transition-all cursor-pointer"
              >
                <ShieldCheck size={18} />
                <span className="text-xs uppercase tracking-wider font-semibold">Studio SOP</span>
              </button>
            )}

            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-6 py-3.5 rounded-2xl text-red-500/70 hover:bg-red-50 hover:text-red-600 transition-all cursor-pointer"
            >
              <LogOut size={18} />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 space-y-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
              <div className="rounded-[2rem] bg-white p-6 md:p-8 border border-luxury-ink/10 shadow-sm">
                <div className="flex items-center gap-3 text-luxury-gold mb-4">
                  <Users size={20} />
                  <p className="uppercase tracking-[0.35em] text-[10px] md:text-xs text-luxury-ink/50">Clients</p>
                </div>
                <p className="text-4xl md:text-5xl font-serif">{totalClients}</p>
                <div className="flex items-center gap-1 text-green-600 text-[10px] mt-2">
                  <TrendingUp size={12} />
                  <span>+12% from last month</span>
                </div>
              </div>

              <div className="rounded-[2rem] bg-white p-6 md:p-8 border border-luxury-ink/10 shadow-sm">
                <div className="flex items-center gap-3 text-luxury-gold mb-4">
                  <FileText size={20} />
                  <p className="uppercase tracking-[0.35em] text-[10px] md:text-xs text-luxury-ink/50">Bookings</p>
                </div>
                <p className="text-4xl md:text-5xl font-serif">{bookings.length}</p>
                <div className="flex items-center gap-1 text-green-600 text-[10px] mt-2">
                  <TrendingUp size={12} />
                  <span>+5% from last month</span>
                </div>
              </div>

              <div className="rounded-[2rem] bg-white p-6 md:p-8 border border-luxury-ink/10 shadow-sm">
                <div className="flex items-center gap-3 text-luxury-gold mb-4">
                  <MessageSquare size={20} />
                  <p className="uppercase tracking-[0.35em] text-[10px] md:text-xs text-luxury-ink/50">Pending</p>
                </div>
                <p className="text-4xl md:text-5xl font-serif">{pendingTestimonials.length}</p>
                <p className="text-[10px] text-luxury-ink/40 mt-2 italic">Awaiting approval</p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
              <section className="rounded-[2rem] bg-white p-6 md:p-8 border border-luxury-ink/10 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h4 className="text-xl font-serif">Booking Trends</h4>
                  <span className="text-[10px] uppercase tracking-widest text-luxury-ink/40">Real-time stats</span>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#C5A880" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#C5A880" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
                      <Tooltip />
                      <Area type="monotone" dataKey="bookings" stroke="#C5A880" fillOpacity={1} fill="url(#colorBookings)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </section>

              <section className="rounded-[2rem] bg-white p-6 md:p-8 border border-luxury-ink/10 shadow-sm">
                <h4 className="text-xl font-serif mb-6">Quick Overview</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-luxury-cream/40 rounded-2xl border border-luxury-ink/5">
                    <span className="text-xs uppercase tracking-wider text-luxury-ink/60">Portfolio Photos</span>
                    <span className="font-serif text-lg font-bold text-luxury-ink">{uploadedImages.length}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-luxury-cream/40 rounded-2xl border border-luxury-ink/5">
                    <span className="text-xs uppercase tracking-wider text-luxury-ink/60">Active Categories</span>
                    <span className="font-serif text-lg font-bold text-luxury-ink">{categories.length}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-luxury-cream/40 rounded-2xl border border-luxury-ink/5">
                    <span className="text-xs uppercase tracking-wider text-luxury-ink/60">Customer Reviews</span>
                    <span className="font-serif text-lg font-bold text-luxury-ink">{testimonials.length}</span>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-luxury-ink/10">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-luxury-ink/30" size={16} />
                <input
                  type="text"
                  placeholder="Search bookings by client name, email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-2 bg-transparent text-sm focus:outline-none placeholder:text-luxury-ink/30"
                />
              </div>
            </div>

            <div className="rounded-[2rem] bg-white overflow-hidden border border-luxury-ink/10 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-luxury-cream/60 border-b border-luxury-ink/5 text-[10px] uppercase tracking-widest text-luxury-ink/50">
                    <tr>
                      <th className="p-4 sm:p-6">Client</th>
                      <th className="p-4 sm:p-6">Service</th>
                      <th className="p-4 sm:p-6">Schedule</th>
                      <th className="p-4 sm:p-6">Status</th>
                      <th className="p-4 sm:p-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-luxury-ink/5">
                    {filteredBookings.length > 0 ? (
                      filteredBookings.map((b) => (
                        <tr key={b.id} className="hover:bg-luxury-cream/20 transition-colors">
                          <td className="p-4 sm:p-6">
                            <p className="font-medium text-luxury-ink">{b.name}</p>
                            <p className="text-xs text-luxury-ink/40">{b.email}</p>
                          </td>
                          <td className="p-4 sm:p-6">
                            <span className="px-3 py-1 rounded-full bg-luxury-gold/10 text-luxury-gold text-xs font-medium">
                              {b.service}
                            </span>
                          </td>
                          <td className="p-4 sm:p-6">
                            <p className="text-luxury-ink">{b.date}</p>
                            <p className="text-xs text-luxury-ink/40">{b.time}</p>
                          </td>
                          <td className="p-4 sm:p-6">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              b.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                              b.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                              'bg-amber-100 text-amber-700'
                            }`}>
                              {b.status}
                            </span>
                          </td>
                          <td className="p-4 sm:p-6 text-right space-x-2">
                            {b.status !== 'Confirmed' && (
                              <button
                                onClick={() => updateStatus(b.id, 'Confirmed')}
                                className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors cursor-pointer"
                                title="Confirm booking"
                              >
                                <CheckCircle2 size={16} />
                              </button>
                            )}
                            {b.status !== 'Cancelled' && (
                              <button
                                onClick={() => updateStatus(b.id, 'Cancelled')}
                                className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                                title="Cancel booking"
                              >
                                <XCircle size={16} />
                              </button>
                            )}
                            <button
                              onClick={() => deleteBooking(b.id)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete booking"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-12 text-center text-luxury-ink/40 italic">
                          No bookings found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'testimonials' && (
          <section className="rounded-[2rem] bg-white p-6 md:p-8 border border-luxury-ink/10 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xl font-serif">Client Reviews Moderation</h4>
                <p className="text-xs text-luxury-ink/40 mt-1">Approve pending reviews to display on the live website</p>
              </div>
              <span className="text-xs uppercase tracking-widest text-luxury-gold font-semibold">
                {pendingTestimonials.length} Pending
              </span>
            </div>

            <div className="space-y-4">
              {testimonials.length > 0 ? (
                testimonials.map((t) => (
                  <div key={t.id} className="p-5 rounded-2xl border border-luxury-ink/10 bg-luxury-cream/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-sm text-luxury-ink">{t.author}</span>
                        <span className={`text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full font-medium ${
                          t.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {t.status}
                        </span>
                        <div className="flex text-luxury-gold">
                          {Array.from({ length: t.rating || 5 }).map((_, i) => (
                            <Star key={i} size={12} fill="currentColor" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-luxury-ink/75 italic max-w-2xl">"{t.quote}"</p>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {t.status === 'pending' && (
                        <button
                          onClick={() => approveTestimonial(t.id)}
                          className="px-4 py-1.5 rounded-full bg-green-600 text-white text-xs hover:bg-green-700 transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <CheckCircle2 size={14} /> Approve
                        </button>
                      )}
                      <button
                        onClick={() => deleteTestimonial(t.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                        title="Delete review"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-luxury-ink/40 italic">
                  No client reviews yet.
                </div>
              )}
            </div>
          </section>
        )}

        {activeTab === 'gallery' && (
          <div className="space-y-8">
            {/* Direct Dashboard Media Upload Form */}
            <ImageUploadForm
              title="Add New Makeup Photo"
              description="Upload portfolio photos categorized by makeup type and client demographic (Female, Male, Gender-Inclusive)"
              categories={categories}
            />

            {/* Manage Uploaded Photos */}
            <section className="rounded-[2rem] bg-white p-6 md:p-8 border border-luxury-ink/10 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-xl font-serif">Portfolio Collection Management</h4>
                  <p className="text-xs text-luxury-ink/40 mt-1">Showing {filteredGalleryImages.length} of {uploadedImages.length} total uploads</p>
                </div>

                {/* Filter Controls */}
                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={galleryGenderFilter}
                    onChange={(e) => setGalleryGenderFilter(e.target.value as any)}
                    className="text-xs bg-luxury-cream/50 border border-luxury-ink/10 rounded-xl px-3 py-2 text-luxury-ink focus:outline-none"
                  >
                    <option value="All">All Genders</option>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Gender-Inclusive">Gender-Inclusive</option>
                  </select>

                  <select
                    value={galleryCatFilter}
                    onChange={(e) => setGalleryCatFilter(e.target.value)}
                    className="text-xs bg-luxury-cream/50 border border-luxury-ink/10 rounded-xl px-3 py-2 text-luxury-ink focus:outline-none"
                  >
                    <option value="All">All Categories</option>
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Grid of Images */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {filteredGalleryImages.length > 0 ? (
                  filteredGalleryImages.map((img) => (
                    <div key={img.id} className="relative group rounded-2xl overflow-hidden border border-luxury-ink/10 bg-luxury-cream/30 aspect-square shadow-xs">
                      <img 
                        src={img.src} 
                        alt={img.title || "Gallery"} 
                        className={`w-full h-full object-cover transition-opacity duration-300 ${img.isHidden ? 'opacity-40 grayscale' : 'opacity-100'}`} 
                      />
                      
                      {/* Action Overlay */}
                      <div className="absolute inset-0 bg-luxury-ink/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button
                          onClick={() => toggleHideImage(img.id, !!img.isHidden)}
                          className="p-2.5 bg-white text-luxury-ink rounded-full transition-all hover:scale-110 cursor-pointer shadow-md"
                          title={img.isHidden ? "Show in public gallery" : "Hide from public gallery"}
                        >
                          {img.isHidden ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                        <button
                          onClick={() => removeUploaded(img.id)}
                          className="p-2.5 bg-red-500 text-white rounded-full transition-all hover:scale-110 cursor-pointer shadow-md"
                          title="Delete permanently"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {/* Status & Category Badges */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        <span className="bg-luxury-ink/80 backdrop-blur-md text-[8px] text-white uppercase tracking-widest px-2 py-0.5 rounded-md font-medium">
                          {img.gender || 'Female'}
                        </span>
                        {img.isHidden && (
                          <span className="bg-red-500/90 text-[8px] text-white uppercase tracking-widest px-2 py-0.5 rounded-md font-medium">
                            Hidden
                          </span>
                        )}
                      </div>

                      <div className="absolute bottom-2 left-2 right-2 bg-white/90 backdrop-blur-md text-[8px] text-luxury-ink uppercase tracking-widest px-2 py-1 rounded-md truncate text-center font-medium">
                        {img.category}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-16 bg-luxury-cream/20 rounded-2xl border border-dashed border-luxury-ink/15">
                    <p className="text-sm text-luxury-ink/40 italic">No images found for this category or demographic filter.</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {/* Categories Tab: Dynamic Category Management */}
        {activeTab === 'categories' && (
          <div className="space-y-8">
            {/* Create Category Form */}
            <section className="rounded-[2rem] bg-white p-6 md:p-8 border border-luxury-ink/10 shadow-sm space-y-6">
              <div className="flex items-center gap-2 text-luxury-gold text-xs uppercase tracking-widest font-medium">
                <Plus size={16} /> Expand Your Services
              </div>
              <div>
                <h4 className="text-xl sm:text-2xl font-serif italic text-luxury-ink">Add Custom Makeup Category</h4>
                <p className="text-xs text-luxury-ink/50 mt-1">
                  Create custom categories (e.g. "Airbrush Bridal", "Debut / Quinceañera", "Editorial Runway"). These will automatically appear in your portfolio filters, image uploads, and client booking dropdown.
                </p>
              </div>

              <form onSubmit={handleAddCategory} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-luxury-gold mb-2 font-semibold">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      placeholder="e.g. Airbrush Makeup, Debut Look..."
                      className="w-full bg-luxury-cream/40 border border-luxury-ink/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-luxury-gold/30 text-luxury-ink"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-luxury-gold mb-2 font-semibold">
                      Brief Description (Optional)
                    </label>
                    <input
                      type="text"
                      value={newCatDesc}
                      onChange={(e) => setNewCatDesc(e.target.value)}
                      placeholder="e.g. High-definition flawless airbrush application"
                      className="w-full bg-luxury-cream/40 border border-luxury-ink/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-luxury-gold/30 text-luxury-ink"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  {catMessage && (
                    <span className={`text-xs ${catMessage.type === 'success' ? 'text-green-600 font-medium' : 'text-red-500'}`}>
                      {catMessage.text}
                    </span>
                  )}
                  <button
                    type="submit"
                    disabled={isAddingCat}
                    className="ml-auto px-6 py-3 rounded-full bg-luxury-ink text-white hover:bg-luxury-gold hover:text-luxury-ink transition-colors text-xs uppercase tracking-widest font-semibold cursor-pointer shadow-md disabled:opacity-50"
                  >
                    {isAddingCat ? 'Creating...' : '+ Create Category'}
                  </button>
                </div>
              </form>
            </section>

            {/* List of Categories */}
            <section className="rounded-[2rem] bg-white p-6 md:p-8 border border-luxury-ink/10 shadow-sm space-y-6">
              <h4 className="text-xl font-serif">Active Service & Makeup Categories</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {/* Standard Base Categories */}
                {['Bridal Makeup', 'Event Makeup', 'Pageant Makeup', 'Photoshoot Makeup', 'Transformation'].map(baseCat => (
                  <div key={baseCat} className="p-4 rounded-2xl border border-luxury-ink/10 bg-luxury-cream/20 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm text-luxury-ink">{baseCat}</p>
                      <span className="text-[9px] uppercase tracking-wider text-luxury-gold font-semibold">Standard Core</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-luxury-ink/5 text-luxury-ink/50">Protected</span>
                  </div>
                ))}

                {/* Custom Admin Categories */}
                {customCategories.map(cat => (
                  <div key={cat.id} className="p-4 rounded-2xl border border-luxury-gold/30 bg-luxury-gold/5 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm text-luxury-ink">{cat.name}</p>
                      <p className="text-[10px] text-luxury-ink/50 truncate max-w-[160px]">{cat.description || 'Custom Category'}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteCategory(cat.id, cat.name)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                      title="Delete category"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

const ClientDashboard = ({ email, bookings }: { email: string | null, bookings: BookingData[] }) => {
  const userBookings = bookings.filter(b => b.email === email);

  return (
    <div className="space-y-6 md:space-y-10">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-[2rem] bg-white p-6 md:p-8 border border-luxury-ink/10 shadow-sm">
          <p className="text-xs uppercase tracking-[0.35em] text-luxury-ink/50">My Reservations</p>
          <p className="text-4xl md:text-5xl font-serif mt-2">{userBookings.length}</p>
          <p className="text-xs text-luxury-ink/40 mt-3 font-light">
            Confirmed and upcoming appointments scheduled under {email}.
          </p>
        </div>

        <div className="rounded-[2rem] bg-white p-6 md:p-8 border border-luxury-ink/10 shadow-sm">
          <p className="text-xs uppercase tracking-[0.35em] text-luxury-ink/50">Status</p>
          <p className="text-4xl md:text-5xl font-serif mt-2 text-luxury-gold">Active</p>
          <p className="text-xs text-luxury-ink/40 mt-3 font-light">
            Welcome to your Haus of Von bespoke client area.
          </p>
        </div>
      </div>

      <div className="rounded-[2rem] bg-white p-6 md:p-8 border border-luxury-ink/10 shadow-sm">
        <h3 className="text-xl font-serif italic mb-6">Upcoming Appointments</h3>
        {userBookings.length > 0 ? (
          <div className="divide-y divide-luxury-ink/5">
            {userBookings.map((b) => (
              <div key={b.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-medium text-luxury-ink">{b.service}</h4>
                  <p className="text-xs text-luxury-ink/50">{b.date} at {b.time}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium self-start sm:self-auto ${
                  b.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                  b.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {b.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-luxury-ink/40 italic">
            You currently have no scheduled appointments.
          </div>
        )}
      </div>
    </div>
  );
};

export const Dashboard = ({ 
  role, 
  email, 
  onBack, 
  onLogout, 
  bookings, 
  testimonials, 
  uploadedImages,
  categories,
  customCategories,
  onOpenSOP
}: DashboardProps) => {
  return (
    <div className="min-h-screen bg-luxury-cream pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-luxury-ink/50">{role === 'admin' ? 'Management Portal' : 'Client Space'}</p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif italic mt-4">{role === 'admin' ? 'Von Beauty Admin' : 'Your client space'}</h1>
            <p className="mt-4 max-w-2xl text-sm text-luxury-ink/60 font-light">
              {role === 'admin'
                ? 'Welcome back, Von. Manage client bookings, review approvals, portfolio uploads with gender categorization, and custom makeup types.'
                : 'See your schedule, recent updates, and appointment status.'}
            </p>
          </div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-full border border-luxury-ink/10 bg-white px-5 py-3 text-sm uppercase tracking-[0.35em] text-luxury-ink transition hover:border-luxury-gold hover:text-luxury-gold cursor-pointer"
          >
            <ArrowLeft size={16} /> Back to site
          </button>
        </div>

        {role === 'admin' ? (
          <AdminDashboard 
            bookings={bookings} 
            testimonials={testimonials} 
            uploadedImages={uploadedImages}
            categories={categories}
            customCategories={customCategories}
            onOpenSOP={onOpenSOP}
            onLogout={onLogout}
          />
        ) : (
          <ClientDashboard email={email} bookings={bookings} />
        )}
      </div>
    </div>
  );
};
