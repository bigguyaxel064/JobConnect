import { Link } from 'react-router-dom';
import './JobCard.css';

function JobCard({ annonce, companyName }) {
  if (!annonce) return null;

  return (
    <section className="job-card-section">
      <h2>{annonce.title}</h2>
      <p className="job-company-name">{companyName}</p>
      {annonce.location && (
        <p className="job-location">
          <span className="job-location-icon" role="img" aria-label="Localisation">
            📍
          </span>
          {annonce.location}
        </p>
      )}
      <p>{annonce.short_description}</p>

      <div>
        <Link to={`/offer/${annonce.id}`}>Voir plus</Link>
      </div>
    </section>
  );
}

export default JobCard;
