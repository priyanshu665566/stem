import React, { useEffect, useRef } from 'react';
import { motion as Motion } from 'framer-motion';

const Loader3D = ({ onComplete }) => {
    const isCompleted = useRef(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (!isCompleted.current) {
                isCompleted.current = true;
                if (onComplete) onComplete();
            }
        }, 3000);

        return () => clearTimeout(timer);
    }, [onComplete]);

    const text3DShadow = `
        0px 1px 0px #d45b00,
        0px 2px 0px #c25300,
        0px 3px 0px #b04b00,
        0px 4px 6px rgba(0,0,0,0.4),
        0px 8px 15px rgba(0,0,0,0.2)
    `;

    return (
        <Motion.div
            className="loader-3d-wrapper"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '400px',
                width: '100%',
                perspective: '1200px',
                overflow: 'hidden',
            }}
        >
            {/* The Floating Container */}
            <Motion.div
                animate={{ y: [-15, 15] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut", repeatType: "mirror" }}
                style={{
                    position: 'relative',
                    transformStyle: 'preserve-3d',
                    transform: 'rotateX(-12deg) rotateY(18deg)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    '--ring-size': 'min(260px, 70vw)',
                }}
            >
                {/* STEMCITY 3D Text */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    transformStyle: 'preserve-3d',
                    fontFamily: '"Inter", "system-ui", sans-serif',
                    fontWeight: 900,
                    fontSize: 'clamp(3rem, 8vw, 4rem)',
                    lineHeight: 0.95,
                    letterSpacing: '0.05em',
                    position: 'relative',
                }}>
                    {/* STEM */}
                    <div style={{
                        color: '#f1592b',
                        textShadow: text3DShadow,
                        transform: 'translateZ(15px)',
                        transformStyle: 'preserve-3d'
                    }}>
                        STEM
                    </div>
                    {/* CITY */}
                    <div style={{
                        color: '#f1592b',
                        textShadow: text3DShadow,
                        transform: 'translateZ(15px)',
                        marginLeft: '1.3em',
                        transformStyle: 'preserve-3d'
                    }}>
                        CITY
                    </div>
                </div>

                {/* 3D Orbit System: Static Ring + Revolving USA */}
                <div style={{
                    position: 'absolute',
                    top: '8%', 
                    left: '10%',
                    width: '100%',
                    height: '100%',
                    transformStyle: 'preserve-3d',
                    transform: 'rotateZ(-10deg) rotateX(15deg)',
                }}>
                    {/* The Full Ring Track */}
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: 'var(--ring-size)', 
                        height: 'var(--ring-size)',
                        transform: 'translate(-50%, -50%) rotateX(90deg)',
                        borderRadius: '50%',
                        border: '3px solid rgba(59, 130, 246, 0.3)',
                        borderTop: '3px solid rgba(96, 165, 250, 0.8)',
                        borderBottom: '3px solid rgba(96, 165, 250, 0.8)',
                        boxShadow: '0 0 15px rgba(59, 130, 246, 0.3), inset 0 0 15px rgba(59, 130, 246, 0.3)',
                        transformStyle: 'preserve-3d',
                        boxSizing: 'border-box'
                    }} />

                    {/* Revolving USA Badge */}
                    <Motion.div
                        animate={{ rotateY: [0, 360] }}
                        transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                        style={{
                            position: 'absolute',
                            top: '0',
                            left: '0',
                            width: '100%',
                            height: '100%',
                            transformStyle: 'preserve-3d',
                        }}
                    >
                        {/* The USA Badge - Front side */}
                        <div 
                            style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%) translateZ(calc(var(--ring-size) / 2))',
                                background: 'linear-gradient(90deg, #1E3A8A, #3B82F6, #1E3A8A)',
                                backgroundSize: '200% 200%',
                                color: '#FFF',
                                padding: 'clamp(4px, 1vw, 6px) clamp(20px, 4vw, 30px)',
                                borderRadius: '50px',
                                fontFamily: '"Inter", "system-ui", sans-serif',
                                fontWeight: 900,
                                fontSize: 'clamp(0.9rem, 2vw, 1.2rem)',
                                letterSpacing: '0.25em',
                                boxShadow: '0 8px 16px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.4)',
                                border: '1px solid #60A5FA',
                                backfaceVisibility: 'hidden',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            USA
                        </div>

                        {/* Backside of the badge */}
                        <div 
                            style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%) translateZ(calc(var(--ring-size) / 2)) rotateY(180deg)',
                                background: 'linear-gradient(90deg, #1E3A8A, #3B82F6, #1E3A8A)',
                                backgroundSize: '200% 200%',
                                color: '#FFF',
                                padding: 'clamp(4px, 1vw, 6px) clamp(20px, 4vw, 30px)',
                                borderRadius: '50px',
                                fontFamily: '"Inter", "system-ui", sans-serif',
                                fontWeight: 900,
                                fontSize: 'clamp(0.9rem, 2vw, 1.2rem)',
                                letterSpacing: '0.25em',
                                boxShadow: '0 8px 16px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.4)',
                                border: '1px solid #60A5FA',
                                backfaceVisibility: 'hidden',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            USA
                        </div>
                    </Motion.div>
                </div>
            </Motion.div>
        </Motion.div>
    );
};

export default Loader3D;
