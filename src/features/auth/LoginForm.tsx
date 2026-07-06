import { useState } from 'react';
import { Form, Input, Button, Alert, Typography } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../shared/supabaseClient';

interface LoginValues {
  email: string;
  password: string;
}

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function onFinish(values: LoginValues) {
    setLoading(true);
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword(values);
    setLoading(false);
    if (signInError) {
      setError('Email o contraseña incorrectos.');
      return;
    }
    navigate('/dashboard');
  }

  return (
    <>
      <Typography.Title level={3}>Iniciar sesión</Typography.Title>
      {error && <Alert type="error" message={error} style={{ marginBottom: 16 }} />}
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="password" label="Contraseña" rules={[{ required: true, min: 6 }]}>
          <Input.Password />
        </Form.Item>
        <Form.Item>
          <Button type="primary" className="lp-btn-primary" htmlType="submit" loading={loading} block>
            Entrar
          </Button>
        </Form.Item>
      </Form>
      <Typography.Paragraph>
        <Link to="/recuperar-password">¿Olvidaste tu contraseña?</Link>
      </Typography.Paragraph>
      <Typography.Paragraph>
        ¿No tienes cuenta? <Link to="/registro">Regístrate</Link>
      </Typography.Paragraph>
    </>
  );
}
