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
    <div className="w-full md:w-[60%] lg:w-[70%] flex flex-col bg-slate-900/30 h-[45vh] md:h-full">
      {/* Browser Bar */}
      <div className="border-b border-slate-800 bg-slate-900/50 p-2 sm:p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
            <div className="hidden sm:flex space-x-1.5 sm:space-x-2">
              <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-red-500"></div>
              <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-yellow-500"></div>
              <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-green-500"></div>
            </div>
            <div className="flex items-center space-x-1.5 sm:space-x-2 rounded-lg bg-slate-800 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 flex-1 min-w-0 max-w-xs sm:max-w-md">
              <Lock className="h-3 w-3 sm:h-4 sm:w-4 text-green-400 flex-shrink-0" />
              <span className="text-[10px] sm:text-xs md:text-sm text-slate-400 truncate">{sitePreviewUrl}</span>
            </div>
          </div>
          <div className="flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0">
            {generatedSite && (
              <>
                <button
                  onClick={() => setShowEditor(true)}
                  className="flex items-center space-x-1 sm:space-x-2 rounded-lg border border-purple-600 bg-purple-600/10 px-2 sm:px-3 py-1.5 sm:py-2 text-purple-400 hover:bg-purple-600/20 transition-colors"
                >
                  <Save className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm hidden sm:inline">Editar Site</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-auto bg-white relative">
        {isGenerating ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm z-50 p-4">
            <div className="text-center">
              <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 text-purple-400 animate-spin mx-auto mb-3 sm:mb-4" />
              <p className="text-base sm:text-lg md:text-xl text-white font-semibold">
                Gerando seu site...
              </p>
              <p className="text-xs sm:text-sm md:text-base text-slate-400 mt-1.5 sm:mt-2 max-w-xs mx-auto">
                Aplicando suas preferências e criando um design profissional
              </p>
            </div>
          </div>
        ) : generatedSite ? (
          <SiteTemplate siteData={site.siteData} />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
            <div className="text-center">
              <Globe className="h-14 w-14 sm:h-18 sm:w-18 md:h-24 md:w-24 text-slate-600 mx-auto mb-3 sm:mb-4 md:mb-6" />
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1.5 sm:mb-2">
                Preview do Site
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-slate-400 mb-1.5 sm:mb-2 max-w-xs mx-auto">
                O preview do seu site aparecerá aqui em tempo real
              </p>
              <p className="text-[10px] sm:text-xs md:text-sm text-slate-500 max-w-xs mx-auto">
                Converse com o assistente para começar a criar seu site
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
