import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // MongoDB Connection Placeholder
  let MONGODB_URI = (process.env.MONGODB_URI || '').trim();
  
  // Remove quotes if they were accidentally included in the env variable
  if (MONGODB_URI.startsWith('"') && MONGODB_URI.endsWith('"')) {
    MONGODB_URI = MONGODB_URI.substring(1, MONGODB_URI.length - 1);
  }

  const isPlaceholder = !MONGODB_URI || MONGODB_URI.includes('<username>');

  if (isPlaceholder) {
    console.warn('⚠️ MongoDB URI is missing or still a placeholder. Database features will not work.');
    // Use a dummy string to avoid the "Invalid scheme" crash, but it will still fail to connect
    MONGODB_URI = 'mongodb://localhost:27017/placeholder';
  }
  
  mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch(err => {
      console.error('❌ MongoDB connection error:', err.message);
      if (isPlaceholder) {
        console.error('👉 Please set a valid MONGODB_URI in your environment variables.');
      }
    });

  // --- Mongoose Models ---
  const BookingSchema = new mongoose.Schema({
    name: String,
    email: String,
    service: String,
    date: String,
    time: String,
    status: { type: String, default: 'Pending' },
    notes: String,
    createdAt: { type: Date, default: Date.now }
  });
  const Booking = mongoose.model('Booking', BookingSchema);

  const TestimonialSchema = new mongoose.Schema({
    author: String,
    quote: String,
    rating: Number,
    role: { type: String, default: 'Client' },
    image: String,
    status: { type: String, default: 'pending' },
    createdAt: { type: Date, default: Date.now }
  });
  const Testimonial = mongoose.model('Testimonial', TestimonialSchema);

  const GallerySchema = new mongoose.Schema({
    src: String,
    category: String,
    isHidden: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  });
  const GalleryImage = mongoose.model('GalleryImage', GallerySchema);

  // --- API Routes ---
  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

  // Bookings
  app.get('/api/bookings', async (req, res) => {
    try {
      const bookings = await Booking.find().sort({ createdAt: -1 });
      res.json(bookings);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch bookings' });
    }
  });

  app.post('/api/bookings', async (req, res) => {
    try {
      const newBooking = new Booking(req.body);
      await newBooking.save();
      res.status(201).json(newBooking);
    } catch (err) {
      res.status(400).json({ error: 'Failed to create booking' });
    }
  });

  app.patch('/api/bookings/:id', async (req, res) => {
    try {
      const updated = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json(updated);
    } catch (err) {
      res.status(400).json({ error: 'Failed to update booking' });
    }
  });

  app.delete('/api/bookings/:id', async (req, res) => {
    try {
      await Booking.findByIdAndDelete(req.params.id);
      res.json({ message: 'Booking deleted' });
    } catch (err) {
      res.status(400).json({ error: 'Failed to delete booking' });
    }
  });

  // Testimonials
  app.get('/api/testimonials', async (req, res) => {
    try {
      const testimonials = await Testimonial.find().sort({ createdAt: -1 });
      res.json(testimonials);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch testimonials' });
    }
  });

  app.post('/api/testimonials', async (req, res) => {
    try {
      const newTestimonial = new Testimonial(req.body);
      await newTestimonial.save();
      res.status(201).json(newTestimonial);
    } catch (err) {
      res.status(400).json({ error: 'Failed to submit testimonial' });
    }
  });

  app.patch('/api/testimonials/:id', async (req, res) => {
    try {
      const updated = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json(updated);
    } catch (err) {
      res.status(400).json({ error: 'Failed to update testimonial' });
    }
  });

  app.delete('/api/testimonials/:id', async (req, res) => {
    try {
      await Testimonial.findByIdAndDelete(req.params.id);
      res.json({ message: 'Testimonial deleted' });
    } catch (err) {
      res.status(400).json({ error: 'Failed to delete testimonial' });
    }
  });

  // Gallery
  app.get('/api/gallery', async (req, res) => {
    try {
      const images = await GalleryImage.find().sort({ createdAt: -1 });
      res.json(images);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch gallery' });
    }
  });

  app.post('/api/gallery', async (req, res) => {
    try {
      const newImage = new GalleryImage(req.body);
      await newImage.save();
      res.status(201).json(newImage);
    } catch (err) {
      res.status(400).json({ error: 'Failed to add image' });
    }
  });

  app.patch('/api/gallery/:id', async (req, res) => {
    try {
      const updated = await GalleryImage.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json(updated);
    } catch (err) {
      res.status(400).json({ error: 'Failed to update image' });
    }
  });

  app.delete('/api/gallery/:id', async (req, res) => {
    try {
      await GalleryImage.findByIdAndDelete(req.params.id);
      res.json({ message: 'Image deleted' });
    } catch (err) {
      res.status(400).json({ error: 'Failed to delete image' });
    }
  });

  // API 404 Handler (to prevent HTML fallback for missing API routes)
  app.use('/api', (req, res) => {
    res.status(404).json({ error: `API route not found: ${req.method} ${req.originalUrl}` });
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
