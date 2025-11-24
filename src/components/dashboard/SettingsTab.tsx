export function SettingsTab() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Configurações</h1>
        <p className="mt-2 text-slate-400">
          Gerencie as configurações da sua conta.
        </p>
      </div>

      <div className="space-y-6">
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
          <h2 className="text-xl font-bold text-white">Notificações</h2>
          <div className="mt-4 space-y-4">
            <label className="flex items-center justify-between">
              <span className="text-slate-300">Notificações por email</span>
              <input
                type="checkbox"
                className="h-5 w-5 rounded border-slate-700 bg-slate-800"
                defaultChecked
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-slate-300">
                Alertas de uso de tokens
              </span>
              <input
                type="checkbox"
                className="h-5 w-5 rounded border-slate-700 bg-slate-800"
                defaultChecked
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-slate-300">Atualizações de produto</span>
              <input
                type="checkbox"
                className="h-5 w-5 rounded border-slate-700 bg-slate-800"
              />
            </label>
          </div>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
          <h2 className="text-xl font-bold text-white">
            API e Integrações
          </h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="text-sm text-slate-400">API Key</label>
              <div className="mt-2 flex space-x-2">
                <input
                  type="password"
                  value="sk_test_**************************"
                  readOnly
                  className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white"
                />
                <button className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                  Copiar
                </button>
              </div>
            </div>
            <button className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white hover:bg-slate-700">
              Gerar Nova API Key
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
