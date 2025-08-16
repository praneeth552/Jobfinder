"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast"; 
import axios from "axios";
import { Mic } from 'lucide-react';
import LoadingButton from "./LoadingButton";

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
    SpeechRecognition: { new(): SpeechRecognition };
    webkitSpeechRecognition: { new(): SpeechRecognition };
  }
}

const ContactForm = () => {
  const [formData, setFormData] = useState({ name: "", email: "", interest: "Suggest a feature", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionImpl = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognitionImpl) {
        const recognition = new SpeechRecognitionImpl();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let interimTranscript = '';
          let finalTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) finalTranscript += transcript + ' ';
            else interimTranscript += transcript;
          }
          setFormData(prev => ({ ...prev, message: finalTranscript + interimTranscript }));
        };
        recognition.onerror = (event: Event) => {
          const errorEvent = event as { error?: string };
          toast.error(`Speech recognition error: ${errorEvent.error || 'Unknown error'}`);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill out all required fields.");
      setIsSubmitting(false);
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      toast.error("Please enter a valid email address.");
      setIsSubmitting(false);
      return;
    }
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/contact`, formData);
      toast.success("Thanks! I'll get back to you soon.");
      setFormData({ name: "", email: "", interest: "Suggest a feature", message: "" });
    } catch (error: unknown) {
      let errorMessage = "An unexpected error occurred.";
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { data?: { detail?: string } } };
        errorMessage = axiosError.response?.data?.detail || "Something went wrong.";
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact-section" className="py-20 bg-gray-900 relative z-10">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-white">Let's Collaborate</h2>
          <p className="text-lg text-gray-300 mt-2">
            I'd love to hear your suggestions or build something great together.
          </p>
        </motion.div>

        <div className="glow-form-wrapper max-w-2xl mx-auto">
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="bg-[#111] p-8 rounded-[16px] space-y-6"
          >
            <div>
              <label htmlFor="name" className="block text-gray-300 font-semibold mb-2">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-black text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500"
                placeholder="Enter your name"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-gray-300 font-semibold mb-2">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-black text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label htmlFor="interest" className="block text-gray-300 font-semibold mb-2">How can I help you?</label>
              <select
                id="interest"
                name="interest"
                value={formData.interest}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-black text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option>Suggest a feature</option>
                <option>Report a bug</option>
                <option>Collaborate with you</option>
                <option>Just saying hi</option>
              </select>
            </div>

            <div className="relative">
              <label htmlFor="message" className="block text-gray-300 font-semibold mb-2">Message / Suggestion</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={5}
                className="w-full px-4 py-2 pr-12 bg-black text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500 resize-none"
                placeholder="Enter your message or suggestion"
                required
              ></textarea>
              <button
                type="button"
                onClick={handleMicClick}
                className={`absolute right-3 top-[48px] text-gray-400 hover:text-purple-500 transition-colors ${isRecording ? 'text-red-500 animate-pulse' : ''}`}
                aria-label={isRecording ? 'Stop recording' : 'Start recording'}
              >
                <Mic size={24} />
              </button>
            </div>

            <div className="text-center pt-4">
              <LoadingButton
                type="submit"
                isLoading={isSubmitting}
                className="submit-button-swipe px-8 py-3 font-semibold"
              >
                Submit
              </LoadingButton>
            </div>
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;