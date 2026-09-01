import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check, Loader2, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.jsx';

const LanguageSelector = ({ compact = false, style = {} }) => {
  const { currentLanguage, activeLangObj, supportedLanguages, setLanguage, loadingTranslation } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLanguage = (langCode) => {
    setLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} data-no-translate="true" style={{ position: 'relative', display: 'inline-block', ...style }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select Portal Language"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: compact ? '6px 10px' : '8px 14px',
          borderRadius: '12px',
          background: '#ffffff',
          border: '1.5px solid #e2e8f0',
          color: '#0f172a',
          fontSize: compact ? '0.78rem' : '0.84rem',
          fontWeight: '800',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          transition: 'all 0.2s ease',
        }}
      >
        <Globe size={compact ? 14 : 16} color="#2563eb" />
        <span>{activeLangObj.flag}</span>
        <span>{compact ? activeLangObj.name.split(' ')[0] : `${activeLangObj.name} (${activeLangObj.nativeName})`}</span>
        {loadingTranslation ? (
          <Loader2 size={14} className="spin" color="#2563eb" style={{ marginLeft: '2px' }} />
        ) : (
          <ChevronDown
            size={14}
            color="#64748b"
            style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s ease' }}
          />
        )}
      </button>

      {isOpen && (
        <div
          data-no-translate="true"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '230px',
            background: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 20px 45px rgba(15, 23, 42, 0.2)',
            border: '1px solid #e2e8f0',
            zIndex: 9999,
            padding: '8px',
            maxHeight: '320px',
            overflowY: 'auto',
            animation: 'langDropdownFade 0.2s ease-out',
          }}
        >
          <div
            style={{
              padding: '6px 10px',
              fontSize: '0.72rem',
              fontWeight: '800',
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              borderBottom: '1px solid #f1f5f9',
              marginBottom: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>Sarvam AI Translation</span>
            <Sparkles size={12} color="#7c3aed" />
          </div>

          {supportedLanguages.map((lang) => {
            const isSelected = lang.code === currentLanguage;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleSelectLanguage(lang.code)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: 'none',
                  background: isSelected ? '#eff6ff' : 'transparent',
                  color: isSelected ? '#1d4ed8' : '#334155',
                  fontWeight: isSelected ? '800' : '600',
                  fontSize: '0.84rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.15s ease',
                  marginBottom: '2px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1rem' }}>{lang.flag}</span>
                  <div>
                    <div style={{ lineHeight: '1.2' }}>{lang.name}</div>
                    <div style={{ fontSize: '0.72rem', color: isSelected ? '#2563eb' : '#64748b', fontWeight: '500' }}>
                      {lang.nativeName}
                    </div>
                  </div>
                </div>

                {isSelected && <Check size={16} color="#2563eb" />}
              </button>
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes langDropdownFade {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default LanguageSelector;
