const fs = require('fs');

const content = `import React, { useState, useEffect } from 'react';
import { Fingerprint, CheckCircle2, XCircle, Loader2, ExternalLink } from 'lucide-react';
import { getCurrentUserSession } from '../utils/authSession';

interface BiometricPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'register' | 'verify';
  onSuccess: (bdNo: string) => void;
  purpose?: string;
  targetBdNo?: string;
}

// Convert a hex string to a Uint8Array
const hexToUint8Array = (hex: string) => {
  const bytes = new Uint8Array(Math.ceil(hex.length / 2));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
};

// Convert a Uint8Array to a hex string
const uint8ArrayToHex = (bytes: ArrayBuffer) => {
  return Array.from(new Uint8Array(bytes))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

export const BiometricPromptModal: React.FC<BiometricPromptModalProps> = ({ isOpen, onClose, mode, onSuccess, purpose, targetBdNo }) => {
  const [status, setStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStatus('idle');
      setErrorMsg('');
    }
  }, [isOpen]);

  const handleScan = async () => {
    setStatus('scanning');
    setErrorMsg('');

    try {
      if (!window.PublicKeyCredential) {
        throw new Error('Your device is unable to use this feature');
      }

      const isAvailable = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      if (!isAvailable) {
        throw new Error('Your device is unable to use this feature');
      }

      if (mode === 'register') {
        const session = getCurrentUserSession();
        if (!session) {
          throw new Error('You must be logged in to register a fingerprint.');
        }

        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);
        
        const userIdBytes = new Uint8Array(16);
        window.crypto.getRandomValues(userIdBytes);

        const credential = await navigator.credentials.create({
          publicKey: {
            challenge,
            rp: {
              name: "155 UASU",
              id: window.location.hostname
            },
            user: {
              id: userIdBytes,
              name: session.bdNo,
              displayName: session.name
            },
            pubKeyCredParams: [
              { type: "public-key", alg: -7 },
              { type: "public-key", alg: -257 }
            ],
            authenticatorSelection: {
              authenticatorAttachment: "platform",
              userVerification: "required"
            },
            timeout: 60000,
            attestation: "none"
          }
        }) as PublicKeyCredential;

        if (credential) {
          const rawId = uint8ArrayToHex(credential.rawId);
          localStorage.setItem('baf_biometric_enabled', 'true');
          localStorage.setItem('baf_biometric_bdNo', session.bdNo);
          localStorage.setItem('baf_biometric_credId', rawId);
          
          setStatus('success');
          setTimeout(() => {
            onSuccess(session.bdNo);
            onClose();
          }, 1500);
        }

      } else {
        // Verify mode
        const isEnabled = localStorage.getItem('baf_biometric_enabled');
        const savedBdNo = localStorage.getItem('baf_biometric_bdNo');
        const savedCredIdHex = localStorage.getItem('baf_biometric_credId');

        if (isEnabled !== 'true' || !savedBdNo) {
          throw new Error('No fingerprint found on this device.');
        }

        if (targetBdNo && savedBdNo !== targetBdNo) {
          throw new Error('Fingerprint does not match the entered User ID.');
        }

        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);

        let allowCredentials: PublicKeyCredentialDescriptor[] = [];
        if (savedCredIdHex) {
          allowCredentials = [{
            type: 'public-key',
            id: hexToUint8Array(savedCredIdHex)
          }];
        }

        const assertion = await navigator.credentials.get({
          publicKey: {
            challenge,
            rpId: window.location.hostname,
            userVerification: "required",
            allowCredentials: allowCredentials.length > 0 ? allowCredentials : undefined
          }
        });

        if (assertion) {
          setStatus('success');
          setTimeout(() => {
            onSuccess(savedBdNo);
            onClose();
          }, 1000);
        }
      }
    } catch (err: any) {
      console.error('Biometric error:', err);
      setStatus('error');
      
      // Handle iframe permissions error specifically
      if (err.name === 'NotAllowedError' || err.message.toLowerCase().includes('not allowed')) {
        setErrorMsg('Access blocked. Try opening the app in a new tab.');
      } else {
        setErrorMsg(err.message || 'Your device is unable to use this feature');
      }
      
      setTimeout(() => {
        setStatus('idle');
      }, 3500);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-sm rounded-3xl p-8 shadow-2xl relative flex flex-col items-center text-center">
        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
          {mode === 'register' ? 'Add Fingerprint' : 'Biometric Login'}
        </h3>
        <p className="text-sm font-bold text-slate-500 mb-8">
          {mode === 'register' 
            ? 'Click the sensor to securely register this device.' 
            : purpose || 'Click the sensor below to verify your identity.'}
        </p>
        
        <div 
          onClick={status === 'idle' ? handleScan : undefined}
          className={\`relative w-24 h-24 rounded-full flex items-center justify-center transition-all \${
            status === 'idle' 
              ? 'bg-slate-100 dark:bg-slate-800 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 hover:scale-105 active:scale-95 shadow-sm' 
              : status === 'scanning'
              ? 'bg-emerald-50 dark:bg-emerald-900/20 scale-95'
              : status === 'success'
              ? 'bg-emerald-100 dark:bg-emerald-900/40 scale-100'
              : 'bg-rose-100 dark:bg-rose-900/40 scale-100'
          }\`}
        >
          {status === 'idle' && <Fingerprint className="w-12 h-12 text-slate-400 dark:text-slate-500 transition-colors" />}
          {status === 'scanning' && <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />}
          {status === 'success' && <CheckCircle2 className="w-12 h-12 text-emerald-500 animate-fadeIn" />}
          {status === 'error' && <XCircle className="w-12 h-12 text-rose-500 animate-fadeIn" />}
        </div>
        
        <div className="h-10 mt-6 flex items-center justify-center">
          {status === 'scanning' && <span className="text-sm font-bold text-emerald-500 animate-pulse">Waiting for device prompt...</span>}
          {status === 'success' && <span className="text-sm font-bold text-emerald-500">Verified Successfully</span>}
          {status === 'error' && (
            <div className="flex flex-col items-center">
              <span className="text-sm font-bold text-rose-500">{errorMsg}</span>
              {errorMsg.includes('new tab') && (
                <span className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                  Click the <ExternalLink className="w-3 h-3"/> Open App icon top-right
                </span>
              )}
            </div>
          )}
        </div>

        <button 
          onClick={onClose}
          className="mt-6 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 uppercase tracking-widest cursor-pointer transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
`;

fs.writeFileSync('src/components/BiometricPromptModal.tsx', content);
