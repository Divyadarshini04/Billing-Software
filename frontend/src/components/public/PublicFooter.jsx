import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

const PublicFooter = () => {
    const location = useLocation();
    return (
        <footer className="bg-gray-900 text-white pt-20 pb-10 font-outfit">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand Info */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <img
                                src="/brand-logo.png"
                                alt="Geo Billing"
                                className="h-10 w-auto object-contain"
                            />
                            <span className="font-bold text-2xl text-white tracking-wide">Geo Billing</span>
                        </div>
                        <p className="text-gray-400 leading-relaxed">
                            Empowering businesses with smart, simple, and scalable billing solutions.
                            From retail to manufacturing, we've got you covered.
                        </p>
                        <div className="flex space-x-4">
                            {[Facebook, Twitter, Instagram, Linkedin].map((Icon, index) => (
                                <a
                                    key={index}
                                    href="#"
                                    className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-green-600 hover:text-white transition-all duration-300"
                                >
                                    <Icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-6">Product</h3>
                        <ul className="space-y-4">
                            {[
                                { name: 'Solutions', path: '/solutions' },
                                { name: 'Features', path: '/features' },
                                { name: 'Pricing', path: '/pricing' },
                                { name: 'About Us', path: '/about' },
                                { name: 'Get Demo', path: '/demo' }
                            ].map((item) => (
                                <li key={item.name}>
                                    <Link
                                        to={item.path}
                                        className={`transition-colors ${location.pathname === item.path ? 'text-green-500 font-medium' : 'text-gray-400 hover:text-green-400'}`}
                                    >
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="text-lg font-semibold mb-6">Support</h3>
                        <ul className="space-y-4">
                            {[
                                { name: 'Contact Us', path: '/contact' },
                                { name: 'Help Center', path: '/help-center' },
                                { name: 'Terms of Service', path: '/terms-of-service' },
                                { name: 'Privacy Policy', path: '/privacy-policy' }
                            ].map((item) => (
                                <li key={item.name}>
                                    <Link
                                        to={item.path}
                                        className={`transition-colors ${location.pathname === item.path ? 'text-green-500 font-medium' : 'text-gray-400 hover:text-green-400'}`}
                                    >
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-lg font-semibold mb-6">Contact Us</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-4 text-gray-400">
                                <MapPin size={20} className="text-green-500 flex-shrink-0 mt-1" />
                                <span>123 Business Park, Tech City,<br />Bangalore, India 560001</span>
                            </li>
                            <li className="flex items-center gap-4 text-gray-400">
                                <Phone size={20} className="text-green-500 flex-shrink-0" />
                                <span>+91 98765 43210</span>
                            </li>
                            <li className="flex items-center gap-4 text-gray-400">
                                <Mail size={20} className="text-green-500 flex-shrink-0" />
                                <span>support@geobilling.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-500 text-sm">
                        © {new Date().getFullYear()} Geo Billing Enterprises. All rights reserved.
                    </p>
                    <p className="text-gray-600 text-sm flex gap-6">
                        <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy</Link>
                        <Link to="/terms-of-service" className="hover:text-white transition-colors">Terms</Link>
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default PublicFooter;
