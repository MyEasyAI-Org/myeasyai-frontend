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
      description="Entre e continue criando experiências incríveis com a MyEasyAI!"
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M21.35 11.1H12v2.8h5.3c-.23 1.2-1.4 3.5-5.3 3.5A6.1 6.1 0 1 1 17.1 7.5l2-2a9.1 9.1 0 1 0 2.25 7.6Z"
                fill="#4285F4"
              />
            </svg>
            <span className="font-medium">Google</span>
          </button>
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3 text-slate-200 transition-colors hover:border-purple-500 hover:bg-slate-800"
            aria-label="Login via conta Apple"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="text-slate-100"
            >
              <path d="M16.61 2c-.92.06-2 1-2.64 1.8-.58.72-1.08 1.8-.89 2.83 1.02.03 2.08-.59 2.71-1.38.62-.78 1.08-1.88.82-3.25ZM20.47 17.1c-.51 1.16-.76 1.67-1.43 2.69-.93 1.43-2.23 3.22-3.85 3.24-1.43.02-1.8-.93-3.75-.92-1.95 0-2.36.94-3.78.92-1.62-.02-2.86-1.62-3.8-3.05-2.6-3.97-2.87-8.63-1.27-11.11 1.13-1.76 3.12-2.79 4.92-2.79 1.82 0 2.97.94 4.48.94 1.47 0 2.35-.94 4.48-.94 1.63 0 3.36.89 4.48 2.44-3.93 2.16-3.27 7.8.52 9.48Z" />
            </svg>
            <span className="font-medium">Apple</span>
          </button>
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3 text-slate-200 transition-colors hover:border-purple-500 hover:bg-slate-800"
            aria-label="Login via conta Facebook"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="text-blue-500"
            >
              <path d="M22 12a10 10 0 1 0-11.5 9.87v-6.99H7.9V12h2.6v-1.8c0-2.57 1.53-3.99 3.87-3.99 1.12 0 2.3.2 2.3.2v2.53h-1.3c-1.28 0-1.68.8-1.68 1.62V12h2.84l-.45 2.88h-2.4v6.99A10 10 0 0 0 22 12Z" />
            </svg>
            <span className="font-medium">Facebook</span>
          </button>
        </div>
      </div>

      {onSwitchToSignup ? (
        <p className="text-center text-sm text-slate-400">
          Ainda não faz parte da comunidade?{' '}
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
