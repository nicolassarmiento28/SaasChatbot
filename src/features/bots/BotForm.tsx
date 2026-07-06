import { Form, Input, Modal, Select } from 'antd';
import { useEffect } from 'react';
import type { BotInput } from './useBots';
import type { Bot } from './types';

interface BotFormProps {
  open: boolean;
  initialBot?: Bot | null;
  onCancel: () => void;
  onSubmit: (input: BotInput) => Promise<void>;
}

export function BotForm({ open, initialBot, onCancel, onSubmit }: BotFormProps) {
  const [form] = Form.useForm<BotInput>();

  useEffect(() => {
    if (open) {
      form.setFieldsValue(
        initialBot
          ? {
              name: initialBot.name,
              tone: initialBot.tone,
              primary_color: initialBot.primary_color,
              avatar_url: initialBot.avatar_url,
            }
          : { name: '', tone: 'amigable', primary_color: '#1677ff', avatar_url: null },
      );
    }
  }, [open, initialBot, form]);

  return (
    <Modal
      open={open}
      title={initialBot ? 'Editar bot' : 'Nuevo bot'}
      onCancel={onCancel}
      onOk={() => form.validateFields().then(onSubmit)}
      okText="Guardar"
      cancelText="Cancelar"
    >
      <Form form={form} layout="vertical">
        <Form.Item name="name" label="Nombre" rules={[{ required: true, message: 'El nombre es obligatorio' }]}>
          <Input placeholder="Asistente de Ventas" />
        </Form.Item>
        <Form.Item name="tone" label="Tono" rules={[{ required: true }]}>
          <Select
            options={[
              { value: 'formal', label: 'Formal' },
              { value: 'casual', label: 'Casual' },
              { value: 'amigable', label: 'Amigable' },
            ]}
          />
        </Form.Item>
        <Form.Item name="primary_color" label="Color primario" rules={[{ required: true }]}>
          <Input type="color" style={{ width: 80, padding: 4 }} />
        </Form.Item>
        <Form.Item name="avatar_url" label="URL del avatar">
          <Input placeholder="https://..." />
        </Form.Item>
      </Form>
    </Modal>
  );
}
