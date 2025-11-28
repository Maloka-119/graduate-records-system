import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../../i18n/i18n';
import { Flag, User ,Globe} from 'lucide-react';
import './Register.css'
import { BASE_URL } from "../../component/api"

const Register = ({ onSwitchToLogin }) => {
  const [credentials, setCredentials] = useState({
    fullName: '',
    email: '',
    nationalId: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const { t, i18n } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { fullName, email, nationalId, phone, password, confirmPassword } = credentials;

    if (!fullName || !email || !nationalId || !phone || !password || !confirmPassword) {
      alert('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fullName,
          email,
          nationalId,
          phone,
          password
        })
      });      

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.message || 'Registration failed');
        setLoading(false);
        return;
      }

      alert('Account created successfully! Please log in.');
      onSwitchToLogin();
    } catch (error) {
      console.error('Registration error:', error);
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
            <h1>{t('registerTitle')}</h1>
            <p>{t('registerSub')}</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>{t('fullName')}</label>
              <input
                type="text"
                value={credentials.fullName}
                onChange={(e) => setCredentials({ ...credentials, fullName: e.target.value })}
                placeholder={t('fullNamePlaceholder')}
              />
            </div>

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
              <label>{t('nationalId')}</label>
              <input
                type="text"
                value={credentials.nationalId}
                onChange={(e) => setCredentials({ ...credentials, nationalId: e.target.value })}
                placeholder={t('nationalIdPlaceholder')}
              />
            </div>

            <div className="form-group">
              <label>{t('phone')}</label>
              <input
                type="text"
                value={credentials.phone}
                onChange={(e) => setCredentials({ ...credentials, phone: e.target.value })}
                placeholder={t('phonePlaceholder')} 
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

            <div className="form-group">
              <label>{t('confirmPassword')}</label>
              <input
                type="password"
                value={credentials.confirmPassword}
                onChange={(e) => setCredentials({ ...credentials, confirmPassword: e.target.value })}
                placeholder={t('confirmPasswordPlaceholder')}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? t('registering') : t('signup')}
            </button>

            <div className="auth-switch">
              <button type="button" onClick={onSwitchToLogin} className="link-button">
              {t('haveAccount')} {t('login')}
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

export default Register;
