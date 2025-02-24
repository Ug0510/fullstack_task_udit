import { FC } from 'react';

interface HeaderProps {
  isConnected: boolean;
}

const Header: FC<HeaderProps> = ({ isConnected }) => {
  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="32" height="32" rx="8" fill="#7F56D9"/>
          <path d="M23 12L14 21L9 16" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <h1 className="text-xl font-semibold text-dark">Todo App</h1>
      </div>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span className="text-sm text-gray-500">
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
    </header>
  );
};

export default Header;
