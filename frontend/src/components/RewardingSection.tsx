import { motion } from 'framer-motion';
import { Gift } from 'lucide-react';
import { useAnimations } from '@/context/AnimationContext';
import HandDrawnGift from '@/components/HandDrawnGift';

const RewardingSection = () => {
  const { animationsEnabled } = useAnimations();
  return (
    <div className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={animationsEnabled ? { opacity: 0, y: 40 } : { opacity: 1, y: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: animationsEnabled ? 0.8 : 0, ease: 'easeOut' }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-5xl font-bold text-[--foreground] mb-6">
            Get Rewarded for Your <span className="text-[--foreground]/60">Loyalty</span>
          </h2>
          <p className="text-xl text-[--foreground]/70 max-w-2xl mx-auto">
            We value our Pro members. As a token of our appreciation, we have a simple and rewarding loyalty program.
          </p>
        </motion.div>

        <motion.div
          initial={animationsEnabled ? { opacity: 0, y: 40 } : { opacity: 1, y: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: animationsEnabled ? 0.8 : 0, ease: 'easeOut', delay: animationsEnabled ? 0.2 : 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-center gap-12 p-10 bg-[--card-background] border border-[--border] rounded-3xl"
        >
          <div className="flex-shrink-0 relative">
            <HandDrawnGift className="w-32 h-32 text-[--foreground]/90 relative z-10" strokeWidth={1.5} />
          </div>
          <div className="text-center md:text-left">
            <h3 className="text-3xl font-bold text-[--foreground] mb-4">Introducing TackleTokens</h3>
            <p className="text-[--foreground]/80 text-lg mb-6 leading-relaxed">
              Earn <span className="font-bold text-[--foreground]">10 TackleTokens</span> for every successful monthly Pro subscription payment.
              Collect <span className="font-bold text-[--foreground]">99 TackleTokens</span> and redeem them for a <span className="font-bold text-[--foreground]">FREE</span> month of TackleIt Pro!
            </p>
            <p className="text-base text-[--foreground]/60 italic">
              It's our way of saying thank you for being a valued member of the TackleIt community.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RewardingSection;
