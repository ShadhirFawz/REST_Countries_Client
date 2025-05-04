import React from 'react';
import { motion } from 'framer-motion';

export default function AnimatedCloseButton({ onClick }) {
    return (
        <motion.button
            onClick={onClick}
            className="absolute top-5 right-3/10 z-50 p-2 rounded-full bg-transparent hover:bg-transparent transition-colors cursor-pointer"
            whileHover={{ 
                scale: 1.1,
                rotate: 90, // Rotate 90 degrees on hover
                transition: { 
                    type: "spring",
                    stiffness: 300,
                    damping: 10
                }
            }}
            whileTap={{ 
                scale: 0.9,
                rotate: 0 // Reset rotation when clicked
            }}
            initial={{ opacity: 0 }}
            animate={{ 
                opacity: 1,
                rotate: 0 // Ensure it starts at 0 rotation
            }}
            exit={{ opacity: 0 }}
        >
            <motion.svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                whileHover={{ 
                    rotate: -90, // Counter-rotate the SVG to keep the X upright
                    transition: { duration: 0.3 }
                }}
            >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </motion.svg>
        </motion.button>
    );
}