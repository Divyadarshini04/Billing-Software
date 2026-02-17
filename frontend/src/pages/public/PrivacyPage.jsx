import React from 'react';

const PrivacyPage = () => {
    return (
        <div className="min-h-screen bg-white pt-32 pb-16 px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-8 text-gray-900">Privacy Policy</h1>
                <div className="prose prose-lg text-gray-600">
                    <p>Last updated: {new Date().toLocaleDateString()}</p>
                    <p>
                        At Geo Billing, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclosure, and safeguard your information when you visit our website or use our application.
                    </p>
                    <h3>1. Information We Collect</h3>
                    <p>We collect information that you provide securely.</p>
                    {/* Add more placeholder content as needed */}
                </div>
            </div>
        </div>
    );
};

export default PrivacyPage;
