'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import axios from 'axios';
import { Mic } from 'lucide-react';
import LoadingButton from './LoadingButton';

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: Event) => void;
  start: () => void;
  stop: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: { new (): SpeechRecognition };
    webkitSpeechRecognition: { new (): SpeechRecognition };
  }
}

const MobileContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    interest: 'Suggest a feature',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionImpl =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognitionImpl) {
        const recognition = new SpeechRecognitionImpl();
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let interimTranscript = '';
          let finalTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
            } else {
              interimTranscript += transcript;
            }
          }
          setFormData((prev) => ({ ...prev, message: finalTranscript + interimTranscript }));
        };

        recognition.onerror = (event: Event) => {
          const errorEvent = event as { error?: string };
          toast.error(
            `Speech recognition error: ${errorEvent.error || 'Unknown error'}`
          );
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const handleMicClick = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill out all required fields.');
      setIsSubmitting(false);
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      toast.error('Please enter a valid email address.');
      setIsSubmitting(false);
      return;
    }

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/contact`,
        formData
      );
      toast.success('Thanks! I’ll get back to you soon.');
      setFormData({
        name: '',
        email: '',
        interest: 'Suggest a feature',
        message: '',
      });
    } catch (error: unknown) {
      let errorMessage = 'An unexpected error occurred.';
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { detail?: string } } };
        errorMessage =
          axiosError.response?.data?.detail ||
          'Something went wrong. Please try again later.';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
        className="bg-[#111] p-8 rounded-[16px]"
      >
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.6, ease: 'easeOut' }}
          className="mb-4"
        >
          <label
            htmlFor="mobile-name"
            className="block text-gray-300 font-semibold mb-2 text-sm"
          >
            Name
          </label>
          <input
            type="text"
            id="mobile-name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-800 text-white"
            required
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.8, ease: 'easeOut' }}
          className="mb-4"
        >
          <label
            htmlFor="mobile-email"
            className="block text-gray-300 font-semibold mb-2 text-sm"
          >
            Email
          </label>
          <input
            type="email"
            id="mobile-email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-800 text-white"
            required
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 1, ease: 'easeOut' }}
          className="mb-4"
        >
          <label
            htmlFor="mobile-interest"
            className="block text-gray-300 font-semibold mb-2 text-sm"
          >
            How can I help you?
          </label>
          <select
            id="mobile-interest"
            name="interest"
            value={formData.interest}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-800 text-white"
          >
            <option>Suggest a feature</option>
            <option>Report a bug</option>
            <option>Collaborate with you</option>
            <option>Just saying hi</option>
          </select>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2, ease: 'easeOut' }}
          className="mb-4 relative"
        >
          <label
            htmlFor="mobile-message"
            className="block text-gray-300 font-semibold mb-2 text-sm"
          >
            Message / Suggestion
          </label>
          <textarea
            id="mobile-message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-800 text-white pr-10"
            required
          ></textarea>
          <button
            type="button"
            onClick={handleMicClick}
            className={`absolute right-3 top-[42px] text-gray-400 hover:text-purple-500 ${
              isRecording ? 'text-red-500 animate-pulse' : ''
            }`}
          >
            <Mic size={20} />
          </button>
        </motion.div>

        <div className="text-center pt-4">
          <LoadingButton
            type="submit"
            isLoading={isSubmitting}
            className="submit-button-swipe px-8 py-3 font-semibold text-white bg-purple-600 rounded-full transition disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            Submit
          </LoadingButton>
        </div>
      </motion.form>
    // </div>
  );
};

export default MobileContactForm;
