import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RefreshCw } from 'lucide-react';

interface CaptchaInputProps {
  value: string;
  onChange: (value: string) => void;
  isValid: boolean;
  onValidationChange: (isValid: boolean) => void;
}

const CaptchaInput: React.FC<CaptchaInputProps> = ({ 
  value, 
  onChange, 
  isValid, 
  onValidationChange 
}) => {
  const [captchaCode, setCaptchaCode] = useState('');

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(result);
    onChange('');
    onValidationChange(false);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  useEffect(() => {
    const valid = value.toUpperCase() === captchaCode;
    onValidationChange(valid);
  }, [value, captchaCode, onValidationChange]);

  return (
    <div className="space-y-2">
      <Label htmlFor="captcha">Captcha</Label>
      <div className="flex items-center space-x-2">
        <div className="bg-muted p-3 rounded-md font-mono text-lg tracking-wider min-w-[120px] text-center border-2">
          {captchaCode}
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={generateCaptcha}
          className="h-12 w-12"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      <Input
        id="captcha"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter captcha code"
        className={!isValid && value ? 'border-destructive' : ''}
        maxLength={5}
      />
      {!isValid && value && (
        <p className="text-sm text-destructive">Captcha code does not match</p>
      )}
    </div>
  );
};

export default CaptchaInput;