'use client';

import React from 'react';
import { BookOpen, Users, Target } from 'lucide-react';

interface WelcomeProps {
  onLogin: () => void;
  onRegister: () => void;
}

export const Welcome: React.FC<WelcomeProps> = ({ onLogin, onRegister }) => {
  return (
    <div className="welcome-container">
      <div className="welcome-card">
        <div className="welcome-icon">
          <BookOpen size={64} />
        </div>
        <h1>Gabarita ENEM</h1>
        <p>
          Prepare-se para o ENEM com nossa plataforma completa de estudos. 
          Simulados, videoaulas e acompanhamento de desempenho.
        </p>
        
        <div className="welcome-features">
          <div className="feature">
            <Target size={24} />
            <span>Simulados Personalizados</span>
          </div>
          <div className="feature">
            <BookOpen size={24} />
            <span>Videoaulas Exclusivas</span>
          </div>
          <div className="feature">
            <Users size={24} />
            <span>Acompanhamento Individual</span>
          </div>
        </div>

        <div className="welcome-actions">
          <button 
            className="welcome-btn primary" 
            onClick={onLogin}
          >
            Entrar
          </button>
          <button 
            className="welcome-btn secondary" 
            onClick={onRegister}
          >
            Criar Conta
          </button>
        </div>
      </div>
    </div>
  );
};