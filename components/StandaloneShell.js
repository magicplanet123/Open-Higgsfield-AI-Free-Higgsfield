'use client';

import { useState, useEffect, useCallback } from 'react';
import { ImageStudio, VideoStudio, LipSyncStudio, CinemaStudio, FreeImageStudio } from 'studio';
import ApiKeyModal from './ApiKeyModal';

// Magic Higgsfield Studio — renamed from "Open Higgsfield AI" per the
// renaming rule: like the original, never identical.
// FREE MODE: no key is required. The Free Images tab (Pollinations, Flux,
// $0, no key) is the default. Premium tabs (Image / Video / Lip Sync /
// Cinema) call Kie.ai and need the visitor's OWN Kie key (BYOK — they pay
// Kie themselves). No key is embedded in this code, no server env var holds
// a key, no paid API is called from our side.

const TABS = [
  { id: 'free',    label: 'Free Images' },
  { id: 'image',   label: 'Image Studio' },
  { id: 'video',   label: 'Video Studio' },
  { id: 'lipsync', label: 'Lip Sync' },
  { id: 'cinema',  label: 'Cinema Studio' },
];

const STORAGE_KEY = 'kie_key';

export default function StandaloneShell() {
  const [apiKey, setApiKey] = useState(null);
  const [activeTab, setActiveTab] = useState('free');
  const [showSettings, setShowSettings] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setApiKey(stored);
  }, []);

  const handleKeySave = useCallback((key) => {
    localStorage.setItem(STORAGE_KEY, key);
    setApiKey(key);
    setShowKeyModal(false);
  }, []);

  const handleKeyChange = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setApiKey(null);
  }, []);

  if (!hasMounted) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="animate-spin text-[#d9ff00] text-3xl">◌</div>
    </div>
  );

  // Premium tabs need a BYOK key. Show an inline unlock panel instead of
  // blocking the whole studio — Free Images always works.
  if (showKeyModal) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center px-4">
        <ApiKeyModal onSave={handleKeySave} />
        <button
          type="button"
          onClick={() => setShowKeyModal(false)}
          className="mt-4 text-white/50 hover:text-white text-sm underline"
        >
          ← Back to Free Images (no key needed)
        </button>
      </div>
    );
  }

  const needsKey = activeTab !== 'free' && !apiKey;

  return (
    <div className="h-screen bg-[#050505] flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between px-4 pt-4 pb-0 border-b border-white/5">
        <div className="flex items-center gap-3">
          <span className="text-white font-black text-lg tracking-wider uppercase">
            Magic Higgsfield Studio
          </span>
          <span className="hidden md:inline text-[10px] font-bold bg-primary text-black px-2 py-0.5 rounded-full uppercase">Free mode</span>
        </div>

        {/* Tabs */}
        <nav className="flex items-center gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#d9ff00] text-black'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Settings / Premium */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowKeyModal(true)}
            className="text-black bg-[#d9ff00] hover:opacity-90 text-xs font-black px-3 py-1.5 rounded-lg transition-colors"
          >
            {apiKey ? 'Premium ✓' : 'Premium models'}
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="text-white/40 hover:text-white text-sm transition-colors"
          >
            ⚙ Settings
          </button>
        </div>
      </header>

      {/* Studio Content */}
      <div className="flex-1">
        {activeTab === 'free' && <FreeImageStudio />}
        {activeTab === 'image' && !needsKey && <ImageStudio apiKey={apiKey} />}
        {activeTab === 'video' && !needsKey && <VideoStudio apiKey={apiKey} />}
        {activeTab === 'lipsync' && !needsKey && <LipSyncStudio apiKey={apiKey} />}
        {activeTab === 'cinema' && !needsKey && <CinemaStudio apiKey={apiKey} />}
        {needsKey && (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
            <h2 className="text-white font-black text-2xl mb-3">Premium models need your own key</h2>
            <p className="text-white/50 text-sm max-w-md mb-6">
              This tab uses Kie.ai premium models (Nano Banana, Kling, Veo, Sora and more).
              Add your own Kie key — BYOK, you pay Kie yourself, the key stays in your browser only.
              Or use Free Images, which needs no key at all.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowKeyModal(true)} className="bg-primary text-black px-6 py-3 rounded-2xl text-sm font-black">Add my Kie key</button>
              <button onClick={() => setActiveTab('free')} className="bg-white/10 text-white px-6 py-3 rounded-2xl text-sm font-bold border border-white/10">Use Free Images</button>
            </div>
          </div>
        )}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-8 w-full max-w-md">
            <h2 className="text-white font-bold text-xl mb-6">Settings</h2>
            <p className="text-white/50 text-sm mb-4">
              {apiKey
                ? <>Current API key: <span className="text-white/80 font-mono">{apiKey.slice(0, 8)}••••••••</span></>
                : <>No premium key saved. Free Images works without a key.</>}
            </p>
            <div className="flex gap-3">
              {apiKey && (
                <button
                  onClick={handleKeyChange}
                  className="flex-1 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 text-sm transition-colors"
                >
                  Remove API Key
                </button>
              )}
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 py-2 rounded-lg bg-white/5 text-white hover:bg-white/10 text-sm transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
