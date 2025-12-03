import ahmedImg from '../../assets/ahmed.firoum@epitech.eu.JPEG';
import guyImg from '../../assets/guy.jpg';
import './Review.css';

function Review() {
  return (
    <section className="review-section">
      <h2 className="review-title">Ils ont trouvé leur voie avec JobConnect</h2>
      <div className="review-cards">
        <div className="review-card">
          <img src={ahmedImg} alt="Ahmed, nouvel employé" className="review-img" />
          <div className="review-content">
            <p className="review-text">
              "Grâce à JobConnect, j'ai trouvé un emploi qui correspond parfaitement à mes attentes.
              La plateforme m'a permis de découvrir des opportunités que je n'aurais jamais
              imaginées. Aujourd'hui, je m'épanouis dans mon nouveau poste !"
            </p>
            <span className="review-author">Ahmed, Développeur Web</span>
          </div>
        </div>
        <div className="review-card">
          <img src={guyImg} alt="Lucas, alternant" className="review-img" />
          <div className="review-content">
            <p className="review-text">
              "JobConnect m'a ouvert les portes de l'alternance. En quelques clics, j'ai pu postuler
              à des offres adaptées à mon profil et décrocher une alternance enrichissante. Je
              recommande à tous les étudiants !"
            </p>
            <span className="review-author">Guy, Étudiant en informatique</span>
          </div>
        </div>
      </div>
    </section>
  );
}
export default Review;
