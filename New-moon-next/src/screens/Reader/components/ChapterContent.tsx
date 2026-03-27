import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowUpDown } from 'lucide-react';
import { formatRelativeTime } from '../utils/formatting';

interface ChapterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  chapters: any[];
  currentChapterId: string;
  isAscending: boolean;
  onToggleSort: () => void;
  onSelectChapter: (number: number) => void;
  loading: boolean;
}

export const ChapterDrawer: React.FC<ChapterDrawerProps> = ({
  isOpen,
  onClose,
  chapters,
  currentChapterId,
  isAscending,
  onToggleSort,
  onSelectChapter,
  loading,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-30 bg-black/60 backdrop-blur-xl rounded-t-2xl border-t border-white/10"
          style={{ maxHeight: '70vh' }}
        >
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full">
              <X size={24} className="text-white" />
            </button>
            <h3 className="text-white font-bold">الفصول ({chapters.length})</h3>
            <button onClick={onToggleSort} className="p-1 hover:bg-white/10 rounded-full">
              <ArrowUpDown size={20} className="text-gray-400" />
            </button>
          </div>
          <div className="overflow-y-auto max-h-[calc(70vh-60px)]">
            {loading ? (
              <div className="p-4 text-center text-gray-500">جاري التحميل...</div>
            ) : (
              chapters.map(ch => (
                <button
                  key={ch._id}
                  onClick={() => onSelectChapter(ch.number)}
                  className={`w-full text-right py-3 px-4 border-b border-white/10 transition-all duration-200 ${
                    ch.number == currentChapterId
                      ? 'bg-white/10 text-white border-r-2 border-white'
                      : 'text-gray-300 hover:bg-white/5'
                  }`}
                >
                  <div className="font-medium">{ch.title || `فصل ${ch.number}`}</div>
                  <div className="text-xs text-gray-500 mt-1">{formatRelativeTime(ch.createdAt)}</div>
                </button>
              ))
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};