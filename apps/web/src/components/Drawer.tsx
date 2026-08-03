import React, { useState } from "react";
import { Maximize2, Minimize2, Eye, EyeOff, X } from "lucide-react";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export default function Drawer({
  isOpen,
  onClose,
  title,
  children,
  footer,
}: DrawerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showBackdrop, setShowBackdrop] = useState(true);

  if (!isOpen) return null;

  return (
    <>
      {showBackdrop && (
        <div
          className="fixed inset-0 bg-[#141B4D]/40 z-40 transition-opacity"
          onClick={onClose}
        />
      )}
      <div
        className={`fixed top-0 right-0 h-full bg-white shadow-2xl z-50 flex flex-col transition-all duration-300 ease-in-out transform ${
          isExpanded
            ? "w-full md:w-[70vw] lg:w-[60vw]"
            : "w-full sm:w-[440px] max-w-full"
        }`}
      >
        <div className="px-[22px] py-[20px] border-b border-gray-200 flex justify-between items-center bg-white">
          <h3 className="m-0 text-[17px] font-bold text-gray-900">{title}</h3>
          
          <div className="flex items-center gap-3">
            {/* Backdrop / Table Visibility Toggle */}
            <button
              type="button"
              onClick={() => setShowBackdrop(!showBackdrop)}
              title={showBackdrop ? "Hide backdrop (interact with table)" : "Show backdrop"}
              className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors bg-transparent border-none cursor-pointer flex items-center justify-center"
            >
              {showBackdrop ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>

            {/* Width Expand / Contract Toggle */}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? "Contract drawer width" : "Expand drawer width"}
              className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors bg-transparent border-none cursor-pointer flex items-center justify-center"
            >
              {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              title="Close drawer"
              className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors bg-transparent border-none cursor-pointer flex items-center justify-center"
            >
              <X size={16} />
            </button>
          </div>
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
