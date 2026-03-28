import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, Palette, Replace, Trash2, Save, ArrowLeft, MinusCircle, PlusCircle } from 'lucide-react';
import { FONT_OPTIONS, ADVANCED_COLORS, QUOTE_STYLES } from '../utils/constants';
import { CustomSlider } from './CustomSlider';
import { ReaderSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ReaderSettings & {
    fontFamily: { id: string; name: string; family: string };
    bgColor: string;
    fontSize: number;
    textBrightness: number;
    enableDialogue: boolean;
    dialogueColor: string;
    dialogueSize: number;
    hideQuotes: boolean;
    selectedQuoteStyle: string;
    enableMarkdown: boolean;
    markdownColor: string;
    markdownSize: number;
    hideMarkdownMarks: boolean;
    selectedMarkdownStyle: string;
  };
  onFontSizeChange: (delta: number) => void;
  onThemeChange: (bgColor: string) => void;
  onFontChange: (font: typeof FONT_OPTIONS[0]) => void;
  onBrightnessChange: (val: number) => void;
  onDialogueToggle: (val: boolean) => void;
  onDialogueColorChange: (color: string) => void;
  onDialogueSizeChange: (size: number) => void;
  onHideQuotesToggle: (val: boolean) => void;
  onQuoteStyleChange: (style: string) => void;
  onMarkdownToggle: (val: boolean) => void;
  onMarkdownColorChange: (color: string) => void;
  onMarkdownSizeChange: (size: number) => void;
  onHideMarkdownMarksToggle: (val: boolean) => void;
  onMarkdownStyleChange: (style: string) => void;
  onOpenReplacements: () => void;
  onOpenCleaner: () => void;
  onOpenCopyright: () => void;
  isAdmin: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onFontSizeChange,
  onThemeChange,
  onFontChange,
  onBrightnessChange,
  onDialogueToggle,
  onDialogueColorChange,
  onDialogueSizeChange,
  onHideQuotesToggle,
  onQuoteStyleChange,
  onMarkdownToggle,
  onMarkdownColorChange,
  onMarkdownSizeChange,
  onHideMarkdownMarksToggle,
  onMarkdownStyleChange,
  onOpenReplacements,
  onOpenCleaner,
  onOpenCopyright,
  isAdmin,
}) => {
  const [view, setView] = useState<'main' | 'appearance'>('main');

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl rounded-t-2xl shadow-xl"
          style={{ maxHeight: '85vh' }}
        >
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full">
              <X size={24} className="text-white" />
            </button>
            <h3 className="text-white font-bold">الإعدادات</h3>
            <div className="w-6" />
          </div>
          <div className="overflow-y-auto p-4" style={{ maxHeight: 'calc(85vh - 60px)' }}>
            {view === 'main' ? (
              <div className="grid grid-cols-1 gap-4">
                <button
                  onClick={() => setView('appearance')}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Palette size={22} className="text-blue-400" />
                    <span className="text-white">مظهر القراءة</span>
                  </div>
                  <ChevronRight size={18} className="text-gray-500" />
                </button>
                <button
                  onClick={() => { onClose(); onOpenReplacements(); }}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Replace size={22} className="text-blue-400" />
                    <span className="text-white">استبدال الكلمات</span>
                  </div>
                  <ChevronRight size={18} className="text-gray-500" />
                </button>
                {isAdmin && (
                  <>
                    <button
                      onClick={() => { onClose(); onOpenCleaner(); }}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Trash2 size={22} className="text-red-400" />
                        <span className="text-white">الحذف الشامل</span>
                      </div>
                      <ChevronRight size={18} className="text-gray-500" />
                    </button>
                    <button
                      onClick={() => { onClose(); onOpenCopyright(); }}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Save size={22} className="text-blue-400" />
                        <span className="text-white">حقوق التطبيق</span>
                      </div>
                      <ChevronRight size={18} className="text-gray-500" />
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <button onClick={() => setView('main')} className="p-1 hover:bg-white/10 rounded-full">
                    <ArrowLeft size={24} className="text-white" />
                  </button>
                  <h4 className="text-white font-bold text-lg">مظهر القراءة</h4>
                </div>
                <div className="space-y-6">
                  {/* Font */}
                  <div>
                    <label className="block text-white/70 text-sm mb-2">نوع الخط</label>
                    <div className="flex flex-wrap gap-2">
                      {FONT_OPTIONS.map(font => (
                        <button
                          key={font.id}
                          onClick={() => onFontChange(font)}
                          className={`px-4 py-2 rounded-full text-sm transition-colors ${
                            settings.fontFamily.id === font.id
                              ? 'bg-blue-600 text-white'
                              : 'bg-white/10 text-gray-300 hover:bg-white/20'
                          }`}
                        >
                          {font.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Font Size */}
                  <div>
                    <label className="block text-white/70 text-sm mb-2">حجم الخط</label>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => onFontSizeChange(-2)}
                        className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
                      >
                        <MinusCircle size={20} className="text-white" />
                      </button>
                      <span className="text-white text-lg">{settings.fontSize}</span>
                      <button
                        onClick={() => onFontSizeChange(2)}
                        className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
                      >
                        <PlusCircle size={20} className="text-white" />
                      </button>
                    </div>
                  </div>
                  {/* Themes */}
                  <div>
                    <label className="block text-white/70 text-sm mb-2">السمة</label>
                    <div className="flex gap-4">
                      {[
                        { color: '#fff', name: 'فاتح' },
                        { color: '#2d2d2d', name: 'داكن' },
                        { color: '#0a0a0a', name: 'أسود' },
                      ].map(theme => (
                        <button
                          key={theme.color}
                          onClick={() => onThemeChange(theme.color)}
                          className={`w-12 h-12 rounded-full border-2 transition-colors ${
                            settings.bgColor === theme.color ? 'border-blue-500' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: theme.color }}
                        />
                      ))}
                    </div>
                  </div>
                  {/* Brightness */}
                  <div>
                    <label className="block text-white/70 text-sm mb-2">سطوع النص</label>
                    <CustomSlider
                      min={0.3}
                      max={1.5}
                      step={0.05}
                      value={settings.textBrightness}
                      onValueChange={onBrightnessChange}
                    />
                  </div>
                  {/* Dialogue Formatting */}
                  <div className="border-t border-white/10 pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white font-medium">تنسيق الحوار</span>
                      <input
                        type="checkbox"
                        checked={settings.enableDialogue}
                        onChange={e => onDialogueToggle(e.target.checked)}
                        className="w-5 h-5 accent-green-500"
                      />
                    </div>
                    {settings.enableDialogue && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-white/70 text-sm mb-1">نمط الأقواس</label>
                          <div className="flex flex-wrap gap-2">
                            {QUOTE_STYLES.map(style => (
                              <button
                                key={style.id}
                                onClick={() => onQuoteStyleChange(style.id)}
                                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                                  settings.selectedQuoteStyle === style.id
                                    ? 'bg-green-600 text-white'
                                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                }`}
                              >
                                {style.preview}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-white/70 text-sm mb-1">لون الحوار</label>
                          <div className="flex flex-wrap gap-2">
                            {ADVANCED_COLORS.map(c => (
                              <button
                                key={c.color}
                                onClick={() => onDialogueColorChange(c.color)}
                                className="w-6 h-6 rounded-full border border-white/30"
                                style={{ backgroundColor: c.color }}
                              />
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-white/70 text-sm mb-1">حجم الحوار ({settings.dialogueSize}%)</label>
                          <CustomSlider
                            min={80}
                            max={150}
                            step={5}
                            value={settings.dialogueSize}
                            onValueChange={onDialogueSizeChange}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/70 text-sm">إخفاء علامات الأقواس</span>
                          <input
                            type="checkbox"
                            checked={settings.hideQuotes}
                            onChange={e => onHideQuotesToggle(e.target.checked)}
                            className="w-5 h-5 accent-green-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Bold Formatting */}
                  <div className="border-t border-white/10 pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white font-medium">الخط العريض (Bold)</span>
                      <input
                        type="checkbox"
                        checked={settings.enableMarkdown}
                        onChange={e => onMarkdownToggle(e.target.checked)}
                        className="w-5 h-5 accent-white"
                      />
                    </div>
                    {settings.enableMarkdown && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-white/70 text-sm mb-1">نمط الأقواس</label>
                          <div className="flex flex-wrap gap-2">
                            {QUOTE_STYLES.map(style => (
                              <button
                                key={style.id}
                                onClick={() => onMarkdownStyleChange(style.id)}
                                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                                  settings.selectedMarkdownStyle === style.id
                                    ? 'bg-white text-black'
                                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                }`}
                              >
                                {style.preview}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-white/70 text-sm mb-1">لون النص العريض</label>
                          <div className="flex flex-wrap gap-2">
                            {ADVANCED_COLORS.map(c => (
                              <button
                                key={c.color}
                                onClick={() => onMarkdownColorChange(c.color)}
                                className="w-6 h-6 rounded-full border border-white/30"
                                style={{ backgroundColor: c.color }}
                              />
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-white/70 text-sm mb-1">حجم النص العريض ({settings.markdownSize}%)</label>
                          <CustomSlider
                            min={80}
                            max={150}
                            step={5}
                            value={settings.markdownSize}
                            onValueChange={onMarkdownSizeChange}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/70 text-sm">إخفاء علامات التنسيق (مثل **)</span>
                          <input
                            type="checkbox"
                            checked={settings.hideMarkdownMarks}
                            onChange={e => onHideMarkdownMarksToggle(e.target.checked)}
                            className="w-5 h-5 accent-white"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};