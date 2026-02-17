import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export default function ModernDropdown({ options, value, onChange, placeholder = "Select option" }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    const handleSelect = (optionValue) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    const selectedLabel = options.find(opt => opt.value === value)?.label || value || placeholder;

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Trigger Button */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    w-full pl-4 pr-10 py-3 bg-gray-50 border rounded-xl text-sm font-bold text-gray-700 cursor-pointer transition-all select-none
                    flex items-center justify-between
                    ${isOpen ? 'border-blue-500 ring-2 ring-blue-500/10 bg-white' : 'border-transparent hover:bg-gray-100'}
                `}
            >
                <span className="truncate">{selectedLabel}</span>
                <div className={`absolute right-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="max-h-60 overflow-y-auto py-1">
                        {options.map((option) => (
                            <div
                                key={option.value}
                                onClick={() => handleSelect(option.value)}
                                className={`
                                    px-4 py-2.5 text-sm font-bold cursor-pointer flex items-center justify-between transition-colors
                                    ${value === option.value ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}
                                `}
                            >
                                <span>{option.label}</span>
                                {value === option.value && <Check className="w-3.5 h-3.5" />}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
