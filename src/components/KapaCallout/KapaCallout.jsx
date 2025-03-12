import React from 'react';
import { useColorMode } from '@docusaurus/theme-common';

export default function KapaCallout() {
  const { colorMode } = useColorMode();

  return (
    <div style={{
      padding: '24px',
      margin: '24px 0',
      borderRadius: '16px',
      background: 'transparent',
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      position: 'relative',
      boxShadow: '0 4px 20px rgba(79, 70, 229, 0.25)',
    }}>
      <div style={{
        position: 'absolute',
        inset: '-1.5px',
        borderRadius: '16px',
        padding: '1.5px',
        background: 'linear-gradient(135deg, #4338CA 0%, #9333EA 100%)',
        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMaskComposite: 'xor',
        maskImage: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        maskComposite: 'exclude',
        pointerEvents: 'none',
      }}/>
      <div style={{
        position: 'relative',
        width: '48px',
        height: '48px',
        flexShrink: 0,
      }}>
        <div style={{
          position: 'absolute',
          inset: '0',
          background: 'conic-gradient(from 180deg at 50% 50%, #4338CA 0deg, #9333EA 180deg, #4338CA 360deg)',
          borderRadius: '50%',
          animation: 'spin 4s linear infinite',
        }}/>
        <div style={{
          position: 'absolute',
          inset: '2px',
          background: 'linear-gradient(135deg, #4338CA 0%, #9333EA 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <img 
            src="/img/icons/kapa-icon.svg"
            alt="Kapa Icon" 
            style={{
              width: '24px',
              height: '24px',
              filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))'
            }}
            className="not-zoom"
          />
        </div>
      </div>
      <div style={{
        position: 'relative', 
        zIndex: 1,
        flex: 1,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '20px'
      }}>
        <div>
          <div style={{
            fontSize: '1.2rem',
            fontWeight: '700',
            color: 'var(--ifm-color-emphasis-900)',
            marginBottom: '4px',
            letterSpacing: '-0.02em',
          }}>Port AI Assistant</div>
          <p style={{
            margin: 0,
            color: 'var(--ifm-color-emphasis-700)',
            fontSize: '0.95rem',
            lineHeight: '1.4',
          }}>Want to know something about Port? Chat with our AI assistant and ask away!</p>
        </div>
        <button 
          onClick={() => {
            // @ts-ignore
            if (window.Kapa) window.Kapa.open();
          }}
          style={{
            padding: '8px 20px',
            background: 'linear-gradient(135deg, #4338CA 0%, #9333EA 100%)',
            border: 'none',
            borderRadius: '20px',
            fontSize: '0.9rem',
            color: 'white',
            fontWeight: '500',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.35)',
            transition: 'all 0.2s ease-in-out',
            flexShrink: 0,
            height: '36px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: '1',
            ':hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 16px rgba(79, 70, 229, 0.45)',
            }
          }}>
          Chat Now →
        </button>
      </div>
    </div>
  );
} 