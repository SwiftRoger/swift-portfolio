import axios from 'axios'

// In Vercel, /api/* routes are on the same domain — no separate server needed
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || ''
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
