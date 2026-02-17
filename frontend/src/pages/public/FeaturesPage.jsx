import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Layers, Percent, Truck, Users, BarChart2, Cloud } from 'lucide-react';

// Custom Icons
import BillingIcon from '../../assets/billing-icon.png';
import InventoryIcon from '../../assets/inventory-icon.png';
import AnalyticsIcon from '../../assets/analytics-icon.png';
import GSTIcon from '../../assets/gst-icon.png';
import CustomerIcon from '../../assets/customer-icon.png';
import CloudIcon from '../../assets/cloud-icon.png';

const FeaturesPage = () => {
    useEffect(() => {
        document.title = "Features - Geo Billing";
    }, []);

    const features = [
        {
            icon: BillingIcon,
            isImage: true,
            title: 'Billing & Invoicing',
            items: [
                'Lightning-fast invoicing: Transform your billing process.',
                'Quick bill generation: Speed up customer checkouts.',
                'Effortless printing: Print multiple invoices in seconds.',
                'Transaction categorization: Organize transactions instantly.',
                'Easy returns and refunds: Manage credit transactions seamlessly.',
                'Online and offline billing: Enjoy uninterrupted operations.',
                'Secure cloud backup: Rest easy with data protection.'
            ]
        },
        {
            icon: InventoryIcon,
            isImage: true,
            title: 'Inventory Management',
            items: [
                'Real-time tracking: Monitor inventory levels instantly.',
                'Eliminate excess inventory: Optimize stock levels efficiently.',
                'Prevent stockouts: Ensure products are always available.',
                'Improved order accuracy: Streamline supplier management.',
                'In-depth analytics: Gain actionable insights for better decisions.',
                'Save time and costs: Boost operational efficiency.',
                'Increase profits: Drive business growth and success.'
            ]
        },
        {
            icon: AnalyticsIcon,
            isImage: true,
            title: 'Automated Data Analysis',
            items: [
                'CRM tracking: Improve customer relationships via automated data.',
                'Detailed profiles: Gather data across all touchpoints.',
                'Smart segmentation: Group customers based on behavior.',
                'Real-time updates: Keep info synced across all channels.',
                '360-degree view: See customer history at a glance.',
                'Actionable Reports: Visualize sales and profit trends.',
                'Growth Engines: Identify top-selling products easily.'
            ]
        },
        {
            icon: GSTIcon,
            isImage: true,
            title: 'GST & Tax Handling',
            items: [
                'Auto-calculation: GST, VAT, and CESS handled automatically.',
                'GSTR Reports: Generate GSTR-1, GSTR-3B in one click.',
                'E-Way Bills: Direct integration for transport ease.',
                'Tax Compliance: Stay updated with government rules.',
                'Audit Ready: Keep clean ledgers for effortless audits.'
            ]
        },
        {
            icon: CustomerIcon,
            isImage: true,
            title: 'Customer & Supplier',
            items: [
                'Digital Ledgers: Track credit/debit for every party.',
                'Payment Reminders: Auto-SMS for outstanding dues.',
                'Supplier History: Monitor purchase trends and costs.',
                'Loyalty Program: Reward regular customers instantly.',
                'Bulk Import: Add thousands of contacts via Excel.'
            ]
        },
        {
            icon: CloudIcon,
            isImage: true,
            title: 'Cloud & Security',
            items: [
                'Anywhere Access: Monitor sales from home or vacation.',
                'Bank-grade Security: Your data is encrypted and safe.',
                'Auto-Backup: Never lose a single transaction.',
                'Role-based Access: Control what your staff can see.',
                'Multi-Device: Works on PC, Tablet, and Mobile.'
            ]
        },
    ];

    return (
        <div className="bg-[#ecfdf5] font-outfit">
            {/* Hero Section */}
            <div className="relative pt-32 pb-40 bg-gray-900 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] opacity-20 bg-cover bg-center mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 via-gray-900/90 to-white"></div>

                <div className="relative max-w-7xl mx-auto px-4 text-center z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight">
                            Powerfully <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-teal-400">Simple.</span>
                        </h1>
                        <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                            Built for speed, accuracy, and growth. Discover the comprehensive suite of tools that powers your business operations.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Features Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 -mt-20 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feat, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-white p-8 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100/50 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300"
                        >
                            <div className="flex flex-col items-center text-center">
                                {/* Icon */}
                                <div className="mb-6 relative">
                                    {typeof feat.icon === 'string' ? (
                                        <div className="w-24 h-24 relative hover:scale-110 transition-transform duration-300">
                                            <img
                                                src={feat.icon}
                                                alt={feat.title}
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                    ) : (
                                        <>
                                            <div className="absolute inset-0 bg-green-100 rounded-full scale-125 opacity-50 blur-lg"></div>
                                            <feat.icon size={48} strokeWidth={1.5} className="relative text-green-600 fill-green-50" />
                                        </>
                                    )}
                                </div>

                                {/* Title */}
                                <h3 className="text-2xl font-bold text-gray-900 mb-8">{feat.title}</h3>
                            </div>

                            {/* Bullet List */}
                            <ul className="space-y-4">
                                {feat.items.map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-gray-600 text-[15px] leading-relaxed">
                                        <div className="min-w-[6px] h-[6px] rounded-full bg-green-500 mt-2"></div>
                                        <span>
                                            <strong className="text-gray-900 font-semibold">{item.split(':')[0]}:</strong>
                                            {item.split(':')[1]}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </div>
            </div>

        </div>
    );
};

export default FeaturesPage;
