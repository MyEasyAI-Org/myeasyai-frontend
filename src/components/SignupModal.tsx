import {
  signInWithFacebook,
  signInWithGoogle,
  signUpWithEmail,
} from '../lib/supabase';
import { Button } from './Button';
import { Modal } from './Modal';

type SubscriptionPlan = 'free' | 'basic' | 'pro' | 'enterprise';

type SignupModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin?: () => void;
  selectedPlan?: SubscriptionPlan | null;
};

export function SignupModal({
  isOpen,
  onClose,
  onSwitchToLogin,
  selectedPlan,
}: SignupModalProps) {
  const handleEmailSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const fullName = formData.get('fullName') as string;
    const preferredName = formData.get('preferredName') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      alert('As senhas não coincidem!');
      return;
    }

    // Validar nome completo
    if (fullName.trim().split(' ').length < 2) {
      alert('Por favor, digite seu nome completo (nome e sobrenome)');
      return;
    }

    try {
      const { error } = await signUpWithEmail(email, password, fullName, preferredName);
      if (error) {
        alert(`Erro ao criar conta: ${error.message}`);
        return;
      }
      
      // Se há um plano selecionado, salvar para vincular depois do login
      if (selectedPlan) {
        localStorage.setItem('selectedPlan', selectedPlan);
      }
      
      alert('Conta criada com sucesso! Verifique seu email para confirmar.');
      // O modal será fechado automaticamente pelo listener de auth no App.tsx
    } catch (error) {
      alert(`Erro inesperado: ${error}`);
    }
  };

  const handleSocialSignup = async (
    provider: 'google' | 'facebook' | 'apple',
  ) => {
    try {
      let result;
      switch (provider) {
        case 'google':
          result = await signInWithGoogle();
          break;
        case 'facebook':
          result = await signInWithFacebook();
          break;
        case 'apple':
          alert('Cadastro com Apple não está disponível no momento.');
          return;
      }

      if (result.error) {
        alert(`Erro ao cadastrar com ${provider}: ${result.error.message}`);
        return;
      }
      
      // Se há um plano selecionado, salvar para vincular depois do login
      if (selectedPlan) {
        localStorage.setItem('selectedPlan', selectedPlan);
      }
      
      // O modal será fechado automaticamente pelo listener de auth no App.tsx
    } catch (error) {
      alert(`Erro inesperado: ${error}`);
    }
  };
  const getModalTitle = () => {
    if (selectedPlan) {
      const planNames = {
        free: 'Plano Free',
        basic: 'Plano Basic',
        pro: 'Plano Pro',
        enterprise: 'Plano Enterprise'
      };
      return `Cadastre-se no ${planNames[selectedPlan]}`;
    }
    return "Chega mais!";
  };

  const getModalDescription = () => {
    if (selectedPlan) {
      return `Crie sua conta para começar a usar o ${selectedPlan.toUpperCase()} e aproveitar todos os benefícios.`;
    }
    return "Conta nova, possibilidades infinitas. Comece a criar seus assistentes em minutos.";
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getModalTitle()}
      description={getModalDescription()}
      contentClassName="space-y-6"
    >
      <form className="space-y-4" onSubmit={handleEmailSignup}>
        <label className="block text-left">
          <span className="mb-1 block text-sm font-medium text-slate-300">
            Seu nome completo *
          </span>
          <input
            type="text"
            name="fullName"
            placeholder="Ex: João Silva Santos"
            required
            className="w-full rounded-lg border border-slate-700 bg-slate-800/60 px-4 py-3 text-slate-100 placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
          />
        </label>

        <label className="block text-left">
          <span className="mb-1 block text-sm font-medium text-slate-300">
            Como quer ser chamado?
          </span>
          <input
            type="text"
            name="preferredName"
            placeholder="Ex: João, Joãozinho, JJ..."
            className="w-full rounded-lg border border-slate-700 bg-slate-800/60 px-4 py-3 text-slate-100 placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
          />
          <span className="text-xs text-slate-500 mt-1">Escreva um nome amigável para usarmos com você 😊</span>
        </label>

        <label className="block text-left">
          <span className="mb-1 block text-sm font-medium text-slate-300">
            Seu e-mail
          </span>
          <input
            type="email"
            name="email"
            placeholder="seuemail@dominio.com"
            required
            className="w-full rounded-lg border border-slate-700 bg-slate-800/60 px-4 py-3 text-slate-100 placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
          />
        </label>

        <label className="block text-left">
          <span className="mb-1 block text-sm font-medium text-slate-300">
            Senha secreta
          </span>
          <input
            type="password"
            name="password"
            placeholder="Crie uma senha segura"
            required
            className="w-full rounded-lg border border-slate-700 bg-slate-800/60 px-4 py-3 text-slate-100 placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
          />
        </label>

        <label className="block text-left">
          <span className="mb-1 block text-sm font-medium text-slate-300">
            Confirme a senha
          </span>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Repita sua senha"
            required
            className="w-full rounded-lg border border-slate-700 bg-slate-800/60 px-4 py-3 text-slate-100 placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
          />
        </label>

        <div className="flex justify-center">
          <Button variant="log">Criar conta</Button>
        </div>
      </form>

      <div>
        <span className="mb-3 block text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
          ou siga com
        </span>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => handleSocialSignup('google')}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3 text-slate-200 transition-colors hover:border-purple-500 hover:bg-slate-800"
            aria-label="Cadastro via conta Google"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="font-medium">Google</span>
          </button>
          {/* <button
            type="button"
            onClick={() => handleSocialSignup('apple')}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3 text-slate-200 transition-colors hover:border-purple-500 hover:bg-slate-800"
            aria-label="Cadastro via conta Apple"
          >
            <FaApple className="h-5 w-5 text-slate-100" aria-hidden="true" />
            <span className="font-medium">Apple</span>
          </button> */}
          <button
            type="button"
            onClick={() => handleSocialSignup('facebook')}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3 text-slate-200 transition-colors hover:border-purple-500 hover:bg-slate-800"
            aria-label="Cadastro via conta Facebook"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
              <circle fill="#1877f2" cx="12" cy="12" r="12" />
              <path
                fill="#ffffff"
                d="M15.8 12.7h-2.6v9.3h-3.8v-9.3H7.5V9.4h1.9V7.2c0-1.6.7-4 4-4l3 .012v3.3h-2.2c-.4 0-.9.2-.9.9v2h3.1l-.6 3.3z"
              />
            </svg>
            <span className="font-medium">Facebook</span>
          </button>
        </div>
      </div>

      {onSwitchToLogin ? (
        <p className="text-center text-sm text-slate-400">
          Ja esta com a gente?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-medium text-purple-400 transition-colors hover:text-purple-300"
          >
            Entre por aqui
          </button>
        </p>
      ) : null}
    </Modal>
  );
}
