import React from 'react';

interface SiteTemplateProps {
  siteData: {
    area: string;
    name: string;
    slogan: string;
    description: string;
    colors: string;
    sections: string[];
    services: string[];
    gallery: string[];
    appPlayStore: string;
    appAppStore: string;
    showPlayStore: boolean;
    showAppStore: boolean;
    address: string;
    phone: string;
    email: string;
  };
}

export function SiteTemplate({ siteData }: SiteTemplateProps) {
  // Parse cores ou usar padrão
  let primaryColor = '#ea580c'; // laranja padrão
  let secondaryColor = '#1a1a1a'; // preto padrão
  
  try {
    if (siteData.colors) {
      const parsed = JSON.parse(siteData.colors);
      primaryColor = parsed.primary || primaryColor;
      secondaryColor = parsed.secondary || secondaryColor;
    }
  } catch {
    // Se não conseguir parsear, usa cores padrão
  }
  
  // Gerar variações de cor
  const lightenColor = (hex: string, percent: number) => {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, Math.floor((num >> 16) + (255 - (num >> 16)) * percent));
    const g = Math.min(255, Math.floor(((num >> 8) & 0x00FF) + (255 - ((num >> 8) & 0x00FF)) * percent));
    const b = Math.min(255, Math.floor((num & 0x0000FF) + (255 - (num & 0x0000FF)) * percent));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  };

  const primaryLight = lightenColor(primaryColor, 0.3);
  const primaryDark = primaryColor;
  const secondaryLight = lightenColor(secondaryColor, 0.2);
  
  return (
    <div className="bg-white min-h-full relative">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Poppins:wght@300;400;500;600;700&display=swap');
        
        .site-template {
          font-family: 'Poppins', sans-serif;
          position: relative;
          
          /* Variáveis de cor globais */
          --color-primary: ${primaryColor};
          --color-primary-light: ${primaryLight};
          --color-primary-dark: ${primaryDark};
          --color-primary-10: ${primaryColor}1a;
          --color-primary-20: ${primaryColor}33;
          --color-primary-50: ${primaryColor}80;
          --color-primary-90: ${primaryColor}e6;
          
          /* Cor secundária (amarelo) */
          --color-secondary: ${secondaryColor};
          --color-secondary-light: ${secondaryLight};
          --color-secondary-10: ${secondaryColor}1a;
          --color-secondary-90: ${secondaryColor}e6;
        }
        
        .site-template h1, .site-template h2, .site-template h3 {
          font-family: 'Playfair Display', serif;
        }
        
        .site-template-header {
          position: sticky;
          top: 0;
          z-index: 50;
        }
        
        /* Classes de cor dinâmicas */
        .site-template .text-primary { color: var(--color-primary) !important; }
        .site-template .bg-primary { background-color: var(--color-primary) !important; }
        .site-template .bg-primary-10 { background-color: var(--color-primary-10) !important; }
        .site-template .bg-primary-light { background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light)) !important; }
        .site-template .border-primary { border-color: var(--color-primary) !important; }
        .site-template .hover\\:bg-primary:hover { background-color: var(--color-primary) !important; }
        .site-template .hover\\:border-primary:hover { border-color: var(--color-primary) !important; }
        .site-template .hover\\:text-primary:hover { color: var(--color-primary) !important; }
        
        /* Gradientes de texto */
        .site-template .text-gradient {
          background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        /* SUBSTITUIR TODAS AS CORES LARANJA AUTOMATICAMENTE */
        /* Textos laranja -> cor primária */
        .site-template .text-orange-500,
        .site-template .text-orange-600 {
          color: var(--color-primary) !important;
        }
        
        /* Backgrounds laranja -> cor primária */
        .site-template .bg-orange-50 {
          background-color: var(--color-primary-10) !important;
        }
        
        .site-template .bg-orange-500,
        .site-template .bg-orange-600 {
          background-color: var(--color-primary) !important;
        }
        
        /* Gradientes laranja -> gradiente primário */
        .site-template .from-orange-600,
        .site-template .from-orange-500 {
          --tw-gradient-from: var(--color-primary) !important;
          --tw-gradient-to: var(--color-primary-light) !important;
          --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important;
        }
        
        .site-template .to-orange-500,
        .site-template .to-orange-400 {
          --tw-gradient-to: var(--color-primary-light) !important;
        }
        
        /* Hovers laranja -> hover primário */
        .site-template .hover\\:bg-orange-500\\/10:hover,
        .site-template .hover\\:bg-orange-600:hover {
          background-color: var(--color-primary-10) !important;
        }
        
        .site-template .hover\\:border-orange-500:hover {
          border-color: var(--color-primary) !important;
        }
        
        .site-template .hover\\:text-orange-500:hover {
          color: var(--color-primary) !important;
        }
        
        /* Borders laranja -> border primário */
        .site-template .border-orange-500 {
          border-color: var(--color-primary) !important;
        }
        
        /* Backgrounds com overlay laranja -> overlay primário */
        .site-template .bg-orange-500\\/90 {
          background-color: var(--color-primary-90) !important;
        }
        
        /* SUBSTITUIR FUNDOS ESCUROS POR CORES MAIS ALEGRES */
        .site-template .bg-gray-900 {
          background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark)) !important;
          color: white !important;
        }
        
        /* Aplicar cor secundária (amarelo) em elementos de destaque */
        .site-template .text-yellow-500 {
          color: var(--color-secondary) !important;
        }
        
        .site-template .secondary-accent {
          color: var(--color-secondary) !important;
        }
      `}</style>
      
      <div className="site-template">
        {/* Header */}
        <header className="site-template-header bg-gray-900/95 backdrop-blur-lg">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <div className="text-2xl font-bold text-white">{siteData.name}</div>
            <nav className="hidden md:flex gap-8">
              <a href="#" className="text-white text-sm uppercase tracking-wide primary-hover transition" style={{color: 'white'}}>Início</a>
              {siteData.sections.includes('services') && <a href="#servicos" className="text-white text-sm uppercase tracking-wide primary-hover transition" style={{color: 'white'}}>Serviços</a>}
              {siteData.sections.includes('gallery') && <a href="#galeria" className="text-white text-sm uppercase tracking-wide primary-hover transition" style={{color: 'white'}}>Galeria</a>}
              {siteData.sections.includes('contact') && <a href="#contato" className="text-white text-sm uppercase tracking-wide primary-hover transition" style={{color: 'white'}}>Contato</a>}
            </nav>
            <button className="px-6 py-3 primary-gradient text-white rounded-full font-semibold text-sm uppercase tracking-wide hover:shadow-lg transition">
              Fale Conosco
            </button>
          </div>
        </header>

        {/* Hero */}
        {siteData.sections.includes('hero') && (
          <section className="relative min-h-screen flex items-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"></div>
            <div className="container mx-auto px-6 relative z-10 py-32">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white text-sm font-medium mb-8 backdrop-blur" style={{backgroundColor: `${primaryColor}1a`, borderColor: `${primaryColor}4d`, border: '1px solid'}}>
                  <span>🔥</span> {siteData.area}
                </div>
                <h1 className="text-6xl font-black text-white mb-6 leading-tight">
                  {siteData.slogan || siteData.name}
                  <br />
                  <span className="primary-color" style={{background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>
                    a um Novo Nível
                  </span>
                </h1>
                <p className="text-xl text-gray-300 mb-10 leading-relaxed">
                  {siteData.description}
                </p>
                <div className="flex gap-4 mb-16">
                  <button className="px-10 py-4 primary-gradient text-white rounded-full font-semibold uppercase text-sm tracking-wide hover:shadow-2xl transition flex items-center gap-2">
                    <span>Saiba Mais</span>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </button>
                  <button className="px-10 py-4 bg-transparent text-white border-2 border-white rounded-full font-semibold uppercase text-sm tracking-wide hover:bg-white hover:text-gray-900 transition">
                    Conheça-nos
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-10">
                  <div>
                    <h3 className="text-4xl font-bold primary-color mb-2">500+</h3>
                    <p className="text-gray-400 text-sm uppercase tracking-wider">Clientes Satisfeitos</p>
                  </div>
                  <div>
                    <h3 className="text-4xl font-bold primary-color mb-2">4.9★</h3>
                    <p className="text-gray-400 text-sm uppercase tracking-wider">Avaliação</p>
                  </div>
                  <div>
                    <h3 className="text-4xl font-bold primary-color mb-2">10+</h3>
                    <p className="text-gray-400 text-sm uppercase tracking-wider">Anos de Experiência</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Features */}
        <section className="py-20 bg-gray-50 -mt-12 relative z-20">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-10 rounded-2xl text-center hover:shadow-2xl transition border">
                <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-2xl primary-color" style={{backgroundColor: `${primaryColor}10`}}>
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 5L25 15H35L27.5 22.5L30 32.5L20 26.25L10 32.5L12.5 22.5L5 15H15L20 5Z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-4">Experiência Premium</h3>
                <p className="text-gray-600">Muito mais que um serviço, uma verdadeira experiência de luxo e conforto</p>
              </div>
              <div className="bg-white p-10 rounded-2xl text-center hover:shadow-2xl transition border">
                <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-2xl primary-color" style={{backgroundColor: `${primaryColor}10`}}>
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="20" cy="20" r="15"/>
                    <path d="M13 20L18 25L27 16" strokeLinecap="round"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-4">Profissionais Qualificados</h3>
                <p className="text-gray-600">Equipe altamente treinada e experiente no que faz</p>
              </div>
              <div className="bg-white p-10 rounded-2xl text-center hover:shadow-2xl transition border">
                <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-2xl primary-color" style={{backgroundColor: `${primaryColor}10`}}>
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="20" cy="20" r="15"/>
                    <path d="M20 15V20L25 25" strokeLinecap="round"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-4">Atendimento Fácil</h3>
                <p className="text-gray-600">Agende com total praticidade e rapidez</p>
              </div>
            </div>
          </div>
        </section>

        {/* About */}
        {siteData.sections.includes('about') && (
          <section className="py-24 bg-white">
            <div className="container mx-auto px-6">
              <div className="grid md:grid-cols-2 gap-20 items-center">
                <div className="relative h-[600px]">
                  <img 
                    src="https://via.placeholder.com/400x500" 
                    alt="Sobre" 
                    className="absolute top-0 left-0 w-[70%] h-[70%] object-cover rounded-2xl shadow-2xl z-10"
                  />
                  <img 
                    src="https://via.placeholder.com/400x500" 
                    alt="Sobre" 
                    className="absolute bottom-0 right-0 w-[70%] h-[70%] object-cover rounded-2xl shadow-2xl"
                  />
                  <div className="absolute bottom-5 left-5 bg-white p-6 rounded-2xl shadow-xl flex items-center gap-4 z-20">
                    <span className="text-4xl">⭐</span>
                    <div>
                      <strong className="text-3xl font-bold text-orange-600 block leading-none">4.9</strong>
                      <p className="text-sm text-gray-600">Avaliação</p>
                    </div>
                  </div>
                </div>
                <div>
                  <span className="inline-block px-5 py-2 bg-orange-50 text-orange-600 rounded-full text-xs font-semibold uppercase tracking-wider mb-5">
                    Sobre Nós
                  </span>
                  <h2 className="text-5xl font-black mb-6 leading-tight">
                    Do Sonho à<br/>
                    <span className="bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">
                      Realidade
                    </span>
                  </h2>
                  <p className="text-xl font-medium text-gray-700 mb-5 leading-relaxed">
                    Nossa empresa foi projetada para ser um ponto de referência em qualidade, inovação e excelência.
                  </p>
                  <p className="text-gray-600 mb-5 leading-relaxed">
                    {siteData.description}
                  </p>
                  <div className="space-y-4 my-8">
                    <div className="flex items-center gap-4">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-orange-600">
                        <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" strokeLinecap="round"/>
                      </svg>
                      <span className="font-medium text-gray-700">Profissionais certificados</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-orange-600">
                        <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" strokeLinecap="round"/>
                      </svg>
                      <span className="font-medium text-gray-700">Produtos premium</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-orange-600">
                        <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" strokeLinecap="round"/>
                      </svg>
                      <span className="font-medium text-gray-700">Ambiente climatizado</span>
                    </div>
                  </div>
                  <button className="px-10 py-4 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-full font-semibold uppercase text-sm tracking-wide hover:shadow-2xl transition">
                    Agende seu horário
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Services */}
        {siteData.sections.includes('services') && siteData.services.length > 0 && (
          <section id="servicos" className="py-24 bg-gray-900 text-white">
            <div className="container mx-auto px-6">
              <div className="text-center max-w-2xl mx-auto mb-16">
                <span className="inline-block px-5 py-2 bg-white/10 text-white rounded-full text-xs font-semibold uppercase tracking-wider mb-5">
                  Nossos Serviços
                </span>
                <h2 className="text-5xl font-black mb-6">
                  Serviços que<br/>
                  <span className="bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">
                    Transformam
                  </span>
                </h2>
                <p className="text-xl text-gray-400">
                  Oferecemos uma gama completa de serviços de excelência
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                {siteData.services.slice(0, 6).map((service, idx) => (
                  <div key={idx} className="bg-white/5 p-10 rounded-2xl text-center border border-white/10 hover:bg-orange-500/10 hover:border-orange-500 transition cursor-pointer">
                    <div className="text-5xl mb-5">✨</div>
                    <h3 className="text-xl font-bold mb-4">{service}</h3>
                    <p className="text-gray-400">Serviço de qualidade premium com resultados excepcionais</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Gallery */}
        {siteData.sections.includes('gallery') && siteData.gallery.length > 0 && (
          <section id="galeria" className="py-24 bg-gray-50">
            <div className="container mx-auto px-6">
              <div className="text-center mb-16">
                <span className="inline-block px-5 py-2 bg-orange-50 text-orange-600 rounded-full text-xs font-semibold uppercase tracking-wider mb-5">
                  Galeria
                </span>
                <h2 className="text-5xl font-black">
                  Nosso <span className="bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">Trabalho</span>
                </h2>
              </div>
              <div className="grid md:grid-cols-3 gap-5">
                {siteData.gallery.map((img, idx) => (
                  <div key={idx} className="relative overflow-hidden rounded-2xl aspect-[4/3] group cursor-pointer">
                    <img src={img} alt={`Galeria ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                    <div className="absolute inset-0 bg-orange-500/90 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <svg width="60" height="60" viewBox="0 0 40 40" fill="white">
                        <path d="M20 5L25 15H35L27.5 22.5L30 32.5L20 26.25L10 32.5L12.5 22.5L5 15H15L20 5Z"/>
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* App Section */}
        {siteData.sections.includes('app') && (siteData.showPlayStore || siteData.showAppStore) && (
          <section className="py-24 bg-gradient-to-r from-orange-600 to-orange-500 text-white">
            <div className="container mx-auto px-6">
              <div className="grid md:grid-cols-2 gap-20 items-center">
                <div>
                  <span className="inline-block px-5 py-2 bg-white/20 text-white rounded-full text-xs font-semibold uppercase tracking-wider mb-5">
                    Nosso App
                  </span>
                  <h2 className="text-5xl font-black mb-6 leading-tight">
                    Agende pelo<br/>
                    <span className="text-white drop-shadow-lg">Aplicativo</span>
                  </h2>
                  <p className="text-xl mb-8 opacity-95 leading-relaxed">
                    Baixe nosso app e tenha acesso a horários disponíveis, promoções exclusivas e muito mais!
                  </p>
                  <div className="space-y-4 mb-10">
                    <div className="flex items-center gap-4">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M7 10L9 12L13 8M19 10C19 14.9706 14.9706 19 10 19C5.02944 19 1 14.9706 1 10C1 5.02944 5.02944 1 10 1C14.9706 1 19 5.02944 19 10Z"/>
                      </svg>
                      <span className="font-medium">Agendamento em segundos</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M7 10L9 12L13 8M19 10C19 14.9706 14.9706 19 10 19C5.02944 19 1 14.9706 1 10C1 5.02944 5.02944 1 10 1C14.9706 1 19 5.02944 19 10Z"/>
                      </svg>
                      <span className="font-medium">Lembretes automáticos</span>
                    </div>
                  </div>
                  <div className="flex gap-5 flex-wrap">
                    {siteData.showPlayStore && (
                      <a href={siteData.appPlayStore} target="_blank" rel="noopener noreferrer">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" className="h-14 hover:scale-105 transition" />
                      </a>
                    )}
                    {siteData.showAppStore && (
                      <a href={siteData.appAppStore} target="_blank" rel="noopener noreferrer">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="App Store" className="h-14 hover:scale-105 transition" />
                      </a>
                    )}
                  </div>
                </div>
                <div className="relative text-center">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/20 rounded-full blur-3xl"></div>
                  <img src="https://via.placeholder.com/300x600/1a1a1a/e84a0f?text=App" alt="App" className="relative z-10 max-w-xs mx-auto drop-shadow-2xl" />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Reviews */}
        {siteData.sections.includes('testimonials') && (
          <section className="py-24 bg-white">
            <div className="container mx-auto px-6">
              <div className="text-center mb-16">
                <span className="inline-block px-5 py-2 bg-orange-50 text-orange-600 rounded-full text-xs font-semibold uppercase tracking-wider mb-5">
                  Depoimentos
                </span>
                <h2 className="text-5xl font-black">
                  O que dizem<br/>
                  <span className="bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">
                    Nossos Clientes
                  </span>
                </h2>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-gray-50 p-10 rounded-2xl hover:shadow-2xl transition">
                    <div className="text-yellow-500 text-2xl mb-5">★★★★★</div>
                    <p className="text-lg italic text-gray-700 mb-6 leading-relaxed">
                      "Excelente serviço! Profissionais atenciosos e ambiente incrível. Recomendo muito!"
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-600 to-orange-500 text-white flex items-center justify-center text-xl font-bold">
                        {String.fromCharCode(64 + i)}
                      </div>
                      <div>
                        <strong className="block text-gray-900">Cliente {i}</strong>
                        <span className="text-sm text-gray-500">Cliente desde 2024</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Contact */}
        {siteData.sections.includes('contact') && (
          <section id="contato" className="py-24 bg-gray-50">
            <div className="container mx-auto px-6">
              <div className="grid md:grid-cols-2 gap-16 items-center">
                <div>
                  <span className="inline-block px-5 py-2 bg-orange-50 text-orange-600 rounded-full text-xs font-semibold uppercase tracking-wider mb-5">
                    Localização
                  </span>
                  <h2 className="text-5xl font-black mb-10 leading-tight">
                    Venha nos<br/>
                    <span className="bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">
                      Visitar
                    </span>
                  </h2>
                  {siteData.address && (
                    <div className="flex gap-5 mb-8">
                      <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-orange-50 text-orange-600 rounded-xl">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z"/>
                          <circle cx="12" cy="9" r="2.5"/>
                        </svg>
                      </div>
                      <div>
                        <strong className="block text-xl text-gray-900 mb-2">Endereço</strong>
                        <p className="text-gray-600 leading-relaxed">{siteData.address}</p>
                      </div>
                    </div>
                  )}
                  {siteData.phone && (
                    <div className="flex gap-5 mb-8">
                      <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-orange-50 text-orange-600 rounded-xl">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 5C3 3.89543 3.89543 3 5 3H8.27924C8.70967 3 9.09181 3.27543 9.22792 3.68377L10.7257 8.17721C10.8831 8.64932 10.6694 9.16531 10.2243 9.38787L7.96701 10.5165C9.06925 12.9612 11.0388 14.9308 13.4835 16.033L14.6121 13.7757C14.8347 13.3306 15.3507 13.1169 15.8228 13.2743L20.3162 14.7721C20.7246 14.9082 21 15.2903 21 15.7208V19C21 20.1046 20.1046 21 19 21H18C9.71573 21 3 14.2843 3 6V5Z"/>
                        </svg>
                      </div>
                      <div>
                        <strong className="block text-xl text-gray-900 mb-2">Telefone</strong>
                        <p className="text-gray-600">{siteData.phone}</p>
                      </div>
                    </div>
                  )}
                  {siteData.email && (
                    <div className="flex gap-5 mb-10">
                      <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-orange-50 text-orange-600 rounded-xl">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 8L10.89 13.26C11.5389 13.7165 12.4611 13.7165 13.11 13.26L21 8M5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19Z"/>
                        </svg>
                      </div>
                      <div>
                        <strong className="block text-xl text-gray-900 mb-2">E-mail</strong>
                        <p className="text-gray-600">{siteData.email}</p>
                      </div>
                    </div>
                  )}
                  <button className="px-10 py-4 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-full font-semibold uppercase text-sm tracking-wide hover:shadow-2xl transition">
                    Como Chegar
                  </button>
                </div>
                <div className="h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                  <iframe 
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(siteData.address || 'Brasil')}&t=m&z=16&output=embed&iwloc=near`}
                    className="w-full h-full"
                    frameBorder="0"
                  ></iframe>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-400 py-20">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-16 mb-10">
              <div>
                <h4 className="text-white text-2xl font-bold mb-5">{siteData.name}</h4>
                <p className="mb-6 leading-relaxed">Experiência premium desde 2024</p>
                <div className="flex gap-4">
                  <a href="#" className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-full hover:bg-orange-600 transition">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 0 1 1.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772 4.915 4.915 0 0 1-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772A4.897 4.897 0 0 1 5.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm6.5-.25a1.25 1.25 0 0 0-2.5 0 1.25 1.25 0 0 0 2.5 0zM12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"/>
                    </svg>
                  </a>
                </div>
              </div>
              <div>
                <h4 className="text-white text-lg font-bold mb-5">Links Rápidos</h4>
                <ul className="space-y-3">
                  <li><a href="#" className="hover:text-orange-500 hover:pl-1 transition">Sobre Nós</a></li>
                  <li><a href="#servicos" className="hover:text-orange-500 hover:pl-1 transition">Serviços</a></li>
                  <li><a href="#galeria" className="hover:text-orange-500 hover:pl-1 transition">Galeria</a></li>
                  <li><a href="#contato" className="hover:text-orange-500 hover:pl-1 transition">Contato</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white text-lg font-bold mb-5">Contato</h4>
                <ul className="space-y-3">
                  {siteData.address && <li>{siteData.address}</li>}
                  {siteData.phone && <li>{siteData.phone}</li>}
                  {siteData.email && <li>{siteData.email}</li>}
                </ul>
              </div>
            </div>
            <div className="border-t border-white/10 pt-8 text-center">
              <p>© 2025 {siteData.name}. Todos os direitos reservados.</p>
            </div>
          </div>
        </footer>

        {/* WhatsApp Float */}
        {siteData.phone && (
          <a 
            href={`https://wa.me/${siteData.phone.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-5 right-5 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition z-50 animate-pulse"
          >
            <svg viewBox="0 0 24 24" fill="white" className="w-8 h-8">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
          </a>
        )}
      </div>
    </div>
  );
}
