import React from 'react';
import PublicNavbar from './PublicNavbar';
import PublicFooter from './PublicFooter';

const PublicLayout = ({ children }) => {
    return (
        <div className="min-h-screen font-sans bg-gray-50 flex flex-col">
            <PublicNavbar />
            <main className="flex-grow pt-20">
                {children}
            </main>
            <PublicFooter />
        </div>
    );
};

export default PublicLayout;
