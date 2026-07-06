import { useState } from 'react';
import { Form, Input, Button, Alert, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { supabase } from '../../shared/supabaseClient';

interface ForgotPasswordValues {
  email: string;
}

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onFinish(values: ForgotPasswordValues) {
    setLoading(true);
    setError(null);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    });
    setLoading(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return <Alert type="success" message="Revisa tu email para restablecer tu contraseña." />;
  }

  return (
    <>
      <Typography.Title level={3}>Recuperar contraseña</Typography.Title>
      {error && <Alert type="error" message={error} style={{ marginBottom: 16 }} />}
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
          <Input />
        </Form.Item>
        <Form.Item>
          <Button type="primary" className="lp-btn-primary" htmlType="submit" loading={loading} block>
            Enviar link de recuperación
          </Button>
        </Form.Item>
      </Form>
      <Typography.Paragraph>
        <Link to="/login">Volver a iniciar sesión</Link>
      </Typography.Paragraph>
    </>
  );
}
