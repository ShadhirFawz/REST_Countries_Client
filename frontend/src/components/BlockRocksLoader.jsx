import React from 'react';
import { motion } from 'framer-motion';

const colors = ['bg-red-500', 'bg-yellow-400', 'bg-green-500', 'bg-blue-500', 'bg-purple-500'];

const circleVariants = {
  animate: {
    y: [0, -20, 0],      // bounce up and down
    scale: [1, 1.4, 1],  // scale up and down
    rotate: [0, 15, 0],  // subtle rotation
    transition: {
      y: {
        repeat: Infinity,
        repeatType: 'loop',
        duration: 1,
        ease: 'easeInOut',
      },
      scale: {
        repeat: Infinity,
        repeatType: 'loop',
        duration: 1,
        ease: 'easeInOut',
      },
      rotate: {
        repeat: Infinity,
        repeatType: 'loop',
        duration: 1,
        ease: 'easeInOut',
      }
    }
  }
};

const BlockRocksLoader = () => {
  return (
    <div className="flex justify-center items-center gap-3 h-24">
      {colors.map((color, index) => (
        <motion.div
          key={index}
          className={`w-8 h-8 rounded-full ${color}`}
          variants={circleVariants}
          animate="animate"
          transition={{ delay: index * 0.15 }}
        />
      ))}
    </div>
  );
};

export default BlockRocksLoader;
