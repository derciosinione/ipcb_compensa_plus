import React, { useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { AIChatInterface } from './AIChatInterface';
import { motion, AnimatePresence } from 'motion/react';

export function FloatingAIChat() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center group"
            aria-label="Open AI Assistant"
          >
            <Sparkles className="w-6 h-6 text-white" />

            {/* Pulse animation */}
            <span className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-20"></span>

            {/* Tooltip */}
            <div className="absolute right-16 top-1/2 -translate-y-1/2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              AI Assistant
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-2 h-2 bg-slate-900 dark:bg-slate-100 rotate-45"></div>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* AI Chat Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl h-[85vh] flex flex-col p-0">
          <DialogHeader className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">AI Assistant</DialogTitle>
                <DialogDescription className="text-sm text-slate-500 dark:text-slate-400">
                  Upload documents and extract structured data
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-hidden px-6 pb-6">
            <AIChatInterface compact maxHeight="100%" />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
