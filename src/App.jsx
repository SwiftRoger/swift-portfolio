import { useState } from 'react'
import Landing from './pages/Landing'
import Bio from './pages/Bio'
import Art from './pages/Art'
import Video from './pages/Video'
import Design from './pages/Design'
import Story from './pages/Story'
import Index from './pages/Index'
import World from './pages/World'
import Admin from './pages/Admin'

export default function App() {
  const isAdmin = window.location.pathname === '/admin' || window.location.hash === '#/admin'
  const [page, setPage] = useState(isAdmin ? 'admin' : 'landing')

  const goBack = () => setPage('landing')

  return (
    <div>
      {page === 'landing' && <Landing onEnter={setPage} />}
      {page === 'bio' && <Bio onBack={goBack} />}
      {page === 'art' && <Art onBack={goBack} />}
      {page === 'videos' && <Video onBack={goBack} />}
      {page === 'design' && <Design onBack={goBack} />}
      {page === 'story' && <Story onBack={goBack} />}
      {page === 'index' && <Index onBack={goBack} />}
      {page === 'world' && <World onBack={goBack} />}
      {page === 'admin' && <Admin />}
    </div>
  )
}
