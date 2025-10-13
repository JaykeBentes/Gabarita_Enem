import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TabMenu } from './components/UI/tabs';
import { Login } from './components/Auth/Login';
import { Register } from './components/Auth/Register';
import { Welcome } from './components/Welcome/Welcome';
import { ModificarSenha } from './components/Auth/ModificarSenha';
import './index.css';
import './App.css';

function AppContent() {
    const { user, logout, isAuthenticated } = useAuth();
    const [authMode, setAuthMode] = useState('welcome');

    if (!isAuthenticated) {
        if (authMode === 'welcome') {
            return (
                <Welcome 
                    onLogin={() => setAuthMode('login')}
                    onRegister={() => setAuthMode('register')}
                />
            );
        }
        
        return (
            <div>
                {authMode === 'login' ? (
                                <Login
                                    onSwitchToRegister={() => setAuthMode('register')}
                                    onSwitchToModificarSenha={() => setAuthMode('modificarsenha')}
                                />
                            ) : authMode === 'register' ? (
                                <Register
                                    onSwitchToLogin={() => setAuthMode('login')}
                                />
                            ) : (
                                <ModificarSenha
                                    onSwitchToLogin={() => setAuthMode('login')}
                                />
                            )}
            </div>
        );
    }

    return (
        <div className="app-container">
            <header>
                <div>
                    <h1 className="titulo">Gabarita ENEM</h1>
                    <button onClick={logout} className="logout-button">
                        Sair
                    </button>
                </div>
            </header>
            <main>
                <TabMenu />
            </main>
        </div>
    );
}

export function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}
    
export default App;

