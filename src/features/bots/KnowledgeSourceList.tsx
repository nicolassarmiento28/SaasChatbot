import { Button, Space, Table, Tag } from 'antd';
import type { KnowledgeSource } from './types';

interface KnowledgeSourceListProps {
  sources: KnowledgeSource[];
  loading: boolean;
  onEdit: (source: KnowledgeSource) => void;
  onDelete: (source: KnowledgeSource) => void;
}

export function KnowledgeSourceList({ sources, loading, onEdit, onDelete }: KnowledgeSourceListProps) {
  return (
    <Table
      rowKey="id"
      loading={loading}
      dataSource={sources}
      pagination={false}
      scroll={{ x: 'max-content' }}
      columns={[
        { title: 'Título', dataIndex: 'title' },
        { title: 'Tipo', dataIndex: 'type', render: (type: string) => <Tag>{type}</Tag> },
        {
          title: 'Acciones',
          render: (_: unknown, source: KnowledgeSource) => (
            <Space>
              <Button size="small" onClick={() => onEdit(source)}>
                Editar
              </Button>
              <Button size="small" danger onClick={() => onDelete(source)}>
                Eliminar
              </Button>
            </Space>
          ),
        },
      ]}
    />
  );
}
