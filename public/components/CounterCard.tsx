import React from 'react';
import Card from './Card';

interface CounterCardProps {
  count: number;
}

const CounterCard: React.FC<CounterCardProps> = ({ count }) => {
  return (
    <Card title="Unique Items Today">
      <div className="text-5xl font-bold text-center text-green-600">
        {count}
      </div>
    </Card>
  );
};

export default CounterCard;
