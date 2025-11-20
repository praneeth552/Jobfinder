import { motion } from 'framer-motion';
import { Gift } from 'lucide-react';

const RewardingSection = () => {
  return (
    <div className="py-24 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[--primary]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-5xl font-bold text-[--foreground] mb-6">
            Get Rewarded for Your <span className="text-[--primary]">Loyalty</span>
          </h2>
          <p className="text-xl text-[--foreground]/70 max-w-2xl mx-auto">
            We value our Pro members. As a token of our appreciation, we have a simple and rewarding loyalty program.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-center gap-12 p-10 bg-[--card-background] border border-[--border] rounded-3xl shadow-xl backdrop-blur-sm"
        >
          <div className="flex-shrink-0 relative">
            <div className="absolute inset-0 bg-yellow-500/20 blur-2xl rounded-full" />
            <Gift className="w-32 h-32 text-yellow-500 relative z-10 drop-shadow-lg" />
          </div>
          <div className="text-center md:text-left">
            <h3 className="text-3xl font-bold text-[--foreground] mb-4">Introducing TackleTokens</h3>
            <p className="text-[--foreground]/80 text-lg mb-6 leading-relaxed">
              Earn <span className="font-bold text-yellow-500">10 TackleTokens</span> for every successful monthly Pro subscription payment.
              Collect <span className="font-bold text-yellow-500">99 TackleTokens</span> and redeem them for a <span className="font-bold text-green-500">FREE</span> month of Tackleit Pro!
            </p>
            <p className="text-base text-[--foreground]/60 italic">
              It's our way of saying thank you for being a valued member of the Tackleit community.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RewardingSection;
