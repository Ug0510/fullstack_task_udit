import { FC } from 'react';

const EmptyState: FC = () => {
  return (
    <div className="py-8 flex flex-col items-center text-center">
      <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#7F56D9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <h3 className="text-base font-medium text-gray-900 mb-1">No tasks yet</h3>
      <p className="text-sm text-gray-500 mb-4">Add your first task using the input above</p>
    </div>
  );
};

export default EmptyState;
