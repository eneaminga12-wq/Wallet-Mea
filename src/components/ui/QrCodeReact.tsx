import { QRCodeSVG } from 'qrcode.react';

interface QrCodeReactProps {
  value: string;
  size?: number;
  level?: 'L' | 'M' | 'Q' | 'H';
  className?: string;
}

export function QrCodeReact({ value, size, level, className }: QrCodeReactProps) {
  return (
    <QRCodeSVG
      value={value}
      size={size}
      level={level}
      bgColor="#ffffff"
      fgColor="#0f172a"
      marginSize={2}
      className={className}
    />
  );
}
