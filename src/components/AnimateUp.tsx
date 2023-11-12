import { motion } from 'framer-motion';

export const AnimateUp = ({
  children,
  className,
  delay,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 0 }}
      transition={{ type: 'tween', delay: delay || 0 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
