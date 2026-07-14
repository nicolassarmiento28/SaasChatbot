import { useState } from 'react';
import { Form, Input, Button, Alert, Typography, Card } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../shared/supabaseClient';

interface LoginValues {
  email: string;
  password: string;
}

const DEMO_CREDENTIALS: LoginValues = {
  email: 'demo@saaschatbotia.com',
  password: 'DemoBrasa2026!',
};

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm<LoginValues>();
  const navigate = useNavigate();

  async function doLogin(values: LoginValues) {
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

  function fillDemoCredentials() {
    form.setFieldsValue(DEMO_CREDENTIALS);
  }

  return (
    <>
      <Typography.Title level={3}>Iniciar sesión</Typography.Title>
      {error && <Alert type="error" message={error} style={{ marginBottom: 16 }} />}
      <Form form={form} layout="vertical" onFinish={doLogin}>
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

      <Card size="small" style={{ marginBottom: 16, background: '#fff7ed', borderColor: '#fed7aa' }}>
        <Typography.Text strong>
          🍽️ Prueba el dashboard con "Restaurante La Brasa"
        </Typography.Text>
        <Typography.Paragraph style={{ margin: '8px 0' }}>
          Es una cuenta demo ya configurada con un chatbot y base de conocimiento reales,
          para que explores el panel sin crear tu propia cuenta.
        </Typography.Paragraph>
        <Typography.Text code copyable style={{ display: 'block' }}>
          {DEMO_CREDENTIALS.email}
        </Typography.Text>
        <Typography.Text code copyable style={{ display: 'block', marginBottom: 8 }}>
          {DEMO_CREDENTIALS.password}
        </Typography.Text>
        <Button onClick={fillDemoCredentials} block>
          Usar cuenta demo
        </Button>
      </Card>

      <Typography.Paragraph>
        <Link to="/recuperar-password">¿Olvidaste tu contraseña?</Link>
      </Typography.Paragraph>
      <Typography.Paragraph>
        ¿No tienes cuenta? <Link to="/registro">Regístrate</Link>
      </Typography.Paragraph>
    </>
  );
}
