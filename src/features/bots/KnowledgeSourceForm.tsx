import { Form, Input, Modal, Select } from 'antd';
import { useEffect } from 'react';
import type { KnowledgeSourceInput } from './useKnowledgeSources';
import type { KnowledgeSource } from './types';

interface KnowledgeSourceFormProps {
  open: boolean;
  initialSource?: KnowledgeSource | null;
  prefill?: Partial<KnowledgeSourceInput>;
  onCancel: () => void;
  onSubmit: (input: KnowledgeSourceInput) => Promise<void>;
}

export function KnowledgeSourceForm({ open, initialSource, prefill, onCancel, onSubmit }: KnowledgeSourceFormProps) {
  const [form] = Form.useForm<KnowledgeSourceInput>();

  useEffect(() => {
    if (open) {
      form.setFieldsValue(
        initialSource
          ? {
              type: initialSource.type,
              title: initialSource.title,
              content: initialSource.content,
              file_url: initialSource.file_url,
            }
          : { type: 'text', title: '', content: '', file_url: null, ...prefill },
      );
    }
  }, [open, initialSource, prefill, form]);

  return (
    <Modal
      open={open}
      width="min(560px, 92vw)"
      title={initialSource ? 'Editar fuente' : 'Nueva fuente de conocimiento'}
      onCancel={onCancel}
      onOk={() => form.validateFields().then(onSubmit)}
      okText="Guardar"
      cancelText="Cancelar"
    >
      <Form form={form} layout="vertical">
        <Form.Item name="type" label="Tipo" rules={[{ required: true }]}>
          <Select
            options={[
              { value: 'text', label: 'Texto libre' },
              { value: 'faq', label: 'FAQ' },
              { value: 'document', label: 'Documento' },
            ]}
          />
        </Form.Item>
        <Form.Item name="title" label="Título" rules={[{ required: true, message: 'El título es obligatorio' }]}>
          <Input placeholder="Horario de atención" />
        </Form.Item>
        <Form.Item
          name="content"
          label="Contenido"
          rules={[
            { required: true, message: 'El contenido es obligatorio' },
            { max: 20000, message: 'Máximo 20000 caracteres' },
          ]}
        >
          <Input.TextArea rows={6} placeholder="Atendemos de lunes a viernes de 9am a 6pm..." />
        </Form.Item>
        <Form.Item name="file_url" label="URL de documento (opcional)">
          <Input placeholder="https://..." />
        </Form.Item>
      </Form>
    </Modal>
  );
}
