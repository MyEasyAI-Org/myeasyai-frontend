type DashboardProps = {
  onLogout: () => void;
  onGoHome: () => void;
};

export function Dashboard({ onLogout, onGoHome }: DashboardProps) {
  const handleLogout = async () => {
    try {
      await onLogout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-600 flex flex-col items-center justify-center text-white">
      <div className="text-center space-y-8">
        <h1 className="text-6xl font-bold mb-4">
          Aqui será o dashboard
        </h1>
        
        <p className="text-xl text-blue-100 mb-8">
          Você está logado com sucesso!
        </p>

        <div className="flex gap-4">
          <button
            onClick={onGoHome}
            className="px-6 py-3 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
          >
            Voltar ao Início
          </button>
          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-white text-blue-900 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
          >
            Sair
          </button>
        </div>
      </div>
    </div>
  );
}
