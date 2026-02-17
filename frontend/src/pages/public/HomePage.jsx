import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    CheckCircle2,
    TrendingUp,
    ShieldCheck,
    Users,
    BarChart3,
    ChevronRight,
    Star,
    Store,
    Utensils,
    Briefcase,
    Factory,
    Stethoscope,
    Package,
    ShoppingBag,
    Coffee,
    Truck,
    Settings,
    HeartPulse,
    MonitorCheck,
    FileText
} from 'lucide-react';

const HomePage = () => {
    useEffect(() => {
        document.title = "Geo Billing - Smart Billing Software";
    }, []);

    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0 }
    };

    const businessCategories = [
        { title: 'Retail & POS', icon: ShoppingBag, desc: 'Complete billing for retail chains & single stores.', tags: ['Grocery', 'Fashion', 'Footwear', 'Electronics'] },
        { title: 'Restaurant & F&B', icon: Coffee, desc: 'Touch POS for fast billing & KOT management.', tags: ['Fine Dine', 'QSR', 'Cafe', 'Cloud Kitchen'] },
        { title: 'Distribution', icon: Truck, desc: 'Manage batches, expiry, and bulk pricing.', tags: ['FMCG', 'Pharma', 'Cold Storage'] },
        { title: 'Manufacturing', icon: Settings, desc: 'Track raw materials and production cost.', tags: ['Textile', 'Auto Parts', 'Assembly'] },
        { title: 'Healthcare', icon: HeartPulse, desc: 'Pharmacy billing with salt composition search.', tags: ['Chemist', 'Clinic', 'Hospitals'] },
        { title: 'Services & B2B', icon: MonitorCheck, desc: 'Professional invoices with GST filing.', tags: ['Repair', 'Consulting', 'Freelancers'] },
    ];

    return (
        <div className="overflow-hidden bg-white font-outfit selection:bg-emerald-100 selection:text-emerald-800">
            {/* Hero Section - Vyapar Style Template with Light Green Background */}
            <section className="relative pt-32 pb-32 lg:pt-48 lg:pb-40 bg-[#ecfdf5] overflow-hidden">
                {/* Subtle Geometric Background */}
                <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-100/30 skew-x-[-15deg] translate-x-32 z-0 hidden lg:block"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
                        {/* LEFT CONTENT */}
                        <motion.div
                            className="lg:w-1/2 text-left"
                            initial="hidden"
                            animate="visible"
                            variants={fadeInUp}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        >
                            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-[#2d3e50] leading-[1.1] mb-8 tracking-tight font-outfit">
                                Smarter Billing. <br />
                                <span className="text-emerald-500">Faster Growth.</span>
                            </h1>

                            <p className="text-xl text-gray-500 mb-10 leading-relaxed font-medium max-w-xl">
                                Print invoices in seconds. Manage inventory without errors. File GST with one click. <br className="hidden md:block" />
                                <span className="text-[#2d3e50] font-bold text-2xl">The complete retail OS for modern India.</span>
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 mb-14">
                                <Link
                                    to="/demo"
                                    className="px-8 py-4 rounded-xl bg-emerald-500 text-white font-bold text-lg hover:bg-emerald-600 transition-all duration-300 flex items-center justify-center gap-2 shadow-xl shadow-emerald-100"
                                >
                                    Get Free Demo <ArrowRight size={20} />
                                </Link>
                                <Link
                                    to="/features"
                                    className="px-8 py-4 rounded-xl bg-white text-gray-700 border-2 border-gray-100 font-bold text-lg hover:bg-gray-50 transition-all duration-300 flex items-center justify-center"
                                >
                                    Explore Features
                                </Link>
                            </div>

                            <div className="flex flex-wrap items-center gap-y-4 gap-x-8 text-sm text-gray-400 font-bold uppercase tracking-widest">
                                <span className="flex items-center gap-2"><CheckCircle2 size={18} className="text-emerald-500" /> Windows & Web</span>
                                <span className="flex items-center gap-2"><CheckCircle2 size={18} className="text-emerald-500" /> Works Offline</span>
                                <span className="flex items-center gap-2"><ShieldCheck size={18} className="text-emerald-500" /> ISO Certified</span>
                            </div>
                        </motion.div>

                        {/* RIGHT CONTENT - Device Mockup (Monitor + Phone) */}
                        <motion.div
                            className="lg:w-1/2 relative"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            {/* Monitor Mockup */}
                            <div className="relative z-10 perspective-2000">
                                <div className="bg-[#2d3e50] rounded-[32px] p-2.5 shadow-2xl border-[8px] border-[#2d3e50] overflow-hidden">
                                    <div className="bg-white rounded-[20px] overflow-hidden aspect-video relative">
                                        <div className="absolute inset-0 bg-gray-50/50 flex flex-col">
                                            {/* App Header Mockup */}
                                            <div className="h-8 bg-white border-b border-gray-100 flex items-center px-4 gap-2">
                                                <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                                                <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                                            </div>
                                            {/* App Dashboard Mockup */}
                                            <div className="flex-1 p-4 grid grid-cols-4 gap-4">
                                                <div className="col-span-1 border-r border-gray-100 flex flex-col gap-3 pr-2">
                                                    <div className="h-2 w-full bg-emerald-100 rounded"></div>
                                                    <div className="h-2 w-3/4 bg-gray-100 rounded"></div>
                                                    <div className="h-2 w-full bg-gray-100 rounded"></div>
                                                </div>
                                                <div className="col-span-3 flex flex-col gap-4">
                                                    <div className="flex justify-between">
                                                        <div className="h-10 w-24 bg-emerald-50 rounded-lg border border-emerald-100"></div>
                                                        <div className="h-10 w-24 bg-blue-50 rounded-lg border border-blue-100"></div>
                                                    </div>
                                                    <div className="flex-1 bg-white rounded-xl border border-gray-100 shadow-sm relative overflow-hidden">
                                                        <svg className="absolute bottom-0 left-0 w-full h-1/2" viewBox="0 0 100 20" preserveAspectRatio="none">
                                                            <path d="M0 20 L0 15 Q25 5 50 12 T100 8 L100 20 Z" fill="#ecfdf5" />
                                                            <path d="M0 15 Q25 5 50 12 T100 8" stroke="#10b981" strokeWidth="0.5" fill="none" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* Monitor Neck/Stand */}
                                <div className="w-32 h-16 bg-gray-200 mx-auto -mt-1 relative z-0 skew-x-[15deg]"></div>
                                <div className="w-48 h-3 bg-gray-300 mx-auto rounded-full -mt-2 shadow-lg"></div>
                            </div>

                            {/* Floating Phone Mockup */}
                            <motion.div
                                className="absolute -left-12 -bottom-8 w-48 z-20"
                                initial={{ y: 0 }}
                                animate={{ y: [0, -20, 0] }}
                                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                            >
                                <div className="bg-[#2d3e50] rounded-[40px] p-3 shadow-2xl border-[5px] border-[#2d3e50] relative overflow-hidden">
                                    <div className="bg-white rounded-[32px] overflow-hidden aspect-[9/19] flex flex-col relative">
                                        {/* Phone Content */}
                                        <div className="h-12 bg-emerald-500 w-full flex items-center justify-center">
                                            <div className="w-12 h-1 bg-white/20 rounded-full"></div>
                                        </div>
                                        <div className="p-4 flex flex-col gap-4 h-full">
                                            <div className="h-24 w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-3 flex flex-col justify-center">
                                                <div className="h-2 w-16 bg-gray-100 rounded mb-2"></div>
                                                <div className="h-4 w-3/4 bg-emerald-50 rounded"></div>
                                            </div>
                                            <div className="space-y-4">
                                                {[1, 2, 3].map(i => (
                                                    <div key={i} className="flex justify-between">
                                                        <div className="h-2 w-20 bg-gray-50 rounded"></div>
                                                        <div className="h-2 w-8 bg-emerald-100 rounded"></div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-auto h-10 w-full bg-emerald-600 rounded-xl flex items-center justify-center">
                                                <div className="w-16 h-1 bg-white/30 rounded-full"></div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Phone Notch */}
                                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-6 bg-[#2d3e50] rounded-b-2xl z-30"></div>
                                </div>
                            </motion.div>

                            {/* Floating Stats Icon */}
                            <motion.div
                                className="absolute -right-8 top-1/3 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 z-30 hidden sm:flex items-center gap-3"
                                animate={{ y: [0, 15, 0] }}
                                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                            >
                                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">
                                    <BarChart3 size={24} />
                                </div>
                                <div className="pr-2">
                                    <div className="text-[10px] text-gray-400 font-bold uppercase">Growth</div>
                                    <div className="text-lg font-bold text-[#2d3e50]">+48%</div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Why Geo Billing Section - Light Mint Theme */}
            <section className="py-24 bg-[#ecfdf5] text-gray-900 border-y border-green-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
                            Why businesses switch to Geo Billing
                        </h2>
                        <p className="text-lg md:text-xl text-gray-800 max-w-2xl mx-auto font-medium">
                            Designed to solve the real problems of Indian retail and distribution.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { title: 'Fastest Checkout', desc: 'Bill 50+ items in under a minute with barcode scanning.', icon: TrendingUp, color: 'bg-[#E1BEE7]' }, // Pastel Purple
                            { title: 'Zero Dead Stock', desc: 'Smart alerts for low stock and expiry tracking.', icon: Package, color: 'bg-[#FFCCBC]' }, // Pastel Orange
                            { title: '100% GST Ready', desc: 'Auto-generate E-Way bills and GSTR reports.', icon: ShieldCheck, color: 'bg-[#C8E6C9]' }, // Pastel Green
                            { title: 'Works Offline', desc: 'Keep billing even when the internet goes down.', icon: CheckCircle2, color: 'bg-[#BBDEFB]' }, // Pastel Blue
                        ].map((feature, idx) => (
                            <div key={idx} className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                                <div className={`w-16 h-16 ${feature.color} rounded-full flex items-center justify-center text-gray-900 mb-6`}>
                                    <feature.icon size={32} strokeWidth={1.5} />
                                </div>
                                <h3 className="font-bold text-xl text-gray-900 mb-3">{feature.title}</h3>
                                <p className="text-gray-600 leading-relaxed font-medium">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Categories Section - Light Mint Theme */}
            <section className="py-24 bg-[#ecfdf5]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">Built for every industry</h2>
                        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                            Whether you run a small pop-up shop or a large distribution network, Geo Billing scales with you.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {businessCategories.map((cat, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="group relative"
                            >
                                <div className="h-full bg-white rounded-xl border-2 border-gray-900 shadow-[6px_6px_0px_0px_rgba(16,185,129,0.3)] hover:shadow-[8px_8px_0px_0px_rgba(16,185,129,0.6)] hover:-translate-y-1 transition-all duration-200 overflow-hidden flex flex-col">
                                    {/* Browser Header */}
                                    <div className="h-12 bg-green-400 border-b-2 border-gray-900 flex items-center px-4 gap-3">
                                        <div className="w-3 h-3 rounded-full bg-gray-900"></div>
                                        <div className="w-3 h-3 rounded-full bg-gray-900 opacity-50"></div>
                                        <div className="w-3 h-3 rounded-full bg-gray-900 opacity-50"></div>
                                    </div>

                                    {/* Card Content */}
                                    <div className="p-6 pb-24 flex-1 flex flex-col bg-white relative">
                                        <div className="mb-4">
                                            <h3 className="text-xl font-bold text-gray-900 underline decoration-green-400 decoration-4 underline-offset-4 mb-3">
                                                {cat.title}
                                            </h3>
                                        </div>

                                        <p className="text-gray-600 font-medium mb-6 leading-relaxed">
                                            {cat.desc}
                                        </p>

                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {cat.tags.map((tag, i) => (
                                                <span key={i} className="text-xs font-bold px-3 py-1.5 rounded-md bg-white text-gray-900 border-2 border-gray-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Floating Big Icon at Bottom Right */}
                                        <div className="absolute bottom-6 right-6 w-16 h-16 rounded-full bg-yellow-400 border-2 border-gray-900 flex items-center justify-center text-gray-900 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transform group-hover:scale-110 transition-transform">
                                            <cat.icon size={32} strokeWidth={2} className="fill-white/20" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Stats Section */}
            <section className="py-24 bg-gray-900 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-800 via-gray-900 to-gray-900 opacity-50"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
                        <div>
                            <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-green-400 to-teal-400 mb-2">10k+</div>
                            <div className="text-gray-400 font-medium">Active Users</div>
                        </div>
                        <div>
                            <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-green-400 to-teal-400 mb-2">5M+</div>
                            <div className="text-gray-400 font-medium">Invoices Generated</div>
                        </div>
                        <div>
                            <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-green-400 to-teal-400 mb-2">99%</div>
                            <div className="text-gray-400 font-medium">Customer Satisfaction</div>
                        </div>
                        <div>
                            <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-green-400 to-teal-400 mb-2">24/7</div>
                            <div className="text-gray-400 font-medium">Support Availability</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            {/* Premium CTA Section - Light Mint Theme */}
            <section className="relative py-24 bg-[#ecfdf5] overflow-hidden border-t border-green-100">
                {/* Background Effects */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                    <div className="absolute top-[-50%] left-[-10%] w-[800px] h-[800px] rounded-full bg-green-900/20 blur-3xl animate-blob"></div>
                    <div className="absolute bottom-[-50%] right-[-10%] w-[800px] h-[800px] rounded-full bg-teal-900/20 blur-3xl animate-blob animation-delay-2000"></div>
                </div>

                <div className="max-w-5xl mx-auto px-4 relative z-10 text-center">
                    <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-8 tracking-tight">
                        Ready to supercharge your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-teal-400">
                            Growth Story?
                        </span>
                    </h2>
                    <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
                        Join 10,000+ smart business owners who trust Geo Billing to manage their operations. Start your free trial today.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                        <Link
                            to="/demo"
                            className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-[#10b981] text-white font-bold text-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3"
                        >
                            Get Started Now <ArrowRight size={24} />
                        </Link>
                        <Link
                            to="/contact"
                            className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-white border border-gray-200 text-gray-900 font-bold text-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 shadow-sm"
                        >
                            Talk to Sales
                        </Link>
                    </div>

                    <p className="mt-8 text-sm text-gray-500">
                        No credit card required. 14-day free trial.
                    </p>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
