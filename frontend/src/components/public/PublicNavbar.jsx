import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PublicNavbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'About', path: '/about' },
        { name: 'Solutions', path: '/solutions' },
        { name: 'Features', path: '/features' },
        { name: 'Pricing', path: '/pricing' },
    ];

    return (
        <nav className="fixed w-full z-50 bg-white/70 backdrop-blur-lg border-b border-white/20 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] transition-all duration-300 font-outfit">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20 items-center">
                    {/* Logo */}
                    <Link to="/" className="flex-shrink-0 flex items-center gap-3 group">
                        <img
                            src="/brand-logo.png"
                            alt="Geo Billing Logo"
                            className="h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                        />
                        <span className="font-bold text-2xl tracking-tight text-gray-900 group-hover:text-green-600 transition-colors">
                            Geo Billing
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`text-sm font-medium transition-colors duration-300 ${location.pathname === link.path
                                    ? 'text-green-600'
                                    : 'text-gray-600 hover:text-green-600'
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center space-x-4">
                        <Link
                            to="/demo"
                            className="px-6 py-2.5 rounded-lg bg-[#10b981] text-white font-semibold text-sm shadow-md hover:bg-[#059669] hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                        >
                            Get Free Demo <ChevronRight size={18} strokeWidth={2.5} />
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-gray-600 hover:text-green-600 transition-colors p-2"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
                    >
                        <div className="px-4 pt-2 pb-6 space-y-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    onClick={() => setIsOpen(false)}
                                    className={`block px-4 py-3 rounded-lg text-base font-medium transition-all ${location.pathname === link.path
                                        ? 'bg-green-50 text-green-700'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-green-600'
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div className="pt-4 space-y-3">
                                <Link
                                    to="/demo"
                                    onClick={() => setIsOpen(false)}
                                    className="block w-full text-center px-4 py-3 rounded-lg bg-[#10b981] text-white font-medium shadow-md active:scale-95 transition-transform"
                                >
                                    Get Free Demo
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default PublicNavbar;
