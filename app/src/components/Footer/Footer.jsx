import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div>
          <h3 className="logo">JobConnect</h3>
          <p className="description">
            Votre plateforme de confiance pour trouver l'emploi de vos rêves. Connectez-vous avec
            les meilleures entreprises et accélérez votre carrière.
          </p>
        </div>

        <div>
          <h4>Navigation</h4>
          <ul>
            <li>
              <Link to="/">Accueil</Link>
            </li>
            <li>
              <Link to="/">Offres d'emploi</Link>
            </li>
            <li>
              <Link to="/login">Connexion</Link>
            </li>
            <li>
              <Link to="/register">Inscription</Link>
            </li>
          </ul>
        </div>

        <div>
          <h4>Entreprises</h4>
          <ul>
            <li>
              <a href="#publier">Publier une offre</a>
            </li>
            <li>
              <a href="#espace-recruteur">Espace recruteur</a>
            </li>
            <li>
              <a href="#tarifs">Nos tarifs</a>
            </li>
            <li>
              <a href="#support">Support entreprise</a>
            </li>
          </ul>
        </div>

        <div>
          <h4>Informations</h4>
          <ul>
            <li>
              <a href="#about">À propos</a>
            </li>
            <li>
              <a href="#contact">Contact</a>
            </li>
            <li>
              <a href="#privacy">Confidentialité</a>
            </li>
            <li>
              <a href="#terms">Conditions d'utilisation</a>
            </li>
          </ul>
        </div>

        <div>
          <h4>Suivez-nous</h4>
          <div className="social">
            <a href="#linkedin" aria-label="LinkedIn">
              <i className="fab fa-linkedin"></i>
            </a>
            <a href="#twitter" aria-label="Twitter">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="#facebook" aria-label="Facebook">
              <i className="fab fa-facebook"></i>
            </a>
            <a href="#instagram" aria-label="Instagram">
              <i className="fab fa-instagram"></i>
            </a>
          </div>
        </div>
      </div>

      <div className="bottom">
        <p>&copy; {currentYear} JobConnect. Tous droits réservés.</p>
      </div>
    </footer>
  );
}

export default Footer;
