
import React, { useState, useRef, useEffect } from 'react';
import { CivicIssue, Location, Priority } from '../types';
import { analyzeIssue } from '../services/geminiService';

interface ReportModalProps {
  onClose: () => void;
  onSubmit: (issue: CivicIssue) => void;
  initialData?: CivicIssue;
}

type LocationMode = 'auto' | 'manual';

const ReportModal: React.FC<ReportModalProps> = ({ onClose, onSubmit, initialData }) => {
  const [description, setDescription] = useState(initialData?.description || '');
  const [image, setImage] = useState<string | undefined>(initialData?.image);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationMode, setLocationMode] = useState<LocationMode>(initialData ? 'manual' : 'auto');
  
  // Address Fields
  const [city, setCity] = useState(initialData?.address.city || '');
  const [state, setState] = useState(initialData?.address.state || '');
  const [district, setDistrict] = useState(initialData?.address.district || '');
  const [pinCode, setPinCode] = useState(initialData?.address.pinCode || '');

  // Location Metadata
  const [locationStatus, setLocationStatus] = useState<'idle' | 'locating' | 'captured' | 'failed'>(initialData ? 'captured' : 'idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [capturedLocation, setCapturedLocation] = useState<Location | null>(initialData?.location || null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAutoDetect = () => {
    setIsLocating(true);
    setLocationStatus('locating');
    setErrorMessage(null);

    if (!navigator.geolocation) {
      setErrorMessage("GPS not supported by your browser.");
      setLocationStatus('failed');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCapturedLocation(coords);
        
        const google = (window as any).google;
        if (google && google.maps && google.maps.Geocoder) {
          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({ location: coords }, (results: any, status: string) => {
            if (status === "OK" && results[0]) {
              const components = results[0].address_components;
              let fCity = "", fState = "", fDist = "", fPin = "";

              components.forEach((c: any) => {
                const t = c.types;
                if (t.includes("locality") || t.includes("postal_town")) fCity = c.long_name;
                else if (!fCity && t.includes("sublocality_level_1")) fCity = c.long_name;
                if (t.includes("administrative_area_level_1")) fState = c.long_name;
                if (t.includes("administrative_area_level_2")) fDist = c.long_name;
                if (t.includes("postal_code")) fPin = c.long_name;
              });

              setCity(fCity);
              setState(fState);
              setDistrict(fDist);
              setPinCode(fPin);
              setLocationStatus('captured');
            } else {
              setErrorMessage("Address lookup failed. Please use manual entry.");
              setLocationStatus('failed');
            }
            setIsLocating(false);
          });
        } else {
          setLocationStatus('captured');
          setIsLocating(false);
        }
      },
      (err) => {
        let msg = "Detection failed.";
        if (err.code === 1) msg = "Permission denied. Check browser settings.";
        else if (err.code === 3) msg = "GPS Signal timeout.";
        setErrorMessage(msg);
        setLocationStatus('failed');
        setIsLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !city || !state || !pinCode) return;

    setIsAnalyzing(true);
    try {
      // Re-run analysis if description changed or if it's a new report
      const analysis = (description !== initialData?.description || !initialData) 
        ? await analyzeIssue(description, image)
        : { 
            priority: initialData.priority, 
            summary: initialData.aiSummary, 
            reason: initialData.aiReason, 
            score: initialData.priorityScore 
          };

      const issue: CivicIssue = {
        id: initialData?.id || Math.random().toString(36).substr(2, 9),
        description,
        image,
        priority: analysis.priority,
        aiSummary: analysis.summary,
        aiReason: analysis.reason,
        priorityScore: analysis.score,
        location: capturedLocation || { lat: 0, lng: 0 },
        address: { city, state, district, pinCode },
        timestamp: initialData?.timestamp || Date.now(),
        status: initialData?.status || 'Pending'
      };
      onSubmit(issue);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const canSubmit = description.length > 5 && city && state && pinCode && !isLocating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-white/20">
        
        {/* Header */}
        <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              {initialData ? 'Edit Report' : 'Report Issue'}
            </h2>
            <p className="text-slate-500 font-medium text-sm">
              {initialData ? 'Update existing report details.' : 'Follow the prompts to lodge your complaint.'}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-3 hover:bg-white rounded-full transition-all shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 hide-scrollbar">
          
          {/* Location Selection Method */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Location Details</h3>
              <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200">
                <button 
                  type="button"
                  onClick={() => setLocationMode('auto')}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-2 ${locationMode === 'auto' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
                >
                  Auto-Detect
                </button>
                <button 
                  type="button"
                  onClick={() => setLocationMode('manual')}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-2 ${locationMode === 'manual' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
                >
                  Manual Entry
                </button>
              </div>
            </div>

            {locationMode === 'auto' ? (
              <div className="animate-in slide-in-from-top-2">
                {locationStatus === 'idle' ? (
                  <div className="p-10 border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-slate-50/50 text-center space-y-5">
                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto text-indigo-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                    <div className="max-w-xs mx-auto">
                      <p className="text-sm font-black text-slate-800">Use GPS for Accuracy</p>
                      <p className="text-xs text-slate-500 font-medium mt-1">Click the button below and allow browser location access when prompted.</p>
                    </div>
                    <button 
                      type="button"
                      onClick={handleAutoDetect}
                      className="px-8 py-3 bg-indigo-600 text-white text-[10px] font-black uppercase rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
                    >
                      Grant Location Access
                    </button>
                  </div>
                ) : isLocating ? (
                  <div className="p-10 border-2 border-dashed border-indigo-200 rounded-[2.5rem] bg-indigo-50/30 text-center space-y-4">
                    <div className="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center mx-auto text-white shadow-xl shadow-indigo-100">
                      <svg className="animate-spin h-7 w-7" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    </div>
                    <p className="text-sm font-black text-slate-800">Requesting Satellite Data...</p>
                  </div>
                ) : locationStatus === 'captured' ? (
                  <div className="p-6 bg-emerald-50 border-2 border-emerald-100 rounded-[2rem] flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-100">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{city || 'Detected Location'}</p>
                        <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">{state} • {pinCode}</p>
                      </div>
                    </div>
                    <button 
                      type="button" onClick={handleAutoDetect}
                      className="text-[9px] font-black uppercase text-slate-400 hover:text-indigo-600 transition-colors bg-white px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm"
                    >
                      Re-Detect
                    </button>
                  </div>
                ) : (
                  <div className="p-8 border-2 border-dashed border-rose-200 rounded-[2.5rem] bg-rose-50/30 text-center space-y-4">
                    <div className="w-12 h-12 bg-rose-500 rounded-full flex items-center justify-center mx-auto text-white shadow-xl shadow-rose-100">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>
                    <div>
                      <p className="text-sm font-black text-rose-800">{errorMessage || 'Location Failed'}</p>
                      <div className="flex gap-2 justify-center mt-4">
                         <button type="button" onClick={handleAutoDetect} className="text-[9px] font-black uppercase bg-white px-4 py-2 rounded-lg shadow-sm border border-rose-100 text-rose-600 hover:bg-rose-50 transition-colors">Try Again</button>
                         <button type="button" onClick={() => setLocationMode('manual')} className="text-[9px] font-black uppercase bg-slate-900 px-4 py-2 rounded-lg shadow-sm text-white hover:bg-slate-800 transition-colors">Manual Entry</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-bottom-2">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-1">City *</label>
                  <input 
                    type="text" required value={city} onChange={e => setCity(e.target.value)}
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold"
                    placeholder="e.g. Pune"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-1">State *</label>
                  <input 
                    type="text" required value={state} onChange={e => setState(e.target.value)}
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold"
                    placeholder="e.g. Maharashtra"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-1">District</label>
                  <input 
                    type="text" value={district} onChange={e => setDistrict(e.target.value)}
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold"
                    placeholder="e.g. Pune District"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-1">PIN Code *</label>
                  <input 
                    type="text" required value={pinCode} onChange={e => setPinCode(e.target.value)}
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold"
                    placeholder="6 digits"
                  />
                </div>
              </div>
            )}
          </section>

          {/* Issue Description */}
          <section className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">What's the issue? *</label>
            <textarea
              required value={description} onChange={e => setDescription(e.target.value)}
              className="w-full h-32 px-6 py-5 bg-slate-50 border border-slate-200 rounded-[2.5rem] focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none resize-none text-slate-700 font-medium leading-relaxed"
              placeholder="Provide context. E.g., Broken streetlight near the park entrance..."
              disabled={isAnalyzing}
            />
          </section>

          {/* Photo Evidence */}
          <section className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Visual Evidence (Recommended)</label>
            <div 
              onClick={() => !isAnalyzing && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-[2.5rem] p-10 text-center cursor-pointer transition-all ${
                image ? 'border-indigo-400 bg-indigo-50/20 shadow-inner' : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
              }`}
            >
              {image ? (
                <div className="relative inline-block group">
                  <img src={image} alt="Preview" className="max-h-56 rounded-3xl shadow-2xl border-4 border-white transition-transform group-hover:rotate-1" />
                  <button 
                    type="button" onClick={e => { e.stopPropagation(); setImage(undefined); }}
                    className="absolute -top-3 -right-3 bg-rose-500 text-white rounded-full p-2.5 shadow-xl hover:bg-rose-600 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto text-indigo-500 shadow-lg border border-slate-50">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Attach Image</p>
                </div>
              )}
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
          </section>
        </form>

        {/* Footer */}
        <div className="p-8 bg-slate-50/80 border-t flex items-center justify-end gap-5">
          <button 
            type="button" onClick={onClose} 
            className="px-6 py-3 text-slate-400 font-black hover:text-slate-600 uppercase text-[10px] tracking-widest transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" onClick={handleFormSubmit}
            disabled={isAnalyzing || !canSubmit}
            className="px-12 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-200 transition-all flex items-center gap-4 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
          >
            {isAnalyzing ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Processing...
              </>
            ) : (initialData ? 'Update Report' : 'Send Report')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
