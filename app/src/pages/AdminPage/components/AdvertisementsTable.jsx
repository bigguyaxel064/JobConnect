import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './AdminPageComponents.css';

function AdvertisementsTable() {
  const [ads, setAds] = useState([]);
  const [editing, setEditing] = useState(null);
  const [query, setQuery] = useState('');
  const initialForm = {
    title: '',
    short_description: '',
    description: '',
    publish_date: new Date().toISOString().slice(0, 10),
    company_id: '',
    location: '',
    salary_min: '',
    salary_max: '',
    employment_type: '',
    work_mode: '',
    required_experience: '',
  };
  const [form, setForm] = useState(initialForm);
  const [companies, setCompanies] = useState([]);

  const fetchAds = async () => {
    const res = await fetch('/api/advertisements', { credentials: 'include' });
    if (!res.ok) return;
    const data = await res.json();
    setAds(data.advertisements || []);
  };

  useEffect(() => {
    fetchAds();
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    const res = await fetch('/api/companies', { credentials: 'include' });
    if (!res.ok) return;
    const data = await res.json();
    setCompanies(data.companies || []);
  };

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `/api/advertisements/${editing}` : '/api/advertisements';
    try {
      const res = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.status === 403) {
        window.location.href = '/login';
        return;
      }
      if (!res.ok) {
        toast.error("Erreur lors de la modification ou l'ajout de l'annonce.");
        return;
      }
      await fetchAds();
      setEditing(null);
      setForm(initialForm);
      toast.success(editing ? 'Annonce modifiée avec succès.' : 'Annonce ajoutée avec succès.');
    } catch {
      toast.error("Erreur lors de la modification ou l'ajout de l'annonce.");
    }
  };

  const handleEdit = ad => {
    setForm({
      title: ad.title || '',
      short_description: ad.short_description || '',
      description: ad.description || '',
      publish_date: ad.publish_date || new Date().toISOString().slice(0, 10),
      company_id: ad.company_id || '',
      location: ad.location || '',
      salary_min: ad.salary_min || '',
      salary_max: ad.salary_max || '',
      employment_type: ad.employment_type || '',
      work_mode: ad.work_mode || '',
      required_experience: ad.required_experience || '',
    });
    setEditing(ad.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async id => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) return;
    const res = await fetch(`/api/advertisements/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (res.status === 403) window.location.href = '/login';
    await fetchAds();
    toast.success('Annonce supprimée avec succès.');
  };

  // Pagination
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;
  const filteredAds = ads.filter(a => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      (a.title || '').toLowerCase().includes(q) ||
      (a.short_description || '').toLowerCase().includes(q) ||
      (a.publish_date || '').toLowerCase().includes(q)
    );
  });
  const totalPages = Math.ceil(filteredAds.length / PAGE_SIZE);
  const paginatedAds = filteredAds.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <section className="admin-section">
      <div style={{ marginBottom: 8 }}>
        <input
          placeholder="Rechercher une annonce..."
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setPage(1);
          }}
          style={{ padding: '6px 8px', width: '100%', boxSizing: 'border-box' }}
        />
      </div>
      <h3>{editing ? 'Modifier une annonce' : 'Ajouter une annonce'}</h3>
      <form className="crud-form" onSubmit={handleSubmit}>
        <input
          name="title"
          placeholder="Titre"
          value={form.title}
          onChange={handleChange}
          required
        />
        <input
          name="short_description"
          placeholder="Aperçu court"
          value={form.short_description}
          onChange={handleChange}
          required
        />
        <input
          name="description"
          placeholder="Description complète"
          value={form.description}
          onChange={handleChange}
          required
        />
        <input
          name="publish_date"
          type="date"
          value={form.publish_date}
          onChange={handleChange}
          required
        />
        <select name="company_id" value={form.company_id} onChange={handleChange} required>
          <option value="">-- Choisir une entreprise --</option>
          {companies.map(c => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input name="location" placeholder="Lieu" value={form.location} onChange={handleChange} />
        <input
          name="salary_min"
          type="number"
          placeholder="Salaire min"
          value={form.salary_min}
          onChange={handleChange}
        />
        <input
          name="salary_max"
          type="number"
          placeholder="Salaire max"
          value={form.salary_max}
          onChange={handleChange}
        />
        <select name="employment_type" value={form.employment_type} onChange={handleChange}>
          <option value="">--</option>
          <option value="CDI">CDI</option>
          <option value="CDD">CDD</option>
          <option value="Alternance">Alternance</option>
          <option value="Stage">Stage</option>
        </select>
        <select name="work_mode" value={form.work_mode} onChange={handleChange}>
          <option value="">--</option>
          <option value="Site">Sur site</option>
          <option value="Hybride">Hybride</option>
          <option value="Remote">Remote</option>
        </select>
        <input
          name="required_experience"
          placeholder="Expérience requise"
          value={form.required_experience}
          onChange={handleChange}
        />
        <div className="form-actions">
          <button type="submit">{editing ? 'Modifier' : 'Ajouter'}</button>
          {editing && (
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setForm({ ...form, title: '', short_description: '', description: '' });
              }}
            >
              Annuler
            </button>
          )}
        </div>
      </form>

      <div className="entity-list simple-list">
        {filteredAds.length === 0 ? (
          <p>Aucune annonce.</p>
        ) : (
          paginatedAds.map(a => (
            <div key={a.id} className="list-row">
              <div className="row-main">
                <strong>{a.title}</strong>
                <div className="muted">
                  {a.short_description} — {a.publish_date}
                </div>
              </div>
              <div className="row-actions">
                <button onClick={() => handleEdit(a)}>Modifier</button>
                <button onClick={() => handleDelete(a.id)}>Supprimer</button>
              </div>
            </div>
          ))
        )}
      </div>
      {totalPages > 1 && (
        <div className="pagination-controls">
          <button disabled={page === 1} onClick={() => setPage(page - 1)}>
            Précédent
          </button>
          <span style={{ margin: '0 8px' }}>
            Page {page} / {totalPages}
          </span>
          <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>
            Suivant
          </button>
        </div>
      )}
    </section>
  );
}

export default AdvertisementsTable;
