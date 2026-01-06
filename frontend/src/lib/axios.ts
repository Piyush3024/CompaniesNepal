import axios from "axios";

// Create axios instance with base configuration
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  withCredentials: true, // Important for HTTP-only cookies
  timeout: 10000,
});

