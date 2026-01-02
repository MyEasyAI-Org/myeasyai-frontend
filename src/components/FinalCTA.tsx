import { ArrowRight } from 'lucide-react';
import { Button } from './Button';

type FinalCtaProps = {
  onSignupClick?: () => void;
};

export function FinalCta({ onSignupClick }: FinalCtaProps) {
  return (
    <section className="bg-gradient-to-b from-transparent via-slate-900/20 to-transparent px-4 py-10 sm:py-12 md:py-16 lg:py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="mb-3 sm:mb-4 md:mb-6 text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight">
          Pronto para criar seu primeiro assistente virtual?
        </h2>
        <p className="mx-auto mb-6 sm:mb-8 md:mb-10 max-w-2xl text-sm sm:text-base md:text-lg lg:text-xl text-slate-300">
          Descubra como a IA pode transformar o atendimento do seu negócio e
          economizar horas do seu dia
        </p>
        <div className="mb-4 sm:mb-6 md:mb-8 flex flex-col justify-center gap-3 sm:gap-4 sm:flex-row">
          <Button variant="primaryLarge" onClick={onSignupClick} className="w-full sm:w-auto">
            <span className="text-sm sm:text-base">Criar minha conta</span>
            <ArrowRight className="ml-1.5 sm:ml-2 h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
        <p className="text-[10px] sm:text-xs md:text-sm text-slate-400">
          Cadastro em menos de 2 minutos
        </p>
      </div>
    </section>
  );
}
