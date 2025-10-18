import React from 'react';
import Card from './Card';

interface HistoryCardProps {
  items: string[];
}

const HistoryCard: React.FC<HistoryCardProps> = ({ items }) => {
  return (
    <Card title="Item History (Last 10)">
      <ul className="list-none p-0 m-0 max-h-[300px] overflow-y-auto">
        {items.length > 0 ? (
          items.map((item, index) => (
            <li
              key={index}
              className={`py-2 px-1 border-b border-dashed border-gray-200 text-sm ${
                index === 0 ? 'font-semibold text-black' : ''
              }`}
            >
              {item}
            </li>
          ))
        ) : (
          <li>(Waiting for data...)</li>
        )}
      </ul>
    </Card>
  );
};

export default HistoryCard;
