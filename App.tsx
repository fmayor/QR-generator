import React, { useState, useEffect, useRef } from 'react';
import { QROptions, AIResponse, GenerationMode } from './types';
import { generateQRDataURL, generateQRSVG, downloadPDF, downloadSVG, verifyQRCode } from './utils/qrHelper';
import { SettingsPanel } from './components/SettingsPanel';
import { WifiForm, VCardForm, EventForm, CryptoForm } from './components/FormComponents';
import { PrivacyPolicy, TermsOfService } from './components/LegalPages';
import { interpretInput } from './services/gemini';
import { 
  Download, 
  Share2, 
  Sparkles, 
  QrCode, 
  Link2, 
  FileImage, 
  FileText, 
  Loader2,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ZapOff,
  Wifi,
  User,
  Calendar,
  Bitcoin,
  HelpCircle,
  Copy,
  X,
  Palette,
  MousePointer2
} from 'lucide-react';

type ViewState = 'home' | 'privacy' | 'terms';

export default function App() {
  const [view, setView] = useState<ViewState>('home');
  const [scrollToSection, setScrollToSection] = useState<string | undefined>(undefined);
  
  // Generator State
  const [input, setInput] = useState<string>('https://svg-qr.com');
  const [mode, setMode] = useState<GenerationMode>('ai');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [qrSvg, setQrSvg] = useState<string>('');
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiStatus, setAiStatus] = useState<'success' | 'fallback' | null>(null);
  
  const [isReadable, setIsReadable] = useState<boolean | null>(true);
  const [verificationError, setVerificationError] = useState<'logo' | 'contrast' | null>(null);
  const [verificationWarning, setVerificationWarning] = useState<'margin' | null>(null);
  
  const [copySuccess, setCopySuccess] = useState(false);
  const [showCookieBanner, setShowCookieBanner] = useState(false);
  
  const hasApiKey = !!process.env.API_KEY;
  
  const [options, setOptions] = useState<QROptions>({
    margin: 2,
    width: 1024,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
    errorCorrectionLevel: 'M',
    logoSize: 0.2,
    style: 'square',
    frameShape: 'square',
  });

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) setShowCookieBanner(true);
  }, []);

  const navigateTo = (newView: ViewState, sectionId?: string) => {
    setView(newView);
    setScrollToSection(sectionId);
    window.scrollTo(0, 0);
  };

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'true');
    setShowCookieBanner(false);
  };

  // Debounce input to avoid excessive rendering
  useEffect(() => {
    const timer = setTimeout(() => {
      generateQR();
    }, 100);
    return () => clearTimeout(timer);
  }, [input, options]);

  const generateQR = async () => {
    if (!input) return;
    try {
      const dataUrl = await generateQRDataURL(input, options);
      const svg = await generateQRSVG(input, options);
      setQrDataUrl(dataUrl);
      setQrSvg(svg);
      
      // Reset states
      setVerificationWarning(null);

      // Determine if we need to run verification logic
      const needsVerification = options.logo || options.color.dark !== '#000000' || options.color.light !== '#ffffff' || options.style !== 'square' || options.margin === 0;

      if (needsVerification) {
        let errorType: 'logo' | 'contrast' | null = null;
        let warningType: 'margin' | null = null;
        
        // 1. Geometry Check: Black & White + Logo
        if (options.logo || options.margin === 0) {
           const geometryOptions: QROptions = { 
             ...options, 
             style: 'square',
             color: { dark: '#000000', light: '#ffffff' },
           };
           const geometryUrl = await generateQRDataURL(input, geometryOptions);
           
           // Strict Check: Simulate hostile black background
           const geometryReadable = await verifyQRCode(geometryUrl, input, '#000000');
           
           if (!geometryReadable) {
             if (options.margin === 0) {
                const lenientReadable = await verifyQRCode(geometryUrl, input, '#ffffff');
                if (lenientReadable) {
                  warningType = 'margin';
                } else {
                  errorType = 'logo'; 
                }
             } else {
                errorType = 'logo';
             }
           }
        }

        // 2. Contrast Check
        if (!errorType) {
           const colorOptions: QROptions = { 
             ...options, 
             style: 'square',
             logo: null,
           };
           const colorUrl = await generateQRDataURL(input, colorOptions);
           
           const contrastReadable = await verifyQRCode(colorUrl, input, options.color.dark);
           if (!contrastReadable) {
             errorType = 'contrast';
           }
        }

        setVerificationError(errorType);
        setVerificationWarning(warningType);
        setIsReadable(errorType === null);
      } else {
        setIsReadable(true);
        setVerificationError(null);
        setVerificationWarning(null);
      }
      
    } catch (e) {
      console.error("Failed to generate QR", e);
    }
  };

  const handleMagicInput = async () => {
    if (!input.trim() || mode !== 'ai') return;
    setIsProcessingAI(true);
    setAiSummary(null);
    setAiStatus(null);
    
    try {
      const result: AIResponse = await interpretInput(input);
      setInput(result.payload);
      setAiSummary(result.summary);
      if (result.summary.includes("AI Disabled") || result.summary.includes("AI Unavailable")) {
        setAiStatus('fallback');
      } else {
        setAiStatus('success');
      }
    } catch (error) {
      console.error("AI Error", error);
      setAiStatus('fallback');
      setAiSummary("Could not connect to AI. Using raw text.");
    } finally {
      setIsProcessingAI(false);
    }
  };

  const handleDownloadPNG = () => {
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = 'qrcode-svg-qr.png';
    link.click();
  };

  const handleCopy = async () => {
    if (!qrDataUrl) return;
    try {
      const byteString = atob(qrDataUrl.split(',')[1]);
      const mimeString = qrDataUrl.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeString });

      await navigator.clipboard.write([
        new ClipboardItem({
          [mimeString]: blob,
        }),
      ]);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (e) {
      console.error("Failed to copy to clipboard", e);
    }
  };

  // ROUTER RENDER
  if (view === 'privacy') {
    return <PrivacyPolicy onBack={() => navigateTo('home')} scrollToId={scrollToSection} />;
  }
  
  if (view === 'terms') {
    return <TermsOfService onBack={() => navigateTo('home')} />;
  }

  // DEFAULT: GENERATOR APP
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900 flex flex-col">
      <div className="max-w-6xl mx-auto space-y-8 flex-grow w-full">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <QrCode className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">SVG QR</h1>
              <p className="text-sm text-slate-500">
                No Signup. No Limits. Just QR Codes.
              </p>
            </div>
          </div>
          {hasApiKey && (
            <div className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-500 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>Enhanced with AI</span>
            </div>
          )}
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Left Column: Input & Controls */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Input Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              
              {/* Tabs */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                 {[
                   { id: 'ai', icon: hasApiKey ? Sparkles : FileText, label: hasApiKey ? 'Text / AI' : 'Text' },
                   { id: 'wifi', icon: Wifi, label: 'WiFi' },
                   { id: 'vcard', icon: User, label: 'vCard' },
                   { id: 'event', icon: Calendar, label: 'Event' },
                   { id: 'crypto', icon: Bitcoin, label: 'Crypto' },
                 ].map((tab) => (
                   <button
                    key={tab.id}
                    onClick={() => {
                      setMode(tab.id as GenerationMode);
                      setAiSummary(null);
                      setAiStatus(null);
                      if (tab.id !== 'ai') setInput(''); // Clear input when switching to manual forms
                    }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                      ${mode === tab.id 
                        ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                   >
                     <tab.icon className="w-4 h-4" />
                     {tab.label}
                   </button>
                 ))}
              </div>

              {/* Dynamic Form Content */}
              {mode === 'ai' ? (
                <>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Enter Content or Description
                  </label>
                  <div className="relative">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      className="w-full h-32 p-4 pr-12 text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none transition-all placeholder:text-slate-400"
                      placeholder={hasApiKey ? "Paste a URL or try AI commands:\n• 'Event: Launch Party next Friday at 7pm'\n• 'WiFi: HomeNet pass: secret123'\n• 'Eth wallet: 0x71C...'\n• 'vCard: John Doe, 555-0199'" : "Enter text, website URL, or paste content here..."}
                    />
                    {hasApiKey && (
                      <button
                        onClick={handleMagicInput}
                        disabled={isProcessingAI || !input.trim()}
                        className="absolute right-3 bottom-3 p-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-lg transition-colors shadow-md group"
                        title="Enhance with AI"
                      >
                        {isProcessingAI ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        )}
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div className="border-t border-slate-100 pt-4">
                  {mode === 'wifi' && <WifiForm onChange={setInput} />}
                  {mode === 'vcard' && <VCardForm onChange={setInput} />}
                  {mode === 'event' && <EventForm onChange={setInput} />}
                  {mode === 'crypto' && <CryptoForm onChange={setInput} />}
                </div>
              )}
              
              {/* AI Feedback */}
              {mode === 'ai' && aiSummary && (
                <div className={`mt-4 p-3 rounded-lg flex items-start gap-3 border ${
                  aiStatus === 'success' 
                    ? 'bg-emerald-50 border-emerald-100' 
                    : 'bg-amber-50 border-amber-100'
                }`}>
                  <div className={`p-1 rounded-full mt-0.5 ${
                    aiStatus === 'success' ? 'bg-emerald-100' : 'bg-amber-100'
                  }`}>
                    {aiStatus === 'success' ? (
                      <Share2 className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <ZapOff className="w-3 h-3 text-amber-600" />
                    )}
                  </div>
                  <div>
                    <p className={`text-xs font-semibold uppercase tracking-wide ${
                      aiStatus === 'success' ? 'text-emerald-800' : 'text-amber-800'
                    }`}>
                      {aiStatus === 'success' ? 'AI Converted' : 'Standard Mode'}
                    </p>
                    <p className={`text-sm ${
                      aiStatus === 'success' ? 'text-emerald-700' : 'text-amber-700'
                    }`}>
                      {aiSummary}
                    </p>
                  </div>
                </div>
              )}
               <p className="mt-4 text-xs text-slate-400 flex items-center gap-1">
                {mode === 'ai' ? (
                  hasApiKey ? (
                    <>
                      <AlertCircle className="w-3 h-3" />
                      The AI detects events, crypto addresses, WiFi, and contacts automatically.
                    </>
                  ) : (
                    <>
                      <FileText className="w-3 h-3" />
                      Standard text mode. Use the tabs above for specific formats.
                    </>
                  )
                ) : (
                   <>
                    <CheckCircle2 className="w-3 h-3 text-indigo-500" />
                    Manual mode enabled. Form data is formatted automatically.
                   </>
                )}
              </p>
            </div>

            {/* Settings Panel */}
            <SettingsPanel options={options} setOptions={setOptions} />

          </div>

          {/* Right Column: Preview & Actions */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Preview Card */}
            <div className="bg-white rounded-2xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300">
              <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${
                isReadable === false ? 'from-rose-500 to-amber-500' :
                verificationWarning ? 'from-amber-400 to-yellow-400' :
                'from-indigo-500 via-purple-500 to-pink-500'
              }`}></div>
              
              <div className="mb-6 text-center w-full">
                 <div className="flex items-center justify-center gap-2">
                   <h2 className="text-lg font-semibold text-slate-800">Live Preview</h2>
                   {isReadable === false && (
                     <span className="bg-rose-100 text-rose-700 text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                       <AlertTriangle className="w-3 h-3" /> 
                       {verificationError === 'logo' ? 'Unreadable' : 'Low Contrast'}
                     </span>
                   )}
                   {isReadable === true && verificationWarning === 'margin' && (
                      <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Low Margin
                      </span>
                   )}
                   {isReadable === true && !verificationWarning && options.logo && (
                     <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                       <CheckCircle2 className="w-3 h-3" /> Valid
                     </span>
                   )}
                 </div>
                 <p className="text-sm text-slate-400">
                   {isReadable === false ? 'Scanner validation failed' : verificationWarning ? 'Code is valid but edges are tight' : 'Scannable in real-time'}
                 </p>
              </div>

              <div 
                className={`bg-transparent p-4 rounded-xl flex items-center justify-center`}
              >
                {qrDataUrl ? (
                   <img 
                    src={qrDataUrl} 
                    alt="QR Code" 
                    className={`w-64 h-64 md:w-72 md:h-72 object-contain transition-all duration-300 drop-shadow-lg`}
                   />
                ) : (
                  <div className="w-64 h-64 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                )}
              </div>
              
              {/* Critical Error Box */}
              {isReadable === false && (
                <div className="mt-4 w-full p-3 bg-rose-50 border border-rose-100 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                  <div className="text-xs text-rose-700 leading-relaxed space-y-1">
                    {verificationError === 'logo' ? (
                      <>
                        <p><strong>Obstructed or Invalid:</strong> The code cannot be read.</p>
                        <ul className="list-disc pl-4 space-y-0.5 mt-1 opacity-90">
                           <li>Decrease <strong>Logo Size</strong> using the slider.</li>
                           <li>Increase <strong>Error Correction</strong> to 'H'.</li>
                           <li>Increase <strong>Margin Width</strong> if set to zero.</li>
                        </ul>
                      </>
                    ) : (
                      <>
                        <p><strong>Low Contrast Detected:</strong> The scanner cannot distinguish the code.</p>
                        <p>Try a <strong>darker foreground</strong> on a light background.</p>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Warning Box (Soft Error) */}
              {isReadable === true && verificationWarning === 'margin' && (
                <div className="mt-4 w-full p-3 bg-amber-50 border border-amber-100 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                  <div className="text-xs text-amber-700 leading-relaxed space-y-1">
                     <p><strong>Low Margin Warning:</strong> This code is readable, but its edges are touching the border.</p>
                     <p>It may fail if printed on a dark surface. Consider increasing <strong>Margin Width</strong> to 1.</p>
                  </div>
                </div>
              )}

              <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
                <button
                  onClick={handleCopy}
                  disabled={!qrDataUrl}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-slate-200 hover:border-indigo-500 hover:text-indigo-600 disabled:border-slate-100 disabled:text-slate-300 disabled:cursor-not-allowed text-slate-700 rounded-xl font-medium transition-all active:scale-95"
                >
                  {copySuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  {copySuccess ? 'Copied' : 'Copy'}
                </button>
                <button
                  onClick={handleDownloadPNG}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all shadow-lg shadow-slate-200 active:scale-95"
                >
                  <FileImage className="w-4 h-4" />
                  PNG
                </button>
                <button
                  onClick={() => downloadSVG(qrSvg, 'easy-qr')}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-slate-200 hover:border-indigo-500 hover:text-indigo-600 disabled:border-slate-100 disabled:text-slate-300 disabled:cursor-not-allowed text-slate-700 rounded-xl font-medium transition-all active:scale-95"
                >
                  <Link2 className="w-4 h-4" />
                  SVG
                </button>
                <button
                  onClick={() => downloadPDF(input, options, 'easy-qr')}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-slate-200 hover:border-rose-500 hover:text-rose-600 disabled:border-slate-100 disabled:text-slate-300 disabled:cursor-not-allowed text-slate-700 rounded-xl font-medium transition-all active:scale-95"
                >
                  <FileText className="w-4 h-4" />
                  PDF
                </button>
              </div>
            </div>

            {/* Quick Tips or Info */}
            <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100 text-indigo-900">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Pro Tip
              </h3>
              <p className="text-sm opacity-80 leading-relaxed">
                Use high error correction (Level H) if you plan to print this QR code on physical merchandise or if you want to add a logo overlay later in a design tool.
              </p>
            </div>

          </div>
        </main>

        {/* FAQ Section */}
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

        {/* How to Use Section */}
        <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 mt-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">How to Use This Tool</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative pl-4 border-l-2 border-slate-100 hover:border-indigo-500 transition-colors">
              <span className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-indigo-600 ring-4 ring-white"></span>
              <h3 className="font-bold text-slate-900 mb-2">1. Choose Content Type</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">
                Select the tab that fits your needs. Use <strong>URL</strong> for websites, <strong>WiFi</strong> for easy network access, or <strong>vCard</strong> for digital business cards.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative pl-4 border-l-2 border-slate-100 hover:border-indigo-500 transition-colors">
              <span className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-200 ring-4 ring-white"></span>
              <h3 className="font-bold text-slate-900 mb-2">2. Customize Design</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">
                Match your brand by adjusting the <strong>Foreground</strong> and <strong>Background</strong> colors. You can also change the pixel style to "Dots" or "Square" and upload a custom logo to place in the center.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative pl-4 border-l-2 border-slate-100 hover:border-indigo-500 transition-colors">
               <span className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-200 ring-4 ring-white"></span>
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

        {/* Footer */}
        <footer className="mt-20 border-t border-slate-200 pt-8 pb-12 text-center md:text-left">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <QrCode className="text-white w-5 h-5" />
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
                  <a href="/privacy.html" onClick={(e) => { e.preventDefault(); navigateTo('privacy'); }} className="hover:text-indigo-600 transition-colors cursor-pointer">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="/terms.html" onClick={(e) => { e.preventDefault(); navigateTo('terms'); }} className="hover:text-indigo-600 transition-colors cursor-pointer">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="/privacy.html#cookies" onClick={(e) => { e.preventDefault(); navigateTo('privacy', 'cookies'); }} className="hover:text-indigo-600 transition-colors cursor-pointer">
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
      </div>

      {/* Cookie Consent Banner */}
      {showCookieBanner && (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] p-4 z-50 animate-in slide-in-from-bottom duration-500">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-600 text-center md:text-left">
              We use cookies to analyze traffic and personalize content. By continuing to use this site, you agree to our use of cookies.
            </p>
            <div className="flex items-center gap-3">
              <button 
                onClick={acceptCookies}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Accept
              </button>
              <button 
                onClick={() => setShowCookieBanner(false)}
                className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}