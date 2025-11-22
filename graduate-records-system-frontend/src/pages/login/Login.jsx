import React, { useState } from 'react';
import { User } from 'lucide-react';
import './Login.css';
import { useTranslation } from 'react-i18next';
import '../../i18n/i18n';
import { Flag,Globe } from 'lucide-react';

const Login = ({ onLogin, onSwitchToRegister }) => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { t, i18n } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { email, password } = credentials;

    if (!email || !password) {
      alert('Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || 'Invalid email or password');
        setLoading(false);
        return;
      }

      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }

      onLogin(data.user || email);
    } catch (error) {
      console.error('Login error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-icon">
              <User className="icon" />
            </div>
            <h1>{t('loginTitle')}</h1>
            <p>{t('loginSub')}</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>{t('email')}</label>
              <input
                type="email"
                value={credentials.email}
                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                placeholder={t('emailPlaceholder')}
              />
            </div>

            <div className="form-group">
              <label>{t('password')}</label>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                placeholder={t('passwordPlaceholder')}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? t('loggingIn') : t('loginBtn')}
            </button>

            <div className="auth-switch">
              <button type="button" onClick={onSwitchToRegister} className="link-button">
              {t('noAccount')} {t('signup')}
              </button>
            </div>
          </form>
          
        </div>
        <div className="lang-switch">
  <button 
    className="icon-btn" 
    onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'ar' : 'en')}
  >
    <Globe size={20} /> {i18n.language === 'en' ? 'AR' : 'EN'}
  </button>
</div>

      </div>
    </div>
  );
};

export default Login;
