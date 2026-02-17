import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { leadsAPI } from '../../api/apiService';

const DemoPage = () => {
    useEffect(() => {
        document.title = "Get Free Demo - Geo Billing";
    }, []);

    const [formData, setFormData] = useState({
        businessName: '',
        contactPerson: '',
        phone: '',
        email: '',
        businessType: '',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            business_name: formData.businessName,
            contact_person: formData.contactPerson,
            phone: formData.phone,
            email: formData.email,
            business_type: formData.businessType,
            message: formData.message
        };

        try {
            await leadsAPI.submitRequest(payload);
            setSubmitted(true);
        } catch (err) {
            console.error("Error submitting demo request:", err);
            // alert("Failed to submit request. Please try again."); // Removed alert for better UX, maybe use toast later
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-md w-full border border-gray-100"
                >
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-6">
                        <CheckCircle size={40} />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Request Received!</h2>
                    <p className="text-gray-600 mb-8">
                        Thank you for your interest. Our super admin team will contact you shortly to schedule your personalized demo.
                    </p>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="text-green-600 font-semibold hover:underline"
                    >
                        Back to Home
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="bg-white py-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Get a Free Demo</h1>
                    <p className="text-lg text-gray-600">
                        See how Geo Billing works with a live walkthrough tailored to your business.
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col md:flex-row">
                    <div className="md:w-1/2 bg-gray-900 p-10 text-white flex flex-col justify-center">
                        <h3 className="text-2xl font-bold mb-6">What to expect?</h3>
                        <ul className="space-y-4 text-gray-300">
                            <li className="flex items-start gap-3">
                                <span className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                                <div>
                                    <h4 className="font-bold text-white">Needs Analysis</h4>
                                    <p className="text-sm mt-1">We discuss your business workflow and challenges.</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                                <div>
                                    <h4 className="font-bold text-white">Live Walkthrough</h4>
                                    <p className="text-sm mt-1">A guided tour of features relevant to you.</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                                <div>
                                    <h4 className="font-bold text-white">Q&A Session</h4>
                                    <p className="text-sm mt-1">Get answers to all your technical questions.</p>
                                </div>
                            </li>
                        </ul>
                    </div>

                    <div className="md:w-1/2 p-10">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
                                <input
                                    type="text"
                                    required
                                    name="businessName"
                                    value={formData.businessName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                                    placeholder="Enter your business name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person *</label>
                                <input
                                    type="text"
                                    required
                                    name="contactPerson"
                                    value={formData.contactPerson}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                                    placeholder="Your name"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                                    <input
                                        type="tel"
                                        required
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                                        placeholder="9876..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Type *</label>
                                    <select
                                        required
                                        name="businessType"
                                        value={formData.businessType}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                                    >
                                        <option value="">Select Type</option>
                                        <option value="Retail">Retail</option>
                                        <option value="Restaurant">Restaurant</option>
                                        <option value="Service">Service</option>
                                        <option value="Manufacturing">Manufacturing</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email (Optional)</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                                    placeholder="name@company.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Message (Optional)</label>
                                <textarea
                                    name="message"
                                    rows="3"
                                    value={formData.message}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                                    placeholder="Tell us about your requirements..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-3 px-4 rounded-lg text-white font-bold text-lg shadow-lg ${loading
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-green-600 to-teal-600 hover:shadow-green-600/30 hover:-translate-y-0.5 transition-all'
                                    }`}
                            >
                                {loading ? 'Submitting...' : 'Request Demo'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DemoPage;
