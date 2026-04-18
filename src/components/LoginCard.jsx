import React from 'react';

const LoginCard = () => {
  return (
    <div className="login-card">
      <div className="login-card__header">
        <h1 className="login-card__title">Iniciar Sesión</h1>
      </div>
      
      <div className="login-card__body">
        <form className="login-card__form">
          <div className="login-card__form-group">
            <label htmlFor="email" className="login-card__label">
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              className="login-card__input"
              placeholder="tu@email.com"
              required
            />
          </div>

          <div className="login-card__form-group">
            <label htmlFor="password" className="login-card__label">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              className="login-card__input"
              placeholder="Ingresa tu contraseña"
              required
            />
          </div>

          <div className="login-card__options">
            <label className="login-card__checkbox">
              <input type="checkbox" className="login-card__checkbox-input" />
              <span>Recuérdame</span>
            </label>
            <a href="/forgot-password" className="login-card__link">
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <button type="submit" className="login-card__button">
            Iniciar Sesión
          </button>
        </form>
      </div>

      <div className="login-card__footer">
        <p className="login-card__footer-text">
          ¿No tienes cuenta?{' '}
          <a href="/sign-up" className="login-card__link-primary">
            Regístrate aquí
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginCard;
