import './Banner.css';

function Banner({ searchValues, onInputChange, onSearch, stats }) {
  return (
    <section className="banner-container">
      <h1>Trouvez votre prochain emploi de rêve</h1>
      <p>Découvrez des milliers d'opportunités d'emploi chez les meilleures entreprises</p>
      <form onSubmit={onSearch}>
        <div>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
          <input
            type="text"
            name="poste"
            placeholder="Recherchez votre poste"
            value={searchValues.poste}
            onChange={onInputChange}
          />
        </div>

        <div>
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
          <input
            type="text"
            name="ville"
            placeholder="Ville"
            value={searchValues.ville}
            onChange={onInputChange}
          />
        </div>

        <button type="submit">Rechercher</button>
      </form>
      <article>
        <div>
          <span className="stat-number">{stats.offres}</span>
          <span className="stat-label">Offres d'emploi</span>
        </div>
        <div>
          <span className="stat-number">{stats.entreprises}</span>
          <span className="stat-label">Entreprises partenaires</span>
        </div>
        <div>
          <span className="stat-number">97%</span>
          <span className="stat-label">Taux de satisfaction</span>
        </div>
      </article>
    </section>
  );
}

export default Banner;
