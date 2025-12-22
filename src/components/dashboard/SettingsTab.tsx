import { useState, useEffect } from 'react';
import { toast } from 'sonner';

type UserSettings = {
  emailNotifications: boolean;
  tokenAlerts: boolean;
  productUpdates: boolean;
};

const SETTINGS_STORAGE_KEY = 'myeasyai_user_settings';

const defaultSettings: UserSettings = {
  emailNotifications: true,
  tokenAlerts: true,
  productUpdates: false,
};

function loadSettings(): UserSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (stored) {
      return { ...defaultSettings, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error('Erro ao carregar configuracoes:', e);
  }
  return defaultSettings;
}

function saveSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Erro ao salvar configuracoes:', e);
  }
}

export function SettingsTab() {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);

  // Load settings on mount
  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  const handleSettingChange = (key: keyof UserSettings, value: boolean) => {
    setSettings((prev) => {
      const newSettings = { ...prev, [key]: value };
      return newSettings;
    });
    setHasChanges(true);
  };

  const handleSaveSettings = () => {
    saveSettings(settings);
    setHasChanges(false);
    toast.success('Configuracoes salvas com sucesso!');
  };

  const handleResetSettings = () => {
    setSettings(defaultSettings);
    saveSettings(defaultSettings);
    setHasChanges(false);
    toast.info('Configuracoes restauradas para o padrao');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Configuracoes</h1>
        <p className="mt-2 text-slate-400">
          Gerencie as configuracoes da sua conta.
        </p>
      </div>

      <div className="space-y-6">
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
          <h2 className="text-xl font-bold text-white">Notificacoes</h2>
          <div className="mt-4 space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-slate-300">Notificacoes por email</span>
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                className="h-5 w-5 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-slate-300">
                Alertas de uso de tokens
              </span>
              <input
                type="checkbox"
                checked={settings.tokenAlerts}
                onChange={(e) => handleSettingChange('tokenAlerts', e.target.checked)}
                className="h-5 w-5 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-slate-300">Atualizacoes de produto</span>
              <input
                type="checkbox"
                checked={settings.productUpdates}
                onChange={(e) => handleSettingChange('productUpdates', e.target.checked)}
                className="h-5 w-5 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900"
              />
            </label>
          </div>

          {/* Save/Reset buttons */}
          <div className="mt-6 flex space-x-4">
            <button
              onClick={handleSaveSettings}
              disabled={!hasChanges}
              className="rounded-lg bg-green-600 px-6 py-2 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Salvar Configuracoes
            </button>
            <button
              onClick={handleResetSettings}
              className="rounded-lg border border-slate-700 bg-slate-800 px-6 py-2 text-white hover:bg-slate-700"
            >
              Restaurar Padrao
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
          <h2 className="text-xl font-bold text-white">
            API e Integracoes
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
