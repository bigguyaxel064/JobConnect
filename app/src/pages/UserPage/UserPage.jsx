import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './UserPage.css';

function UserPage() {
  const { user: currentUser, isLoading: authLoading, setUser } = useAuth();
  const { user_id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: '',
    cv: null,
  });
  const [applications, setApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(true);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!authLoading) {
      if (!currentUser) {
        navigate('/login');
        return;
      }
      if (String(currentUser.id) !== String(user_id)) {
        navigate('/');
      }
    }
  }, [authLoading, currentUser, user_id, navigate]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/user/${user_id}`, { credentials: 'include' });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.message || 'Failed to load user');
        }
        const data = await res.json();
        if (!mounted) return;
        const u = data.user || {};
        setForm({
          first_name: u.first_name || '',
          last_name: u.last_name || '',
          email: u.email || '',
          phone: u.phone || '',
          role: u.role || '',
          cv: u.cv || null,
        });
      } catch (err) {
        if (!mounted) return;
        setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [user_id]);

  useEffect(() => {
    let mounted = true;
    async function loadApplications() {
      setLoadingApplications(true);
      try {
        const res = await fetch(`/api/applications/user/${user_id}`, { credentials: 'include' });
        if (!res.ok) {
          setApplications([]);
          return;
        }
        const data = await res.json();
        if (!mounted) return;
        setApplications(data.applications || []);
      } catch {
        if (!mounted) return;
        setApplications([]);
      } finally {
        if (mounted) setLoadingApplications(false);
      }
    }
    loadApplications();
    return () => {
      mounted = false;
    };
  }, [user_id]);

  function handleChange(e) {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      const f = files[0];
      setForm(prev => ({ ...prev, cv: f }));
      return;
    }
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone,
        role: form.role,
      };

      const res = await fetch(`/api/users/${user_id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || 'Failed to save');

      const u = data.user || {};
      setForm(f => ({ ...f, cv: u.cv || f.cv }));
      try {
        setUser?.(u);
      } catch {
        //
      }
      setError('Sauvegarde réussie');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!form.cv || typeof form.cv === 'string') {
      setError('Sélectionnez un fichier PDF à uploader');
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('file', form.cv);

      const res = await fetch(`/api/users/${user_id}/cv`, {
        method: 'PUT',
        credentials: 'include',
        body: fd,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || data?.error || 'Upload failed');

      // Update cv path (server returns url)
      setForm(f => ({ ...f, cv: data.cv }));
      setError('CV uploadé avec succès');
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  if (loading || authLoading) {
    return (
      <main className="user-page">
        <p>Loading…</p>
      </main>
    );
  }

  return (
    <main className="user-page">
      <h1>Mon profil</h1>
      {error && <div className="user-error">{error}</div>}

      <form className="user-form" onSubmit={handleSave}>
        <label>
          Prénom
          <input name="first_name" value={form.first_name} onChange={handleChange} />
        </label>
        <label>
          Nom
          <input name="last_name" value={form.last_name} onChange={handleChange} />
        </label>
        <label>
          Email
          <input name="email" value={form.email} onChange={handleChange} />
        </label>
        <label>
          Téléphone
          <input name="phone" value={form.phone} onChange={handleChange} />
        </label>
        <label>
          Rôle
          <input name="role" value={form.role} onChange={handleChange} />
        </label>

        <div className="form-actions">
          <button type="submit" disabled={saving}>
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </form>

      <section className="cv-section">
        <h2>CV</h2>
        {form.cv && typeof form.cv === 'string' ? (
          <p>
            CV actuel:{' '}
            <a href={form.cv} target="_blank" rel="noreferrer">
              Voir le CV
            </a>
          </p>
        ) : (
          <p>Aucun CV enregistré</p>
        )}

        <form className="upload-form" onSubmit={handleUpload}>
          <div className="file-input-wrapper">
            <input
              ref={fileInputRef}
              className="real-file-input"
              type="file"
              accept="application/pdf"
              onChange={handleChange}
              name="file"
            />
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => fileInputRef.current?.click()}
            >
              Choisir un fichier
            </button>
            <span className="file-name">
              {form.cv && typeof form.cv !== 'string' ? form.cv.name : ''}
            </span>
          </div>

          <div className="file-preview-area">
            {form.cv && typeof form.cv === 'string' ? (
              <p>
                CV disponible:{' '}
                <a href={form.cv} target="_blank" rel="noreferrer">
                  Ouvrir le CV
                </a>
              </p>
            ) : form.cv && typeof form.cv !== 'string' ? (
              <p>Fichier sélectionné: {form.cv?.name || 'aperçu local'}</p>
            ) : (
              <p className="no-cv">Aucun CV sélectionné</p>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" disabled={uploading}>
              {uploading ? 'Upload…' : 'Uploader le CV (PDF)'}
            </button>
          </div>
        </form>
      </section>

      <section className="applications-section">
        <h2>Mes candidatures</h2>
        {loadingApplications ? (
          <p>Chargement des candidatures…</p>
        ) : applications.length === 0 ? (
          <p>Aucune candidature trouvée.</p>
        ) : (
          <ul className="applications-list">
            {applications.map(app => (
              <li key={app.id} className="application-item">
                <strong>{app.status}</strong> – Poste #{app.advertisement_id} <br />
                <span>
                  Date: {app.apply_date ? new Date(app.apply_date).toLocaleDateString() : '—'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

export default UserPage;
