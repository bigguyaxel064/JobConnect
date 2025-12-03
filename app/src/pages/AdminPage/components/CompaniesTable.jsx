import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './AdminPageComponents.css';

function CompaniesTable() {
  const [companies, setCompanies] = useState([]);
  const [editing, setEditing] = useState(null);
  const [query, setQuery] = useState('');
  const [form, setForm] = useState({ name: '', address: '', website: '' });

  const fetchCompanies = async () => {
    const res = await fetch('/api/companies', { credentials: 'include' });
    if (!res.ok) return;
    const data = await res.json();
    setCompanies(data.companies || []);
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `/api/companies/${editing}` : '/api/companies';
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
        toast.error("Erreur lors de la modification ou l'ajout de l'entreprise.");
        return;
      }
      await fetchCompanies();
      setEditing(null);
      setForm({ name: '', address: '', website: '' });
      toast.success(
        editing ? 'Entreprise modifiée avec succès.' : 'Entreprise ajoutée avec succès.'
      );
    } catch {
      toast.error("Erreur lors de la modification ou l'ajout de l'entreprise.");
    }
  };

  const handleEdit = c => {
    setForm({ name: c.name || '', address: c.address || '', website: c.website || '' });
    setEditing(c.id);
  };
  const handleDelete = async id => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette entreprise ?')) return;
    await fetch(`/api/companies/${id}`, { method: 'DELETE', credentials: 'include' });
    await fetchCompanies();
    toast.success('Entreprise supprimée avec succès.');
  };

  // Pagination
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;
  const filteredCompanies = companies.filter(c => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      (c.name || '').toLowerCase().includes(q) ||
      (c.website || '').toLowerCase().includes(q) ||
      (c.address || '').toLowerCase().includes(q)
    );
  });
  const totalPages = Math.ceil(filteredCompanies.length / PAGE_SIZE);
  const paginatedCompanies = filteredCompanies.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <section className="admin-section">
      <div style={{ marginBottom: 8 }}>
        <input
          placeholder="Rechercher une entreprise..."
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setPage(1);
          }}
          style={{ padding: '6px 8px', width: '100%', boxSizing: 'border-box' }}
        />
      </div>
      <h3>{editing ? 'Modifier une entreprise' : 'Ajouter une entreprise'}</h3>
      <form className="crud-form" onSubmit={handleSubmit}>
        <input name="name" placeholder="Nom" value={form.name} onChange={handleChange} required />
        <input name="address" placeholder="Adresse" value={form.address} onChange={handleChange} />
        <input name="website" placeholder="Site web" value={form.website} onChange={handleChange} />
        <div className="form-actions">
          <button type="submit">{editing ? 'Modifier' : 'Ajouter'}</button>
          {editing && (
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setForm({ name: '', address: '', website: '' });
              }}
            >
              Annuler
            </button>
          )}
        </div>
      </form>

      <div className="entity-list simple-list">
        {filteredCompanies.length === 0 ? (
          <p>Aucune entreprise.</p>
        ) : (
          paginatedCompanies.map(c => (
            <div key={c.id} className="list-row">
              <div className="row-main">
                <strong>{c.name}</strong>
                <div className="muted">
                  {c.website || ''} {c.address ? `— ${c.address}` : ''}
                </div>
              </div>
              <div className="row-actions">
                <button onClick={() => handleEdit(c)}>Modifier</button>
                <button onClick={() => handleDelete(c.id)}>Supprimer</button>
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

export default CompaniesTable;
