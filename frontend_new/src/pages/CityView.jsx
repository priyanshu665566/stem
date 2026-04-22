import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import Loader3D from '../components/Loader3D';
import SmartImage from '../components/SmartImage';
import { getCityBySlug } from '../api/cities';

const NAVBAR_HEIGHT = '50px';

const isVideoUrl = (url) => Boolean(url && /\.(mp4|webm|ogg)(\?.*)?$/i.test(url));

const CityView = () => {
  const { slug } = useParams();
  const [city, setCity] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchCity = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { data } = await getCityBySlug(slug);
        if (isMounted) setCity(data);
      } catch (err) {
        if (isMounted) {
          setError('City not found');
          setCity(null);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchCity();
    return () => { isMounted = false; };
  }, [slug]);

  if (isLoading) return <Loader3D />;

  if (error || !city) {
    return (
      <div style={{
        height: `calc(100vh - ${NAVBAR_HEIGHT})`,
        marginTop: NAVBAR_HEIGHT,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center',
        background: '#0b0c10',
        color: '#fff',
      }}>
        <div>
          <h1>City not found</h1>
          <p>That city is not available at this time.</p>
        </div>
      </div>
    );
  }

  const { thumbnail, flyin_graphic, loop_graphic, support_audio_url, name } = city;
  const loopOriginal = loop_graphic?.original;
  const loopIsVideo = isVideoUrl(loopOriginal);

  return (
    <Motion.div
      initial={{ opacity: 0, scale: 1.08 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, ease: 'easeOut' }}
      style={{
        position: 'fixed',
        top: NAVBAR_HEIGHT,
        left: 0,
        right: 0,
        bottom: 0,
        height: `calc(100vh - ${NAVBAR_HEIGHT})`,
        width: '100vw',
        overflow: 'hidden',
        background: '#000',
      }}
    >
      <SmartImage
        avif={thumbnail?.avif}
        webp={thumbnail?.webp}
        fallback={thumbnail?.original}
        alt={name}
        loading="eager"
        priority={true}
        className=""
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'fill',
          objectPosition: 'center center',
          zIndex: 0,
        }}
      />

      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(0,0,0,0.24)',
        pointerEvents: 'none',
        zIndex: 1,
      }} />

      {flyin_graphic?.original && (
        <SmartImage
          avif={flyin_graphic.avif}
          webp={flyin_graphic.webp}
          fallback={flyin_graphic.original}
          alt={`${name} flyin graphic`}
          loading="eager"
          priority={true}
          style={{
            position: 'absolute',
            right: '2rem',
            top: '2rem',
            maxWidth: '35%',
            maxHeight: '55%',
            objectFit: 'contain',
            zIndex: 2,
          }}
        />
      )}

      {loop_graphic?.original && (
        loopIsVideo ? (
          <video
            src={loopOriginal}
            autoPlay
            loop
            muted
            playsInline
            style={{
              position: 'absolute',
              left: '2rem',
              top: '2rem',
              maxWidth: '45%',
              maxHeight: '55%',
              objectFit: 'cover',
              zIndex: 2,
            }}
          />
        ) : (
          <SmartImage
            avif={loop_graphic.avif}
            webp={loop_graphic.webp}
            fallback={loop_graphic.original}
            alt={`${name} loop graphic`}
            loading="eager"
            priority={true}
            style={{
              position: 'absolute',
              left: '2rem',
              top: '2rem',
              maxWidth: '45%',
              maxHeight: '55%',
              objectFit: 'contain',
              zIndex: 2,
            }}
          />
        )
      )}

      <div style={{
        position: 'absolute',
        bottom: '3rem',
        left: '3rem',
        zIndex: 3,
        color: '#ffffff',
        textShadow: '0 20px 40px rgba(0,0,0,0.45)',
        maxWidth: '45%',
      }}>
        <h1 style={{ fontSize: 'clamp(3rem, 5vw, 5rem)', margin: 0 }}>{name}</h1>
      </div>

      {support_audio_url && (
        <div style={{
          position: 'absolute',
          bottom: '2rem',
          right: '2rem',
          zIndex: 3,
          backdropFilter: 'blur(12px)',
          background: 'rgba(0,0,0,0.45)',
          padding: '1rem 1.25rem',
          borderRadius: '16px',
        }}>
          <audio
            src={support_audio_url}
            controls
            autoPlay
            muted
            loop
            style={{ width: '260px' }}
          />
        </div>
      )}
    </Motion.div>
  );
};

export default CityView;
