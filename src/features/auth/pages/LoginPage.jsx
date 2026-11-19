import { useNavigate } from 'react-router-dom'
import AuthForm from '../components/AuthForm.jsx'
import AuthIntro from '../components/AuthIntro.jsx'
import '../components/AuthModal.css'
import './LoginPage.css'

export default function LoginPage() {
  const navigate = useNavigate()

  return (
    <div className="frame login-page auth-layout">
      <AuthForm onComplete={() => navigate('/licitaciones')} />
      <AuthIntro />
    </div>
  )
}
