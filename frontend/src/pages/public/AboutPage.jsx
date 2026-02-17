import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Target, Eye, Rocket, Users, Award, ShieldCheck, Heart } from 'lucide-react';

// Custom 3D Icons
import BillingIcon from '../../assets/billing-icon.png';
import CloudIcon from '../../assets/cloud-icon.png';
import CustomerIcon from '../../assets/customer-icon.png';
import GSTIcon from '../../assets/gst-icon.png';
import AnalyticsIcon from '../../assets/analytics-icon.png';

const AboutPage = () => {
    useEffect(() => {
        document.title = "About Us - Geo Billing";
    }, []);

    const values = [
        {
            icon: GSTIcon,
            title: "Trust & Security",
            desc: "We prioritize the security of your business data with bank-grade encryption and regular backups."
        },
        {
            icon: CustomerIcon,
            title: "Customer First",
            desc: "Our software is built around the real needs of Indian SMEs, with 24/7 support to help you grow."
        },
        {
            icon: AnalyticsIcon,
            title: "Innovation",
            desc: "We constantly evolve our platform with the latest technology to keep your business ahead of the curve."
        }
    ];

    const stats = [
        { label: "Satisfied Users", value: "1 Cr+" },
        { label: "Years of Excellence", value: "10+" },
        { label: "Support Available", value: "24/7" },
        { label: "Uptime", value: "99.9%" }
    ];

    return (
        <div className="bg-white font-outfit">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 bg-[#ecfdf5] overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-100/30 skew-x-[-15deg] translate-x-32 z-0 hidden lg:block"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="max-w-3xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <h1 className="text-5xl md:text-7xl font-extrabold text-[#2d3e50] leading-tight mb-8">
                                Empowering <span className="text-emerald-500">Retailers</span> for the Digital Age.
                            </h1>
                            <p className="text-xl text-gray-600 leading-relaxed mb-10">
                                At Geo Billing, we believe that every small business deserves world-class technology.
                                We're on a mission to simplify business management for millions of Indian SMEs.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Our Story Section */}
            <section className="py-24 bg-[#ecfdf5]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            <div className="aspect-square bg-emerald-50 rounded-3xl overflow-hidden shadow-2xl">
                                <img
                                    src="https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&q=80&w=2070"
                                    alt="Team Collaboration"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full -z-10"></div>
                        </motion.div>

                        <div className="space-y-8">
                            <h2 className="text-4xl font-bold text-gray-900 leading-tight">Our Story</h2>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                Founded with a vision to revolutionize the Indian retail landscape, Geo Billing started as a simple invoicing tool. Today, it has evolved into a comprehensive business operating system trusted by over 1 Crore businesses.
                            </p>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                We understand the challenges of managing inventory, credits, and GST compliance in a fast-paced market. That's why we've built a platform that works both online and offline, ensuring your business never stops.
                            </p>

                            <div className="grid grid-cols-2 gap-8 pt-6">
                                {stats.map((stat, idx) => (
                                    <div key={idx}>
                                        <div className="text-3xl font-extrabold text-emerald-600 mb-1">{stat.value}</div>
                                        <div className="text-sm text-gray-500 font-bold uppercase tracking-wider">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-24 bg-[#ecfdf5]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-12">
                        <motion.div
                            className="bg-white p-12 rounded-[32px] shadow-sm border border-gray-100"
                            whileHover={{ y: -5 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mb-8">
                                <img src={BillingIcon} alt="Mission" className="w-14 h-14 object-contain" />
                            </div>
                            <h3 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h3>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                To provide affordable, easy-to-use, and powerful technology that helps small businesses automate their operations and focus on growth.
                            </p>
                        </motion.div>

                        <motion.div
                            className="bg-white p-12 rounded-[32px] shadow-sm border border-gray-100"
                            whileHover={{ y: -5 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mb-8">
                                <img src={CloudIcon} alt="Vision" className="w-14 h-14 object-contain" />
                            </div>
                            <h3 className="text-3xl font-bold text-gray-900 mb-6">Our Vision</h3>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                To be the world's most trusted partner for small business growth, powering millions of successful entrepreneurs across the globe.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Core Values */}
            <section className="py-24 bg-[#ecfdf5]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl font-bold text-gray-900 mb-16">Our Core Values</h2>
                    <div className="grid md:grid-cols-3 gap-12">
                        {values.map((value, idx) => (
                            <motion.div
                                key={idx}
                                className="space-y-6"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.2 }}
                            >
                                <div className="w-24 h-24 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-8">
                                    <img src={value.icon} alt={value.title} className="w-16 h-16 object-contain" />
                                </div>
                                <h4 className="text-2xl font-bold text-gray-900">{value.title}</h4>
                                <p className="text-gray-600 leading-relaxed">
                                    {value.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-[#ecfdf5]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-emerald-500 rounded-[40px] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-emerald-500/20">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 blur-[100px] rounded-full"></div>
                        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/10 blur-[100px] rounded-full"></div>

                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 relative z-10">
                            Ready to grow your business?
                        </h2>
                        <p className="text-xl text-emerald-50 mb-12 max-w-2xl mx-auto relative z-10">
                            Join over 1 Crore businesses who trust Geo Billing to manage their operations and grow faster.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center relative z-10">
                            <Link
                                to="/demo"
                                className="px-10 py-5 bg-white text-emerald-600 rounded-2xl font-bold text-lg hover:bg-emerald-50 transition-all shadow-xl shadow-white/10"
                            >
                                Get Free Demo
                            </Link>
                            <Link
                                to="/contact"
                                className="px-10 py-5 bg-emerald-600/20 text-white border border-white/30 rounded-2xl font-bold text-lg hover:bg-emerald-600/30 transition-all"
                            >
                                Contact Sales
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;
