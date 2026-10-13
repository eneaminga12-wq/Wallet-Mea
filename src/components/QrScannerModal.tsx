import { useState, useRef, useEffect } from 'react';
import { Camera, Check, Copy, FileText, QrCode as QrIcon, Upload, X, Zap } from 'lucide-react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { useLanguage } from '../i18n/LanguageContext';
import { useToast } from '../contexts/ToastContext';

interface QrScannerModalProps {
  open: boolean;
  onClose: () => void;
  onScan: (value: string) => void;
  title?: string;
}

const SAMPLE_CODES = [
  {
    label: 'Mama Lishe Invoice (10,000 TZS)',
    type: 'invoice',
    value: 'lnbc100n1p3xmeabitdemoq7vz9k2m4n8pa89d7fa98s7dfa98sdf7a',
    desc: 'Instant Lightning invoice for food order',
  },
  {
    label: 'Amani John (Lightning Address)',
    type: 'address',
    value: 'amani@meabit.wallet',
    desc: 'Lightning Address',
  },
  {
    label: 'Neema Mbwana (Lightning Address)',
    type: 'address',
    value: 'neema@meabit.wallet',
    desc: 'Lightning Address',
  },
  {
    label: 'Bitcoin On-chain Address',
    type: 'onchain',
    value: 'bc1qxw9v2meabitdemo4f2a8821k9x7v3t5p8m2z6c',
    desc: 'On-chain SegWit address',
  },
  {
    label: 'PayBee Tap Merchant Invoice',
    type: 'paybee',
    value: 'lnbc50n1p3xmeabitpaybee987sd6f5sd4f3s2d1a0s9d8f7',
    desc: 'PayBee NFC micropayment invoice',
  },
];

export default function QrScannerModal({ open, onClose, onScan, title }: QrScannerModalProps) {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [copiedSample, setCopiedSample] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      stopCamera();
      return;
    }

    // Try starting camera if possible
    startCamera();

    return () => {
      stopCamera();
    };
  }, [open]);

  async function startCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraActive(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => undefined);
      }
      setCameraActive(true);
    } catch {
      setCameraActive(false);
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }

  function handleSelect(val: string) {
    onScan(val);
    onClose();
    showToast('QR code scanned successfully', 'success');
  }

  function handlePasteClipboard() {
    if (navigator.clipboard?.readText) {
      navigator.clipboard.readText().then((text) => {
        if (text) {
          handleSelect(text.trim());
        }
      }).catch(() => {
        showToast('Please paste manually', 'info');
      });
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title || t('send.scanQrTitle')}
      className="max-w-lg"
    >
      <div className="space-y-4">
        {/* Viewfinder area */}
        <div className="relative mx-auto flex h-64 w-full flex-col items-center justify-center overflow-hidden rounded-2xl bg-slate-900 text-white shadow-inner">
          {cameraActive ? (
            <video
              ref={videoRef}
              className="absolute inset-0 h-full w-full object-cover"
              playsInline
              muted
            />
          ) : (
            <div className="relative flex flex-col items-center justify-center p-6 text-center">
              <Camera className="h-10 w-10 text-slate-500 mb-2 animate-pulse" />
              <p className="text-xs font-semibold text-slate-300">
                Camera viewfinder active
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                Point your camera at a QR code, or use a sample below
              </p>
            </div>
          )}

          {/* Scanner Overlay Frame */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="relative h-44 w-44 rounded-2xl border-2 border-brand-400/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]">
              {/* Corner marks */}
              <div className="absolute -left-1 -top-1 h-5 w-5 border-l-4 border-t-4 border-brand-400" />
              <div className="absolute -right-1 -top-1 h-5 w-5 border-r-4 border-t-4 border-brand-400" />
              <div className="absolute -bottom-1 -left-1 h-5 w-5 border-b-4 border-l-4 border-brand-400" />
              <div className="absolute -bottom-1 -right-1 h-5 w-5 border-b-4 border-r-4 border-brand-400" />

              {/* Animated laser line */}
              <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_10px_#10b981] animate-pulse" style={{ top: '50%' }} />
            </div>
          </div>
        </div>

        {/* Quick action buttons: Paste & Upload */}
        <div className="flex gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="flex-1 text-xs"
            onClick={handlePasteClipboard}
          >
            <Copy className="h-3.5 w-3.5" />
            Paste from Clipboard
          </Button>
          <label className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors">
            <Upload className="h-3.5 w-3.5" />
            Upload QR Image
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  // Simulate image QR decode
                  handleSelect('lnbc100n1p3xmeabitdemoq7vz9k2m4n8p');
                }
              }}
            />
          </label>
        </div>

        {/* Manual paste / typing input */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Or enter / paste invoice or address:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-800 placeholder-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none"
              placeholder="lnbc... or name@meabit.wallet or bc1q..."
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
            />
            <Button
              size="sm"
              disabled={!manualInput.trim()}
              onClick={() => handleSelect(manualInput.trim())}
            >
              Use
            </Button>
          </div>
        </div>

        {/* Demo Samples for 1-click testing */}
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            {t('send.sampleQr')}:
          </p>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {SAMPLE_CODES.map((item) => (
              <div
                key={item.value}
                onClick={() => handleSelect(item.value)}
                className="group flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 transition-all hover:border-brand-300 hover:bg-brand-50/50"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white shadow-xs">
                    {item.type === 'invoice' || item.type === 'paybee' ? (
                      <Zap className="h-4 w-4 text-amber-500" />
                    ) : item.type === 'address' ? (
                      <QrIcon className="h-4 w-4 text-brand-600" />
                    ) : (
                      <FileText className="h-4 w-4 text-slate-500" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-slate-800 group-hover:text-brand-900">
                      {item.label}
                    </p>
                    <p className="truncate font-mono text-[10px] text-slate-400">
                      {item.value}
                    </p>
                  </div>
                </div>

                <span className="shrink-0 rounded-lg bg-brand-600 px-2 py-1 text-[10px] font-bold text-white group-hover:bg-brand-700">
                  Select
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
