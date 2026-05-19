import { useState } from 'react'
import Landing from './pages/Landing'
import Portfolio from './pages/Portfolio'
import Admin from './pages/Admin'

export default function App() {
  const isAdmin = window.location.pathname === '/admin' || window.location.hash === '#/admin'
  const [page, setPage] = useState(isAdmin ? 'admin' : 'landing')
  const [activeSection, setActiveSection] = useState('bio')

  const handleEnter = (section = 'bio') => {
    setActiveSection(section)
    setPage('portfolio')
  }

  return (
    <div>
      {page === 'landing' && <Landing onEnter={handleEnter} />}
      {page === 'portfolio' && <Portfolio initialSection={activeSection} onBack={() => setPage('landing')} />}
      {page === 'admin' && <Admin />}
    </div>
  )
}
