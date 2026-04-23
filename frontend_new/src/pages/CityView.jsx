import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Loader3D from '../components/Loader3D';
import SmartImage from '../components/SmartImage';
import { getCityBySlug } from '../api/cities';

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
        position: 'fixed',
        inset: 0,
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
    <div
      style={{
        position: 'fixed',
        inset: 0,                  // covers navbar too
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: '#000',
        zIndex: 0,
      }}
    >
      {/* Background image — full bleed, no overlay darkening */}
      <div
            style={{
              position: 'absolute',
              inset: 0,
              overflow: 'hidden',
              zIndex: 0,
            }}
          >      
            <SmartImage
              avif={thumbnail?.avif}
              webp={thumbnail?.webp}
              fallback={thumbnail?.original}
              alt={name}
              loading="eager"
              priority={true}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                objectPosition: 'center center',
                display: 'block',
                transform: 'scale(1.01)',
              }}
            />
      </div>

      {/* Subtle vignette only at edges — not a flat dark overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%)',
        pointerEvents: 'none',
        zIndex: 1,
      }} />

      {/* Flyin graphic — top right */}
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

      {/* Loop graphic — top left */}
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
          <div
            style={{
              position: 'absolute',
              inset: 0,
              overflow: 'hidden',
              zIndex: 0,
            }}
          >
            <SmartImage
              avif={thumbnail?.avif}
              webp={thumbnail?.webp}
              fallback={thumbnail?.original}
              alt={name}
              loading="eager"
              priority={true}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center center',
                display: 'block',
                transform: 'scale(1.01)',
              }}
            />
          </div>
        )
      )}

      {/* Audio player — bottom right */}
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
    </div>
  );
};

export default CityView;