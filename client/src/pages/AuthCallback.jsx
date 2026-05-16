import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthCallback() {
  const [params] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get('token');
    const setup = params.get('setup');
    if (token) {
      login(token).then(() => {
        navigate(setup ? '/edit-profile' : '/dashboard', { replace: true });
      }).catch(() => navigate('/', { replace: true }));
    } else {
      navigate('/', { replace: true });
    }
  }, []);

  return (
    <div className="loading" style={{ minHeight: '100vh', alignItems: 'center' }}>
      <div className="spinner"></div>
    </div>
  );
}
