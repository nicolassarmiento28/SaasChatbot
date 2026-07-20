import { Button, Form, Input, Space } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { MAX_CTA_BUTTONS } from './ctaButtons';

// Hasta 3 botones CTA (label + URL) configurables por bot (specs/04-bot-config.md §5).
// La sanitización/validación final ocurre en ctaButtons.ts al guardar.
export function CtaButtonsConfig() {
  return (
    <Form.Item label="Botones de acción (CTA)">
      <Form.List name="cta_buttons">
        {(fields, { add, remove }) => (
          <>
            {fields.map((field) => (
              <Space key={field.key} align="baseline" style={{ display: 'flex', marginBottom: 8 }}>
                <Form.Item {...field} name={[field.name, 'label']} noStyle rules={[{ required: true, message: 'Falta el texto del botón' }]}>
                  <Input placeholder="Ver menú" style={{ width: 160 }} />
                </Form.Item>
                <Form.Item {...field} name={[field.name, 'url']} noStyle rules={[{ required: true, message: 'Falta la URL' }]}>
                  <Input placeholder="https://..." style={{ width: 220 }} />
                </Form.Item>
                <MinusCircleOutlined onClick={() => remove(field.name)} />
              </Space>
            ))}
            {fields.length < MAX_CTA_BUTTONS && (
              <Button type="dashed" onClick={() => add({ label: '', url: '' })} icon={<PlusOutlined />}>
                Agregar botón
              </Button>
            )}
          </>
        )}
      </Form.List>
    </Form.Item>
  );
}
