import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { subscriptionAPI } from '../../api/apiService';

const PricingPage = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        document.title = "Pricing - Geo Billing";
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const response = await subscriptionAPI.getPlans();
            // Sort plans by price
            const sortedPlans = response.data.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
            setPlans(sortedPlans);
        } catch (error) {
            console.error("Failed to fetch plans:", error);
        } finally {
            setLoading(false);
        }
    };

    // Fallback/Loading skeleton or processing
    const displayPlans = plans.length > 0 ? plans : [];

    return (
        <div className="min-h-screen bg-[#ecfdf5] text-[#052e16] font-outfit">
            {/* Navbar Placeholder/Adjustment */}
            <div className="pt-28 pb-16 px-4 text-center">

                <div className="inline-block px-4 py-1.5 rounded-full border border-gray-900/20 text-xs font-bold uppercase tracking-widest mb-6">
                    Pricing
                </div>

                <h1 className="text-6xl md:text-8xl font-bold mb-8 tracking-[-0.03em] leading-none">
                    Membership <span style={{ fontFamily: '"Instrument Serif", serif', fontStyle: 'italic', fontWeight: 400 }}>pricing</span>
                </h1>

                <p className="text-lg md:text-xl text-[#052e16]/80 max-w-2xl mx-auto leading-relaxed font-medium">
                    Invest in design that drives your business.<br className="hidden md:block" />
                    Clear, straightforward plans tailored to your needs.
                </p>
            </div>

            <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 pb-32">
                {loading ? (
                    <div className="text-center text-[#052e16] py-20 font-medium animate-pulse">Loading plans...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
                        {displayPlans.map((plan, idx) => {
                            // Determine features list
                            let featuresList = [];
                            if (Array.isArray(plan.features)) {
                                featuresList = plan.features;
                            } else if (typeof plan.features === 'object' && plan.features !== null) {
                                featuresList = Object.values(plan.features);
                            }

                            // Popular logic (Standard/Pro)
                            const isPopular = plan.name.toLowerCase().includes('standard') || plan.popular;

                            // Reference UI: "Pro" is purple, others are white.
                            const cardBg = isPopular ? 'bg-[#e0e7ff]' : 'bg-white';
                            // Buttons: Always dark green/black
                            const btnBg = 'bg-[#052e16]';
                            const btnText = 'text-white';

                            return (
                                <motion.div
                                    key={plan.id || idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                    className={`relative rounded-[2rem] p-6 flex flex-col h-full ${cardBg} transition-transform duration-300 hover:-translate-y-1`}
                                >
                                    <div className="mb-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-xl font-bold text-[#052e16]">{plan.name.replace(/\(Monthly\)|\(Yearly\)/gi, '').trim()}</h3>
                                            {isPopular && (
                                                <span className="bg-[#052e16] text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                                                    Popular
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[#052e16]/70 text-xs leading-relaxed min-h-[32px]">{plan.description || "Perfect for your business needs."}</p>
                                    </div>

                                    <div className="mb-6">
                                        <div className="flex items-baseline">
                                            <span className="text-4xl font-extrabold text-[#052e16] tracking-tight">
                                                {parseFloat(plan.price) === 0 ? 'Free' : `₹${parseInt(plan.price)}`}
                                            </span>
                                            <span className="text-[#052e16]/60 font-medium ml-1 text-sm">
                                                {plan.duration_days === 365 ? '/yr' : plan.duration_days === 30 ? '/mo' : `/ ${plan.duration_days} days`}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-[#052e16]/60 mt-1 font-medium">Pause or cancel anytime</p>
                                    </div>

                                    <Link
                                        to="/demo"
                                        className={`block w-full text-center py-3.5 rounded-xl font-bold text-sm transition-transform active:scale-95 duration-200 mb-6 ${btnBg} ${btnText} hover:opacity-90`}
                                    >
                                        {parseFloat(plan.price) === 0 ? 'Start Free Trial' : 'Subscribe today'}
                                    </Link>

                                    <div className="space-y-3 flex-1">
                                        <div className="flex items-start gap-3 text-xs font-medium text-[#052e16]">
                                            <Check size={14} className="mt-0.5 shrink-0" strokeWidth={2.5} />
                                            <span>{plan.max_staff_users === 0 ? 'Unlimited' : plan.max_staff_users} Staff Accounts</span>
                                        </div>
                                        <div className="flex items-start gap-3 text-xs font-medium text-[#052e16]">
                                            <Check size={14} className="mt-0.5 shrink-0" strokeWidth={2.5} />
                                            <span>{plan.invoice_limit === 'Unlimited' ? 'Unlimited Invoices' : `${plan.invoice_limit} Invoices`}</span>
                                        </div>

                                        {featuresList.map((feat, i) => (
                                            <div key={i} className="flex items-start gap-3 text-xs font-medium text-[#052e16]">
                                                <Check size={14} className="mt-0.5 shrink-0" strokeWidth={2.5} />
                                                <span className="leading-snug">{feat}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Bottom tags mimicking 'Included services' */}
                                    <div className="mt-6 pt-4 border-t border-[#052e16]/10">
                                        <p className="text-[10px] font-bold text-[#052e16] mb-2 uppercase tracking-wider">Included</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            <span className="px-2 py-0.5 bg-white/50 border border-[#052e16]/10 rounded-full text-[9px] font-bold text-[#052e16]/70">GST Billing</span>
                                            <span className="px-2 py-0.5 bg-white/50 border border-[#052e16]/10 rounded-full text-[9px] font-bold text-[#052e16]/70">Inventory</span>
                                        </div>
                                    </div>

                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PricingPage;
