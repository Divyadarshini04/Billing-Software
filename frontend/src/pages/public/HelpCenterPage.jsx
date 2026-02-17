import React from 'react';
import { Link } from 'react-router-dom';

const HelpCenterPage = () => {
    return (
        <div className="min-h-screen bg-white pt-32 pb-16 px-4">
            <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-4xl font-bold mb-6 text-gray-900">Help Center</h1>
                <p className="text-xl text-gray-600 mb-12">
                    How can we help you today?
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                    <div className="p-6 border rounded-xl hover:shadow-md transition-shadow">
                        <h3 className="text-xl font-bold mb-3">Getting Started</h3>
                        <p className="text-gray-600 mb-4">Learn the basics of setting up your account and billing.</p>
                        <Link to="/contact" className="text-green-600 font-bold hover:underline">Read Articles</Link>
                    </div>
                    <div className="p-6 border rounded-xl hover:shadow-md transition-shadow">
                        <h3 className="text-xl font-bold mb-3">Account & Billing</h3>
                        <p className="text-gray-600 mb-4">Manage your subscription, invoices, and payment methods.</p>
                        <Link to="/contact" className="text-green-600 font-bold hover:underline">Read Articles</Link>
                    </div>
                </div>

                <div className="mt-16">
                    <p className="text-gray-600">Still need help?</p>
                    <Link to="/contact" className="inline-block mt-4 px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors">Contact Support</Link>
                </div>
            </div>
        </div>
    );
};

export default HelpCenterPage;
