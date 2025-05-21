import React from 'react';
import { motion } from 'framer-motion';

const Logo = ({ className = "", size = "md" }) => {
  const sizeClasses = {
    sm: "h-8", // text-xl, text-lg
    md: "h-12", // text-3xl, text-2xl
    lg: "h-16"  // text-4xl, text-3xl
  };

  const jgrTextSize = {
    sm: "text-2xl",
    md: "text-3xl",
    lg: "text-4xl"
  }

  const brokerTextSize = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl"
  }

  return (
    <motion.div 
      className={`flex items-center ${className}`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className={`font-bold ${sizeClasses[size]} flex items-center logo-shadow`}>
        <span className={`${jgrTextSize[size]} text-jgr-gold`}>JGR</span>
        <span className={`${brokerTextSize[size]} ml-1 text-jgr-gold-light`}>BROKER</span>
      </div>
    </motion.div>
  );
};

export default Logo;