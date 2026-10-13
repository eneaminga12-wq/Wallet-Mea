import { QrCodeReact } from './QrCodeReact';

interface QrCodeProps {
  value: string;
  size?: number;
  level?: 'L' | 'M' | 'Q' | 'H';
  className?: string;
}

/** Thin wrapper so pages do not depend on the QR library directly. */
export default function QrCode({ value, size = 180, level = 'M', className }: QrCodeProps) {
  return <QrCodeReact value={value} size={size} level={level} className={className} />;
}
