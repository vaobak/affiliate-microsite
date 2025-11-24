import { useState, useEffect } from 'react';
import { isAuthenticated } from '../utils/auth';

export function useAuth() {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    setAuthenticated(isAuthenticated());
  }, []);

  return authenticated;
}
