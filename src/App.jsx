import { useState } from 'react'
import Landing from './pages/Landing'
import Portfolio from './pages/Portfolio'
import Admin from './pages/Admin'

export default function App() {
  // Use hash-based routing so Vite dev server works without config
  const isAdmin = window.location.hash === '#/admin' || window.location.pathname === '/admin'
  const [page, setPage] = useState(isAdmin ? 'admin' : 'landing')

  return (
    <div>
      {page === 'landing' && <Landing onEnter={() => setPage('portfolio')} />}
      {page === 'portfolio' && <Portfolio />}
      {page === 'admin' && <Admin />}
    </div>
  )
}
