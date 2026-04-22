import { useState, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, Table as T } from 'lucide-react';
import Card from '../utilities/Card';
import Table from '../utilities/Table';
import Loader3D from '../components/Loader3D';
import { getCities } from '../api/cities';

const spring = { type: 'spring', stiffness: 100, damping: 20 };

const citySpans = ['featured', 'wide', 'standard', 'standard', 'tall', 'standard', 'wide', 'standard', 'featured', 'standard', 'standard', 'standard', 'standard'];

const heroContainerVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1,
        },
    },
};

const heroChildVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: spring,
    },
};
 
const Home = () => {
    const [showInfo, setShowInfo] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [cities, setCities] = useState([]);

    useEffect(() => {
        let isMounted = true;

        const fetchCities = async () => {
            try {
                const response = await getCities();
                const publishedCities = response.data.filter(city => city.status === 'published');
                const mappedCities = publishedCities.map((city, index) => ({
                    name: city.name,
                    description: city.description || city.name,
                    image: city.thumbnail || null,
                    span: citySpans[index % citySpans.length],
                    path: `/city/${city.slug}`,
                }));

                if (!isMounted) return;
                setCities(mappedCities);

                mappedCities.forEach(city => {
                    if (city.image?.original) {
                        const img = new Image();
                        img.src = city.image.original;
                    }
                });
            } catch (error) {
                if (isMounted) {
                    setCities([]);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchCities();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleToggleView = () => {
        if (showInfo) {
            setIsLoading(true);
            setShowInfo(false);
        } else {
            setIsLoading(false);
            setShowInfo(true);
        }
    };

    return (
        <main>

            <section className="hero">
                
                <div className="hero__grid-overlay" />
                
                <div className="hero__glow" />

                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    onCanPlay={(e) => e.target.play()}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        opacity: 0.3,
                    }}
                >
                <source src={import.meta.env.VITE_HERO_VIDEO_URL} type="video/mp4" />                
                </video>

                <Motion.div
                    className="hero__content"
                    variants={heroContainerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <Motion.p
                        className="hero__tagline"
                        variants={heroChildVariants}
                    >
                        The Future of STEM Education
                    </Motion.p>

                    <Motion.h1
                        className="hero__title text-tight"
                        variants={heroChildVariants}
                    >
                        Welcome to{' '}
                        <span>STEMCity USA</span>
                    </Motion.h1>

                    <Motion.p
                        className="hero__subtitle"
                        variants={heroChildVariants}
                    >
                        Discover the intersection of science and society.
                        Explore how innovation is shaping communities
                        across the nation.
                    </Motion.p>
                </Motion.div>
            </section>

            <section
                className="bento-section"
                style={{
                    backgroundImage: `url(${import.meta.env.VITE_BG_IMAGE_URL})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    backgroundAttachment: 'fixed',
                }}
            >
                <Motion.div
                    className="bento-section__header"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, margin: "0px 0px -50px 0px" }}
                    transition={spring}
                >
                    <p className="bento-section__label">Destinations</p>

                    <div style={{
                        position: 'relative',
                        width: '100%',
                        maxWidth: showInfo ? '900px' : '1200px',
                        margin: '0 auto',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <h2 
                            className="bento-section__title text-tight"
                            style={{ textAlign: 'center', margin: 0}}
                        >
                            Explore Cities
                        </h2>

                        <button
                            className="info-toggle"
                            style={{
                                position: 'absolute',
                                right: showInfo ? '0' : 'var(--space-lg)',
                                top: '50%',
                                transform:'translateY(-50%)'
                            }}
                            onClick={handleToggleView}
                            aria-label="Toggle table/grid view"
                        >
                          { showInfo ? <LayoutGrid size={16} color="#86868b" /> : <T size={16} color="#86868b" />}
                        </button>
                    </div>
                </Motion.div>

                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <Loader3D key="loader" onComplete={() => setIsLoading(false)} />
                    ) : cities.length === 0 ? (
                        <Motion.div
                            key="empty"
                            className="empty-state"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={spring}
                            style={{ padding: '4rem 2rem', textAlign: 'center', color: '#f1592b' }}
                        >
                            <h3>No published cities available.</h3>
                            <p>Check back later for new STEM destinations.</p>
                        </Motion.div>
                    ) : showInfo ? (
                        <Motion.div
                            key="table"
                            className="table-section"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={spring}
                        >
                            <Table cities={cities} />
                        </Motion.div>
                    ) : (
                        <Motion.div
                            key="grid"
                            className="bento-grid"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4 }}
                        >
                            {cities.map((city) => (
                                <Card
                                    key={city.name}
                                    title={city.name}
                                    description={city.description}
                                    image={city.image}
                                    span={city.span}
                                    path={city.path}
                                />
                            ))}
                        </Motion.div>
                    )}
                </AnimatePresence>
            </section>
        </main>
    );
};

export default Home; 
