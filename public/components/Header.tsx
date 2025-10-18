import React from 'react';
import StatusIndicator from './StatusIndicator';

interface HeaderProps {
  status: string; // Using string to accommodate new statuses
}

const Header: React.FC<HeaderProps> = ({ status }) => {
  return (
    <header className="flex justify-between items-center border-b-2 border-gray-200 pb-4">
      <h1 className="text-3xl font-bold text-slate-800">
        Live Food <span className="font-light text-blue-500">Detector</span>
      </h1>
      <StatusIndicator status={status} />
    </header>
  );
};

export default Header;
