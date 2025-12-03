import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Header.css';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, setUser, setIsLogged } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header>
      <nav>
        <div className="nav-left">
          <button
            className={`burger-menu ${isMenuOpen ? 'open' : ''}`}
            onClick={toggleMenu}
            aria-label="Menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <Link to="/" className="logo" onClick={closeMenu}>
            JobConnect
          </Link>
        </div>

        <div className={`nav-content ${isMenuOpen ? 'open' : ''}`}>
          <ul>
            {user && (
              <li>
                <span className="welcome-burger">
                  {user.first_name} {user.last_name}
                </span>
              </li>
            )}
            <li>
              <Link to="/" onClick={closeMenu}>
                Accueil
              </Link>
            </li>
            {user && (
              <li>
                <Link to={`/user/${user.id}`} onClick={closeMenu}>
                  Mon profil
                </Link>
              </li>
            )}
          </ul>
        </div>

        <div className="auth-buttons">
          {user ? (
            <>
              <span className="welcome">
                {user.first_name} {user.last_name}
              </span>
              <button
                className="btn btn-outline"
                onClick={async () => {
                  try {
                    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
                  } finally {
                    setUser(null);
                    setIsLogged(false);
                    closeMenu();
                  }
                }}
              >
                Déconnexion
              </button>
              {user.is_admin && (
                <Link to="/admin" className="btn btn-primary" onClick={closeMenu}>
                  Admin
                </Link>
              )}
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline" onClick={closeMenu}>
                Connexion
              </Link>
              <Link to="/register" className="btn btn-primary" onClick={closeMenu}>
                Inscription
              </Link>
            </>
          )}
        </div>

        {isMenuOpen && <div className="overlay" onClick={closeMenu}></div>}
      </nav>
    </header>
  );
}

export default Header;
