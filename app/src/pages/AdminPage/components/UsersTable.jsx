import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './AdminPageComponents.css';

function UsersTable() {
  const [users, setUsers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [query, setQuery] = useState('');
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: '',
    is_admin: false,
  });

  const fetchUsers = async () => {
    const res = await fetch('/api/users', { credentials: 'include' });
    if (!res.ok) return;
    const data = await res.json();
    setUsers(data.users || []);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `/api/users/${editing}` : '/api/users';
    const payload = { ...form };
    if (!editing) payload.password_hash = 'placeholder';

    try {
      const res = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.status === 403) {
        window.location.href = '/login';
        return;
      }
      if (!res.ok) {
        toast.error("Erreur lors de la modification ou l'ajout de l'utilisateur.");
        return;
      }
      await fetchUsers();
      setEditing(null);
      setForm({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        role: '',
        is_admin: false,
      });
      toast.success(
        editing ? 'Utilisateur modifié avec succès.' : 'Utilisateur ajouté avec succès.'
      );
    } catch {
      toast.error("Erreur lors de la modification ou l'ajout de l'utilisateur.");
    }
  };

  const handleEdit = u => {
    setForm({
      first_name: u.first_name || '',
      last_name: u.last_name || '',
      email: u.email || '',
      phone: u.phone || '',
      role: u.role || '',
      is_admin: !!u.is_admin,
    });
    setEditing(u.id);
  };
  const handleDelete = async id => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;
    await fetch(`/api/users/${id}`, { method: 'DELETE', credentials: 'include' });
    await fetchUsers();
    toast.success('Utilisateur supprimé avec succès.');
  };

  // Pagination
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;
  const filteredUsers = users
    .filter(u => u.email !== 'admin@jobconnect.fr')
    .filter(u => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      const name = (u.first_name || '') + ' ' + (u.last_name || '');
      return (
        name.toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.role || '').toLowerCase().includes(q)
      );
    });
  const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE);
  const paginatedUsers = filteredUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <section className="admin-section">
      <div style={{ marginBottom: 8 }}>
        <input
          placeholder="Rechercher un utilisateur..."
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setPage(1);
          }}
          style={{ padding: '6px 8px', width: '100%', boxSizing: 'border-box' }}
        />
      </div>
      <h3>{editing ? 'Modifier un utilisateur' : 'Ajouter un utilisateur'}</h3>
      <form className="crud-form" onSubmit={handleSubmit}>
        <input
          name="first_name"
          placeholder="Prénom"
          value={form.first_name}
          onChange={handleChange}
          required
        />
        <input
          name="last_name"
          placeholder="Nom"
          value={form.last_name}
          onChange={handleChange}
          required
        />
        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input name="phone" placeholder="Téléphone" value={form.phone} onChange={handleChange} />
        <select name="role" value={form.role} onChange={handleChange} required>
          <option value="">-- Choisir un rôle --</option>
          <option value="responsible">Responsable</option>
          <option value="candidate">Candidat</option>
        </select>
        <label className="checkbox-row">
          <input name="is_admin" type="checkbox" checked={form.is_admin} onChange={handleChange} />{' '}
          Admin
        </label>
        <div className="form-actions">
          <button type="submit">{editing ? 'Modifier' : 'Ajouter'}</button>
          {editing && (
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setForm({
                  first_name: '',
                  last_name: '',
                  email: '',
                  phone: '',
                  role: '',
                  is_admin: false,
                });
              }}
            >
              Annuler
            </button>
          )}
        </div>
      </form>

      <div className="entity-list simple-list">
        {filteredUsers.length === 0 ? (
          <p>Aucun utilisateur.</p>
        ) : (
          paginatedUsers.map(u => (
            <div key={u.id} className="list-row">
              <div className="row-main">
                <strong>
                  {u.first_name} {u.last_name}
                </strong>
                <div className="muted">
                  {u.email} — {u.role} {u.is_admin ? '(admin)' : ''}
                  {u.cv ? (
                    <span>
                      {' '}
                      —{' '}
                      <a href={u.cv} target="_blank" rel="noreferrer">
                        CV
                      </a>
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="row-actions">
                <button onClick={() => handleEdit(u)}>Modifier</button>
                <button onClick={() => handleDelete(u.id)}>Supprimer</button>
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

export default UsersTable;
