import React from 'react';
import Card from './Card';

interface LatestItemCardProps {
  detection: string | null;
  isDetecting: boolean;
}

const LatestItemCard: React.FC<LatestItemCardProps> = ({ detection, isDetecting }) => {
  const name = detection || '--';
  const detectingClasses = isDetecting ? 'opacity-50' : 'opacity-100';

  return (
    <Card title="Last Detected Item">
      <div className={`transition-opacity ${detectingClasses} flex items-center justify-center min-h-[80px]`}>
        <div className="text-4xl font-bold text-blue-500 text-center capitalize">
          {name}
        </div>
      </div>
    </Card>
  );
};

export default LatestItemCard;
