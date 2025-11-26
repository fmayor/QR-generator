import React, { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

interface LegalPageProps {
  onBack: () => void;
  scrollToId?: string;
}

export const PrivacyPolicy: React.FC<LegalPageProps> = ({ onBack, scrollToId }) => {
  // Handle scrolling to specific section if requested
  useEffect(() => {
    if (scrollToId) {
      setTimeout(() => {
        const element = document.getElementById(scrollToId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, [scrollToId]);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 md:px-8 font-sans text-slate-900">
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200">
        <div className="mb-8 border-b border-slate-100 pb-8">
          <button 
            onClick={onBack}
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Generator
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
          <p className="text-slate-500">Last Updated: October 24, 2024</p>
        </div>

        <div className="prose prose-slate max-w-none prose-headings:font-semibold prose-a:text-indigo-600 hover:prose-a:text-indigo-500">
          <p>At <strong>SVG QR</strong>, accessible from svg-qr.com, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by SVG QR and how we use it.</p>

          <h3 className="text-xl font-bold mt-6 mb-3 text-slate-800">1. Local Processing</h3>
          <p className="mb-4 text-slate-600 leading-relaxed">SVG QR is designed as a privacy-first application. The core functionality of generating QR codes (including WiFi, vCard, Event, and Crypto formats) is performed <strong>locally within your browser</strong> using JavaScript. Your input data for these standard generations is not sent to our servers or stored in any database.</p>

          <h3 id="cookies" className="text-xl font-bold mt-6 mb-3 text-slate-800">2. Cookies and Local Storage</h3>
          <p className="mb-4 text-slate-600 leading-relaxed">We use local storage technology to save your preferences, such as your decision to dismiss the cookie consent banner. We may use third-party cookies for the following purposes:</p>
          <ul className="list-disc pl-5 mb-4 text-slate-600 space-y-1">
            <li><strong>Analytics:</strong> To understand how visitors interact with the website.</li>
            <li><strong>Advertising:</strong> To provide relevant advertisements and support the free maintenance of this tool.</li>
          </ul>

          <h3 className="text-xl font-bold mt-6 mb-3 text-slate-800">3. Log Files</h3>
          <p className="mb-4 text-slate-600 leading-relaxed">SVG QR follows a standard procedure of using log files. These files log visitors when they visit websites. All hosting companies do this as a part of hosting services' analytics. The information collected includes IP addresses, browser type, Internet Service Provider (ISP), date/time stamp, and referring/exit pages.</p>

          <h3 className="text-xl font-bold mt-6 mb-3 text-slate-800">4. Third-Party Privacy Policies</h3>
          <p className="mb-4 text-slate-600 leading-relaxed">SVG QR's Privacy Policy does not apply to other advertisers or websites. Thus, we are advising you to consult the respective Privacy Policies of these third-party ad servers for more detailed information.</p>

          <h3 className="text-xl font-bold mt-6 mb-3 text-slate-800">5. Consent</h3>
          <p className="mb-4 text-slate-600 leading-relaxed">By using our website, you hereby consent to our Privacy Policy and agree to its Terms and Conditions.</p>
        </div>
        
        <div className="mt-12 pt-8 border-t border-slate-100 text-center text-sm text-slate-500">
          &copy; {new Date().getFullYear()} SVG-QR.com. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export const TermsOfService: React.FC<LegalPageProps> = ({ onBack }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 md:px-8 font-sans text-slate-900">
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200">
        <div className="mb-8 border-b border-slate-100 pb-8">
          <button 
            onClick={onBack}
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Generator
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Terms of Service</h1>
          <p className="text-slate-500">Last Updated: October 24, 2024</p>
        </div>

        <div className="prose prose-slate max-w-none prose-headings:font-semibold prose-a:text-indigo-600 hover:prose-a:text-indigo-500">
          <h3 className="text-xl font-bold mt-6 mb-3 text-slate-800">1. Acceptance of Terms</h3>
          <p className="mb-4 text-slate-600 leading-relaxed">By accessing and using <strong>SVG QR</strong> (svg-qr.com), you accept and agree to be bound by the terms and provision of this agreement.</p>

          <h3 className="text-xl font-bold mt-6 mb-3 text-slate-800">2. Description of Service</h3>
          <p className="mb-4 text-slate-600 leading-relaxed">SVG QR provides a free, browser-based tool for generating QR codes in various formats (SVG, PDF, PNG). The service is provided "as is" and is intended for general information and utility purposes.</p>

          <h3 className="text-xl font-bold mt-6 mb-3 text-slate-800">3. User Responsibilities</h3>
          <ul className="list-disc pl-5 mb-4 text-slate-600 space-y-1">
            <li>You are responsible for verifying the accuracy and scannability of the QR codes generated before printing or distributing them.</li>
            <li>You agree not to use the service to generate QR codes containing malicious links, illegal content, or hate speech.</li>
            <li>You acknowledge that physical printing conditions (material, contrast, size) affect QR code readability and are beyond our control.</li>
          </ul>

          <h3 className="text-xl font-bold mt-6 mb-3 text-slate-800">4. Intellectual Property</h3>
          <p className="mb-4 text-slate-600 leading-relaxed">The QR codes you generate using our tool are yours. We claim no ownership over the content you encode or the resulting images. The underlying code, design, and interface of the website remain the intellectual property of SVG QR.</p>

          <h3 className="text-xl font-bold mt-6 mb-3 text-slate-800">5. Disclaimer of Warranties</h3>
          <p className="mb-4 text-slate-600 leading-relaxed">The site and its original content, features, and functionality are owned by SVG QR and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws. We do not warrant that the service will be uninterrupted, secure, or error-free.</p>

          <h3 className="text-xl font-bold mt-6 mb-3 text-slate-800">6. Limitation of Liability</h3>
          <p className="mb-4 text-slate-600 leading-relaxed">In no event shall SVG QR, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the service.</p>

          <h3 className="text-xl font-bold mt-6 mb-3 text-slate-800">7. Changes to Terms</h3>
          <p className="mb-4 text-slate-600 leading-relaxed">We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.</p>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-100 text-center text-sm text-slate-500">
          &copy; {new Date().getFullYear()} SVG-QR.com. All rights reserved.
        </div>
      </div>
    </div>
  );
};