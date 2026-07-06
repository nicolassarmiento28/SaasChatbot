import { Button, Typography } from 'antd';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { KnowledgeSourceForm } from './KnowledgeSourceForm';
import { KnowledgeSourceList } from './KnowledgeSourceList';
import { useKnowledgeSources, type KnowledgeSourceInput } from './useKnowledgeSources';
import type { KnowledgeSource } from './types';

export function BotKnowledgePage() {
  const { id: botId } = useParams<{ id: string }>();
  const { sources, loading, createSource, updateSource, deleteSource } = useKnowledgeSources(botId ?? '');
  const [formOpen, setFormOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<KnowledgeSource | null>(null);

  async function handleSubmit(input: KnowledgeSourceInput) {
    if (editingSource) {
      await updateSource(editingSource.id, input);
    } else {
      await createSource(input);
    }
    setFormOpen(false);
    setEditingSource(null);
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <Typography.Title level={3}>Base de conocimiento</Typography.Title>
        <Button
          type="primary"
          onClick={() => {
            setEditingSource(null);
            setFormOpen(true);
          }}
        >
          Nueva fuente
        </Button>
      </div>

      <KnowledgeSourceList
        sources={sources}
        loading={loading}
        onEdit={(source) => {
          setEditingSource(source);
          setFormOpen(true);
        }}
        onDelete={(source) => deleteSource(source.id)}
      />

      <KnowledgeSourceForm
        open={formOpen}
        initialSource={editingSource}
        onCancel={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
