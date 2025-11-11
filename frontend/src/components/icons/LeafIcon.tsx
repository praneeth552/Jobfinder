import { motion } from "framer-motion";

const LeafIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <motion.svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 22c-2 0-4-2-4-4s2-4 4-4 4 2 4 4-2 4-4 4z" />
    <path d="M12 14V2" />
    <path d="M12 2c-4.4 0-8 3.6-8 8s3.6 8 8 8" />
    <path d="M12 2c4.4 0 8 3.6 8 8s-3.6 8-8 8" />
  </motion.svg>
);

export default LeafIcon;
