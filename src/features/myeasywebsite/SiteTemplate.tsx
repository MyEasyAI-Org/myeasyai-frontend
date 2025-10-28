import React from 'react';

interface SiteTemplateProps {
  siteData: {
    area: string;
    name: string;
    slogan: string;
    description: string;
    vibe: string;
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
    faq?: Array<{ question: string; answer: string }>;
    heroStats?: Array<{ value: string; label: string }>;
    features?: Array<{ title: string; description: string }>;
    aboutContent?: { title: string; subtitle: string; checklist: string[] };
    serviceDescriptions?: Array<{ name: string; description: string }>;
    testimonials?: Array<{ name: string; role: string; text: string }>;
  };
}

export function SiteTemplate({ siteData }: SiteTemplateProps) {
  // Parse cores ou usar padrão
  let primaryColor = '#ea580c';
  let secondaryColor = '#1a1a1a';
  let accentColor = '#fb923c';
  let darkColor = '#1a1a1a';
  let lightColor = '#f5f5f5';
  
  try {
    if (siteData.colors) {
      const parsed = JSON.parse(siteData.colors);
      primaryColor = parsed.primary || primaryColor;
      secondaryColor = parsed.secondary || secondaryColor;
      accentColor = parsed.accent || accentColor;
      darkColor = parsed.dark || darkColor;
      lightColor = parsed.light || lightColor;
    }
  } catch {
    // Se não conseguir parsear, usa cores padrão
  }

  // ========== FUNÇÕES DE CÁLCULO DE CONTRASTE ==========
  
  // Calcular luminosidade de uma cor (0-255)
  const getLuminance = (hex: string): number => {
    const rgb = parseInt(hex.replace('#', ''), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    return 0.299 * r + 0.587 * g + 0.114 * b;
  };

  // Determinar se uma cor é clara ou escura
  const isLightColor = (hex: string): boolean => {
    return getLuminance(hex) > 128;
  };

  // Determinar cor de texto ideal para um fundo
  const getContrastText = (bgHex: string): string => {
    return isLightColor(bgHex) ? '#1a1a1a' : '#ffffff';
  };

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

  // ========== CORES DINÂMICAS BASEADAS EM CONTRASTE ==========
  
  // Cores de texto para diferentes contextos
  const heroTextColor = getContrastText(primaryColor);
  const badgeTextColor = getContrastText(primaryColor);
  const badgeBorderColor = `${badgeTextColor}20`;
  
  // Aplicar estilos baseados na vibração/emoção escolhida
  const vibe = siteData.vibe || 'vibrant';
  
  // Definir backgrounds e cores de texto baseados na vibração
  let heroBg = 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900';
  let headerBg = 'bg-gray-900/95';
  let sectionBg = 'bg-gray-50';
  let darkSectionBg = 'bg-gray-900';
  let textOnDark = 'text-white';
  let textOnLight = 'text-gray-900';
  let iconColor = primaryColor;
  
  switch(vibe) {
    case 'light':
      heroBg = 'bg-gradient-to-br from-white via-gray-50 to-gray-100';
      headerBg = 'bg-white/95 border-b border-gray-200';
      sectionBg = 'bg-white';
      darkSectionBg = 'bg-gray-50';
      textOnDark = 'text-gray-900';
      iconColor = primaryColor;
      break;
    case 'dark':
      heroBg = 'bg-gradient-to-br from-black via-gray-900 to-black';
      headerBg = 'bg-black/95';
      sectionBg = 'bg-gray-900';
      darkSectionBg = 'bg-black';
      textOnDark = 'text-white';
      iconColor = primaryColor;
      break;
    case 'vibrant':
      heroBg = `bg-gradient-to-br from-[${primaryColor}] via-[${secondaryColor}] to-[${primaryColor}]`;
      headerBg = `bg-[${primaryColor}]/95`;
      sectionBg = 'bg-white';
      darkSectionBg = `bg-gradient-to-br from-[${primaryColor}] to-[${secondaryColor}]`;
      textOnDark = 'text-white';
      iconColor = '#ffffff';
      break;
    case 'corporate':
      heroBg = 'bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800';
      headerBg = 'bg-slate-900/95';
      sectionBg = 'bg-slate-50';
      darkSectionBg = 'bg-slate-800';
      textOnDark = 'text-white';
      iconColor = primaryColor;
      break;
    case 'fun':
      heroBg = 'bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400';
      headerBg = 'bg-purple-600/95';
      sectionBg = 'bg-gradient-to-br from-pink-50 to-purple-50';
      darkSectionBg = 'bg-gradient-to-br from-purple-600 to-pink-600';
      textOnDark = 'text-white';
      iconColor = '#ffffff';
      break;
    case 'elegant':
      heroBg = 'bg-gradient-to-br from-gray-100 via-white to-gray-100';
      headerBg = 'bg-white/95 border-b border-gray-100';
      sectionBg = 'bg-gray-50';
      darkSectionBg = 'bg-gray-900';
      textOnDark = 'text-white';
      textOnLight = 'text-gray-800';
      iconColor = primaryColor;
      break;
  }

  // Determinar cores para as estatísticas baseado no vibe
  const isLightBackground = vibe === 'light' || vibe === 'elegant';
  const statsNumberColor = isLightBackground ? primaryColor : '#ffffff';
  const statsTextColor = isLightBackground ? '#4b5563' : '#ffffff';

  // SEO
  const seoTitle = `${siteData.name} - ${siteData.slogan || 'Seu negócio online'}`;
  const seoDescription = siteData.description || `${siteData.name} - ${siteData.slogan}. Conheça nossos serviços e entre em contato!`;
  const seoKeywords = [
    siteData.name,
    siteData.area,
    ...(siteData.services || []),
    'empresa',
    'negócio',
    'serviços'
  ].filter(Boolean).join(', ');
  
  const siteUrl = `https://${siteData.name.toLowerCase().replace(/\s+/g, '-')}.netlify.app`;
  
  return (
    <div className="bg-white min-h-full relative">
      {/* SEO Meta Tags */}
      <div style={{ display: 'none' }}>
        <title>{seoTitle}</title>
        <meta name="title" content={seoTitle} />
        <meta name="description" content={seoDescription} />
        <meta name="keywords" content={seoKeywords} />
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Poppins:wght@300;400;500;600;700&display=swap');
        
        .site-template {
          font-family: 'Poppins', sans-serif;
          position: relative;
          --color-primary: ${primaryColor};
          --color-primary-light: ${primaryLight};
          --color-secondary: ${secondaryColor};
          --color-accent: ${accentColor};
        }
        
        .site-template h1, .site-template h2, .site-template h3 {
          font-family: 'Playfair Display', serif;
        }
        
        .site-template-header {
          position: sticky;
          top: 0;
          z-index: 50;
        }

        /* ========== ANIMAÇÕES DA HERO SECTION ========== */
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }

        @keyframes floatSlow {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(5deg); }
          66% { transform: translate(-20px, 20px) rotate(-5deg); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.25; transform: scale(1.1); }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .hero-float-element {
          animation: float 6s ease-in-out infinite;
        }

        .hero-float-slow {
          animation: floatSlow 12s ease-in-out infinite;
        }

        .hero-pulse {
          animation: pulse 4s ease-in-out infinite;
        }

        .hero-slide-up {
          animation: slideUp 0.8s ease-out forwards;
        }

        .hero-decorative-circle {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
        }

        /* ========== ANIMAÇÕES DA FEATURES SECTION ========== */
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        @keyframes iconBounce {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }

        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(234, 88, 12, 0.3); }
          50% { box-shadow: 0 0 40px rgba(234, 88, 12, 0.6); }
        }

        .feature-card {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .feature-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s;
        }

        .feature-card:hover::before {
          left: 100%;
        }

        .feature-card:hover {
          transform: translateY(-15px) scale(1.03);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }

        .feature-icon-container {
          transition: all 0.4s ease;
        }

        .feature-card:hover .feature-icon-container {
          animation: iconBounce 0.6s ease;
          transform: scale(1.15);
        }

        .feature-card:hover .feature-icon-container {
          animation: glow 1.5s ease-in-out infinite;
        }

        /* ========== ANIMAÇÕES DA ABOUT SECTION ========== */
        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-50px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes fadeInRight {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes rotateIn {
          from { opacity: 0; transform: rotate(-5deg) scale(0.9); }
          to { opacity: 1; transform: rotate(0deg) scale(1); }
        }

        .about-image-1 {
          animation: fadeInLeft 1s ease-out 0.2s backwards;
          transition: all 0.5s ease;
        }

        .about-image-1:hover {
          transform: scale(1.05) rotate(-2deg);
          box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.4);
        }

        .about-image-2 {
          animation: fadeInRight 1s ease-out 0.4s backwards;
          transition: all 0.5s ease;
        }

        .about-image-2:hover {
          transform: scale(1.05) rotate(2deg);
          box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.4);
        }

        .about-rating-card {
          animation: scaleIn 0.8s ease-out 0.6s backwards;
          transition: all 0.3s ease;
        }

        .about-rating-card:hover {
          transform: scale(1.1) translateY(-5px);
          box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.3);
        }

        .about-content {
          animation: fadeInRight 1s ease-out 0.3s backwards;
        }

        .about-checklist-item {
          transition: all 0.3s ease;
        }

        .about-checklist-item:hover {
          transform: translateX(10px);
        }

        .about-checklist-item svg {
          transition: all 0.3s ease;
        }

        .about-checklist-item:hover svg {
          transform: scale(1.2) rotate(360deg);
        }

        /* ========== ANIMAÇÕES DA SERVICES SECTION ========== */
        @keyframes serviceCardAppear {
          from { opacity: 0; transform: translateY(40px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes serviceBgMove {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes serviceIconSpin {
          from { transform: rotate(0deg) scale(1); }
          to { transform: rotate(360deg) scale(1.2); }
        }

        .service-card {
          animation: serviceCardAppear 0.6s ease-out backwards;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .service-card::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%);
          opacity: 0;
          transition: opacity 0.5s;
        }

        .service-card:hover::before {
          opacity: 1;
          animation: serviceBgMove 3s ease infinite;
        }

        .service-card:hover {
          transform: translateY(-20px) scale(1.05);
          background-color: rgba(255,255,255,0.15) !important;
          box-shadow: 0 30px 60px -15px rgba(0,0,0,0.5);
        }

        .service-icon {
          transition: all 0.5s ease;
        }

        .service-card:hover .service-icon {
          animation: serviceIconSpin 0.6s ease;
        }

        /* ========== ANIMAÇÕES DA GALLERY SECTION ========== */
        @keyframes galleryImageAppear {
          from { opacity: 0; transform: scale(0.9) rotate(-2deg); }
          to { opacity: 1; transform: scale(1) rotate(0deg); }
        }

        @keyframes overlaySlideIn {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }

        .gallery-item {
          animation: galleryImageAppear 0.6s ease-out backwards;
          position: relative;
          overflow: hidden;
        }

        .gallery-item img {
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .gallery-item:hover img {
          transform: scale(1.15) rotate(2deg);
        }

        .gallery-overlay {
          transition: opacity 0.4s ease;
        }

        .gallery-item:hover .gallery-overlay {
          opacity: 1;
        }

        .gallery-overlay-content {
          transform: translateY(20px);
          opacity: 0;
          transition: all 0.4s ease;
        }

        .gallery-item:hover .gallery-overlay-content {
          transform: translateY(0);
          opacity: 1;
        }

        /* ========== ANIMAÇÕES DA TESTIMONIALS SECTION ========== */
        @keyframes testimonialSlideIn {
          from { opacity: 0; transform: translateY(40px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes starPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        @keyframes testimonialFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .testimonial-card {
          animation: testimonialSlideIn 0.6s ease-out backwards;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .testimonial-card::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
          opacity: 0;
          transition: opacity 0.5s;
          border-radius: 1rem;
          z-index: -1;
        }

        .testimonial-card:hover::before {
          opacity: 1;
        }

        .testimonial-card:hover {
          transform: translateY(-15px) scale(1.03);
          box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.3);
        }

        .testimonial-stars {
          display: inline-flex;
          gap: 2px;
        }

        .testimonial-stars svg {
          transition: all 0.3s ease;
        }

        .testimonial-card:hover .testimonial-stars svg {
          animation: starPulse 0.6s ease;
        }

        .testimonial-avatar {
          transition: all 0.4s ease;
        }

        .testimonial-card:hover .testimonial-avatar {
          transform: scale(1.15) rotate(5deg);
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }

        .testimonial-quote {
          position: relative;
        }

        .testimonial-quote::before {
          content: '"';
          position: absolute;
          top: -20px;
          left: -10px;
          font-size: 80px;
          opacity: 0.1;
          font-family: 'Playfair Display', serif;
          line-height: 1;
        }

        /* ========== ANIMAÇÕES DA CONTACT SECTION ========== */
        @keyframes contactSlideIn {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes mapZoomIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes iconPop {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }

        .contact-info {
          animation: contactSlideIn 0.8s ease-out backwards;
        }

        .contact-item {
          transition: all 0.3s ease;
        }

        .contact-item:hover {
          transform: translateX(10px);
        }

        .contact-item:hover .contact-icon {
          animation: iconPop 0.6s ease;
        }

        .contact-map {
          animation: mapZoomIn 0.8s ease-out 0.3s backwards;
        }

        .contact-icon {
          transition: all 0.3s ease;
        }

        /* ========== ANIMAÇÕES DO FOOTER ========== */
        @keyframes footerFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .footer-section {
          animation: footerFadeIn 0.6s ease-out backwards;
        }

        .footer-link {
          position: relative;
          transition: all 0.3s ease;
        }

        .footer-link::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 2px;
          background: currentColor;
          transition: width 0.3s ease;
        }

        .footer-link:hover::after {
          width: 100%;
        }

        /* ========== ANIMAÇÃO DO MENU HAMBÚRGUER ========== */
        #mobile-menu-btn.open span:nth-child(1) {
          transform: rotate(45deg) translate(5px, 5px);
        }

        #mobile-menu-btn.open span:nth-child(2) {
          opacity: 0;
        }

        #mobile-menu-btn.open span:nth-child(3) {
          transform: rotate(-45deg) translate(5px, -5px);
        }

        /* ========== ANIMAÇÃO DO WHATSAPP BUTTON ========== */
        @keyframes whatsappPulse {
          0%, 100% { 
            box-shadow: 0 10px 40px rgba(37, 211, 102, 0.4); 
          }
          50% { 
            box-shadow: 0 10px 50px rgba(37, 211, 102, 0.7); 
          }
        }
      `}</style>
      
      <div className="site-template">
        {/* Header */}
        <header className={`site-template-header ${headerBg} backdrop-blur-lg`} role="banner">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <div className={`text-2xl font-bold ${vibe === 'light' || vibe === 'elegant' ? 'text-gray-900' : 'text-white'}`}>{siteData.name}</div>
            <nav className="hidden md:flex gap-8">
              <a href="#" className={`${vibe === 'light' || vibe === 'elegant' ? 'text-gray-700' : 'text-white'} text-sm uppercase tracking-wide transition hover:opacity-70`}>Início</a>
              {siteData.sections.includes('services') && <a href="#servicos" className={`${vibe === 'light' || vibe === 'elegant' ? 'text-gray-700' : 'text-white'} text-sm uppercase tracking-wide transition hover:opacity-70`}>Serviços</a>}
              {siteData.sections.includes('gallery') && <a href="#galeria" className={`${vibe === 'light' || vibe === 'elegant' ? 'text-gray-700' : 'text-white'} text-sm uppercase tracking-wide transition hover:opacity-70`}>Galeria</a>}
              {siteData.sections.includes('contact') && <a href="#contato" className={`${vibe === 'light' || vibe === 'elegant' ? 'text-gray-700' : 'text-white'} text-sm uppercase tracking-wide transition hover:opacity-70`}>Contato</a>}
            </nav>
            <a 
              href={siteData.phone ? `https://wa.me/${siteData.phone.replace(/\D/g, '')}` : '#contato'}
              target={siteData.phone ? '_blank' : '_self'}
              rel={siteData.phone ? 'noopener noreferrer' : ''}
              className="hidden md:block px-6 py-3 rounded-full font-semibold text-sm uppercase tracking-wide hover:shadow-lg transition"
              style={{
                background: `linear-gradient(135deg, ${primaryColor}, ${primaryLight})`,
                color: getContrastText(primaryColor)
              }}
            >
              Fale Conosco
            </a>
            
            {/* Mobile Menu Button */}
            <button 
              className="md:hidden flex flex-col justify-center items-center w-10 h-10 relative z-50"
              onClick={() => {
                const menu = document.getElementById('mobile-menu');
                const overlay = document.getElementById('mobile-overlay');
                const btn = document.getElementById('mobile-menu-btn');
                menu?.classList.toggle('translate-x-full');
                overlay?.classList.toggle('hidden');
                btn?.classList.toggle('open');
              }}
              id="mobile-menu-btn"
            >
              <span className={`block w-6 h-0.5 mb-1 transition-all duration-300 ${vibe === 'light' || vibe === 'elegant' ? 'bg-gray-900' : 'bg-white'}`} style={{transformOrigin: '4px 0px'}}></span>
              <span className={`block w-6 h-0.5 mb-1 transition-all duration-300 ${vibe === 'light' || vibe === 'elegant' ? 'bg-gray-900' : 'bg-white'}`}></span>
              <span className={`block w-6 h-0.5 transition-all duration-300 ${vibe === 'light' || vibe === 'elegant' ? 'bg-gray-900' : 'bg-white'}`} style={{transformOrigin: '4px 0px'}}></span>
            </button>
          </div>
        </header>

        {/* Mobile Menu Overlay */}
        <div 
          id="mobile-overlay"
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 hidden md:hidden transition-opacity duration-300"
          onClick={() => {
            const menu = document.getElementById('mobile-menu');
            const overlay = document.getElementById('mobile-overlay');
            const btn = document.getElementById('mobile-menu-btn');
            menu?.classList.add('translate-x-full');
            overlay?.classList.add('hidden');
            btn?.classList.remove('open');
          }}
        ></div>

        {/* Mobile Menu Drawer */}
        <div 
          id="mobile-menu"
          className={`fixed top-0 right-0 h-screen w-4/5 max-w-xs ${headerBg} backdrop-blur-lg z-50 transform translate-x-full transition-transform duration-300 ease-in-out shadow-2xl md:hidden`}
          style={{paddingTop: '80px'}}
        >
          <nav className="flex flex-col gap-6 px-6">
            <a 
              href="#" 
              className={`${vibe === 'light' || vibe === 'elegant' ? 'text-gray-700 border-gray-200' : 'text-white border-white/10'} text-base uppercase tracking-wide py-3 border-b transition hover:opacity-70`}
              onClick={() => {
                const menu = document.getElementById('mobile-menu');
                const overlay = document.getElementById('mobile-overlay');
                const btn = document.getElementById('mobile-menu-btn');
                menu?.classList.add('translate-x-full');
                overlay?.classList.add('hidden');
                btn?.classList.remove('open');
              }}
            >
              Início
            </a>
            {siteData.sections.includes('services') && (
              <a 
                href="#servicos" 
                className={`${vibe === 'light' || vibe === 'elegant' ? 'text-gray-700 border-gray-200' : 'text-white border-white/10'} text-base uppercase tracking-wide py-3 border-b transition hover:opacity-70`}
                onClick={() => {
                  const menu = document.getElementById('mobile-menu');
                  const overlay = document.getElementById('mobile-overlay');
                  const btn = document.getElementById('mobile-menu-btn');
                  menu?.classList.add('translate-x-full');
                  overlay?.classList.add('hidden');
                  btn?.classList.remove('open');
                }}
              >
                Serviços
              </a>
            )}
            {siteData.sections.includes('gallery') && (
              <a 
                href="#galeria" 
                className={`${vibe === 'light' || vibe === 'elegant' ? 'text-gray-700 border-gray-200' : 'text-white border-white/10'} text-base uppercase tracking-wide py-3 border-b transition hover:opacity-70`}
                onClick={() => {
                  const menu = document.getElementById('mobile-menu');
                  const overlay = document.getElementById('mobile-overlay');
                  const btn = document.getElementById('mobile-menu-btn');
                  menu?.classList.add('translate-x-full');
                  overlay?.classList.add('hidden');
                  btn?.classList.remove('open');
                }}
              >
                Galeria
              </a>
            )}
            {siteData.sections.includes('contact') && (
              <a 
                href="#contato" 
                className={`${vibe === 'light' || vibe === 'elegant' ? 'text-gray-700 border-gray-200' : 'text-white border-white/10'} text-base uppercase tracking-wide py-3 border-b transition hover:opacity-70`}
                onClick={() => {
                  const menu = document.getElementById('mobile-menu');
                  const overlay = document.getElementById('mobile-overlay');
                  const btn = document.getElementById('mobile-menu-btn');
                  menu?.classList.add('translate-x-full');
                  overlay?.classList.add('hidden');
                  btn?.classList.remove('open');
                }}
              >
                Contato
              </a>
            )}
          </nav>
          <div className="px-6 mt-6">
            <a 
              href={siteData.phone ? `https://wa.me/${siteData.phone.replace(/\D/g, '')}` : '#contato'}
              target={siteData.phone ? '_blank' : '_self'}
              rel={siteData.phone ? 'noopener noreferrer' : ''}
              className="w-full px-6 py-4 rounded-full font-semibold text-sm uppercase tracking-wide hover:shadow-lg transition block text-center"
              style={{
                background: `linear-gradient(135deg, ${primaryColor}, ${primaryLight})`,
                color: getContrastText(primaryColor)
              }}
              onClick={() => {
                const menu = document.getElementById('mobile-menu');
                const overlay = document.getElementById('mobile-overlay');
                const btn = document.getElementById('mobile-menu-btn');
                menu?.classList.add('translate-x-full');
                overlay?.classList.add('hidden');
                btn?.classList.remove('open');
              }}
            >
              Fale Conosco
            </a>
          </div>
        </div>

        {/* Hero */}
        {siteData.sections.includes('hero') && (
          <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-20" style={{backgroundColor: primaryColor}}>
            {/* Elementos decorativos animados de fundo com efeitos de luzes - Z-INDEX BAIXO para não atrapalhar leitura */}
            <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
              {/* Círculo grande superior esquerdo */}
              <div 
                className="hero-decorative-circle hero-float-slow"
                style={{
                  width: '500px',
                  height: '500px',
                  top: '-200px',
                  left: '-150px',
                  opacity: 0.15
                }}
              ></div>
              
              {/* Círculo médio inferior direito */}
              <div 
                className="hero-decorative-circle hero-pulse"
                style={{
                  width: '350px',
                  height: '350px',
                  bottom: '-100px',
                  right: '-80px',
                  animationDelay: '1s'
                }}
              ></div>

              {/* Círculo pequeno superior direito */}
              <div 
                className="hero-decorative-circle hero-float-element"
                style={{
                  width: '200px',
                  height: '200px',
                  top: '100px',
                  right: '150px',
                  opacity: 0.1,
                  animationDelay: '2s'
                }}
              ></div>

              {/* Círculo médio centro-esquerdo */}
              <div 
                className="hero-decorative-circle hero-pulse"
                style={{
                  width: '280px',
                  height: '280px',
                  top: '50%',
                  left: '10%',
                  opacity: 0.12,
                  animationDelay: '3s'
                }}
              ></div>

              {/* Partículas de luz animadas - AUMENTADAS */}
              <div className="absolute top-20 left-20 w-6 h-6 rounded-full bg-white opacity-60 hero-float-element" style={{animationDelay: '0.5s'}}></div>
              <div className="absolute top-40 right-32 w-5 h-5 rounded-full bg-white opacity-50 hero-pulse" style={{animationDelay: '1.5s'}}></div>
              <div className="absolute bottom-32 left-40 w-8 h-8 rounded-full bg-white opacity-40 hero-float-slow" style={{animationDelay: '2.5s'}}></div>
              <div className="absolute top-60 left-1/4 w-4 h-4 rounded-full bg-white opacity-70 hero-pulse" style={{animationDelay: '3.5s'}}></div>
              <div className="absolute bottom-40 right-1/4 w-5 h-5 rounded-full bg-white opacity-55 hero-float-element" style={{animationDelay: '4s'}}></div>
              <div className="absolute top-1/3 right-20 w-6 h-6 rounded-full bg-white opacity-45 hero-float-slow" style={{animationDelay: '2s'}}></div>
              
              {/* NOVAS partículas adicionais */}
              <div className="absolute top-10 right-1/4 w-7 h-7 rounded-full bg-white opacity-65 hero-pulse" style={{animationDelay: '0.8s'}}></div>
              <div className="absolute bottom-20 left-1/3 w-5 h-5 rounded-full bg-white opacity-60 hero-float-element" style={{animationDelay: '1.2s'}}></div>
              <div className="absolute top-1/2 left-10 w-6 h-6 rounded-full bg-white opacity-50 hero-float-slow" style={{animationDelay: '3s'}}></div>
              <div className="absolute bottom-60 right-40 w-4 h-4 rounded-full bg-white opacity-70 hero-pulse" style={{animationDelay: '4.5s'}}></div>
              <div className="absolute top-80 right-10 w-8 h-8 rounded-full bg-white opacity-45 hero-float-element" style={{animationDelay: '0.3s'}}></div>
              <div className="absolute bottom-10 left-20 w-6 h-6 rounded-full bg-white opacity-55 hero-float-slow" style={{animationDelay: '5s'}}></div>
              <div className="absolute top-1/4 left-1/2 w-5 h-5 rounded-full bg-white opacity-60 hero-pulse" style={{animationDelay: '1.8s'}}></div>
              <div className="absolute bottom-1/3 right-1/3 w-7 h-7 rounded-full bg-white opacity-50 hero-float-element" style={{animationDelay: '3.2s'}}></div>
              <div className="absolute top-96 left-60 w-4 h-4 rounded-full bg-white opacity-65 hero-float-slow" style={{animationDelay: '2.3s'}}></div>

              {/* Raios de luz sutis */}
              <div 
                className="absolute top-0 left-1/4 w-1 h-full opacity-5 hero-pulse"
                style={{
                  background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.3), transparent)',
                  transform: 'rotate(15deg)',
                  animationDelay: '1s'
                }}
              ></div>
              <div 
                className="absolute top-0 right-1/3 w-1 h-full opacity-5 hero-pulse"
                style={{
                  background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.3), transparent)',
                  transform: 'rotate(-10deg)',
                  animationDelay: '2s'
                }}
              ></div>
            </div>

            {/* Conteúdo centralizado */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
              <div className="max-w-5xl mx-auto">
                {/* Badge */}
                <div className="hero-slide-up mb-8" style={{animationDelay: '0.1s'}}>
                  <div 
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold shadow-2xl" 
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      color: getContrastText(primaryColor),
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    <span>🔥</span> {siteData.area}
                  </div>
                </div>

                {/* Título principal - Responsivo */}
                <h1 
                  className="hero-slide-up text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-4 sm:mb-6 leading-tight px-4"
                  style={{
                    animationDelay: '0.2s',
                    color: getContrastText(primaryColor),
                    textShadow: '0 4px 20px rgba(0,0,0,0.3)'
                  }}
                >
                  {siteData.slogan || siteData.name}
                </h1>

                {/* Descrição - Responsiva */}
                <p 
                  className="hero-slide-up text-base sm:text-lg md:text-xl lg:text-2xl mb-8 sm:mb-10 lg:mb-12 leading-relaxed max-w-2xl mx-auto px-4"
                  style={{
                    animationDelay: '0.3s',
                    color: getContrastText(primaryColor),
                    opacity: 0.95,
                    textShadow: '0 2px 10px rgba(0,0,0,0.2)'
                  }}
                >
                  {siteData.description}
                </p>

                {/* Botões CTA - Responsivos */}
                <div className="hero-slide-up flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-12 sm:mb-16 lg:mb-20 px-4" style={{animationDelay: '0.4s'}}>
                  <button 
                    className="w-full sm:w-auto px-8 sm:px-10 lg:px-12 py-4 sm:py-5 rounded-full font-bold uppercase text-xs sm:text-sm tracking-wide shadow-2xl transition transform hover:scale-105 hover:shadow-3xl"
                    style={{
                      backgroundColor: '#ffffff',
                      color: primaryColor
                    }}
                  >
                    <span>Começar Agora</span>
                  </button>
                  <button 
                    className="w-full sm:w-auto px-8 sm:px-10 lg:px-12 py-4 sm:py-5 rounded-full font-bold uppercase text-xs sm:text-sm tracking-wide transition transform hover:scale-105"
                    style={{
                      backgroundColor: 'transparent',
                      color: getContrastText(primaryColor),
                      border: `2px solid ${getContrastText(primaryColor)}80`,
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    Saiba Mais
                  </button>
                </div>

                {/* Estatísticas - com padding extra para não cortar */}
                <div className="hero-slide-up grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 px-4" style={{animationDelay: '0.5s'}}>
                  {(siteData.heroStats || [
                    { value: '500+', label: 'Clientes Satisfeitos' },
                    { value: '4.9★', label: 'Avaliação Média' },
                    { value: '10+', label: 'Anos de Experiência' }
                  ]).map((stat, idx) => (
                    <div 
                      key={idx}
                      className="p-4 sm:p-6 lg:p-8 rounded-2xl transform transition-all duration-300 hover:scale-105"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-2" style={{color: getContrastText(primaryColor)}}>{stat.value}</h3>
                      <p className="text-xs sm:text-sm uppercase tracking-wider font-semibold opacity-90" style={{color: getContrastText(primaryColor)}}>{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Features */}
        <section className="py-20 bg-gradient-to-b from-gray-50 to-white -mt-12 relative z-20 overflow-hidden">
          {/* Elementos decorativos de fundo */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br opacity-5 rounded-full blur-3xl" style={{background: `radial-gradient(circle, ${primaryColor}, transparent)`}}></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br opacity-5 rounded-full blur-3xl" style={{background: `radial-gradient(circle, ${accentColor}, transparent)`}}></div>
          </div>

          <div className="container mx-auto px-6 relative z-10">
            {/* Título da seção */}
            <div className="text-center mb-16">
              <span 
                className="inline-block px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider mb-5"
                style={{
                  backgroundColor: `${primaryColor}10`,
                  color: primaryColor
                }}
              >
                Por Que Escolher a Gente?
              </span>
              <h2 className="text-5xl font-black text-gray-900">
                Benefícios <span style={{ color: primaryColor }}>Exclusivos</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: "M20 5L25 15H35L27.5 22.5L30 32.5L20 26.25L10 32.5L12.5 22.5L5 15H15L20 5Z", title: "Experiência Premium", desc: "Muito mais que um serviço, uma verdadeira experiência de luxo e conforto" },
                { icon: "M20 20m-15 0a15 15 0 1 0 30 0a15 15 0 1 0 -30 0M13 20L18 25L27 16", title: "Profissionais Qualificados", desc: "Equipe altamente treinada e experiente no que faz" },
                { icon: "M20 20m-15 0a15 15 0 1 0 30 0a15 15 0 1 0 -30 0M20 15V20L25 25", title: "Atendimento Fácil", desc: "Agende com total praticidade e rapidez" }
              ].map((feature, idx) => (
                <div 
                  key={idx} 
                  className="feature-card bg-white p-10 rounded-3xl text-center border-2 cursor-pointer"
                  style={{
                    borderColor: 'transparent',
                    background: 'linear-gradient(white, white) padding-box, linear-gradient(135deg, rgba(234, 88, 12, 0.1), rgba(251, 146, 60, 0.1)) border-box'
                  }}
                >
                  <div 
                    className="feature-icon-container w-24 h-24 mx-auto mb-6 flex items-center justify-center rounded-2xl relative"
                    style={{
                      background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
                      boxShadow: `0 10px 30px ${primaryColor}40`
                    }}
                  >
                    <svg width="48" height="48" viewBox="0 0 40 40" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d={feature.icon}/>
                    </svg>
                    {/* Brilho animado */}
                    <div 
                      className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: 'radial-gradient(circle at center, rgba(255,255,255,0.3), transparent 70%)'
                      }}
                    ></div>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                  
                  {/* Indicador visual de hover */}
                  <div className="mt-6 flex items-center justify-center gap-2 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity" style={{color: primaryColor}}>
                    <span>Saiba mais</span>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 12L10 8L6 4"/>
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About */}
        {siteData.sections.includes('about') && (
          <section className="py-24 relative overflow-hidden" style={{background: `linear-gradient(135deg, ${lightenColor(primaryColor, 0.95)}, ${lightenColor(accentColor, 0.97)})`}}>
            {/* Fundo decorativo */}
            <div className="absolute inset-0 pointer-events-none z-0">
              <div className="absolute top-1/4 -right-32 w-96 h-96 rounded-full opacity-5" style={{background: `radial-gradient(circle, ${primaryColor}, transparent)`}}></div>
              <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full opacity-5" style={{background: `radial-gradient(circle, ${accentColor}, transparent)`}}></div>
            </div>

            <div className="container mx-auto px-6 relative z-10">
              <div className="grid md:grid-cols-2 gap-20 items-center">
                {/* Galeria de imagens com animações */}
                <div className="relative h-[600px]">
                  {/* Imagem 1 */}
                  <img 
                    src="https://via.placeholder.com/400x500" 
                    alt="Sobre" 
                    className="about-image-1 absolute top-0 left-0 w-[70%] h-[70%] object-cover rounded-3xl shadow-2xl z-10 cursor-pointer" 
                  />
                  
                  {/* Imagem 2 */}
                  <img 
                    src="https://via.placeholder.com/400x500" 
                    alt="Sobre" 
                    className="about-image-2 absolute bottom-0 right-0 w-[70%] h-[70%] object-cover rounded-3xl shadow-2xl cursor-pointer" 
                  />
                  
                  {/* Card de avaliação flutuante */}
                  <div className="about-rating-card absolute bottom-5 left-5 bg-white p-6 rounded-2xl shadow-2xl flex items-center gap-4 z-20 cursor-pointer border-2 border-transparent hover:border-opacity-50" style={{borderColor: primaryColor}}>
                    <div 
                      className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl"
                      style={{
                        background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`
                      }}
                    >
                      ⭐
                    </div>
                    <div>
                      <strong className="text-4xl font-black block leading-none" style={{color: primaryColor}}>4.9</strong>
                      <p className="text-sm text-gray-600 font-semibold">Avaliação</p>
                    </div>
                  </div>

                  {/* Elemento decorativo */}
                  <div 
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full rounded-full opacity-10 -z-10 blur-3xl"
                    style={{background: `radial-gradient(circle, ${primaryColor}, transparent)`}}
                  ></div>
                </div>

                {/* Conteúdo com animações */}
                <div className="about-content">
                  <span 
                    className="inline-block px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider mb-5"
                    style={{
                      backgroundColor: `${primaryColor}10`,
                      color: primaryColor
                    }}
                  >
                    Sobre Nós
                  </span>
                  
                  <h2 className="text-5xl md:text-6xl font-black mb-6 leading-tight text-gray-900">
                    Do Sonho à<br/>
                    <span style={{ color: primaryColor }}>
                      Realidade
                    </span>
                  </h2>
                  
                  <p className="text-xl font-medium text-gray-700 mb-5 leading-relaxed">
                    Nossa empresa foi projetada para ser um ponto de referência em qualidade, inovação e excelência.
                  </p>
                  
                  <p className="text-gray-600 mb-8 leading-relaxed">
                    {siteData.description}
                  </p>
                  
                  {/* Lista de checagem animada */}
                  <div className="space-y-4 my-8">
                    {['Profissionais certificados', 'Produtos premium', 'Ambiente climatizado'].map((item, idx) => (
                      <div 
                        key={idx} 
                        className="about-checklist-item flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 cursor-pointer"
                        style={{
                          animationDelay: `${0.5 + idx * 0.1}s`
                        }}
                      >
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{
                            backgroundColor: `${primaryColor}15`
                          }}
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={primaryColor} strokeWidth="3">
                            <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" strokeLinecap="round"/>
                          </svg>
                        </div>
                        <span className="font-semibold text-gray-800">{item}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Botão CTA */}
                  <button 
                    className="px-12 py-5 rounded-full font-bold uppercase text-sm tracking-wide shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
                    style={{
                      background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
                      color: getContrastText(primaryColor)
                    }}
                  >
                    Agende seu horário
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Services */}
        {siteData.sections.includes('services') && siteData.services.length > 0 && (
          <section id="servicos" className="py-24 text-white relative overflow-hidden" style={{background: `linear-gradient(135deg, ${primaryColor}, ${darkColor})`}}>
            {/* Efeitos de fundo animados */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-0 w-full h-full opacity-10">
                <div className="absolute top-20 left-20 w-64 h-64 rounded-full hero-pulse" style={{background: 'radial-gradient(circle, rgba(255,255,255,0.3), transparent)'}}></div>
                <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full hero-float-slow" style={{background: 'radial-gradient(circle, rgba(255,255,255,0.2), transparent)'}}></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full hero-pulse" style={{background: 'radial-gradient(circle, rgba(255,255,255,0.15), transparent)', animationDelay: '1.5s'}}></div>
              </div>
            </div>

            <div className="container mx-auto px-6 relative z-10">
              {/* Título da seção */}
              <div className="text-center max-w-2xl mx-auto mb-16">
                <span className="inline-block px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider mb-6 shadow-xl" style={{backgroundColor: 'rgba(255,255,255,0.2)', color: getContrastText(primaryColor), border: '2px solid rgba(255,255,255,0.3)'}}>
                  Nossos Serviços
                </span>
                <h2 className="text-5xl md:text-6xl font-black mb-6 leading-tight" style={{color: getContrastText(primaryColor), textShadow: '0 4px 20px rgba(0,0,0,0.4)'}}>
                  Serviços que<br/>
                  <span style={{textShadow: '0 6px 30px rgba(0,0,0,0.6)'}}>Transformam</span>
                </h2>
                <p className="text-xl leading-relaxed" style={{color: getContrastText(primaryColor), opacity: 0.9, textShadow: '0 2px 10px rgba(0,0,0,0.3)'}}>
                  Oferecemos uma gama completa de serviços de excelência
                </p>
              </div>

              {/* Grid de serviços */}
              <div className="grid md:grid-cols-3 gap-8">
                {siteData.services.slice(0, 6).map((service, idx) => (
                  <div 
                    key={idx} 
                    className="service-card p-10 rounded-3xl text-center cursor-pointer border-2"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.08)',
                      borderColor: 'rgba(255,255,255,0.2)',
                      animationDelay: `${idx * 0.1}s`
                    }}
                  >
                    {/* Ícone do serviço */}
                    <div 
                      className="service-icon w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-2xl text-5xl"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.15)',
                        border: '2px solid rgba(255,255,255,0.3)'
                      }}
                    >
                      ✨
                    </div>
                    
                    {/* Nome do serviço */}
                    <h3 className="text-2xl font-bold mb-4" style={{color: getContrastText(primaryColor), textShadow: '0 2px 6px rgba(0,0,0,0.5)'}}>
                      {service}
                    </h3>
                    
                    {/* Descrição */}
                    <p className="leading-relaxed mb-6" style={{color: getContrastText(primaryColor), opacity: 0.85, textShadow: '0 1px 3px rgba(0,0,0,0.4)'}}>
                      Serviço de qualidade premium com resultados excepcionais
                    </p>

                    {/* Divisor decorativo */}
                    <div className="w-16 h-1 mx-auto mb-6 rounded-full" style={{background: 'rgba(255,255,255,0.3)'}}></div>

                    {/* CTA */}
                    <button className="px-6 py-2 rounded-full text-sm font-semibold transition-all hover:scale-105" style={{backgroundColor: 'rgba(255,255,255,0.2)', color: getContrastText(primaryColor), border: '1px solid rgba(255,255,255,0.4)'}}>
                      Saiba Mais
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* App Download Section */}
        {siteData.sections.includes('app') && (
          <section className="py-24 text-white" style={{background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`}}>
            <div className="container mx-auto px-6">
              <div className="grid md:grid-cols-2 gap-20 items-center">
                <div>
                  <span className="inline-block px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider mb-5" style={{backgroundColor: 'rgba(255,255,255,0.25)', color: '#ffffff', textShadow: '0 2px 4px rgba(0,0,0,0.4)'}}>
                    Nosso App
                  </span>
                  <h2 className="text-5xl font-black mb-6 leading-tight" style={{color: '#ffffff', textShadow: '0 4px 8px rgba(0,0,0,0.5)'}}>
                    Agende pelo<br/>
                    <span style={{textShadow: '0 4px 8px rgba(0,0,0,0.6)'}}>Aplicativo</span>
                  </h2>
                  <p className="text-xl mb-8 leading-relaxed" style={{color: '#ffffff', textShadow: '0 2px 4px rgba(0,0,0,0.4)'}}>
                    Baixe nosso app e tenha acesso a horários disponíveis, promoções exclusivas e muito mais!
                  </p>
                  <div className="space-y-4 mb-10">
                    <div className="flex items-center gap-4" style={{color: '#ffffff'}}>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M7 10L9 12L13 8M19 10C19 14.9706 14.9706 19 10 19C5.02944 19 1 14.9706 1 10C1 5.02944 5.02944 1 10 1C14.9706 1 19 5.02944 19 10Z"/>
                      </svg>
                      <span className="font-medium" style={{textShadow: '0 2px 4px rgba(0,0,0,0.4)'}}>Agendamento em segundos</span>
                    </div>
                    <div className="flex items-center gap-4" style={{color: '#ffffff'}}>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M7 10L9 12L13 8M19 10C19 14.9706 14.9706 19 10 19C5.02944 19 1 14.9706 1 10C1 5.02944 5.02944 1 10 1C14.9706 1 19 5.02944 19 10Z"/>
                      </svg>
                      <span className="font-medium" style={{textShadow: '0 2px 4px rgba(0,0,0,0.4)'}}>Lembretes automáticos</span>
                    </div>
                  </div>
                  <div className="flex gap-5 flex-wrap">
                    <button className="px-8 py-3 bg-white rounded-full font-semibold hover:scale-105 transition" style={{color: primaryColor}}>
                      📱 Google Play
                    </button>
                    <button className="px-8 py-3 bg-white rounded-full font-semibold hover:scale-105 transition" style={{color: primaryColor}}>
                      🍎 App Store
                    </button>
                  </div>
                </div>
                <div className="relative text-center">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/20 rounded-full blur-3xl"></div>
                  <img src="https://via.placeholder.com/300x600/1a1a1a/ffffff?text=App+Preview" alt="App" className="relative z-10 max-w-xs mx-auto drop-shadow-2xl rounded-3xl" />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* FAQ Section */}
        {siteData.sections.includes('faq') && siteData.faq && siteData.faq.length > 0 && (
          <section className="py-24" style={{background: `linear-gradient(to bottom, ${lightenColor(secondaryColor, 0.98)}, #ffffff)`}}>
            <div className="container mx-auto px-6">
              <div className="text-center mb-16">
                <span 
                  className="inline-block px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider mb-5"
                  style={{
                    backgroundColor: `${primaryColor}10`,
                    color: primaryColor
                  }}
                >
                  FAQ
                </span>
                <h2 className="text-5xl font-black text-gray-900">
                  Perguntas <span style={{ color: primaryColor }}>Frequentes</span>
                </h2>
              </div>
              <div className="max-w-3xl mx-auto space-y-4">
                {siteData.faq.map((item, idx) => (
                  <details key={idx} className="group bg-gray-50 rounded-2xl overflow-hidden border border-gray-200 hover:shadow-lg transition" style={{borderColor: `${primaryColor}20`}}>
                    <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                      <h3 className="text-lg font-bold text-gray-900">{item.question}</h3>
                      <svg className="w-6 h-6 transform group-open:rotate-180 transition-transform" fill="none" stroke={primaryColor} viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="px-6 pb-6">
                      <p className="text-gray-600 leading-relaxed">{item.answer}</p>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Pricing Section */}
        {siteData.sections.includes('pricing') && (
          <section className="py-24 bg-gray-50">
            <div className="container mx-auto px-6">
              <div className="text-center mb-16">
                <span 
                  className="inline-block px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider mb-5"
                  style={{
                    backgroundColor: `${primaryColor}10`,
                    color: primaryColor
                  }}
                >
                  Preços
                </span>
                <h2 className="text-5xl font-black text-gray-900">
                  Planos que <span style={{ color: primaryColor }}>Cabem no Bolso</span>
                </h2>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { name: 'Básico', price: 'R$ 99', features: ['Atendimento básico', 'Produtos padrão', 'Sem agendamento'] },
                  { name: 'Premium', price: 'R$ 199', features: ['Atendimento premium', 'Produtos premium', 'Agendamento prioritário', 'Brindes exclusivos'], popular: true },
                  { name: 'VIP', price: 'R$ 299', features: ['Atendimento VIP', 'Produtos top de linha', 'Agendamento exclusivo', 'Tratamento especial', 'Benefícios extras'] }
                ].map((plan, idx) => (
                  <div key={idx} className={`bg-white p-10 rounded-2xl hover:shadow-2xl transition relative ${plan.popular ? 'scale-105 border-2' : 'border'}`} style={{borderColor: plan.popular ? primaryColor : '#e5e7eb'}}>
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-6 py-1 rounded-full text-sm font-bold text-white" style={{backgroundColor: primaryColor}}>
                        POPULAR
                      </div>
                    )}
                    <h3 className="text-2xl font-bold mb-4 text-gray-900">{plan.name}</h3>
                    <div className="mb-6">
                      <span className="text-5xl font-black" style={{color: primaryColor}}>{plan.price}</span>
                      <span className="text-gray-600">/mês</span>
                    </div>
                    <ul className="space-y-4 mb-8">
                      {plan.features.map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-3">
                          <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="none" stroke={primaryColor} viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <button 
                      className={`w-full py-4 rounded-full font-semibold uppercase text-sm tracking-wide transition ${plan.popular ? 'text-white hover:shadow-xl' : 'hover:text-white'}`}
                      style={plan.popular ? {
                        background: `linear-gradient(to right, ${primaryColor}, ${accentColor})`,
                        color: getContrastText(primaryColor)
                      } : {
                        border: `2px solid ${primaryColor}`,
                        color: primaryColor
                      }}
                      onMouseEnter={e => {
                        if (!plan.popular) {
                          e.currentTarget.style.backgroundColor = primaryColor;
                          e.currentTarget.style.color = getContrastText(primaryColor);
                        }
                      }}
                      onMouseLeave={e => {
                        if (!plan.popular) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = primaryColor;
                        }
                      }}
                    >
                      Escolher Plano
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Team Section */}
        {siteData.sections.includes('team') && (
          <section className="py-24" style={{background: `linear-gradient(135deg, ${lightenColor(accentColor, 0.95)}, ${lightenColor(primaryColor, 0.97)})`}}>
            <div className="container mx-auto px-6">
              <div className="text-center mb-16">
                <span 
                  className="inline-block px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider mb-5"
                  style={{
                    backgroundColor: `${primaryColor}10`,
                    color: primaryColor
                  }}
                >
                  Nossa Equipe
                </span>
                <h2 className="text-5xl font-black text-gray-900">
                  Conheça nosso <span style={{ color: primaryColor }}>Time</span>
                </h2>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { name: 'João Silva', role: 'CEO & Fundador' },
                  { name: 'Maria Santos', role: 'Diretora de Operações' },
                  { name: 'Pedro Costa', role: 'Gerente de Atendimento' }
                ].map((member, idx) => (
                  <div key={idx} className="text-center group">
                    <div className="relative mb-6 inline-block">
                      <div 
                        className="w-48 h-48 mx-auto rounded-full text-white flex items-center justify-center text-5xl font-bold group-hover:scale-105 transition-transform"
                        style={{
                          background: `linear-gradient(to bottom right, ${primaryColor}, ${accentColor})`,
                          color: getContrastText(primaryColor)
                        }}
                      >
                        {member.name.charAt(0)}
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold mb-2 text-gray-900">{member.name}</h3>
                    <p className="font-medium mb-4" style={{color: primaryColor}}>{member.role}</p>
                    <div className="flex justify-center gap-3">
                      <a href="#" className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full transition" style={{color: '#6b7280'}} onMouseEnter={e => {
                        e.currentTarget.style.backgroundColor = primaryColor;
                        e.currentTarget.style.color = getContrastText(primaryColor);
                      }} onMouseLeave={e => {
                        e.currentTarget.style.backgroundColor = '#f3f4f6';
                        e.currentTarget.style.color = '#6b7280';
                      }}>
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                          <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 0 1 1.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772 4.915 4.915 0 0 1-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772A4.897 4.897 0 0 1 5.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2z" />
                        </svg>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Gallery */}
        {siteData.sections.includes('gallery') && siteData.gallery.length > 0 && (
          <section id="galeria" className="py-24 bg-gray-50 relative overflow-hidden">
            {/* Fundo decorativo */}
            <div className="absolute inset-0 pointer-events-none opacity-5">
              <div className="absolute top-20 right-20 w-72 h-72 rounded-full blur-3xl" style={{background: `radial-gradient(circle, ${primaryColor}, transparent)`}}></div>
              <div className="absolute bottom-20 left-20 w-96 h-96 rounded-full blur-3xl" style={{background: `radial-gradient(circle, ${accentColor}, transparent)`}}></div>
            </div>

            <div className="container mx-auto px-6 relative z-10">
              {/* Título da seção */}
              <div className="text-center mb-16">
                <span 
                  className="inline-block px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider mb-5"
                  style={{
                    backgroundColor: `${primaryColor}10`,
                    color: primaryColor
                  }}
                >
                  Galeria
                </span>
                <h2 className="text-5xl md:text-6xl font-black text-gray-900">
                  Nosso <span style={{ color: primaryColor }}>Trabalho</span>
                </h2>
                <p className="text-xl text-gray-600 mt-4 max-w-2xl mx-auto">
                  Confira alguns dos nossos melhores projetos e trabalhos realizados
                </p>
              </div>

              {/* Grid de imagens */}
              <div className="grid md:grid-cols-3 gap-6">
                {siteData.gallery.map((img, idx) => (
                  <div 
                    key={idx} 
                    className="gallery-item relative overflow-hidden rounded-3xl aspect-[4/3] cursor-pointer shadow-lg hover:shadow-2xl transition-shadow"
                    style={{
                      animationDelay: `${idx * 0.1}s`
                    }}
                  >
                    {/* Imagem */}
                    <img 
                      src={img} 
                      alt={`${siteData.name} - Galeria ${idx + 1}`} 
                      className="w-full h-full object-cover" 
                      loading="lazy" 
                    />
                    
                    {/* Overlay com gradiente */}
                    <div 
                      className="gallery-overlay absolute inset-0 opacity-0 flex flex-col items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${primaryColor}f0, ${accentColor}f0)`
                      }}
                    >
                      {/* Conteúdo do overlay */}
                      <div className="gallery-overlay-content text-center px-6">
                        {/* Ícone de zoom */}
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{backgroundColor: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.4)'}}>
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                            <circle cx="11" cy="11" r="8"/>
                            <path d="M21 21l-4.35-4.35"/>
                            <path d="M11 8v6M8 11h6"/>
                          </svg>
                        </div>
                        
                        {/* Texto */}
                        <h3 className="text-xl font-bold text-white mb-2">
                          Projeto {idx + 1}
                        </h3>
                        <p className="text-white text-sm opacity-90">
                          Ver detalhes
                        </p>
                      </div>

                      {/* Efeito de brilho no canto */}
                      <div className="absolute top-0 right-0 w-32 h-32 opacity-20" style={{background: 'radial-gradient(circle at top right, rgba(255,255,255,0.8), transparent)'}}></div>
                    </div>

                    {/* Borda decorativa no hover */}
                    <div className="absolute inset-0 rounded-3xl pointer-events-none" style={{border: '3px solid transparent', transition: 'border-color 0.3s'}}></div>
                  </div>
                ))}
              </div>

              {/* CTA para ver mais */}
              <div className="text-center mt-12">
                <button 
                  className="px-10 py-4 rounded-full font-bold uppercase text-sm tracking-wide shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
                    color: getContrastText(primaryColor)
                  }}
                >
                  Ver Mais Projetos
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Reviews */}
        {siteData.sections.includes('testimonials') && (
          <section className="py-24 relative overflow-hidden" style={{background: `linear-gradient(to bottom right, #ffffff, ${lightenColor(primaryColor, 0.96)})`}}>
            {/* Fundo decorativo */}
            <div className="absolute inset-0 pointer-events-none opacity-5 z-0">
              <div className="absolute top-20 left-20 w-80 h-80 rounded-full blur-3xl" style={{background: `radial-gradient(circle, ${primaryColor}, transparent)`}}></div>
              <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full blur-3xl" style={{background: `radial-gradient(circle, ${accentColor}, transparent)`}}></div>
            </div>

            <div className="container mx-auto px-6 relative z-10">
              {/* Título da seção */}
              <div className="text-center mb-16">
                <span 
                  className="inline-block px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider mb-5"
                  style={{
                    backgroundColor: `${primaryColor}10`,
                    color: primaryColor
                  }}
                >
                  Depoimentos
                </span>
                <h2 className="text-5xl md:text-6xl font-black text-gray-900">
                  O que dizem<br/>
                  <span style={{ color: primaryColor }}>
                    Nossos Clientes
                  </span>
                </h2>
                <p className="text-xl text-gray-600 mt-4 max-w-2xl mx-auto">
                  Veja o que nossos clientes satisfeitos têm a dizer sobre nossos serviços
                </p>
              </div>

              {/* Grid de depoimentos */}
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { name: 'Ana Silva', role: 'Cliente desde 2024', text: 'Excelente serviço! Profissionais atenciosos e ambiente incrível. Recomendo muito!', initial: 'A' },
                  { name: 'Carlos Santos', role: 'Cliente desde 2023', text: 'Superou todas as minhas expectativas! Qualidade premium com atendimento impecável.', initial: 'C' },
                  { name: 'Maria Costa', role: 'Cliente desde 2024', text: 'Simplesmente perfeito! A melhor experiência que já tive. Voltarei sempre!', initial: 'M' }
                ].map((testimonial, idx) => (
                  <div 
                    key={idx} 
                    className="testimonial-card bg-gradient-to-br from-gray-50 to-white p-10 rounded-3xl border-2 cursor-pointer"
                    style={{
                      borderColor: `${primaryColor}20`,
                      animationDelay: `${idx * 0.15}s`
                    }}
                  >
                    {/* Estrelas de avaliação */}
                    <div className="testimonial-stars mb-6" style={{color: '#fbbf24'}}>
                      {[...Array(5)].map((_, starIdx) => (
                        <svg 
                          key={starIdx} 
                          width="28" 
                          height="28" 
                          viewBox="0 0 24 24" 
                          fill="currentColor"
                          style={{
                            animationDelay: `${starIdx * 0.1}s`
                          }}
                        >
                          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                        </svg>
                      ))}
                    </div>

                    {/* Texto do depoimento com quote decorativa */}
                    <div className="testimonial-quote mb-8">
                      <p className="text-lg italic text-gray-700 leading-relaxed relative z-10">
                        "{testimonial.text}"
                      </p>
                    </div>

                    {/* Divisor decorativo */}
                    <div className="w-16 h-1 mb-6 rounded-full" style={{background: `linear-gradient(90deg, ${primaryColor}, ${accentColor})`}}></div>

                    {/* Info do cliente */}
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div 
                        className="testimonial-avatar w-16 h-16 rounded-full text-white flex items-center justify-center text-2xl font-bold flex-shrink-0"
                        style={{
                          background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
                          boxShadow: `0 5px 20px ${primaryColor}40`
                        }}
                      >
                        {testimonial.initial}
                      </div>
                      
                      {/* Nome e cargo */}
                      <div>
                        <strong className="block text-lg font-bold text-gray-900">{testimonial.name}</strong>
                        <span className="text-sm font-medium" style={{color: primaryColor}}>{testimonial.role}</span>
                      </div>
                    </div>

                    {/* Ícone de verificado */}
                    <div className="absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center" style={{backgroundColor: `${primaryColor}10`}}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={primaryColor} strokeWidth="3">
                        <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" strokeLinecap="round"/>
                      </svg>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA para deixar depoimento */}
              <div className="text-center mt-16">
                <p className="text-lg text-gray-600 mb-6">Você também é nosso cliente? Deixe seu depoimento!</p>
                <button 
                  className="px-10 py-4 rounded-full font-bold uppercase text-sm tracking-wide shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
                    color: getContrastText(primaryColor)
                  }}
                >
                  Deixar Depoimento
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Contact */}
        {siteData.sections.includes('contact') && (
          <section id="contato" className="py-24 bg-gray-50 relative overflow-hidden">
            {/* Fundo decorativo */}
            <div className="absolute inset-0 pointer-events-none opacity-5">
              <div className="absolute top-20 left-20 w-80 h-80 rounded-full blur-3xl" style={{background: `radial-gradient(circle, ${primaryColor}, transparent)`}}></div>
              <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full blur-3xl" style={{background: `radial-gradient(circle, ${accentColor}, transparent)`}}></div>
            </div>

            <div className="container mx-auto px-6 relative z-10">
              {/* Título da seção */}
              <div className="text-center mb-16">
                <span 
                  className="inline-block px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider mb-5"
                  style={{
                    backgroundColor: `${primaryColor}10`,
                    color: primaryColor
                  }}
                >
                  Fale Conosco
                </span>
                <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-4">
                  Venha nos <span style={{ color: primaryColor }}>Visitar</span>
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Estamos prontos para atender você da melhor forma possível
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-16 items-center">
                {/* Informações de contato */}
                <div className="contact-info">
                  {siteData.address && (
                    <div className="contact-item flex gap-5 mb-8 p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition cursor-pointer">
                      <div 
                        className="contact-icon w-14 h-14 flex-shrink-0 flex items-center justify-center rounded-xl"
                        style={{
                          background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
                          color: getContrastText(primaryColor)
                        }}
                      >
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z"/>
                          <circle cx="12" cy="9" r="2.5"/>
                        </svg>
                      </div>
                      <div>
                        <strong className="block text-xl font-bold text-gray-900 mb-2">Endereço</strong>
                        <p className="text-gray-600 leading-relaxed">{siteData.address}</p>
                      </div>
                    </div>
                  )}
                  
                  {siteData.phone && (
                    <div className="contact-item flex gap-5 mb-8 p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition cursor-pointer" style={{animationDelay: '0.1s'}}>
                      <div 
                        className="contact-icon w-14 h-14 flex-shrink-0 flex items-center justify-center rounded-xl"
                        style={{
                          background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
                          color: getContrastText(primaryColor)
                        }}
                      >
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 5C3 3.89543 3.89543 3 5 3H8.27924C8.70967 3 9.09181 3.27543 9.22792 3.68377L10.7257 8.17721C10.8831 8.64932 10.6694 9.16531 10.2243 9.38787L7.96701 10.5165C9.06925 12.9612 11.0388 14.9308 13.4835 16.033L14.6121 13.7757C14.8347 13.3306 15.3507 13.1169 15.8228 13.2743L20.3162 14.7721C20.7246 14.9082 21 15.2903 21 15.7208V19C21 20.1046 20.1046 21 19 21H18C9.71573 21 3 14.2843 3 6V5Z"/>
                        </svg>
                      </div>
                      <div>
                        <strong className="block text-xl font-bold text-gray-900 mb-2">Telefone</strong>
                        <p className="text-gray-600 font-medium">{siteData.phone}</p>
                      </div>
                    </div>
                  )}
                  
                  {siteData.email && (
                    <div className="contact-item flex gap-5 mb-10 p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition cursor-pointer" style={{animationDelay: '0.2s'}}>
                      <div 
                        className="contact-icon w-14 h-14 flex-shrink-0 flex items-center justify-center rounded-xl"
                        style={{
                          background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
                          color: getContrastText(primaryColor)
                        }}
                      >
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 8L10.89 13.26C11.5389 13.7165 12.4611 13.7165 13.11 13.26L21 8M5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19Z"/>
                        </svg>
                      </div>
                      <div>
                        <strong className="block text-xl font-bold text-gray-900 mb-2">E-mail</strong>
                        <p className="text-gray-600 font-medium">{siteData.email}</p>
                      </div>
                    </div>
                  )}
                  
                  <button 
                    className="px-12 py-5 rounded-full font-bold uppercase text-sm tracking-wide shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
                    style={{
                      background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
                      color: getContrastText(primaryColor)
                    }}
                  >
                    Como Chegar
                  </button>
                </div>

                {/* Mapa */}
                <div className="contact-map h-[500px] rounded-3xl overflow-hidden shadow-2xl">
                  <iframe 
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(siteData.address || 'Brasil')}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                    className="w-full h-full"
                    frameBorder="0"
                    style={{border: 0}}
                    allowFullScreen
                    loading="lazy"
                    title="Localização no Google Maps"
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
              </div>
              <div>
                <h4 className="text-white text-lg font-bold mb-5">Links Rápidos</h4>
                <ul className="space-y-3">
                  <li><a href="#" className="transition" style={{color: '#9ca3af'}} onMouseEnter={e => e.currentTarget.style.color = primaryColor} onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}>Sobre Nós</a></li>
                  <li><a href="#servicos" className="transition" style={{color: '#9ca3af'}} onMouseEnter={e => e.currentTarget.style.color = primaryColor} onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}>Serviços</a></li>
                  <li><a href="#galeria" className="transition" style={{color: '#9ca3af'}} onMouseEnter={e => e.currentTarget.style.color = primaryColor} onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}>Galeria</a></li>
                  <li><a href="#contato" className="transition" style={{color: '#9ca3af'}} onMouseEnter={e => e.currentTarget.style.color = primaryColor} onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}>Contato</a></li>
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
            className="fixed bottom-5 right-5 w-16 h-16 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition z-50"
            style={{
              backgroundColor: '#25d366',
              animation: 'whatsappPulse 2s ease-in-out infinite'
            }}
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
