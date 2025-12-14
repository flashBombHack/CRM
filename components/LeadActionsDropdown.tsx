'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { HiDotsVertical, HiEye, HiPencil, HiTrash } from 'react-icons/hi';
import { useRouter } from 'next/navigation';

interface LeadActionsDropdownProps {
  leadId: string;
  onEdit: () => void;
  onDelete: () => void;
}

export default function LeadActionsDropdown({ leadId, onEdit, onDelete }: LeadActionsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Calculate position and close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const calculatePosition = () => {
      if (buttonRef.current) {
        const buttonRect = buttonRef.current.getBoundingClientRect();
        const menuWidth = 192; // w-48 = 192px
        const menuHeight = 120; // Approximate height
        const spaceBelow = window.innerHeight - buttonRect.bottom;
        const spaceAbove = buttonRect.top;

        let top: number;
        let right: number;

        // Calculate right position (distance from right edge of viewport)
        right = window.innerWidth - buttonRect.right;

        // If there's not enough space below but enough space above, show above
        if (spaceBelow < menuHeight && spaceAbove > menuHeight) {
          top = buttonRect.top - menuHeight - 8; // 8px = mb-2
        } else {
          top = buttonRect.bottom + 8; // 8px = mt-2
        }

        // Ensure menu doesn't go off screen
        if (top < 0) top = 8;
        if (top + menuHeight > window.innerHeight) {
          top = window.innerHeight - menuHeight - 8;
        }
        if (right < 0) right = 8;
        if (right + menuWidth > window.innerWidth) {
          right = window.innerWidth - menuWidth - 8;
        }

        setMenuPosition({ top, right });
      }
    };

    if (isOpen) {
      calculatePosition();
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('resize', calculatePosition);
      window.addEventListener('scroll', calculatePosition, true);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', calculatePosition);
      window.removeEventListener('scroll', calculatePosition, true);
    };
  }, [isOpen]);

  const handleView = () => {
    setIsOpen(false);
    router.push(`/sales/leads/${leadId}`);
  };

  const handleEdit = () => {
    setIsOpen(false);
    onEdit();
  };

  const handleDelete = () => {
    setIsOpen(false);
    onDelete();
  };

  const menuContent = isOpen && typeof window !== 'undefined' ? (
    createPortal(
      <div
        ref={menuRef}
        className="fixed w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-[1000]"
        style={{
          top: `${menuPosition.top}px`,
          right: `${menuPosition.right}px`,
        }}
      >
        <button
          onClick={handleView}
          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
        >
          <HiEye className="w-4 h-4" />
          View
        </button>
        <button
          onClick={handleEdit}
          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
        >
          <HiPencil className="w-4 h-4" />
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
        >
          <HiTrash className="w-4 h-4" />
          Delete
        </button>
      </div>,
      document.body
    )
  ) : null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-400 hover:text-gray-600 transition-colors p-1"
      >
        <HiDotsVertical className="w-5 h-5" />
      </button>
      {menuContent}
    </div>
  );
}
