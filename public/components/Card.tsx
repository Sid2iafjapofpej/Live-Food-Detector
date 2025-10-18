import React from 'react';

interface CardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, children, className = '' }) => {
  return (
    <section className={`bg-white rounded-lg p-6 shadow-md border border-gray-200 ${className}`}>
      <h2 className="mt-0 border-b border-gray-200 pb-2 mb-4 text-xl text-slate-800 font-semibold">
        {title}
      </h2>
      {children}
    </section>
  );
};

export default Card;
