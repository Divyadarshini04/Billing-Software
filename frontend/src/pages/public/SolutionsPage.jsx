import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

// Custom 3D Icons
import BillingIcon from '../../assets/billing-icon.png';
import CustomerIcon from '../../assets/customer-icon.png';
import AnalyticsIcon from '../../assets/analytics-icon.png';
import InventoryIcon from '../../assets/inventory-icon.png';

const SolutionsPage = () => {
    useEffect(() => {
        document.title = "Solutions - Geo Billing";
    }, []);

    const solutions = [
        {
            id: 'retail',
            title: 'Retail Billing',
            icon: BillingIcon,
            desc: 'Lightning-fast barcode billing designed for supermarkets, clothing stores, and electronics shops.',
            features: ['Barcode scanning', 'Inventory tracking', 'Customer loyalty points', 'Daily sales reports', 'GST Filing Reports', 'Offline Billing Mode']
        },
        {
            id: 'service',
            title: 'Service Billing',
            icon: CustomerIcon,
            desc: 'Generate professional invoices for services like consulting, repairs, and freelancing.',
            features: ['Service catalog', 'Hour/Project-based billing', 'Recurring invoices', 'Payment reminders', 'Client Portal', 'Multi-currency Support']
        },
        {
            id: 'restaurant',
            title: 'Food & Restaurant',
            icon: AnalyticsIcon,
            desc: 'Manage your cafe or restaurant with table management and KOT generation.',
            features: ['Table management', 'KOT printing', 'Recipe management', 'Touch-friendly POS', 'Kitchen Display System', 'Online Ordering Integration']
        },
        {
            id: 'distribution',
            title: 'Inventory Distribution',
            icon: InventoryIcon,
            desc: 'Handle bulk orders, stock transfers, and supplier management effectively.',
            features: ['Stock inwards/outwards', 'Supplier ledger', 'Purchase orders', 'Batch tracking', 'Route Management', 'Driver App Integration']
        },
    ];

    return (
        <div className="bg-gray-50 font-outfit selection:bg-green-100 selection:text-green-800">
            {/* Header Section - Styled like 'Features Page' with mixed gradient */}
            <section className="relative pt-32 pb-40 flex items-center justify-center overflow-hidden bg-gray-900">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2069"
                        alt="Background"
                        className="w-full h-full object-cover opacity-20 mix-blend-overlay"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 via-gray-900/90 to-white"></div>
                </div>

                <div className="relative z-10 text-center px-4">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight"
                    >
                        Our Solutions
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-gray-400 max-w-2xl mx-auto"
                    >
                        Tailored tools for your specific industry needs
                    </motion.p>
                </div>
            </section>

            {/* Solutions Grid - LVNG Template Style */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 -mt-20 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {solutions.map((sol, idx) => (
                        <motion.div
                            key={sol.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white rounded-[20px] p-8 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col items-center text-center group border border-gray-100 h-full"
                        >
                            {/* Icon */}
                            <div className="mb-6 relative">
                                <div className="w-24 h-24 transition-transform duration-300 group-hover:scale-110 drop-shadow-xl">
                                    <img src={sol.icon} alt={sol.title} className="w-full h-full object-contain" />
                                </div>
                            </div>

                            {/* Title */}
                            <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-green-600 transition-colors">
                                {sol.title}
                            </h3>

                            {/* Features List (Bullet Points) */}
                            <ul className="space-y-3 text-left inline-block mt-4">
                                {sol.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3 text-gray-600 text-[15px] font-medium leading-relaxed">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0"></div>
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Bottom CTA */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-gray-900"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-green-900/20 to-teal-900/20"></div>
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>

                <div className="relative max-w-4xl mx-auto px-4 text-center z-10">
                    <h2 className="text-4xl font-bold text-white mb-6 font-outfit">Need a Custom Solution?</h2>
                    <p className="text-gray-300 text-lg mb-10 max-w-2xl mx-auto font-inter leading-relaxed">
                        We build custom modules for large enterprises and unique business models.
                        <br className="hidden md:block" />
                        Let's discuss how we can tailor Geo Billing for you.
                    </p>
                    <Link
                        to="/contact"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold rounded-full hover:scale-105 transition-transform shadow-lg shadow-green-500/25"
                    >
                        Contact Our Team
                        <ArrowRight size={20} />
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default SolutionsPage;
