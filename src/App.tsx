import React, { useState } from 'react';
import { Auth } from './components/Auth';
import { Chat } from './components/Chat';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  const handleAuth = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  if (!token) {
    return <Auth onAuth={handleAuth} />;
  }

  return <Chat token={token} onLogout={handleLogout} />;
}

export default App;