import React from 'react';
import { HelpCircle, Sparkles, ArrowRight } from 'lucide-react';

export const FAQSection = React.memo(() => (
  <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 mt-12">
    <div className="flex items-center gap-3 mb-8">
      <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
        <HelpCircle className="w-5 h-5 text-indigo-600" />
      </div>
      <h2 className="text-xl font-bold text-slate-900">Frequently Asked Questions</h2>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
      <div className="space-y-6">
        <div>
          <h3 className="font-semibold text-slate-900 mb-2">What is a QR code and why are they useful?</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            A QR (Quick Response) code is a two-dimensional barcode that allows smartphones to instantly access information. 
            They are incredibly useful for sharing websites, Wi-Fi passwords, contact details (vCards), or event info without typing.
          </p>
        </div>
        
        <div>
          <h3 className="font-semibold text-slate-900 mb-2">How to create a Vector QR Code?</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Creating a vector QR code is simple. Generate your code using the tools above, then click the "SVG" or "PDF" download buttons. 
            These formats save the code as mathematical paths, ensuring it stays perfectly sharp at any size, from business cards to billboards.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-slate-900 mb-2">Is this really free?</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Yes, this tool is 100% free and open-source. All generation happens locally in your browser, meaning your data is private, secure, and no sign-up is required.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="font-semibold text-slate-900 mb-2">What is error correction?</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Error correction allows a QR code to be scanned even if part of it is damaged or covered. 
            We offer four levels: L (Low, 7%), M (Medium, 15%), Q (Quartile, 25%), and H (High, 30%). 
            Use 'H' if you add a logo to the center.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-slate-900 mb-2">Why use SVG for QR Codes?</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            SVG (Scalable Vector Graphics) files are resolution-independent. Unlike PNG or JPG images, 
            SVGs do not get blurry or pixelated when printed on large surfaces. They are the professional standard for printing.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-slate-900 mb-2">Can I use these QR codes for commercial purposes?</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Absolutely. The QR codes generated here are yours forever. There are no time limits, scan limits, or hidden tracking. 
            You can use them for business cards, product packaging, or marketing campaigns without any restrictions.
          </p>
        </div>
      </div>
    </div>
  </section>
));

export const HowToUseSection = React.memo(() => (
  <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 mt-8">
    <div className="flex items-center gap-3 mb-8">
      <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
        <Sparkles className="w-5 h-5 text-indigo-600" />
      </div>
      <h2 className="text-xl font-bold text-slate-900">How to Use This Tool</h2>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Step 1 */}
      <div className="relative pl-4 border-l-2 border-slate-100 hover:border-indigo-500 transition-colors group">
        <span className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-indigo-600 ring-4 ring-white transition-transform group-hover:scale-110"></span>
        <h3 className="font-bold text-slate-900 mb-2">1. Choose Content Type</h3>
        <p className="text-sm text-slate-500 leading-relaxed mb-4">
          Select the tab that fits your needs. Use <strong>URL</strong> for websites, <strong>WiFi</strong> for easy network access, or <strong>vCard</strong> for digital business cards.
        </p>
      </div>

      {/* Step 2 */}
      <div className="relative pl-4 border-l-2 border-slate-100 hover:border-indigo-500 transition-colors group">
        <span className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-200 ring-4 ring-white group-hover:bg-indigo-400 transition-colors"></span>
        <h3 className="font-bold text-slate-900 mb-2">2. Customize Design</h3>
        <p className="text-sm text-slate-500 leading-relaxed mb-4">
          Match your brand by adjusting the <strong>Foreground</strong> and <strong>Background</strong> colors. You can also change the pixel style to "Dots" or "Square" and upload a custom logo to place in the center.
        </p>
      </div>

      {/* Step 3 */}
      <div className="relative pl-4 border-l-2 border-slate-100 hover:border-indigo-500 transition-colors group">
         <span className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-200 ring-4 ring-white group-hover:bg-indigo-400 transition-colors"></span>
        <h3 className="font-bold text-slate-900 mb-2">3. Download Vector</h3>
        <p className="text-sm text-slate-500 leading-relaxed mb-4">
          For professional printing, always choose <strong>SVG</strong> or <strong>PDF</strong>. These vector formats ensure your QR code remains crisp and scannable at any size, from business cards to billboards.
        </p>
      </div>
    </div>
    
    <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-500">
      <p><strong>Note for Designers:</strong> Because this tool runs locally in your browser, you can generate as many high-resolution codes as you need without hitting any paywalls or limits. The "Vector SVG" output is fully editable in software like Adobe Illustrator or Figma.</p>
    </div>
  </section>
));

interface FooterProps {
  onNavigate: (view: 'privacy' | 'terms', section?: string) => void;
}

export const Footer = React.memo<FooterProps>(({ onNavigate }) => (
  <footer className="mt-20 border-t border-slate-200 pt-8 pb-12 text-center md:text-left">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
      <div className="col-span-1 md:col-span-2">
        <div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
           <div className="group">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="w-8 h-8 rounded-lg group-hover:scale-105 transition-transform duration-200">
              <rect width="32" height="32" rx="8" fill="#4f46e5"/>
              <path fill="white" d="M7 7h6v6H7zM19 7h6v6h-6zM7 19h6v6H7zM19 19h2v2h-2zM23 19h2v2h-2zM19 23h2v2h-2zM23 23h2v2h-2z"/>
            </svg>
          </div>
          <span className="font-bold text-lg text-slate-800">SVG QR</span>
        </div>
        <p className="text-sm text-slate-500 max-w-xs mx-auto md:mx-0 leading-relaxed">
          The free, privacy-first vector QR code generator. 
          Built for designers, developers, and everyone who hates sign-up forms.
        </p>
      </div>
      
      <div>
        <h4 className="font-semibold text-slate-900 mb-4">Legal</h4>
        <ul className="space-y-2 text-sm text-slate-500">
          <li>
            <a href="/privacy.html" onClick={(e) => { e.preventDefault(); onNavigate('privacy'); }} className="hover:text-indigo-600 transition-colors cursor-pointer">
              Privacy Policy
            </a>
          </li>
          <li>
            <a href="/terms.html" onClick={(e) => { e.preventDefault(); onNavigate('terms'); }} className="hover:text-indigo-600 transition-colors cursor-pointer">
              Terms of Service
            </a>
          </li>
          <li>
            <a href="/privacy.html#cookies" onClick={(e) => { e.preventDefault(); onNavigate('privacy', 'cookies'); }} className="hover:text-indigo-600 transition-colors cursor-pointer">
              Cookie Policy
            </a>
          </li>
        </ul>
      </div>

      <div>
        <h4 className="font-semibold text-slate-900 mb-4">Connect</h4>
        <ul className="space-y-2 text-sm text-slate-500">
          <li><a href="https://github.com/fmayor/QR-generator" target="_blank" rel="noreferrer" className="hover:text-indigo-600 transition-colors">GitHub</a></li>
        </ul>
      </div>
    </div>
    <div className="mt-12 pt-8 border-t border-slate-100 text-center text-xs text-slate-400">
      &copy; {new Date().getFullYear()} SVG-QR.com. All rights reserved.
    </div>
  </footer>
));