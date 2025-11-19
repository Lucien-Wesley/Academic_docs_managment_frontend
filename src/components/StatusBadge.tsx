import React from 'react';
import { Clock, CheckCircle, XCircle, FileCheck, Archive } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusConfig = (status: string) => {
    const configs: Record<string, { color: string; icon: any; label: string }> = {
      'soumise': {
        color: 'bg-blue-100 text-blue-800',
        icon: Clock,
        label: 'Soumise'
      },
      'validee_secretariat': {
        color: 'bg-orange-100 text-orange-800',
        icon: FileCheck,
        label: 'Validée Secrétariat'
      },
      'validee_doyen': {
        color: 'bg-purple-100 text-purple-800',
        icon: CheckCircle,
        label: 'Validée Doyen'
      },
      'validee_archives': {
        color: 'bg-green-100 text-green-800',
        icon: Archive,
        label: 'Validée Archives'
      },
      'terminee': {
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle,
        label: 'Terminée'
      },
      'refusee': {
        color: 'bg-red-100 text-red-800',
        icon: XCircle,
        label: 'Refusée'
      }
    };

    return configs[status] || {
      color: 'bg-gray-100 text-gray-800',
      icon: Clock,
      label: status
    };
  };

  const config = getStatusConfig(status);
  const IconComponent = config.icon;

  return (
    <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      <IconComponent className="h-3 w-3" />
      <span>{config.label}</span>
    </span>
  );
};

export default StatusBadge;