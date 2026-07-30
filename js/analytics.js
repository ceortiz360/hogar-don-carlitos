// Vercel Web Analytics initialization
import { inject } from 'https://cdn.jsdelivr.net/npm/@vercel/analytics@2.0.1/dist/index.mjs';

// Initialize Vercel Web Analytics
inject({
  mode: 'auto', // Auto-detect production vs development
  debug: false  // Set to true to see analytics events in console during development
});
