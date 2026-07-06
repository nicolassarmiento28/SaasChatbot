import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spin } from 'antd';
import { useSession } from './useSession';

export function AuthCallback() {
  const { session, loading } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    navigate(session ? '/dashboard' : '/login', { replace: true });
  }, [session, loading, navigate]);

  return <Spin style={{ display: 'flex', justifyContent: 'center', marginTop: 64 }} />;
}
