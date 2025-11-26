import React, { useState, useEffect } from 'react';
import { Wifi, User, Calendar, Bitcoin, MapPin, Globe, Mail, Phone, Briefcase, AlertCircle, Building2 } from 'lucide-react';

interface FormProps {
  onChange: (payload: string) => void;
}

// --- WiFi Form ---
export const WifiForm: React.FC<FormProps> = ({ onChange }) => {
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [encryption, setEncryption] = useState('WPA');
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    // Format: WIFI:S:MySSID;T:WPA;P:MyPass;H:false;;
    const payload = `WIFI:S:${ssid};T:${encryption};P:${password};H:${hidden};;`;
    onChange(payload);
  }, [ssid, password, encryption, hidden, onChange]);

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Network Name (SSID)</label>
        <div className="relative">
          <Wifi className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={ssid}
            onChange={(e) => setSsid(e.target.value)}
            className="w-full pl-10 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="e.g. Home_Network"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
        <input
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          placeholder="Network Password"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Security</label>
          <select
            value={encryption}
            onChange={(e) => setEncryption(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="WPA">WPA/WPA2</option>
            <option value="WEP">WEP</option>
            <option value="nopass">None</option>
          </select>
        </div>
        <div className="flex items-center pt-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={hidden}
              onChange={(e) => setHidden(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
            />
            <span className="text-sm text-slate-700">Hidden Network</span>
          </label>
        </div>
      </div>
    </div>
  );
};

// --- vCard Form ---
export const VCardForm: React.FC<FormProps> = ({ onChange }) => {
  const [data, setData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    workPhone: '',
    email: '',
    website: '',
    org: '',
    title: '',
    street: '',
    city: '',
    country: ''
  });

  useEffect(() => {
    // Standard vCard 3.0 format
    // We conditionally add phones so empty fields don't create blank entries
    let payload = `BEGIN:VCARD
VERSION:3.0
N:${data.lastName};${data.firstName};;;
FN:${data.firstName} ${data.lastName}
ORG:${data.org}
TITLE:${data.title}
EMAIL:${data.email}
URL:${data.website}
ADR:;;${data.street};${data.city};;;${data.country}
`;
    if (data.phone) payload += `TEL;TYPE=CELL:${data.phone}\n`;
    if (data.workPhone) payload += `TEL;TYPE=WORK:${data.workPhone}\n`;
    
    payload += `END:VCARD`;
    
    onChange(payload);
  }, [data, onChange]);

  const update = (field: string, value: string) => setData(prev => ({ ...prev, [field]: value }));

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
          <div className="relative">
            <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input type="text" value={data.firstName} onChange={e => update('firstName', e.target.value)} className="w-full pl-10 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="John" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
          <input type="text" value={data.lastName} onChange={e => update('lastName', e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Doe" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Mobile Phone</label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input type="tel" value={data.phone} onChange={e => update('phone', e.target.value)} className="w-full pl-10 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="+1 234..." />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Work Phone</label>
          <div className="relative">
             <Building2 className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input type="tel" value={data.workPhone} onChange={e => update('workPhone', e.target.value)} className="w-full pl-10 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="+1 800..." />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <div className="relative">
             <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input type="email" value={data.email} onChange={e => update('email', e.target.value)} className="w-full pl-10 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="john@example.com" />
          </div>
        </div>
         <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Website</label>
          <div className="relative">
            <Globe className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input type="url" value={data.website} onChange={e => update('website', e.target.value)} className="w-full pl-10 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="https://mysite.com" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Company</label>
          <div className="relative">
            <Briefcase className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input type="text" value={data.org} onChange={e => update('org', e.target.value)} className="w-full pl-10 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Acme Inc." />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Job Title</label>
          <input type="text" value={data.title} onChange={e => update('title', e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Manager" />
        </div>
      </div>
    </div>
  );
};

// --- Event Form ---
export const EventForm: React.FC<FormProps> = ({ onChange }) => {
  const [data, setData] = useState({
    title: '',
    location: '',
    start: '',
    end: '',
    description: ''
  });

  // Calculate validity
  let isInvalidDate = false;
  try {
    if (data.start && data.end) {
      isInvalidDate = new Date(data.start) > new Date(data.end);
    }
  } catch (e) {
    // ignore invalid parsing
  }

  useEffect(() => {
    // Helper to format date as YYYYMMDDTHHmm00
    const fmt = (d: string) => d ? d.replace(/[-:]/g, '').replace(' ', 'T') + '00' : '';

    const payload = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//SVGQR//EN
BEGIN:VEVENT
SUMMARY:${data.title}
LOCATION:${data.location}
DTSTART:${fmt(data.start)}
DTEND:${fmt(data.end)}
DESCRIPTION:${data.description}
END:VEVENT
END:VCALENDAR`;
    onChange(payload);
  }, [data, onChange]);

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStart = e.target.value;
    
    setData(prev => {
      const next = { ...prev, start: newStart };
      
      // Smart Auto-Fix: 
      // If user sets a start date, and the end date is either empty OR invalid (before start),
      // automatically set end date to start + 1 hour.
      if (newStart) {
        try {
          const startDate = new Date(newStart);
          const currentEnd = next.end ? new Date(next.end) : null;
          
          if (!currentEnd || currentEnd <= startDate) {
             const nextHour = new Date(startDate.getTime() + 60 * 60 * 1000);
             
             // Manually format to YYYY-MM-DDTHH:mm to preserve local time
             const pad = (n: number) => n.toString().padStart(2, '0');
             const y = nextHour.getFullYear();
             const m = pad(nextHour.getMonth() + 1);
             const d = pad(nextHour.getDate());
             const h = pad(nextHour.getHours());
             const min = pad(nextHour.getMinutes());
             
             next.end = `${y}-${m}-${d}T${h}:${min}`;
          }
        } catch (e) {
          console.warn("Date auto-fix failed", e);
        }
      }
      return next;
    });
  };

  const update = (field: string, value: string) => setData(prev => ({ ...prev, [field]: value }));

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Event Title</label>
        <input type="text" value={data.title} onChange={e => update('title', e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Birthday Party" />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input type="text" value={data.location} onChange={e => update('location', e.target.value)} className="w-full pl-10 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="123 Main St, New York" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
          <div className="relative">
             <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
             <input type="datetime-local" value={data.start} onChange={handleStartChange} className="w-full pl-10 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">End Time</label>
          <div className="relative">
             <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
             <input 
              type="datetime-local" 
              value={data.end} 
              onChange={e => update('end', e.target.value)} 
              className={`w-full pl-10 p-2.5 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-colors ${
                isInvalidDate 
                  ? 'border-rose-300 bg-rose-50 text-rose-700 focus:ring-rose-500' 
                  : 'border-slate-200'
              }`} 
             />
          </div>
        </div>
      </div>

      {isInvalidDate && (
        <div className="flex items-center gap-2 text-xs text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-100 animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>End time cannot be before start time.</span>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
        <textarea rows={2} value={data.description} onChange={e => update('description', e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none" placeholder="Additional details..." />
      </div>
    </div>
  );
};

// --- Crypto Form ---
export const CryptoForm: React.FC<FormProps> = ({ onChange }) => {
  const [currency, setCurrency] = useState('bitcoin');
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    // Simple schema: bitcoin:addr?amount=x
    let payload = `${currency}:${address}`;
    if (amount) {
      payload += `?amount=${amount}`;
    }
    onChange(payload);
  }, [currency, address, amount, onChange]);

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
        >
          <option value="bitcoin">Bitcoin (BTC)</option>
          <option value="ethereum">Ethereum (ETH)</option>
          <option value="solana">Solana (SOL)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Wallet Address</label>
        <div className="relative">
          <Bitcoin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full pl-10 p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm"
            placeholder={currency === 'ethereum' ? '0x...' : 'Address...'}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Amount (Optional)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          placeholder="0.00"
          step="0.00000001"
        />
      </div>
    </div>
  );
};