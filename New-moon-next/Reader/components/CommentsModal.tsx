import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { CommentSection } from '../../../components/CommentSection';

interface CommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  novelId: string;
  chapterId: number;
  onAddComment: (content: string) => Promise<void>;
}

export const CommentsModal: React.FC<CommentsModalProps> = ({
  isOpen,
  onClose,
  novelId,
  chapterId,
  onAddComment,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-40 bg-black/90 backdrop-blur-xl rounded-t-2xl shadow-xl"
          style={{ maxHeight: '80vh' }}
        >
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full">
              <X size={24} className="text-white" />
            </button>
            <h3 className="text-white font-bold">التعليقات</h3>
            <div className="w-6" />
          </div>
          <div className="overflow-y-auto p-4" style={{ maxHeight: 'calc(80vh - 60px)' }}>
            <CommentSection
              novelId={novelId}
              comments={[]}
              loading={false}
              onAddComment={onAddComment}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};