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
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data.detail || "Something went wrong.";
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage, { duration: 5000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact-section" className="py-24 bg-[#020617] relative overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px] animate-pulse delay-1000" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">Let's Collaborate</h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            I'd love to hear your suggestions or build something great together.
          </p>
        </motion.div>

        <div className="max-w-2xl mx-auto">
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="bg-white/5 backdrop-blur-xl p-8 md:p-10 rounded-[2rem] border border-white/10 shadow-2xl space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 ml-1">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-5 py-3 bg-black/40 text-white border border-white/10 rounded-xl focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder-gray-600"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 ml-1">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-5 py-3 bg-black/40 text-white border border-white/10 rounded-xl focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder-gray-600"
                  placeholder="john@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="interest" className="block text-sm font-medium text-gray-300 ml-1">How can I help you?</label>
              <div className="relative">
                <select
                  id="interest"
                  name="interest"
                  value={formData.interest}
                  onChange={handleChange}
                  className="w-full px-5 py-3 bg-black/40 text-white border border-white/10 rounded-xl focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none"
                >
                  <option>Suggest a feature</option>
                  <option>Report a bug</option>
                  <option>Collaborate with you</option>
                  <option>Just saying hi</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            <div className="space-y-2 relative">
              <label htmlFor="message" className="block text-sm font-medium text-gray-300 ml-1">Message</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={5}
                className="w-full px-5 py-3 pr-12 bg-black/40 text-white border border-white/10 rounded-xl focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder-gray-600 resize-none"
                placeholder="Tell me about your project..."
                required
              ></textarea>
              <button
                type="button"
                onClick={handleMicClick}
                className={`absolute right-3 top-[38px] p-2 rounded-lg transition-all ${isRecording ? 'text-red-500 bg-red-500/10 animate-pulse' : 'text-gray-400 hover:text-indigo-400 hover:bg-white/5'}`}
                aria-label={isRecording ? 'Stop recording' : 'Start recording'}
              >
                <Mic size={20} />
              </button>
            </div>

            <div className="pt-4">
              <LoadingButton
                type="submit"
                isLoading={isSubmitting}
                className="w-full group relative px-8 py-4 bg-indigo-600 text-white rounded-full font-semibold text-lg overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_-5px_rgba(79,70,229,0.5)] hover:scale-[1.02]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Send Message
                  <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </LoadingButton>
            </div>
          </motion.form>
        </div>
      </div >
    </section >
  );
};

export default ContactForm;