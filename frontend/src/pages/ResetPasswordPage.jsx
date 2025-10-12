import { useNavigate } from 'react-router-dom';
import { ResetPassword } from '../components/Auth/ResetPassword';
import '../App.css';

export function ResetPasswordPage() {
  const navigate = useNavigate();

  const handleSwitchToLogin = () => {
    navigate('/');
  };

  return (
    <div>
      <header>
        <div style={{ justifyContent: 'center' }}>
          <h1 className="titulo">Gabarita ENEM</h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="auth-container" style={{ paddingTop: '2rem' }}>
          <ResetPassword onSwitchToLogin={handleSwitchToLogin} />
        </div>
      </main>
    </div>
  );
}