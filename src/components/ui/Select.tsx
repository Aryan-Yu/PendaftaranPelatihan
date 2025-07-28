import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const Select: React.FC<SelectProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <select
      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 ${className}`}
      {...props}
    >
      {children}
    </select>
  );
};
