import React, { useRef } from 'react';
import { QROptions } from '../types';
import { Settings, Check, Droplet, ShieldCheck, Maximize, Image as ImageIcon, X, Palette, PaintBucket, Grid, Circle, Square } from 'lucide-react';

interface SettingsPanelProps {
  options: QROptions;
  setOptions: React.Dispatch<React.SetStateAction<QROptions>>;
}

const FG_COLORS = [
  { name: 'Black', value: '#000000' },
  { name: 'Blue', value: '#2563eb' },
  { name: 'Purple', value: '#7c3aed' },
  { name: 'Rose', value: '#e11d48' },
  { name: 'Emerald', value: '#059669' },
  { name: 'Slate', value: '#334155' },
];

const BG_COLORS = [
  { name: 'White', value: '#ffffff' },
  { name: 'Light Slate', value: '#f1f5f9' },
  { name: 'Cream', value: '#fffbeb' },
  { name: 'Pale Blue', value: '#eff6ff' },
  { name: 'Mint', value: '#f0fdf4' },
  { name: 'Dark', value: '#1e293b' },
];

export const SettingsPanel = React.memo<SettingsPanelProps>(({ options, setOptions }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFgColorChange = (color: string) => {
    setOptions(prev => ({ ...prev, color: { ...prev.color, dark: color } }));
  };

  const handleBgColorChange = (color: string) => {
    setOptions(prev => ({ ...prev, color: { ...prev.color, light: color } }));
  };

  const handleLevelChange = (level: QROptions['errorCorrectionLevel']) => {
    setOptions(prev => ({ ...prev, errorCorrectionLevel: level }));
  };
  
  const handleStyleChange = (style: 'square' | 'dots') => {
    setOptions(prev => ({ ...prev, style }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.match(/image\/(png|jpeg|jpg)/)) {
        alert('Please upload a PNG or JPEG image only.');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          // AUTO-UPGRADE: When adding a logo, automatically set Level to 'H' to ensure readability.
          setOptions(prev => ({ 
            ...prev, 
            logo: event.target?.result as string,
            errorCorrectionLevel: 'H'
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setOptions(prev => ({ ...prev, logo: null }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
      <div className="flex items-center gap-2 mb-6 text-slate-800">
        <Settings className="w-5 h-5" />
        <h2 className="font-semibold text-lg">Customization</h2>
      </div>

      <div className="space-y-6">
        
        {/* Colors Section */}
        <div className="space-y-4">
          {/* Foreground Color */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-600 mb-3">
              <Droplet className="w-4 h-4" />
              Foreground Color
            </label>
            <div className="flex flex-wrap gap-3">
              {FG_COLORS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => handleFgColorChange(c.value)}
                  className={`w-8 h-8 rounded-full transition-all duration-200 flex items-center justify-center border border-slate-100
                    ${options.color.dark === c.value ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : 'hover:scale-105'}`}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                >
                  {options.color.dark === c.value && <Check className="w-4 h-4 text-white mix-blend-difference" strokeWidth={3} />}
                </button>
              ))}
              
              <div className="relative group">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-110 shadow-sm ring-1 ring-slate-100"
                  style={{ 
                    background: 'linear-gradient(135deg, #fca5a5 0%, #fcd34d 25%, #86efac 50%, #67e8f9 75%, #c4b5fd 100%)' 
                  }}
                >
                  <Palette className="w-4 h-4 text-slate-700 opacity-70" />
                </div>
                <input
                  type="color"
                  value={options.color.dark}
                  onChange={(e) => handleFgColorChange(e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-full"
                  title="Choose Custom Color"
                />
              </div>
            </div>
          </div>

          {/* Background Color */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-600 mb-3">
              <PaintBucket className="w-4 h-4" />
              Background Color
            </label>
            <div className="flex flex-wrap gap-3">
              {BG_COLORS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => handleBgColorChange(c.value)}
                  className={`w-8 h-8 rounded-full transition-all duration-200 flex items-center justify-center border border-slate-200
                    ${options.color.light === c.value ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : 'hover:scale-105'}`}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                >
                  {options.color.light === c.value && <Check className="w-4 h-4 text-slate-900 mix-blend-difference" strokeWidth={3} />}
                </button>
              ))}
              
              <div className="relative group">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-110 shadow-sm ring-1 ring-slate-100 bg-white"
                >
                  <Palette className="w-4 h-4 text-slate-700 opacity-70" />
                </div>
                <input
                  type="color"
                  value={options.color.light}
                  onChange={(e) => handleBgColorChange(e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-full"
                  title="Choose Custom Background"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Pixel Style Selector */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-600 mb-3">
            <Grid className="w-4 h-4" />
            Pixel Style
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'square', label: 'Square', icon: Square },
              { id: 'dots', label: 'Dots', icon: Circle }
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => handleStyleChange(s.id as any)}
                className={`flex flex-col items-center justify-center gap-2 py-3 rounded-lg border transition-all duration-200
                  ${options.style === s.id
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                    : 'border-slate-200 text-slate-600 hover:border-indigo-200 hover:text-indigo-600'
                  }`}
              >
                <s.icon className="w-5 h-5" fill="currentColor" strokeWidth={0} />
                <span className="text-xs font-medium">{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Logo Upload */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-600 mb-3">
            <ImageIcon className="w-4 h-4" />
            Center Logo
          </label>
          
          {!options.logo ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 rounded-xl p-4 hover:border-indigo-400 hover:bg-indigo-50 transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-2 group"
            >
              <div className="p-2 bg-slate-100 rounded-full group-hover:bg-white transition-colors">
                <ImageIcon className="w-5 h-5 text-slate-400 group-hover:text-indigo-500" />
              </div>
              <p className="text-xs text-slate-500 font-medium">Click to upload <br/>(PNG or JPEG)</p>
            </div>
          ) : (
             <div className="space-y-4">
               <div className="relative group">
                  <div className="w-full h-20 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center overflow-hidden">
                    <img src={options.logo} alt="Logo preview" className="h-12 w-12 object-contain" />
                  </div>
                  <button 
                    onClick={removeLogo}
                    className="absolute -top-2 -right-2 bg-white text-slate-500 hover:text-rose-500 border border-slate-200 p-1 rounded-full shadow-sm transition-colors"
                    title="Remove logo"
                  >
                    <X className="w-4 h-4" />
                  </button>
               </div>

               {/* Logo Size Slider */}
               <div className="animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between text-xs font-medium text-slate-600 mb-1">
                  <span>Logo Size</span>
                  <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                    {Math.round((options.logoSize || 0.2) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.35"
                  step="0.01"
                  value={options.logoSize || 0.2}
                  onChange={(e) => setOptions(prev => ({...prev, logoSize: parseFloat(e.target.value)}))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                 <p className="text-[10px] text-slate-400 mt-1 leading-tight">
                   Adjust size if the logo covers too much of the data.
                 </p>
              </div>
             </div>
          )}
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleLogoUpload}
            accept="image/png, image/jpeg, image/jpg"
            className="hidden"
          />
        </div>

        {/* Error Correction Level */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-600 mb-3">
            <ShieldCheck className="w-4 h-4" />
            Error Correction
          </label>
          <div className="grid grid-cols-4 gap-2">
            {['L', 'M', 'Q', 'H'].map((level) => (
              <button
                key={level}
                onClick={() => handleLevelChange(level as any)}
                className={`py-2 text-sm font-medium rounded-lg border transition-all duration-200
                  ${options.errorCorrectionLevel === level
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                    : 'border-slate-200 text-slate-600 hover:border-indigo-200 hover:text-indigo-600'
                  }`}
              >
                {level}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {options.errorCorrectionLevel === 'H' || options.errorCorrectionLevel === 'Q' 
              ? "High redundancy. Best for logos, but makes the code denser." 
              : "Standard redundancy. Best for long URLs and cleaner look."}
          </p>
        </div>

        {/* Size / Margin */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-600 mb-3">
            <Maximize className="w-4 h-4" />
            Margin Width
          </label>
          <input 
            type="range" 
            min="1" 
            max="10" 
            step="1"
            value={options.margin}
            onChange={(e) => setOptions(prev => ({...prev, margin: parseInt(e.target.value)}))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>Narrow</span>
            <span>Wide</span>
          </div>
        </div>
      </div>
    </div>
  );
});