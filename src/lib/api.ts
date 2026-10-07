/**
 * API Utility for custom Express + MongoDB backend
 */

const API_BASE = '/api';

export const api = {
  // Bookings
  bookings: {
    getAll: () => fetch(`${API_BASE}/bookings`).then(res => res.json()),
    create: (data: any) => fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => res.json()),
    update: (id: string, data: any) => fetch(`${API_BASE}/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => res.json()),
    delete: (id: string) => fetch(`${API_BASE}/bookings/${id}`, {
      method: 'DELETE'
    }).then(res => res.json()),
  },

  // Testimonials
  testimonials: {
    getAll: () => fetch(`${API_BASE}/testimonials`).then(res => res.json()),
    create: (data: any) => fetch(`${API_BASE}/testimonials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => res.json()),
    update: (id: string, data: any) => fetch(`${API_BASE}/testimonials/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => res.json()),
    delete: (id: string) => fetch(`${API_BASE}/testimonials/${id}`, {
      method: 'DELETE'
    }).then(res => res.json()),
  },

  // Gallery
  gallery: {
    getAll: () => fetch(`${API_BASE}/gallery`).then(res => res.json()),
    create: (data: any) => fetch(`${API_BASE}/gallery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => res.json()),
    update: (id: string, data: any) => fetch(`${API_BASE}/gallery/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => res.json()),
    delete: (id: string) => fetch(`${API_BASE}/gallery/${id}`, {
      method: 'DELETE'
    }).then(res => res.json()),
  }
};
