import React from 'react';

const Toast = ({ message, isVisible }) => (
  <div className={`fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transition-opacity duration-300 ${isVisible ? 'opacity-100 z-50' : 'opacity-0 -z-10'}`}>
    {message}
  </div>
);

export default Toast;
