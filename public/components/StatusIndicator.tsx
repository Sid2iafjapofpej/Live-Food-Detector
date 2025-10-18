import React from 'react';

interface StatusIndicatorProps {
  status: string;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
  const getStatusInfo = (): { color: string; text: string } => {
    switch (status) {
      case 'Ready':
        return { color: 'bg-green-500', text: 'Ready' };
      case 'Detecting':
        return { color: 'bg-blue-500 animate-pulse', text: 'Detecting...' };
      case 'Connecting':
      case 'Initializing':
        return { color: 'bg-yellow-500', text: 'Connecting...' };
      case 'AwaitingPhone':
        return { color: 'bg-gray-400', text: 'Awaiting Phone' };
      case 'Error':
        return { color: 'bg-red-500', text: 'Error' };
      default:
        return { color: 'bg-gray-400', text: 'Unknown' };
    }
  };

  const { color, text } = getStatusInfo();

  return (
    <div className={`font-semibold py-1 px-3 rounded-full text-white text-sm transition-colors ${color}`}>
      {text}
    </div>
  );
};

export default StatusIndicator;
