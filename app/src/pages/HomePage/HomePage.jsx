import { useEffect, useState } from 'react';
import Banner from '../../components/Banner/Banner';
import JobCard from '../../components/JobCard/JobCard';
import Review from '../../components/Review/Review';
import './HomePage.css';

function HomePage() {
  const [advertisements, setAdvertisements] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [searchValues, setSearchValues] = useState({ poste: '', ville: '' });
  const [filteredAds, setFilteredAds] = useState([]);
  const [stats, setStats] = useState({ offres: 0, entreprises: 0 });

  useEffect(() => {
    fetch('/api/advertisements')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        setAdvertisements(data.advertisements || []);
        setFilteredAds(data.advertisements || []);
      });
    fetch('/api/companies')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        setCompanies(data.companies || []);
      });
    fetch('/api/stats')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        setStats({
          offres: data.offres || 0,
          entreprises: data.entreprises || 0,
        });
      })
      .catch(() => {
        setStats({ offres: 0, entreprises: 0 });
      });
  }, []);

  const filterAds = (poste, ville) => {
    setFilteredAds(
      advertisements.filter(ad => {
        const matchPoste = poste ? ad.title.toLowerCase().includes(poste.toLowerCase()) : true;
        const matchVille = ville
          ? ad.location && ad.location.toLowerCase().includes(ville.toLowerCase())
          : true;
        return matchPoste && matchVille;
      })
    );
  };

  const onInputChange = e => {
    const { name, value } = e.target;
    const newValues = { ...searchValues, [name]: value };
    setSearchValues(newValues);
    filterAds(newValues.poste, newValues.ville);
  };

  const onSearch = e => {
    e.preventDefault();
    filterAds(searchValues.poste, searchValues.ville);
  };

  return (
    <main className="homepage-main-container">
      <Banner
        searchValues={searchValues}
        onInputChange={onInputChange}
        onSearch={onSearch}
        stats={stats}
      />
      <h2>Annonces</h2>
      {filteredAds.length === 0 ? (
        <p>Aucune annonce disponible.</p>
      ) : (
        <div className="job-cards-container">
          {filteredAds.map(annonce => {
            const company = companies.find(c => c.id === annonce.company_id);
            return (
              <JobCard
                key={annonce.id}
                annonce={annonce}
                companyName={company ? company.name : ''}
              />
            );
          })}
        </div>
      )}
      <Review />
    </main>
  );
}

export default HomePage;
