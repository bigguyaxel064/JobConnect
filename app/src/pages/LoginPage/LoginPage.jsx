import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './LoginPage.css';

function LoginPage({ onLogin }) {
  const [identifiant, setIdentifiant] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { setUser, setIsLogged } = useAuth();

  const submit = e => {
    e.preventDefault();
    setError(null);

    const body = new URLSearchParams({ identifiant, password });

    fetch('/api/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    })
      .then(res => {
        if (!res.ok) {
          return res
            .text()
            .catch(() => '')
            .then(text => {
              throw new Error(text || 'Échec de connexion');
            });
        }
        return res.text().then(() => res);
      })
      .then(() => fetch('/api/session', { credentials: 'include' }))
      .then(me => {
        if (!me.ok) {
          throw new Error('Échec lors de la récupération de la session');
        }
        return me.json();
      })
      .then(data => {
        const user = data?.user || null;
        setUser(user);
        setIsLogged(Boolean(user));
        onLogin && onLogin(user);
        if (user?.is_admin) {
          navigate('/admin');
        } else {
          navigate('/');
        }
      })
      .catch(e => {
        setError(e.message);
      });
  };

  return (
    <main className="login-page">
      <section>
        <h1>Connexion</h1>
        <p>Accédez à votre espace</p>
        <form onSubmit={submit} method="post">
          <fieldset>
            <div>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={identifiant}
                onChange={e => setIdentifiant(e.target.value)}
                placeholder="ex: ahmed@gmail.com"
                required
                autoComplete="username"
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
                autoComplete="current-password"
              />
            </div>
          </fieldset>
          <Link to="/register">
            <p>
              Vous n'avez pas de compte ? <span>Inscrivez-vous</span>
            </p>
          </Link>
          {error && (
            <p className="alert error" role="alert" aria-live="assertive">
              Email ou mot de passe invalide
            </p>
          )}
          <button type="submit">Se connecter</button>
        </form>
      </section>
    </main>
  );
}

export default LoginPage;
