import React from 'react';

const TermsPage = () => {
    return (
        <div className="min-h-screen bg-white pt-32 pb-16 px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-8 text-gray-900">Terms of Service</h1>
                <div className="prose prose-lg text-gray-600">
                    <p>Last updated: {new Date().toLocaleDateString()}</p>
                    <p>
                        Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the Geo Billing website and application.
                    </p>
                    <h3>1. Acceptance of Terms</h3>
                    <p>By accessing or using the Service you agree to be bound by these Terms.</p>
                    {/* Add more placeholder content as needed */}
                </div>
            </div>
        </div>
    );
};

export default TermsPage;
