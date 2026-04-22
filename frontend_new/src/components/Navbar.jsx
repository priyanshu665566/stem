import { useState } from 'react';
import { Link } from "react-router-dom";
import { getCloudinaryImageUrl } from '../utilities/cloudinary';

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <nav className="glass-nav">
            <div className="glass-nav__inner">
                <Link className="glass-nav__brand" to="/">
                    <img
                        src={import.meta.env.VITE_LOGO_URL}
                        alt="STEMCity USA"
                        loading="lazy"
                    />
                </Link>

                {/* Desktop links */}
                <ul className={`glass-nav__links${menuOpen ? ' glass-nav__links--open' : ''}`}>
                    <li>
                        <Link
                            className="glass-nav__link glass-nav__link--active"
                            to="/"
                            onClick={() => setMenuOpen(false)}
                        >
                            Home
                        </Link>
                    </li>
                    <li>
                        <Link
                            className="glass-nav__link"
                            to="/"
                            onClick={() => setMenuOpen(false)}
                        >
                            Cities
                        </Link>
                    </li>
                    <li>
                        <Link
                            className="glass-nav__link"
                            to="/"
                            onClick={() => setMenuOpen(false)}
                        >
                            About
                        </Link>
                    </li>
                </ul>

                {/* Mobile toggle */}
                <button
                    className="glass-nav__toggle"
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle navigation"
                >
                    <span />
                    <span />
                    <span />
                </button>
            </div>
        </nav>
    );
};

export default Navbar;