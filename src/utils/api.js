import axios from 'axios'

// Local dev: empty baseURL uses Vite proxy (/api → localhost:3001).
// Production: set VITE_API_URL on Vercel (often empty — same origin).
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
})

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    localStorage.setItem('portfolio_token', token)
  } else {
    delete api.defaults.headers.common['Authorization']
    localStorage.removeItem('portfolio_token')
  }
}

// Load token on startup
const token = localStorage.getItem('portfolio_token')
if (token) setAuthToken(token)

export default api