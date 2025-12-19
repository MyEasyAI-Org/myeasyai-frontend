import { ArrowRight } from 'lucide-react';
import { Button } from './Button';

type FinalCtaProps = {
  onSignupClick?: () => void;
};

export function FinalCta({ onSignupClick }: FinalCtaProps) {
  return (
    <section className="bg-gradient-to-b from-transparent via-slate-900/20 to-transparent px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="mb-6 text-4xl font-bold md:text-5xl">
          Pronto para criar seu primeiro assistente virtual?
        </h2>
        <p className="mx-auto mb-10 max-w-2xl text-xl text-slate-300">
          Descubra como a IA pode transformar o atendimento do seu negócio e
          economizar horas do seu dia
        </p>
        <div className="mb-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Button variant="primaryLarge" onClick={onSignupClick}>
            <span>Criar minha conta</span>
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
        <p className="text-sm text-slate-400">
          Cadastro em menos de 2 minutos
        </p>
      </div>
    </section>
  );
}
