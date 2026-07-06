import { useState } from 'react';
import { Form, Input, Button, Alert, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { supabase } from '../../shared/supabaseClient';

interface SignupValues {
  email: string;
  password: string;
}

export function SignupForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onFinish(values: SignupValues) {
    setLoading(true);
    setError(null);
    const { error: signUpError } = await supabase.auth.signUp(values);
    setLoading(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    setSuccess(true);
  }

  if (success) {
    return (
      <Alert
        type="success"
        message="Cuenta creada"
        description="Revisa tu email para confirmar tu cuenta."
      />
    );
  }

  return (
    <>
      <Typography.Title level={3}>Crear cuenta</Typography.Title>
      {error && <Alert type="error" message={error} style={{ marginBottom: 16 }} />}
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
          <Input />
        </Form.Item>
        <Form.Item
          name="password"
          label="Contraseña"
          rules={[{ required: true, min: 8, message: 'Mínimo 8 caracteres' }]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item>
          <Button type="primary" className="lp-btn-primary" htmlType="submit" loading={loading} block>
            Registrarme
          </Button>
        </Form.Item>
      </Form>
      <Typography.Paragraph>
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
      </Typography.Paragraph>
    </>
  );
}
