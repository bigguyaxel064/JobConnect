import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './OfferDetail.css';

function OfferDetail() {
  const { advertisement_id } = useParams();
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [advertisement, setAdvertisement] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [applicationData, setApplicationData] = useState({
    coverLetter: '',
    cvFile: null,
  });
  const [submitting, setSubmitting] = useState(false);

  const refreshUser = useCallback(async () => {
    try {
      const response = await fetch('/api/session', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        if (data?.user) {
          setUser(data.user);
        }
      }
    } catch (err) {
      console.error('Error refreshing user data:', err);
    }
  }, [setUser]);

  useEffect(() => {
    const fetchAdvertisement = async () => {
      try {
        const response = await fetch(`http://localhost:5000/advertisement/${advertisement_id}`);
        if (!response.ok) throw new Error('Offre non trouvée');
        const data = await response.json();
        setAdvertisement(data.advertisement);

        if (data.advertisement.company_id) {
          const companyResponse = await fetch(
            `http://localhost:5000/company/${data.advertisement.company_id}`
          );
          if (companyResponse.ok) {
            const companyData = await companyResponse.json();
            setCompany(companyData.company);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAdvertisement();
  }, [advertisement_id]);

  useEffect(() => {
    if (showModal) {
      refreshUser();
    }
  }, [showModal, refreshUser]);

  const handleApply = async e => {
    e.preventDefault();

    if (!user) {
      navigate('/login');
      return;
    }

    if (!user.cv && !applicationData.cvFile) {
      alert('Veuillez joindre un CV à votre candidature.');
      return;
    }

    setSubmitting(true);
    try {
      let cvPath = user.cv;
      if (applicationData.cvFile) {
        const formData = new FormData();
        formData.append('file', applicationData.cvFile);

        const uploadResponse = await fetch('http://localhost:5000/upload', {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error("Erreur lors de l'upload du CV");
        }

        const uploadData = await uploadResponse.json();
        cvPath = uploadData.file_path;
      }

      const response = await fetch('http://localhost:5000/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          advertisement_id: parseInt(advertisement_id),
          cover_letter: applicationData.coverLetter,
          cv_path: cvPath,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la candidature');
      }

      alert('Candidature envoyée avec succès !');
      setShowModal(false);
      setApplicationData({ coverLetter: '', cvFile: null });
    } catch (err) {
      alert(`Erreur : ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = e => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        alert('Veuillez uploader un fichier PDF');
        e.target.value = '';
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Le fichier ne doit pas dépasser 5 MB');
        e.target.value = '';
        return;
      }
      setApplicationData({ ...applicationData, cvFile: file });
    }
  };

  if (loading)
    return (
      <main className="offer-detail">
        <p>Chargement...</p>
      </main>
    );
  if (error)
    return (
      <main className="offer-detail">
        <p>Erreur</p>
      </main>
    );
  if (!advertisement)
    return (
      <main className="offer-detail">
        <p>Offre non trouvée</p>
      </main>
    );

  return (
    <main className="offer-detail">
      <article>
        <button onClick={() => navigate(-1)} className="back-button">
          ← Retour
        </button>

        <div className="offer-header">
          <h1>{advertisement.title}</h1>
          {company && <p>{company.name}</p>}
        </div>

        <section>
          <h2>Description</h2>
          <p>{advertisement.description}</p>
        </section>

        <section>
          <h2>Informations</h2>
          <div className="offer-info-grid">
            {advertisement.location && (
              <div className="info-item">
                <strong>Localisation :</strong> {advertisement.location}
              </div>
            )}
            {advertisement.employment_type && (
              <div className="info-item">
                <strong>Type d'emploi :</strong> {advertisement.employment_type}
              </div>
            )}
            {advertisement.work_mode && (
              <div className="info-item">
                <strong>Mode de travail :</strong> {advertisement.work_mode}
              </div>
            )}
            {(advertisement.salary_min || advertisement.salary_max) && (
              <div className="info-item">
                <strong>Salaire :</strong> {advertisement.salary_min}€ - {advertisement.salary_max}€
              </div>
            )}
            {advertisement.required_experience && (
              <div className="info-item">
                <strong>Expérience requise :</strong> {advertisement.required_experience}
              </div>
            )}
            {advertisement.publish_date && (
              <div className="info-item">
                <strong>Date de publication :</strong>{' '}
                {new Date(advertisement.publish_date).toLocaleDateString('fr-FR')}
              </div>
            )}
          </div>
        </section>

        {company && (
          <section>
            <h2>À propos de l'entreprise</h2>
            <div className="company-info">
              <p>
                <strong>Nom :</strong> {company.name}
              </p>
              {company.address && (
                <p>
                  <strong>Adresse :</strong> {company.address}
                </p>
              )}
              {company.website && (
                <p>
                  <strong>Site web :</strong>{' '}
                  <a href={company.website} target="_blank" rel="noopener noreferrer">
                    {company.website}
                  </a>
                </p>
              )}
            </div>
          </section>
        )}

        <div className="offer-actions">
          <button
            onClick={() => {
              if (!user) {
                navigate('/login');
              } else {
                setShowModal(true);
              }
            }}
            className="apply-button"
          >
            Postuler à cette offre
          </button>
        </div>
      </article>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Postuler : {advertisement.title}</h2>
              <button onClick={() => setShowModal(false)} className="close-button">
                ×
              </button>
            </div>

            <form onSubmit={handleApply} className="application-form">
              <div className="form-group">
                <label>Candidat</label>
                <input
                  type="text"
                  value={`${user.first_name} ${user.last_name}`}
                  disabled
                  className="readonly-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="coverLetter">Lettre de motivation *</label>
                <textarea
                  id="coverLetter"
                  value={applicationData.coverLetter}
                  onChange={e =>
                    setApplicationData({ ...applicationData, coverLetter: e.target.value })
                  }
                  placeholder="Expliquez pourquoi vous êtes intéressé(e) par ce poste..."
                  rows="8"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="cvFile">
                  CV {!user.cv && <span className="required-indicator">*</span>}
                </label>
                {user.cv ? (
                  <div className="cv-info">
                    <p className="cv-status">✓ Vous avez déjà un CV dans votre profil</p>
                    <p className="cv-optional">
                      Vous pouvez en uploader un nouveau spécifiquement pour cette candidature
                      (optionnel)
                    </p>
                  </div>
                ) : (
                  <p className="cv-required">Vous devez joindre un CV à votre candidature</p>
                )}
                <input
                  type="file"
                  id="cvFile"
                  accept=".pdf"
                  onChange={handleFileChange}
                  required={!user.cv}
                  className="file-input"
                />
                {applicationData.cvFile && (
                  <p className="file-selected">
                    ✓ Fichier sélectionné : {applicationData.cvFile.name}
                  </p>
                )}
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setShowModal(false)} className="cancel-button">
                  Annuler
                </button>
                <button type="submit" disabled={submitting} className="submit-button">
                  {submitting ? 'Envoi...' : 'Envoyer ma candidature'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default OfferDetail;
