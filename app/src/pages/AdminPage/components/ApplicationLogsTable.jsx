import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './AdminPageComponents.css';

function ApplicationLogsTable() {
  const [applications, setApplications] = useState([]);
  const fetchApplications = async () => {
    const res = await fetch('/api/applications', { credentials: 'include' });
    if (!res.ok) return;
    const data = await res.json().catch(() => null);
    setApplications(data?.applications || []);
  };
  const [ads, setAds] = useState([]);
  const fetchAds = async () => {
    const res = await fetch('/api/advertisements', { credentials: 'include' });
    if (!res.ok) return;
    const data = await res.json().catch(() => null);
    setAds(data?.advertisements || []);
  };
  const fetchLogs = async () => {
    const res = await fetch('/api/application_logs', { credentials: 'include' });
    if (!res.ok) return;
    const data = await res.json().catch(() => null);
    setLogs(data?.application_logs || []);
  };
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const fetchUsers = async () => {
    const res = await fetch('/api/users', { credentials: 'include' });
    if (!res.ok) return;
    const data = await res.json().catch(() => null);
    setUsers(data?.users || []);
  };
  useEffect(() => {
    fetchLogs();
    fetchUsers();
    fetchAds();
    fetchApplications();
  }, []);
  const [expandedLog, setExpandedLog] = useState(null);

  const handleDelete = async id => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce log ?')) return;
    try {
      const res = await fetch(`/api/application_logs/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        toast.error('Erreur lors de la suppression du log.');
        return;
      }
      await fetchLogs();
      toast.success('Log supprimé avec succès.');
    } catch {
      toast.error('Erreur lors de la suppression du log.');
    }
  };

  const LogRow = ({ log, handleDelete }) => {
    let adTitle = '';
    if (log.application_id) {
      const app = applications.find(a => a.id === log.application_id);
      if (app && app.advertisement_id) {
        const ad = ads.find(ad => ad.id === app.advertisement_id);
        adTitle = ad ? ad.title : '';
      }
    }
    const actor = users.find(u => u.id === log.actor_id);
    const cover = 'cover_letter' in log ? log.cover_letter : null;
    return (
      <div className="list-row">
        <div className="row-main">
          {adTitle ? <strong>Annonce : {adTitle}</strong> : null}
          <div className="muted">
            Status: {log.status || '-'} — Candidat/e: {log.candidate_last_name || '-'}{' '}
            {log.candidate_first_name || ''}
          </div>
          {cover !== null && (
            <div className="muted">
              <strong>Message:</strong>{' '}
              {cover ? (
                expandedLog === log.id ? (
                  <span>{cover}</span>
                ) : (
                  <span>{cover.length > 200 ? `${cover.slice(0, 200)}...` : cover}</span>
                )
              ) : (
                <em>(aucun message)</em>
              )}
              {cover && cover.length > 200 && (
                <button
                  className="link-like"
                  onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                >
                  {expandedLog === log.id ? 'Voir moins' : 'Voir plus'}
                </button>
              )}
            </div>
          )}
          {log.cv && (
            <div className="muted">
              CV:
              {log.cv.startsWith('http') || log.cv.startsWith('/') ? (
                <a href={log.cv} target="_blank" rel="noreferrer">
                  Voir CV
                </a>
              ) : (
                <span>{log.cv}</span>
              )}
            </div>
          )}
          {log.actor_id && (
            <div className="muted">
              Action par: {actor ? `${actor.first_name} ${actor.last_name}` : `#${log.actor_id}`}
            </div>
          )}
          {log.sent_at && <div className="muted">Envoyé le: {log.sent_at}</div>}
        </div>
        <div className="row-actions">
          <button onClick={() => handleDelete(log.id)}>Supprimer</button>
        </div>
      </div>
    );
  };

  // Pagination
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;
  const totalPages = Math.ceil(logs.length / PAGE_SIZE);
  const paginatedLogs = logs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const [query, setQuery] = useState('');
  const filteredLogs = logs.filter(log => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      (log.status || '').toLowerCase().includes(q) ||
      (log.candidate_last_name || '').toLowerCase().includes(q) ||
      (log.candidate_first_name || '').toLowerCase().includes(q)
    );
  });
  const totalPagesFiltered = Math.ceil(filteredLogs.length / PAGE_SIZE);
  const paginatedFilteredLogs = filteredLogs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <section className="admin-section">
      <h3>Journal des candidatures</h3>
      <div style={{ marginBottom: 8 }}>
        <input
          placeholder="Rechercher dans les logs..."
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setPage(1);
          }}
          style={{ padding: '6px 8px', width: '100%', boxSizing: 'border-box' }}
        />
      </div>
      <div className="entity-list simple-list">
        {filteredLogs.length === 0 ? (
          <p>Aucun log.</p>
        ) : (
          paginatedFilteredLogs.map(l => <LogRow key={l.id} log={l} handleDelete={handleDelete} />)
        )}
      </div>
      {totalPagesFiltered > 1 && (
        <div className="pagination-controls">
          <button disabled={page === 1} onClick={() => setPage(page - 1)}>
            Précédent
          </button>
          <span style={{ margin: '0 8px' }}>
            Page {page} / {totalPagesFiltered}
          </span>
          <button disabled={page === totalPagesFiltered} onClick={() => setPage(page + 1)}>
            Suivant
          </button>
        </div>
      )}
    </section>
  );
}

export default ApplicationLogsTable;
