import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './RegisterPage.css';

function RegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('candidate');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const submit = async e => {
    e.preventDefault();
    setError(null);

    if (!firstName || !lastName || !email || !password || !role) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    try {
      const body = {
        first_name: firstName,
        last_name: lastName,
        email,
        password_hash: password,
        role,
        phone: phone || null,
      };

      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.status === 201) {
        navigate('/login');
        return;
      }

      const data = await res.json().catch(() => ({}));
      setError(data?.message || "Erreur lors de l'inscription");
    } catch (e) {
      setError(e.message || 'Erreur réseau');
    }
  };

  return (
    <main className="login-page">
      <section>
        <h1>Inscription</h1>
        <p>Créez votre compte</p>
        <form onSubmit={submit} method="post">
          <fieldset>
            <div>
              <label htmlFor="firstName">Prénom</label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                placeholder="Prénom"
                required
                autoComplete="given-name"
              />
            </div>

            <div>
              <label htmlFor="lastName">Nom</label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                placeholder="Nom"
                required
                autoComplete="family-name"
              />
            </div>

            <div>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="ex: ahmed@gmail.com"
                required
                autoComplete="email"
                inputMode="email"
              />
            </div>

            <div>
              <label htmlFor="password">Mot de passe</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Votre mot de passe"
                required
                autoComplete="new-password"
              />
            </div>

            <div>
              <label htmlFor="role">Rôle</label>
              <select id="role" value={role} onChange={e => setRole(e.target.value)}>
                <option value="candidate">Candidat</option>
                <option value="responsible">Entreprise</option>
              </select>
            </div>

            <div>
              <label htmlFor="phone">Téléphone (optionnel)</label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="Ex: +33 6 12 34 56 78"
                autoComplete="tel"
              />
            </div>
          </fieldset>

          <Link to="/login">
            <p>
              Vous avez déjà un compte ? <span>Connectez-vous</span>
            </p>
          </Link>

          {error && (
            <p className="alert error" role="alert" aria-live="assertive">
              Erreur lors de la création de votre compte
            </p>
          )}

          <button type="submit">S'inscrire</button>
        </form>
      </section>
    </main>
  );
}

export default RegisterPage;
