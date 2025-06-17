'use client';

import { useNotification } from './Notification';

export function YourComponent() {
  const { showNotification } = useNotification();
  
  const handleClick = () => {
    showNotification('Hello!', 'success');
  };

  return (
    <button onClick={handleClick}>
      Show Notification
    </button>
  );
} 