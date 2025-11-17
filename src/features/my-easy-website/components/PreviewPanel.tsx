import { Globe, Loader2, Lock, Save } from 'lucide-react';
import { SiteTemplate } from '../SiteTemplate';

type PreviewPanelProps = {
  // Data
  site: any;

  // Estados UI
  generatedSite: string | null;
  sitePreviewUrl: string;
  isGenerating: boolean;
  showEditor: boolean;
  setShowEditor: (value: boolean) => void;
};

export function PreviewPanel({
  site,
  generatedSite,
  sitePreviewUrl,
  isGenerating,
  showEditor,
  setShowEditor,
}: PreviewPanelProps) {
  return (
    <div className="w-[70%] flex flex-col bg-slate-900/30">
      {/* Browser Bar */}
      <div className="border-b border-slate-800 bg-slate-900/50 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <div className="flex space-x-2">
              <div className="h-3 w-3 rounded-full bg-red-500"></div>
              <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
            </div>
            <div className="flex items-center space-x-2 rounded-lg bg-slate-800 px-4 py-2 flex-1 max-w-md">
              <Lock className="h-4 w-4 text-green-400" />
              <span className="text-sm text-slate-400">{sitePreviewUrl}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {generatedSite && (
              <>
                <button
                  onClick={() => setShowEditor(true)}
                  className="flex items-center space-x-2 rounded-lg border border-purple-600 bg-purple-600/10 px-3 py-2 text-purple-400 hover:bg-purple-600/20 transition-colors"
                >
                  <Save className="h-4 w-4" />
                  <span className="text-sm">Editar Site</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-auto bg-white relative">
        {isGenerating ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm z-50">
            <div className="text-center">
              <Loader2 className="h-16 w-16 text-purple-400 animate-spin mx-auto mb-4" />
              <p className="text-xl text-white font-semibold">
                Gerando seu site...
              </p>
              <p className="text-slate-400 mt-2">
                Aplicando suas preferências e criando um design profissional
              </p>
            </div>
          </div>
        ) : generatedSite ? (
          <SiteTemplate siteData={site.siteData} />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
            <div className="text-center">
              <Globe className="h-24 w-24 text-slate-600 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white mb-2">
                Preview do Site
              </h2>
              <p className="text-slate-400 mb-2">
                O preview do seu site aparecerá aqui em tempo real
              </p>
              <p className="text-slate-500 text-sm">
                Converse com o assistente para começar a criar seu site
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
