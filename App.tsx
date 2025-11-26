
import React, { useState, useEffect, useRef } from 'react';
import { QROptions, AIResponse, GenerationMode } from './types';
import { generateQRDataURL, generateQRSVG, downloadPDF, downloadSVG, verifyQRCode } from './utils/qrHelper';
import { SettingsPanel } from './components/SettingsPanel';
import { WifiForm, VCardForm, EventForm, CryptoForm } from './components/FormComponents';
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
  Bitcoin
} from 'lucide-react';

export default function App() {
  const [input, setInput] = useState<string>('https://google.com');
  const [mode, setMode] = useState<GenerationMode>('ai');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [qrSvg, setQrSvg] = useState<string>('');
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiStatus, setAiStatus] = useState<'success' | 'fallback' | null>(null);
  const [isReadable, setIsReadable] = useState<boolean | null>(true);
  
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
  });

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
      
      // Verify readability if there is a logo or custom settings that might break it
      if (options.logo || options.color.dark !== '#000000' || options.color.light !== '#ffffff') {
        const readable = await verifyQRCode(dataUrl, input);
        setIsReadable(readable);
      } else {
        setIsReadable(true);
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
    link.download = 'qrcode-intelli.png';
    link.click();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <QrCode className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">IntelliQR</h1>
              <p className="text-sm text-slate-500">
                {hasApiKey ? 'Smart QR Code Generator' : 'Professional QR Code Generator'}
              </p>
            </div>
          </div>
          {hasApiKey && (
            <div className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-500 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>Powered by Gemini 2.5</span>
            </div>
          )}
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
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
              
              {/* AI Feedback (Only show in AI mode and if we have a summary) */}
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
              <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${isReadable ? 'from-indigo-500 via-purple-500 to-pink-500' : 'from-amber-500 to-rose-500'}`}></div>
              
              <div className="mb-6 text-center w-full">
                 <div className="flex items-center justify-center gap-2">
                   <h2 className="text-lg font-semibold text-slate-800">Live Preview</h2>
                   {isReadable === false && (
                     <span className="bg-rose-100 text-rose-700 text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                       <AlertTriangle className="w-3 h-3" /> Error
                     </span>
                   )}
                   {isReadable === true && options.logo && (
                     <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                       <CheckCircle2 className="w-3 h-3" /> Valid
                     </span>
                   )}
                 </div>
                 <p className="text-sm text-slate-400">
                   {isReadable === false ? 'Unreadable. Reduce logo size or boost error correction.' : 'Scannable in real-time'}
                 </p>
              </div>

              <div 
                className={`bg-white p-4 rounded-xl shadow-inner border transition-colors duration-300 ${isReadable === false ? 'border-rose-200 bg-rose-50' : 'border-slate-100'}`}
                style={{
                  boxShadow: `0 20px 40px -10px ${isReadable === false ? '#ef4444' : options.color.dark}33`
                }}
              >
                {qrDataUrl ? (
                   <img 
                    src={qrDataUrl} 
                    alt="QR Code" 
                    className={`w-64 h-64 md:w-72 md:h-72 object-contain transition-all duration-300 ${isReadable === false ? 'opacity-90 blur-[0.5px]' : ''}`}
                   />
                ) : (
                  <div className="w-64 h-64 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                )}
              </div>
              
              {isReadable === false && (
                <div className="mt-4 w-full p-3 bg-rose-50 border border-rose-100 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                  <p className="text-xs text-rose-700 leading-relaxed">
                    <strong>Scan Verification Failed:</strong> The logo covers too much of the QR code. Try reducing the logo size or setting Error Correction to 'H' (High).
                  </p>
                </div>
              )}

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
                <button
                  onClick={handleDownloadPNG}
                  disabled={isReadable === false}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all shadow-lg shadow-slate-200 active:scale-95"
                >
                  <FileImage className="w-4 h-4" />
                  PNG
                </button>
                <button
                  onClick={() => downloadSVG(qrSvg, 'intelli-qr')}
                  disabled={isReadable === false}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-slate-200 hover:border-indigo-500 hover:text-indigo-600 disabled:border-slate-100 disabled:text-slate-300 disabled:cursor-not-allowed text-slate-700 rounded-xl font-medium transition-all active:scale-95"
                >
                  <Link2 className="w-4 h-4" />
                  SVG
                </button>
                <button
                  onClick={() => downloadPDF(input, options, 'intelli-qr')}
                  disabled={isReadable === false}
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
      </div>
    </div>
  );
}