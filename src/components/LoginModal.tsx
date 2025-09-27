import { FaApple, FaFacebook, FaGoogle } from 'react-icons/fa';
import { Button } from './Button';
import { Modal } from './Modal';

type LoginModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignup?: () => void;
};

export function LoginModal({
  isOpen,
  onClose,
  onSwitchToSignup,
}: LoginModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bem-vindo de volta"
      description="Entre e continue criando experiencias incriveis com a MyEasyAI."
      contentClassName="space-y-6"
    >
      <form className="space-y-4" onSubmit={(event) => event.preventDefault()}>
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
            placeholder="Digite sua senha"
            required
            className="w-full rounded-lg border border-slate-700 bg-slate-800/60 px-4 py-3 text-slate-100 placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
          />
        </label>

        <div className="flex justify-center">
          <Button variant="log">Entrar</Button>
        </div>
      </form>

      <div>
        <span className="mb-3 block text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
          ou acesse com
        </span>

        <div className="space-y-3">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3 text-slate-200 transition-colors hover:border-purple-500 hover:bg-slate-800"
            aria-label="Login via conta Google"
          >
            <FaGoogle className="h-5 w-5 text-[#ea4335]" aria-hidden="true" />
            <span className="font-medium">Google</span>
          </button>
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3 text-slate-200 transition-colors hover:border-purple-500 hover:bg-slate-800"
            aria-label="Login via conta Apple"
          >
            <FaApple className="h-5 w-5 text-slate-100" aria-hidden="true" />
            <span className="font-medium">Apple</span>
          </button>
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3 text-slate-200 transition-colors hover:border-purple-500 hover:bg-slate-800"
            aria-label="Login via conta Facebook"
          >
            <FaFacebook className="h-5 w-5 text-[#1877f2]" aria-hidden="true" />
            <span className="font-medium">Facebook</span>
          </button>
        </div>
      </div>

      {onSwitchToSignup ? (
        <p className="text-center text-sm text-slate-400">
          Ainda nao faz parte da comunidade?{' '}
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="font-medium text-purple-400 transition-colors hover:text-purple-300"
          >
            Crie sua conta agora
          </button>
        </p>
      ) : null}
    </Modal>
  );
}
