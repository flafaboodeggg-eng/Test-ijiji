import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft } from 'lucide-react';
import { ChapterFull } from '../services/novel';

interface ChapterReaderProps {
  chapter: ChapterFull | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ChapterReader: React.FC<ChapterReaderProps> = ({ chapter, isOpen, onClose }) => {
  if (!chapter) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/95 overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="min-h-screen py-8 px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="max-w-4xl mx-auto bg-[#0a0a0a] rounded-2xl shadow-2xl relative">
              <button
                onClick={onClose}
                className="absolute top-4 left-4 z-10 p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
              <div className="p-6 md:p-8">
                <h1 className="text-2xl font-bold mb-6 text-center">
                  الفصل {chapter.number}: {chapter.title}
                </h1>
                <div
                  className="chapter-content prose dark:prose-invert max-w-none leading-loose"
                  style={{
                    fontSize: chapter.copyrightStyles?.fontSize || 18,
                    textAlign: chapter.copyrightStyles?.alignment === 'center' ? 'center' : 'right',
                  }}
                >
                  {chapter.copyrightStart && (
                    <div className="text-center text-gray-500 mb-6 pb-4 border-b border-white/10">
                      {chapter.copyrightStart}
                    </div>
                  )}
                  <div dangerouslySetInnerHTML={{ __html: chapter.content.replace(/\n/g, '<br/>') }} />
                  {chapter.copyrightEnd && (
                    <div className="text-center text-gray-500 mt-6 pt-4 border-t border-white/10">
                      {chapter.copyrightEnd}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};