import { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext.jsx';
import Landing from './pages/Landing';
import Bio from './pages/Bio';
import Art from './pages/Art';
import Video from './pages/Video';
import Design from './pages/Design';
import Story from './pages/Story';
import Index from './pages/Index';
import World from './pages/World';
import Admin from './pages/Admin';
import Auth from './pages/Auth';
import CreateCharacter from './pages/CreateCharacter';
import Profile from './pages/Profile';

export default function App() {
  const isAdmin = window.location.pathname === '/admin' || window.location.hash === '#/admin';
  const isAuth = window.location.pathname === '/auth' || window.location.hash === '#/auth';
  const isCreateChar = window.location.pathname === '/create-character' || window.location.hash === '#/create-character';
  const isProfile = window.location.pathname === '/profile' || window.location.hash === '#/profile';
  const [page, setPage] = useState(isAdmin ? 'admin' : isAuth ? 'auth' : isCreateChar ? 'create-character' : isProfile ? 'profile' : 'landing');

  const goBack = () => setPage('landing');

  return (
    <AuthProvider>
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
        {page === 'auth' && <Auth onBack={goBack} />}
        {page === 'create-character' && <CreateCharacter onBack={goBack} />}
        {page === 'profile' && <Profile onBack={goBack} />}
      </div>
    </AuthProvider>
  );
}
