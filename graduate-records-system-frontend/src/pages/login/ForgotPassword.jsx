// ForgotPassword.jsx
import React, { useState } from 'react';
import './Login.css';
import { useTranslation } from 'react-i18next';
import { BASE_URL } from "../../component/api";

const ForgotPassword = ({ onBackToLogin }) => {
  const { t, i18n } = useTranslation();
  const [form, setForm] = useState({ nationalId: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { nationalId, newPassword, confirmPassword } = form;

    if (!nationalId || !newPassword || !confirmPassword) {
      alert(t('fillAllFields'));
      return;
    }

    if (newPassword !== confirmPassword) {
      alert(t('passwordsDoNotMatch'));
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nationalId, newPassword })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || t('failedReset'));
      } else {
        alert(t('resetSuccess'));
        onBackToLogin();
      }
    } catch (error) {
      console.error('Reset password error:', error);
      alert(t('somethingWentWrong'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="auth-container">
        <div className="auth-card">
          <h2>{t('resetPassword')}</h2>
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>{t('nationalId')}</label>
              <input
                type="text"
                value={form.nationalId}
                onChange={(e) => setForm({ ...form, nationalId: e.target.value })}
                placeholder={t('nationalIdPlaceholder')}
              />
            </div>

            <div className="form-group">
              <label>{t('newPassword')}</label>
              <input
                type="password"
                value={form.newPassword}
                onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                placeholder={t('newPasswordPlaceholder')}
              />
            </div>

            <div className="form-group">
              <label>{t('confirmPassword')}</label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                placeholder={t('confirmPasswordPlaceholder')}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? t('loading') : t('resetPasswordBtn')}
            </button>

            <div className="auth-switch">
              <button type="button" onClick={onBackToLogin} className="link-button">
                {t('backToLogin')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
