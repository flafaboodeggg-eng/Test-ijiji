import { useState, useCallback, useEffect } from 'react';
import { CopyrightStyle } from '../types';
import toast from 'react-hot-toast';

export const useCopyright = (isAdmin: boolean) => {
  const [startText, setStartText] = useState('');
  const [endText, setEndText] = useState('');
  const [style, setStyle] = useState<CopyrightStyle>({
    color: '#888888',
    opacity: 1,
    alignment: 'center',
    isBold: true,
    fontSize: 14,
  });
  const [hexColor, setHexColor] = useState('#888888');
  const [frequency, setFrequency] = useState('always');
  const [everyX, setEveryX] = useState('5');
  const [enableSeparator, setEnableSeparator] = useState(true);
  const [separatorText, setSeparatorText] = useState('________________________________________');
  const [loading, setLoading] = useState(false);

  const fetchCopyright = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const res = await fetch('/api/admin/copyright');
      const data = await res.json();
      setStartText(data.startText || '');
      setEndText(data.endText || '');
      if (data.styles) setStyle(prev => ({ ...prev, ...data.styles }));
      setHexColor(data.styles?.color || '#888888');
      if (data.frequency) setFrequency(data.frequency);
      if (data.everyX) setEveryX(data.everyX.toString());
      if (data.chapterSeparatorText) setSeparatorText(data.chapterSeparatorText);
      if (data.enableChapterSeparator !== undefined) setEnableSeparator(data.enableChapterSeparator);
    } catch (e) {}
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) fetchCopyright();
  }, [isAdmin, fetchCopyright]);

  const saveCopyright = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/copyright', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startText,
          endText,
          styles: style,
          frequency,
          everyX: parseInt(everyX) || 5,
          chapterSeparatorText: separatorText,
          enableChapterSeparator: enableSeparator,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success('تم حفظ الحقوق والإعدادات بنجاح');
      return true;
    } catch (e) {
      toast.error('فشل الحفظ');
      return false;
    } finally {
      setLoading(false);
    }
  }, [startText, endText, style, frequency, everyX, separatorText, enableSeparator]);

  return {
    startText,
    endText,
    style,
    hexColor,
    frequency,
    everyX,
    enableSeparator,
    separatorText,
    loading,
    setStartText,
    setEndText,
    setStyle,
    setHexColor,
    setFrequency,
    setEveryX,
    setEnableSeparator,
    setSeparatorText,
    saveCopyright,
  };
};