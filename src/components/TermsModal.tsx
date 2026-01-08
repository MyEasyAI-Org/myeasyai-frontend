import { X } from 'lucide-react';

type TermsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function TermsModal({ isOpen, onClose }: TermsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-4xl mx-4 bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 flex-shrink-0">
          <h2 className="text-xl font-semibold text-white">Termos de Uso</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
            aria-label="Fechar"
          >
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        {/* Content - HTML */}
        <div
          className="flex-1 overflow-y-auto p-6 bg-slate-800 text-slate-200"
          onContextMenu={(e) => e.preventDefault()}
        >
          <TermsContent />
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t border-slate-700 bg-slate-900/50 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold hover:from-purple-600 hover:to-blue-600 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

// Componente com o conteudo dos Termos de Uso em HTML (fallback para mobile)
function TermsContent() {
  return (
    <div className="prose prose-invert prose-sm max-w-none">
      <h1 className="text-2xl font-bold text-white mb-4">TERMOS DE USO E POLITICA DE PRIVACIDADE</h1>
      <p className="text-slate-400 mb-6">Ultima atualizacao: Janeiro de 2025</p>

      <section className="mb-6">
        <h2 className="text-xl font-semibold text-purple-400 mb-3">1. ACEITACAO DOS TERMOS</h2>
        <p className="text-slate-300 leading-relaxed">
          Ao acessar e utilizar os servicos da MyEasyAI ("Plataforma"), voce concorda com estes Termos de Uso
          e nossa Politica de Privacidade. Se voce nao concordar com qualquer parte destes termos,
          nao devera usar nossos servicos.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold text-purple-400 mb-3">2. DESCRICAO DOS SERVICOS</h2>
        <p className="text-slate-300 leading-relaxed mb-3">
          A MyEasyAI oferece uma plataforma de inteligencia artificial que permite aos usuarios:
        </p>
        <ul className="list-disc list-inside text-slate-300 space-y-2">
          <li>Criar e personalizar assistentes virtuais de IA</li>
          <li>Gerar sites e landing pages automaticamente</li>
          <li>Integrar assistentes em websites e aplicacoes</li>
          <li>Acessar ferramentas de automacao e produtividade</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold text-purple-400 mb-3">3. CADASTRO E CONTA</h2>
        <p className="text-slate-300 leading-relaxed mb-3">
          Para utilizar nossos servicos, voce devera criar uma conta fornecendo informacoes verdadeiras,
          precisas e completas. Voce e responsavel por:
        </p>
        <ul className="list-disc list-inside text-slate-300 space-y-2">
          <li>Manter a confidencialidade de suas credenciais</li>
          <li>Todas as atividades realizadas em sua conta</li>
          <li>Notificar imediatamente qualquer uso nao autorizado</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold text-purple-400 mb-3">4. PRIVACIDADE E DADOS</h2>
        <p className="text-slate-300 leading-relaxed mb-3">
          Coletamos e processamos dados pessoais de acordo com a Lei Geral de Protecao de Dados (LGPD).
          Isso inclui:
        </p>
        <ul className="list-disc list-inside text-slate-300 space-y-2">
          <li>Dados de identificacao (nome, email, telefone)</li>
          <li>Dados de localizacao (cidade, estado)</li>
          <li>Dados de uso da plataforma</li>
          <li>Preferencias e configuracoes</li>
        </ul>
        <p className="text-slate-300 leading-relaxed mt-3">
          Seus dados sao utilizados exclusivamente para fornecer e melhorar nossos servicos,
          e nunca serao vendidos a terceiros.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold text-purple-400 mb-3">5. USO ACEITAVEL</h2>
        <p className="text-slate-300 leading-relaxed mb-3">
          Voce concorda em nao utilizar a plataforma para:
        </p>
        <ul className="list-disc list-inside text-slate-300 space-y-2">
          <li>Atividades ilegais ou fraudulentas</li>
          <li>Disseminar conteudo ofensivo, difamatorio ou discriminatorio</li>
          <li>Violar direitos de propriedade intelectual</li>
          <li>Distribuir malware ou realizar ataques ciberneticos</li>
          <li>Coletar dados de outros usuarios sem autorizacao</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold text-purple-400 mb-3">6. PROPRIEDADE INTELECTUAL</h2>
        <p className="text-slate-300 leading-relaxed">
          Todo o conteudo da plataforma, incluindo mas nao limitado a textos, graficos, logos,
          icones, imagens, clips de audio, downloads digitais e compilacoes de dados sao propriedade
          da MyEasyAI ou de seus licenciadores e sao protegidos pelas leis de direitos autorais.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold text-purple-400 mb-3">7. PAGAMENTOS E ASSINATURAS</h2>
        <p className="text-slate-300 leading-relaxed">
          Alguns servicos podem requerer pagamento. Ao assinar um plano, voce concorda com os precos
          e termos de cobranca apresentados. Cancelamentos podem ser realizados a qualquer momento,
          mas nao havera reembolso de periodos ja utilizados.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold text-purple-400 mb-3">8. LIMITACAO DE RESPONSABILIDADE</h2>
        <p className="text-slate-300 leading-relaxed">
          A MyEasyAI nao sera responsavel por danos indiretos, incidentais, especiais ou consequenciais
          resultantes do uso ou incapacidade de usar nossos servicos. Nossos servicos sao fornecidos
          "como estao" sem garantias de qualquer tipo.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold text-purple-400 mb-3">9. MODIFICACOES DOS TERMOS</h2>
        <p className="text-slate-300 leading-relaxed">
          Reservamo-nos o direito de modificar estes termos a qualquer momento. Alteracoes significativas
          serao comunicadas por email ou atraves da plataforma. O uso continuado dos servicos apos as
          modificacoes constitui aceitacao dos novos termos.
        </p>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold text-purple-400 mb-3">10. CONTATO</h2>
        <p className="text-slate-300 leading-relaxed">
          Para duvidas sobre estes Termos de Uso ou nossa Politica de Privacidade, entre em contato:
        </p>
        <p className="text-purple-400 mt-2">suporte@myeasyai.com</p>
      </section>

      <section className="mt-8 pt-6 border-t border-slate-700">
        <p className="text-slate-400 text-sm">
          MyEasyAI - Todos os direitos reservados © 2025
        </p>
      </section>
    </div>
  );
}
