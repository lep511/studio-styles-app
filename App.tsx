/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, ChangeEvent, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateStyledImage } from './services/geminiService';
import PolaroidCard from './components/PolaroidCard';
import ImageLightbox from './components/ImageLightbox';
import Footer from './components/Footer';

const PHOTO_AGENCIES = [
    {
        name: 'Anzenberger Agency',
        prompt: `Create a photograph with a strong, subjective authorial vision, in the style of the Anzenberger Agency. The image must blend documentary realism with a distinct artistic sensibility. Focus on unique, thoughtful composition, a personal point of view, and a mood that can range from poetic to surreal. Whether it's travel, reportage, or a portrait, the final image should feel like a single, creative frame from a larger, personal story.`,
        description: "Based in Vienna, the Anzenberger Agency represents photographers who blend documentary, reportage, and fine art. The agency is known for fostering a strong, subjective authorial vision, resulting in diverse work that is personal, creative, and unconventional."
    },
    {
        name: 'Associated Press',
        prompt: `Generate a classic, objective, and impactful news photograph in the quintessential style of the Associated Press. The image must be sharp, clear, and timely, capturing a decisive moment with a straightforward, uncluttered composition. Prioritize factual storytelling over artistic flair. The final result should look like a wire photo, ready for global distribution.`,
        description: `Founded in 1846, the Associated Press is a global news agency renowned for its fast, factual, and unbiased reporting. Its photography has won numerous Pulitzer Prizes, capturing history-defining moments with clarity and integrity, setting the standard for photojournalism worldwide.`
    },
    {
        name: 'Contact Press Images',
        prompt: `Produce an intimate and compelling documentary photograph in the spirit of Contact Press Images. The image must offer a deep, humanistic insight into its subject. The composition should be thoughtful and immersive, drawing the viewer into the scene with a profound sense of authenticity, empathy, and closeness. It should feel like a single, powerful frame from an in-depth photo essay.`,
        description: "An independent agency founded in 1976, Contact Press Images is celebrated for its in-depth photo essays and intimate documentation of major historical events. Its photographers create compelling visual narratives that provide a deep, personal insight into their subjects."
    },
    {
        name: 'Getty Images',
        prompt: `Create a high-quality, commercially appealing stock photograph typical of Getty Images. The image needs to be impeccably lit, with a clean, balanced composition, vibrant and inviting colors, and a clearly defined subject. The overall aesthetic should be professional, polished, and versatile, perfectly suited for advertising, corporate, or editorial use.`,
        description: "As one of the world's largest stock photography agencies, Getty Images provides a vast library of high-quality creative and editorial imagery. Its signature style is professional, polished, and commercially appealing, characterized by clean compositions and vibrant lighting."
    },
    {
        name: 'Magnum Photos',
        prompt: `Evoke the spirit of Magnum Photos with a powerful, humanistic, documentary-style image. Capture a candid, 'decisive moment' that tells a profound story. The composition must be strong and intentional, often with a gritty, authentic feel. Emulate a classic aesthetic, frequently using high-contrast black and white to emphasize emotion and raw reality.`,
        description: "Founded in 1947 by legendary photographers like Robert Capa and Henri Cartier-Bresson, Magnum Photos is a cooperative renowned for its powerful, humanistic photojournalism, capturing pivotal moments in history with profound artistry and a deeply personal vision."
    },
    {
        name: 'National Geographic',
        prompt: `Generate a breathtaking photograph in the iconic style of National Geographic. The image must showcase natural beauty, wildlife, or world culture with awe-inspiring detail and an epic, often wide, composition. Use rich, saturated colors and dramatic, beautiful lighting to create a profound sense of wonder, discovery, and connection to the planet.`,
        description: `For over a century, National Geographic has set the gold standard for nature, science, and cultural photography. Its iconic yellow border frames a world of breathtaking beauty and scientific discovery, with images that are both visually stunning and deeply educational.`
    },
    {
        name: 'Panos Pictures',
        prompt: `Produce a vibrant, context-rich documentary photograph in the style of Panos Pictures. The image must tell a compelling story about contemporary social issues, culture, or the environment, always with a focus on the dignity and humanity of the subject. Use rich, natural colors and an environmental composition that conveys a strong sense of place and narrative depth.`,
        description: "Specializing in global documentary photography, Panos Pictures focuses on stories of contemporary social issues, culture, and the environment. Its work is context-rich, vibrant, and deeply respectful of its subjects, highlighting themes of human dignity."
    },
    {
        name: 'Reuters',
        prompt: `Generate a powerful, high-impact news photograph in the style of Reuters. The image must convey a significant global story with journalistic precision and emotional depth. The composition should be dynamic and compelling, capturing the absolute essence of an event in a single, clean, and technically excellent frame. The photo should feel immediate and newsworthy.`,
        description: `A leading global news agency, Reuters has been delivering trusted news and imagery since 1851. Its photographers are known for their bravery and artistry, producing powerful, award-winning images that provide an unflinching look at world events with both precision and humanity.`
    },
    {
        name: 'VII Photo Agency',
        prompt: `Create a raw, provocative, and impactful photojournalistic image in the unflinching style of VII Photo Agency. The photograph must feel immediate, visceral, and emotionally charged, telling a compelling, often difficult, story. Use natural, often dramatic or harsh, lighting to emphasize the raw energy and unvarnished truth of the scene.`,
        description: "Established in 2001, VII Photo Agency is known for its unflinching and provocative coverage of conflict and social issues. Its style is raw, immediate, and dedicated to telling the unvarnished truth through powerful, narrative-driven photojournalism."
    }
];


const GHOST_POLAROIDS_CONFIG = [
  { initial: { x: "-150%", y: "-100%", rotate: -30 }, transition: { delay: 0.2 } },
  { initial: { x: "150%", y: "-80%", rotate: 25 }, transition: { delay: 0.4 } },
  { initial: { x: "-120%", y: "120%", rotate: 45 }, transition: { delay: 0.6 } },
  { initial: { x: "180%", y: "90%", rotate: -20 }, transition: { delay: 0.8 } },
  { initial: { x: "0%", y: "-200%", rotate: 0 }, transition: { delay: 0.5 } },
  { initial: { x: "100%", y: "150%", rotate: 10 }, transition: { delay: 0.3 } },
];


type ImageStatus = 'pending' | 'done' | 'error';
interface GeneratedImage {
    status: ImageStatus;
    url?: string;
    error?: string;
}
type PhotoAgency = typeof PHOTO_AGENCIES[0];


const primaryButtonClasses = "font-permanent-marker text-xl text-center text-black bg-yellow-400 py-3 px-8 rounded-sm transform transition-transform duration-200 hover:scale-105 hover:-rotate-2 hover:bg-yellow-300 shadow-[2px_2px_0px_2px_rgba(0,0,0,0.2)]";
const secondaryButtonClasses = "font-permanent-marker text-xl text-center text-white bg-white/10 backdrop-blur-sm border-2 border-white/80 py-3 px-8 rounded-sm transform transition-transform duration-200 hover:scale-105 hover:rotate-2 hover:bg-white hover:text-black";

const useMediaQuery = (query: string) => {
    const [matches, setMatches] = useState(false);
    useEffect(() => {
        const media = window.matchMedia(query);
        if (media.matches !== matches) {
            setMatches(media.matches);
        }
        const listener = () => setMatches(media.matches);
        window.addEventListener('resize', listener);
        return () => window.removeEventListener('resize', listener);
    }, [matches, query]);
    return matches;
};

function App() {
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);
    const [selectedAgencyInfo, setSelectedAgencyInfo] = useState<PhotoAgency | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [appState, setAppState] = useState<'idle' | 'image-uploaded' | 'generating' | 'results-shown'>('idle');
    const [zoomedImage, setZoomedImage] = useState<{ url: string; caption: string } | null>(null);
    const isMobile = useMediaQuery('(max-width: 768px)');


    const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setUploadedImage(reader.result as string);
                setAppState('image-uploaded');
                setGeneratedImage(null);
                setSelectedAgencyInfo(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleStyleGenerate = async (agency: PhotoAgency) => {
        if (!uploadedImage) return;

        setSelectedAgencyInfo(agency);
        setIsLoading(true);
        setAppState('generating');
        setGeneratedImage({ status: 'pending' });

        try {
            const basePrompt = `Recreate the provided image in this style: "${agency.prompt}". The main subject and key elements of the original image must remain clearly recognizable, but adapt the environment and the photo's quality (color, grain, lighting) to perfectly match the requested style.`;
            const resultUrl = await generateStyledImage(uploadedImage, basePrompt);
            setGeneratedImage({ status: 'done', url: resultUrl });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
            setGeneratedImage({ status: 'error', error: errorMessage });
            console.error(`Failed to generate image for ${agency.name}:`, err);
        } finally {
            setIsLoading(false);
            setAppState('results-shown');
        }
    };
    
    const handleReset = () => {
        setUploadedImage(null);
        setGeneratedImage(null);
        setSelectedAgencyInfo(null);
        setAppState('idle');
        setIsLoading(false);
    };

    const handleDownloadIndividualImage = () => {
        if (generatedImage?.status === 'done' && generatedImage.url && selectedAgencyInfo) {
            const link = document.createElement('a');
            link.href = generatedImage.url;
            link.download = `studio-styles-${selectedAgencyInfo.name.toLowerCase().replace(/\s+/g, '-')}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };
    
    const handleZoomIn = (url: string, caption: string) => {
        if (url && caption) {
            setZoomedImage({ url, caption });
        }
    };
    const handleZoomOut = () => {
        setZoomedImage(null);
    };

    const StyleSelector = () => (
        <div className="w-full max-w-lg mt-8">
            <h2 className="font-permanent-marker text-2xl text-center text-neutral-300 mb-6">Choose a Style</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {PHOTO_AGENCIES.map(agency => (
                    <button
                        key={agency.name}
                        onClick={() => handleStyleGenerate(agency)}
                        disabled={isLoading}
                        className="font-permanent-marker text-lg text-center text-white bg-white/10 backdrop-blur-sm border-2 border-white/80 py-4 px-4 rounded-sm transform transition-all duration-200 hover:scale-105 hover:rotate-2 hover:bg-yellow-400 hover:text-black disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {agency.name}
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <main className="bg-black text-neutral-200 min-h-screen w-full flex flex-col items-center justify-center p-4 pb-24 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-full bg-grid-white/[0.05]"></div>
            
            <div className="z-10 flex flex-col items-center justify-center w-full h-full flex-1 min-h-0">
                <div className="text-center mb-10">
                    <h1 className="text-6xl md:text-8xl font-playfair-display font-bold text-neutral-100">Studio Styles</h1>
                    <p className="font-permanent-marker text-neutral-300 mt-2 text-xl tracking-wide">Reimagine your photo in the style of iconic agencies.</p>
                </div>

                {appState === 'idle' && (
                     <div className="relative flex flex-col items-center justify-center w-full">
                        {/* Ghost polaroids for intro animation */}
                        {GHOST_POLAROIDS_CONFIG.map((config, index) => (
                             <motion.div
                                key={index}
                                className="absolute w-80 h-[26rem] rounded-md p-4 bg-neutral-100/10 blur-sm"
                                initial={config.initial}
                                animate={{
                                    x: "0%", y: "0%", rotate: (Math.random() - 0.5) * 20,
                                    scale: 0,
                                    opacity: 0,
                                }}
                                transition={{
                                    ...config.transition,
                                    ease: "circOut",
                                    duration: 2,
                                }}
                            />
                        ))}
                        <motion.div
                             initial={{ opacity: 0, scale: 0.8 }}
                             animate={{ opacity: 1, scale: 1 }}
                             transition={{ delay: 2, duration: 0.8, type: 'spring' }}
                             className="flex flex-col items-center"
                        >
                            <label htmlFor="file-upload" className="cursor-pointer group transform hover:scale-105 transition-transform duration-300">
                                 <PolaroidCard 
                                     caption="Click to begin"
                                     status="done"
                                 />
                            </label>
                            <input id="file-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleImageUpload} />
                            <p className="mt-8 font-permanent-marker text-neutral-500 text-center max-w-xs text-lg">
                                Click the polaroid to upload your photo and start your journey through photography.
                            </p>
                        </motion.div>
                    </div>
                )}

                {appState === 'image-uploaded' && uploadedImage && (
                    <div className="flex flex-col items-center gap-6">
                         <PolaroidCard 
                            imageUrl={uploadedImage} 
                            caption="Your Photo" 
                            status="done"
                         />
                         <div className="flex items-center gap-4 mt-4">
                            <button onClick={handleReset} className={secondaryButtonClasses}>
                                Different Photo
                            </button>
                         </div>
                         <StyleSelector />
                    </div>
                )}

                {(appState === 'generating' || appState === 'results-shown') && selectedAgencyInfo && (
                     <div className="flex flex-col items-center justify-center flex-1 w-full">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={selectedAgencyInfo.name}
                                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -50, scale: 0.9 }}
                                transition={{ duration: 0.5, type: 'spring' }}
                                className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 w-full max-w-4xl"
                            >
                                {/* Polaroid Card */}
                                <PolaroidCard
                                    caption={`${selectedAgencyInfo.name} style`}
                                    status={generatedImage?.status || 'pending'}
                                    imageUrl={generatedImage?.url}
                                    error={generatedImage?.error}
                                    onShake={() => handleStyleGenerate(selectedAgencyInfo)}
                                    onDownload={handleDownloadIndividualImage}
                                    onZoom={handleZoomIn}
                                    isMobile={true} // Force mobile styles for single card view
                                />
                                 {/* Agency Info */}
                                 {(appState === 'generating' || (appState === 'results-shown' && generatedImage?.status === 'done')) && (
                                     <motion.div
                                         initial={{ opacity: 0, x: 20 }}
                                         animate={{ opacity: 1, x: 0 }}
                                         transition={{ delay: 0.2, duration: 0.5 }}
                                         className="w-full max-w-md lg:max-w-sm text-center lg:text-left mt-6 lg:mt-0"
                                     >
                                         <h2 className="font-permanent-marker text-3xl text-yellow-400 mb-3">{selectedAgencyInfo.name}</h2>
                                         <p className="text-neutral-300 text-base">{selectedAgencyInfo.description}</p>
                                     </motion.div>
                                 )}
                            </motion.div>
                        </AnimatePresence>

                        <div className="h-20 mt-4 flex items-center justify-center">
                            {appState === 'results-shown' && (
                                <div className="flex flex-col sm:flex-row items-center gap-4">
                                    <button onClick={handleReset} className={secondaryButtonClasses}>
                                        Start Over
                                    </button>
                                </div>
                            )}
                        </div>
                        
                        {appState === 'results-shown' && <StyleSelector />}
                    </div>
                )}
            </div>
             <AnimatePresence>
                {zoomedImage && (
                    <ImageLightbox
                        imageUrl={zoomedImage.url}
                        caption={zoomedImage.caption}
                        onClose={handleZoomOut}
                        onDownload={() => {
                            if (generatedImage?.url === zoomedImage.url) {
                                handleDownloadIndividualImage();
                            }
                        }}
                    />
                )}
            </AnimatePresence>
            <Footer />
        </main>
    );
}

export default App;
