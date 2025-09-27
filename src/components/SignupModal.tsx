import { FaApple, FaFacebook, FaGoogle } from 'react-icons/fa';
import { Button } from './Button';
import { Modal } from './Modal';

type SignupModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin?: () => void;
};

export function SignupModal({
  isOpen,
  onClose,
  onSwitchToLogin,
}: SignupModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chega mais!"
      description="Conta nova, possibilidades infinitas. Comece a criar seus assistentes em minutos."
      contentClassName="space-y-6"
    >
      <form className="space-y-4" onSubmit={(event) => event.preventDefault()}>
        <label className="block text-left">
          <span className="mb-1 block text-sm font-medium text-slate-300">
            Como quer ser chamado?
          </span>
          <input
            type="text"
            name="name"
            placeholder="Seu nome"
            required
            className="w-full rounded-lg border border-slate-700 bg-slate-800/60 px-4 py-3 text-slate-100 placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
          />
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
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3 text-slate-200 transition-colors hover:border-purple-500 hover:bg-slate-800"
            aria-label="Cadastro via conta Google"
          >
            <FaGoogle className="h-5 w-5 text-[#ea4335]" aria-hidden="true" />
            <span className="font-medium">Google</span>
          </button>
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3 text-slate-200 transition-colors hover:border-purple-500 hover:bg-slate-800"
            aria-label="Cadastro via conta Apple"
          >
            <FaApple className="h-5 w-5 text-slate-100" aria-hidden="true" />
            <span className="font-medium">Apple</span>
          </button>
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3 text-slate-200 transition-colors hover:border-purple-500 hover:bg-slate-800"
            aria-label="Cadastro via conta Facebook"
          >
            <FaFacebook className="h-5 w-5 text-[#1877f2]" aria-hidden="true" />
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
