'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';

export default function CreateInquiryButton() {
  const { data: session } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;

    setIsSubmitting(true);
    try {
      // TODO: Implement API call
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create inquiry');
      }

      setIsModalOpen(false);
      setFormData({ title: '', content: '' });
    } catch (error) {
      console.error('Error creating inquiry:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsModalOpen(true)}
        className="button-hover px-4 py-2 bg-primary text-white rounded-lg font-medium"
      >
        문의하기
      </motion.button>

      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50"
            >
              <div className="bg-white rounded-xl shadow-xl p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  문의하기
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="title"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      제목
                    </label>
                    <input
                      type="text"
                      id="title"
                      required
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="content"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      문의 내용
                    </label>
                    <textarea
                      id="content"
                      required
                      rows={4}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                      value={formData.content}
                      onChange={(e) =>
                        setFormData({ ...formData, content: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="button-hover px-4 py-2 bg-primary text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? '처리중...' : '등록하기'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
