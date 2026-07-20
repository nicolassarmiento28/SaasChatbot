import { Button, Col, Form, Grid, Input, Modal, Row, Select, Space } from 'antd';
import { useEffect, useState } from 'react';
import { BotPreviewChat } from './BotPreviewChat';
import { BOT_TEMPLATES, type BotTemplateFaq } from './botTemplates';
import type { BotInput } from './useBots';
import type { Bot } from './types';

interface BotFormProps {
  open: boolean;
  initialBot?: Bot | null;
  onCancel: () => void;
  onSubmit: (input: BotInput, templateFaqs?: BotTemplateFaq[]) => Promise<void>;
}

const DEFAULT_VALUES: BotInput = { name: '', tone: 'amigable', primary_color: '#1677ff', avatar_url: null };

export function BotForm({ open, initialBot, onCancel, onSubmit }: BotFormProps) {
  const [form] = Form.useForm<BotInput>();
  const values = Form.useWatch([], form) ?? DEFAULT_VALUES;
  const screens = Grid.useBreakpoint();
  const isDesktop = screens.md ?? true;
  const [previewOpen, setPreviewOpen] = useState(false);
  const [templateId, setTemplateId] = useState<string | undefined>();
  const [appliedFaqs, setAppliedFaqs] = useState<BotTemplateFaq[] | undefined>();

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
          : DEFAULT_VALUES,
      );
      setTemplateId(undefined);
      setAppliedFaqs(undefined);
    }
  }, [open, initialBot, form]);

  function applyTemplate() {
    const template = BOT_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;
    form.setFieldsValue({ tone: template.tone });
    setAppliedFaqs(template.faqs);
  }

  const formFields = (
    <Form form={form} layout="vertical">
      {!initialBot && (
        <Form.Item label="Plantilla por rubro">
          <Space.Compact style={{ width: '100%' }}>
            <Select
              placeholder="Elegir rubro"
              style={{ flex: 1 }}
              value={templateId}
              onChange={setTemplateId}
              options={BOT_TEMPLATES.map((t) => ({ value: t.id, label: t.label }))}
            />
            <Button onClick={applyTemplate} disabled={!templateId}>
              Aplicar plantilla
            </Button>
          </Space.Compact>
        </Form.Item>
      )}
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
  );

  const preview = (
    <BotPreviewChat
      botId={initialBot?.id ?? null}
      name={values.name || ''}
      tone={values.tone || DEFAULT_VALUES.tone}
      primaryColor={values.primary_color || DEFAULT_VALUES.primary_color}
      avatarUrl={values.avatar_url ?? null}
    />
  );

  return (
    <Modal
      open={open}
      width={isDesktop ? 'min(900px, 92vw)' : 'min(520px, 92vw)'}
      title={initialBot ? 'Editar bot' : 'Nuevo bot'}
      onCancel={onCancel}
      onOk={() => form.validateFields().then((input) => onSubmit(input, appliedFaqs))}
      okText="Guardar"
      cancelText="Cancelar"
    >
      {isDesktop ? (
        <Row gutter={24}>
          <Col span={14}>{formFields}</Col>
          <Col span={10}>{preview}</Col>
        </Row>
      ) : (
        <>
          {formFields}
          <Button block onClick={() => setPreviewOpen(true)}>
            Ver preview
          </Button>
          <Modal open={previewOpen} onCancel={() => setPreviewOpen(false)} footer={null} title="Preview del widget">
            {preview}
          </Modal>
        </>
      )}
    </Modal>
  );
}
