import React from 'react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export default function Drawer({ isOpen, onClose, title, children, footer }: DrawerProps) {
  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-[#141B4D] bg-opacity-35 z-40 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed top-0 right-0 w-full sm:w-[440px] max-w-full h-[100vh] bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out transform">
        <div className="px-[22px] py-[20px] border-b border-gray-200 flex justify-between items-center bg-white">
          <h3 className="m-0 text-[17px] font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="bg-transparent border-none text-[20px] cursor-pointer text-gray-500 leading-none hover:text-gray-900">
            &times;
          </button>
        </div>
        
        <div className="px-[22px] py-[20px] overflow-y-auto flex-1 bg-white">
          {children}
        </div>

        {footer && (
          <div className="px-[22px] py-[16px] border-t border-gray-200 flex gap-[10px] justify-end bg-white">
            {footer}
          </div>
        )}
      </div>
    </>
  );
}
