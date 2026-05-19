import { useState } from 'react'
import Landing from './pages/Landing'
import Admin from './pages/Admin'
import Bio from './pages/Bio'
import Art from './pages/Art'
import Video from './pages/Video'
import Design from './pages/Design'


export default function App() {
  const isAdmin = window.location.pathname === '/admin' || window.location.hash === '#/admin'
  const [page, setPage] = useState(isAdmin ? 'admin' : 'landing')

  const handleEnter = (section) => {
    setPage(section)
  }

  const goBack = () => setPage('landing')

  return (
    <div>
      {page === 'landing' && <Landing onEnter={handleEnter} />}
      {page === 'bio' && <Bio onBack={goBack} />}
      {page === 'art' && <Art onBack={goBack} />}
      {page === 'video' && <Video onBack={goBack} />}
      {page === 'design' && <div style={{color:'white',display:'flex',alignItems:'center',justifyContent:'center',height:'100vh'}}></div>}
      {page === 'admin' && <Admin />}
      {page === 'design' && <Design onBack={goBack} />}
    </div>
  )
}