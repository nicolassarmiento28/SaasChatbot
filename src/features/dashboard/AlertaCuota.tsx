import { useState } from 'react';
import { Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

interface AlertaCuotaProps {
  messagesUsed: number;
  messageLimit: number;
  quotaPercent: number;
}

export function AlertaCuota({ messagesUsed, messageLimit, quotaPercent }: AlertaCuotaProps) {
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();

  if (dismissed || quotaPercent < 80) return null;

  return (
    <div className="dash-alerta-cuota" role="alert">
      <span>
        Llevas {Math.floor(quotaPercent)}% de tu cuota mensual ({messagesUsed} de {messageLimit} mensajes).
        Considera hacer upgrade para no interrumpir tu servicio.
      </span>
      <div className="dash-alerta-cuota__actions">
        <Button size="small" onClick={() => navigate('/dashboard/plan')}>
          Ver planes
        </Button>
        <button
          type="button"
          className="dash-alerta-cuota__close"
          aria-label="Cerrar"
          onClick={() => setDismissed(true)}
        >
          <CloseOutlined />
        </button>
      </div>
    </div>
  );
}
