// ============================================
// VERCEL SERVERLESS ENTRY POINT
// ============================================
// Vercel routes all non-static requests to this file.
// It simply re-exports the Express app configured in server.js.
// The app object is already initialized with all routes and middleware.

const app = require('../server');

module.exports = app;
