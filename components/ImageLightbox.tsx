/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { motion } from 'framer-motion';

interface ImageLightboxProps {
    imageUrl: string;
    caption: string;
    onClose: () => void;
    onDownload: () => void;
}

const ImageLightbox: React.FC<ImageLightboxProps> = ({ imageUrl, caption, onClose, onDownload }) => {
    // Prevents click on the content from closing the lightbox
    const handleContentClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <motion.div
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 20 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="relative max-w-full max-h-full flex flex-col items-center gap-4"
                onClick={handleContentClick}
            >
                {/* Action Buttons Container */}
                 <div className="absolute -top-10 right-0 sm:top-0 sm:-right-12 flex items-center gap-4 z-10">
                    {/* Download Button */}
                    <button
                        onClick={onDownload}
                        className="text-white/70 hover:text-white transition-colors"
                        aria-label={`Download image for ${caption}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                    </button>

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="text-white/70 hover:text-white transition-colors"
                        aria-label="Close zoomed image"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>


                <img
                    src={imageUrl}
                    alt={`Zoomed in view of ${caption}`}
                    className="max-w-full max-h-[80vh] object-contain rounded-sm shadow-2xl"
                />
                <p className="font-permanent-marker text-2xl text-white/90">{caption}</p>
            </motion.div>
        </motion.div>
    );
};

export default ImageLightbox;
