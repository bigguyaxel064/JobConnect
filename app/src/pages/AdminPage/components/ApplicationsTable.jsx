import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../../../hooks/useAuth';
import './AdminPageComponents.css';

function ApplicationsTable() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [users, setUsers] = useState([]);
  const [ads, setAds] = useState([]);
  const [query, setQuery] = useState('');

  const fetchApplications = async () => {
    const res = await fetch('/api/applications', { credentials: 'include' });
    if (!res.ok) return;
    const data = await res.json();
    setApplications(data.applications || []);
  };

  const fetchUsers = async () => {
    const res = await fetch('/api/users', { credentials: 'include' });
    if (!res.ok) return;
    const data = await res.json();
    setUsers(data.users || []);
  };

  const fetchAds = async () => {
    const res = await fetch('/api/advertisements', { credentials: 'include' });
    if (!res.ok) return;
    const data = await res.json();
    setAds(data.advertisements || []);
  };

  useEffect(() => {
    fetchApplications();
    fetchUsers();
    fetchAds();
  }, []);

  const handleDelete = async id => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette candidature ?')) return;
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        toast.error('Erreur lors de la suppression de la candidature.');
        return;
      }
      await fetchApplications();
      toast.success('Candidature supprimée avec succès.');
    } catch {
      toast.error('Erreur lors de la suppression de la candidature.');
    }
  };

  const updateStatus = async (id, status) => {
    const app = applications.find(a => a.id === id);
    if (!app) return;
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          person_id: app.person_id,
          advertisement_id: app.advertisement_id,
          status,
          handled_by: user?.id || app.handled_by || '',
        }),
      });
      if (res.status === 403) {
        window.location.href = '/login';
        return;
      }
      if (!res.ok) {
        toast.error('Erreur lors de la modification du statut de la candidature.');
        return;
      }
      await fetchApplications();
      toast.success('Statut de la candidature modifié.');
    } catch {
      toast.error('Erreur lors de la modification du statut de la candidature.');
    }
  };

  // Pagination
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;
  const filteredApps = applications.filter(a => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    const ad = ads.find(ad => ad.id === a.advertisement_id);
    const user = users.find(u => u.id === a.person_id);
    return (
      (ad?.title || '').toLowerCase().includes(q) ||
      (user?.first_name || '').toLowerCase().includes(q) ||
      (user?.last_name || '').toLowerCase().includes(q) ||
      (a.status || '').toLowerCase().includes(q)
    );
  });
  const totalPages = Math.ceil(filteredApps.length / PAGE_SIZE);
  const paginatedApps = filteredApps.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <section className="admin-section">
      <div style={{ marginBottom: 8 }}>
        <input
          placeholder="Rechercher une candidature..."
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setPage(1);
          }}
          style={{ padding: '6px 8px', width: '100%', boxSizing: 'border-box' }}
        />
      </div>

      <div className="entity-list simple-list">
        {filteredApps.length === 0 ? (
          <p>Aucune candidature.</p>
        ) : (
          paginatedApps.map(a => {
            const ad = ads.find(ad => ad.id === a.advertisement_id);
            const user = users.find(u => u.id === a.person_id);
            return (
              <div key={a.id} className="list-row">
                <div className="row-main">
                  <strong>{ad ? ad.title : 'Annonce inconnue'}</strong>
                  <div className="muted">
                    Candidat: {user ? `${user.first_name} ${user.last_name}` : a.person_id} —
                    Status: {a.status}
                  </div>
                </div>
                <div className="row-actions">
                  <button onClick={() => updateStatus(a.id, 'Acceptée')}>Accepter</button>
                  <button onClick={() => updateStatus(a.id, 'Refusée')}>Refuser</button>
                  <button onClick={() => updateStatus(a.id, 'Review')}>Mettre en review</button>
                  <button onClick={() => handleDelete(a.id)}>Supprimer</button>
                </div>
              </div>
            );
          })
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

export default ApplicationsTable;
