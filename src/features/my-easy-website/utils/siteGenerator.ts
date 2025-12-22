import type { SiteData } from '../hooks/useSiteData';
import { getTemplateStyleById, TEMPLATE_STYLES } from '../constants/templateStyles';

/**
 * Gera o HTML completo do site baseado nos dados fornecidos
 * IMPORTANTE: Este HTML deve ser 100% IDÊNTICO ao SiteTemplate.tsx
 */
export function generateSiteHTML(siteData: SiteData, site: { siteData: SiteData }): string {
  // Obter estilos do template selecionado
  const templateId = siteData.templateId || 1;
  const templateStyle = getTemplateStyleById(templateId) || TEMPLATE_STYLES[0];

  // Filtrar marcadores internos (_processed, _skipped) dos dados
  const filteredHeroStats = (siteData.heroStats || []).filter(
    (s: { label: string }) => s.label !== '_processed' && s.label !== '_skipped'
  );
  const filteredTeam = (siteData.team || []).filter(
    (t: { name: string }) => t.name !== '_processed' && t.name !== '_skipped'
  );
  const filteredPricing = (siteData.pricing || []).filter(
    (p: { name: string }) => p.name !== '_processed' && p.name !== '_skipped'
  );

  // Parse cores do usuário (selecionadas na paleta de cores)
  const userColors = siteData.colors
    ? JSON.parse(siteData.colors)
    : null;

  // Combinar cores: prioridade para cores do usuário, fallback para cores do template
  const colors = {
    primary: userColors?.primary || templateStyle.colors.primary,
    secondary: userColors?.secondary || templateStyle.colors.secondary,
    accent: userColors?.accent || templateStyle.colors.accent,
    dark: userColors?.dark || templateStyle.colors.dark,
    light: userColors?.light || templateStyle.colors.light,
  };

  // Helper functions (MESMAS do SiteTemplate.tsx)
  const getLuminance = (hex: string): number => {
    const rgb = parseInt(hex.replace('#', ''), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    return 0.299 * r + 0.587 * g + 0.114 * b;
  };

  const isLightColor = (hex: string): boolean => {
    return getLuminance(hex) > 128;
  };

  const getContrastText = (bgHex: string): string => {
    return isLightColor(bgHex) ? '#1a1a1a' : '#ffffff';
  };

  const lightenColor = (hex: string, percent: number) => {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(
      255,
      Math.floor((num >> 16) + (255 - (num >> 16)) * percent),
    );
    const g = Math.min(
      255,
      Math.floor(
        ((num >> 8) & 0x00ff) + (255 - ((num >> 8) & 0x00ff)) * percent,
      ),
    );
    const b = Math.min(
      255,
      Math.floor((num & 0x0000ff) + (255 - (num & 0x0000ff)) * percent),
    );
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  };

  const primaryLight = lightenColor(colors.primary, 0.3);

  // Definir vibe PRIMEIRO
  const vibe = siteData.vibe || 'vibrant';

  // Cores de texto para diferentes contextos (MESMAS do SiteTemplate.tsx)
  const heroTextColor = getContrastText(colors.primary);

  // Determinar cor do header baseado no vibe
  const headerTextColor =
    vibe === 'light' || vibe === 'elegant' ? '#111827' : '#ffffff';

  // Definir backgrounds e cores baseadas no vibe (MESMAS do SiteTemplate.tsx)
  let headerBg = 'bg-gray-900/95';

  switch (vibe) {
    case 'light':
      headerBg = 'bg-white/95 border-b border-gray-200';
      break;
    case 'dark':
      headerBg = 'bg-black/95';
      break;
    case 'vibrant':
      headerBg = `bg-[${colors.primary}]/95`;
      break;
    case 'corporate':
      headerBg = 'bg-slate-900/95';
      break;
    case 'fun':
      headerBg = 'bg-purple-600/95';
      break;
    case 'elegant':
      headerBg = 'bg-white/95 border-b border-gray-100';
      break;
  }

  // SEO - usar dados customizados se disponíveis
  const seoTitle = siteData.seoData?.ogTitle || `${siteData.name} - ${siteData.slogan || 'Seu negócio online'}`;
  const seoDescription = siteData.seoData?.metaDescription ||
    siteData.description ||
    `${siteData.name} - ${siteData.slogan}. Conheça nossos serviços e entre em contato!`;
  const seoKeywords = siteData.seoData?.keywords?.join(', ') || '';

  // WhatsApp message - usar customizada se disponível
  const whatsappMessage = siteData.whatsappConfig?.welcomeMessage || 'Olá! Vim pelo site';

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${seoTitle}</title>
    <meta name="description" content="${seoDescription}">
    ${seoKeywords ? `<meta name="keywords" content="${seoKeywords}">` : ''}

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="${seoTitle}">
    <meta property="og:description" content="${seoDescription}">
    ${siteData.seoData?.ogImage ? `<meta property="og:image" content="${siteData.seoData.ogImage}">` : ''}

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${seoTitle}">
    <meta name="twitter:description" content="${seoDescription}">

    ${siteData.analyticsData?.googleAnalyticsId ? `
    <!-- Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=${siteData.analyticsData.googleAnalyticsId}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${siteData.analyticsData.googleAnalyticsId}');
    </script>
    ` : ''}

    ${siteData.analyticsData?.facebookPixelId ? `
    <!-- Facebook Pixel -->
    <script>
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${siteData.analyticsData.facebookPixelId}');
      fbq('track', 'PageView');
    </script>
    <noscript><img height="1" width="1" style="display:none"
      src="https://www.facebook.com/tr?id=${siteData.analyticsData.facebookPixelId}&ev=PageView&noscript=1"
    /></noscript>
    ` : ''}

    <link href="${templateStyle.fonts.googleFontsUrl}" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
          font-family: '${templateStyle.fonts.body}', sans-serif;
          line-height: 1.6;
          color: #333;
          --color-primary: ${colors.primary};
          --color-primary-light: ${primaryLight};
          --color-secondary: ${colors.secondary};
          --color-accent: ${colors.accent};
        }

        h1, h2, h3 { font-family: '${templateStyle.fonts.heading}', serif; }

        /* Template ${templateStyle.id} - ${templateStyle.name} Custom Styles */
        ${templateStyle.customStyles}

        /* Container */
        .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }

        /* Header */
        header {
          position: sticky;
          top: 0;
          z-index: 50;
          background: ${
            vibe === 'light'
              ? 'rgba(255, 255, 255, 0.95)'
              : vibe === 'elegant'
                ? 'rgba(255, 255, 255, 0.95)'
                : vibe === 'dark'
                  ? 'rgba(0, 0, 0, 0.95)'
                  : vibe === 'vibrant'
                    ? `${colors.primary}f2`
                    : vibe === 'corporate'
                      ? 'rgba(15, 23, 42, 0.95)'
                      : vibe === 'fun'
                        ? 'rgba(147, 51, 234, 0.95)'
                        : 'rgba(26, 26, 26, 0.95)'
          };
          backdrop-filter: blur(16px);
          ${vibe === 'light' ? 'border-bottom: 1px solid #e5e7eb;' : ''}
          ${vibe === 'elegant' ? 'border-bottom: 1px solid #f3f4f6;' : ''}
        }

        header .container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 16px;
          padding-bottom: 16px;
        }

        header .logo { font-size: 24px; font-weight: bold; color: ${headerTextColor}; }
        header .logo .logo-img { height: 40px; width: auto; max-width: 150px; object-fit: contain; }

        /* Mobile Menu Button */
        .mobile-menu-btn {
          display: none;
          width: 40px;
          height: 40px;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          background: none;
          border: none;
          padding: 0;
        }

        .mobile-menu-btn span {
          width: 24px;
          height: 2px;
          background: ${headerTextColor};
          transition: all 0.3s;
          border-radius: 2px;
        }

        .mobile-menu-btn span:not(:last-child) {
          margin-bottom: 5px;
        }

        .mobile-menu-btn.active span:nth-child(1) {
          transform: rotate(45deg) translate(6px, 6px);
        }

        .mobile-menu-btn.active span:nth-child(2) {
          opacity: 0;
        }

        .mobile-menu-btn.active span:nth-child(3) {
          transform: rotate(-45deg) translate(6px, -6px);
        }

        /* Mobile Menu Drawer */
        .mobile-menu {
          position: fixed;
          top: 0;
          right: -100%;
          width: 80%;
          max-width: 300px;
          height: 100vh;
          background: ${headerBg};
          backdrop-filter: blur(16px);
          z-index: 1000;
          transition: right 0.3s ease;
          padding: 80px 24px 24px;
          overflow-y: auto;
          box-shadow: -4px 0 20px rgba(0,0,0,0.3);
        }

        .mobile-menu.active {
          right: 0;
        }

        .mobile-menu nav {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .mobile-menu nav a {
          color: ${headerTextColor};
          text-decoration: none;
          font-size: 16px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 12px 0;
          border-bottom: 1px solid rgba(${parseInt(headerTextColor.slice(1, 3), 16)}, ${parseInt(headerTextColor.slice(3, 5), 16)}, ${parseInt(headerTextColor.slice(5, 7), 16)}, 0.1);
          transition: opacity 0.3s;
        }

        .mobile-menu nav a:hover {
          opacity: 0.7;
        }

        .mobile-menu .cta-button {
          margin-top: 24px;
          width: 100%;
          text-align: center;
        }

        /* Mobile Menu Overlay */
        .mobile-menu-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.5);
          z-index: 999;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.3s, visibility 0.3s;
        }

        .mobile-menu-overlay.active {
          opacity: 1;
          visibility: visible;
        }

        /* Desktop Navigation */
        header nav { display: flex; gap: 32px; }

        header nav a {
          color: ${headerTextColor};
          text-decoration: none;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          transition: opacity 0.3s;
        }

        header nav a:hover { opacity: 0.7; }

        /* Responsive: Hide desktop nav on mobile, show hamburger */
        @media (max-width: 768px) {
          header nav,
          header .cta-button {
            display: none;
          }

          .mobile-menu-btn {
            display: flex;
          }
        }

        header .cta-button {
          padding: 12px 24px;
          border-radius: 9999px;
          font-weight: 600;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          background: linear-gradient(135deg, ${colors.primary}, ${primaryLight});
          color: ${heroTextColor};
          border: none;
          cursor: pointer;
          transition: box-shadow 0.3s;
        }

        header .cta-button:hover { box-shadow: 0 10px 40px rgba(0,0,0,0.3); }

        /* Hero Section */
        .hero {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 80px 0;
          background-color: ${colors.primary};
        }

        .hero-decorative {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
        }

        .hero-light-particle {
          position: absolute;
          border-radius: 50%;
          background: white;
          animation: float 6s ease-in-out infinite;
        }

        .hero-light-ray {
          position: absolute;
          top: 0;
          width: 1px;
          height: 100%;
          opacity: 0.05;
          background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.3), transparent);
          animation: pulse 4s ease-in-out infinite;
        }

        .hero-content { position: relative; z-index: 10; text-align: center; max-width: 1280px; margin: 0 auto; padding: 0 16px; }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          border-radius: 9999px;
          font-size: 14px;
          font-weight: bold;
          box-shadow: 0 20px 50px rgba(0,0,0,0.3);
          background: rgba(255, 255, 255, 0.2);
          color: ${heroTextColor};
          border: 2px solid rgba(255, 255, 255, 0.3);
          backdrop-filter: blur(10px);
          margin-bottom: 32px;
        }

        .hero h1 {
          font-size: 72px;
          font-weight: 900;
          margin-bottom: 24px;
          line-height: 1.2;
          color: ${heroTextColor};
          text-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }

        .hero-description {
          font-size: 24px;
          margin-bottom: 48px;
          line-height: 1.5;
          color: ${heroTextColor};
          opacity: 0.95;
          text-shadow: 0 2px 10px rgba(0,0,0,0.2);
        }

        .hero-buttons {
          display: flex;
          flex-direction: column;
          gap: 16px;
          justify-content: center;
          margin-bottom: 80px;
        }

        @media (min-width: 640px) {
          .hero-buttons { flex-direction: row; }
        }

        .hero-cta-primary {
          padding: 20px 48px;
          border-radius: 9999px;
          font-weight: bold;
          text-transform: uppercase;
          font-size: 14px;
          letter-spacing: 0.05em;
          box-shadow: 0 20px 50px rgba(0,0,0,0.3);
          transition: transform 0.3s, box-shadow 0.3s;
          background: #ffffff;
          color: ${colors.primary};
          border: none;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
        }

        .hero-cta-primary:hover {
          transform: scale(1.05);
          box-shadow: 0 30px 70px rgba(0,0,0,0.5);
        }

        .hero-cta-secondary {
          padding: 20px 48px;
          border-radius: 9999px;
          font-weight: bold;
          text-transform: uppercase;
          font-size: 14px;
          letter-spacing: 0.05em;
          transition: transform 0.3s;
          background: transparent;
          color: ${heroTextColor};
          border: 2px solid rgba(${parseInt(heroTextColor.slice(1, 3), 16)}, ${parseInt(heroTextColor.slice(3, 5), 16)}, ${parseInt(heroTextColor.slice(5, 7), 16)}, 0.5);
          backdrop-filter: blur(10px);
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
        }

        .hero-cta-secondary:hover { transform: scale(1.05); }

        .hero-stats {
          display: grid;
          grid-template-columns: repeat(1, 1fr);
          gap: 32px;
        }

        @media (min-width: 768px) {
          .hero-stats { grid-template-columns: repeat(3, 1fr); gap: 48px; }
        }

        .hero-stat {
          padding: 24px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .hero-stat h3 {
          font-size: 48px;
          font-weight: 900;
          margin-bottom: 8px;
          color: ${heroTextColor};
        }

        .hero-stat p {
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: 600;
          opacity: 0.9;
          color: ${heroTextColor};
        }

        /* Features Section */
        .features-section {
          padding: 80px 0;
          background: linear-gradient(to bottom, #f9fafb, #ffffff);
          margin-top: -48px;
          position: relative;
          z-index: 20;
          overflow: hidden;
        }

        .section-badge {
          display: inline-block;
          padding: 8px 20px;
          border-radius: 9999px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 20px;
          background: rgba(${parseInt(colors.primary.slice(1, 3), 16)}, ${parseInt(colors.primary.slice(3, 5), 16)}, ${parseInt(colors.primary.slice(5, 7), 16)}, 0.1);
          color: ${colors.primary};
        }

        .section-title {
          font-size: 48px;
          font-weight: 900;
          color: #111827;
          text-align: center;
          margin-bottom: 64px;
        }

        .section-title .highlight { color: ${colors.primary}; }

        .features-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
        }

        @media (min-width: 768px) {
          .features-grid { grid-template-columns: repeat(3, 1fr); }
        }

        .feature-card {
          background: white;
          padding: 40px;
          border-radius: 24px;
          text-align: center;
          border: 2px solid transparent;
          transition: transform 0.4s, box-shadow 0.4s;
          position: relative;
          overflow: hidden;
          cursor: pointer;
        }

        .feature-card:hover {
          transform: translateY(-15px) scale(1.03);
          box-shadow: 0 25px 50px rgba(0,0,0,0.25);
        }

        .feature-icon {
          width: 96px;
          height: 96px;
          margin: 0 auto 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 16px;
          background: linear-gradient(135deg, ${colors.primary}, ${colors.accent});
          box-shadow: 0 10px 30px rgba(${parseInt(colors.primary.slice(1, 3), 16)}, ${parseInt(colors.primary.slice(3, 5), 16)}, ${parseInt(colors.primary.slice(5, 7), 16)}, 0.25);
          position: relative;
        }

        .feature-card h3 {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 16px;
          color: #111827;
        }

        .feature-card p {
          color: #4b5563;
          line-height: 1.5;
        }

        /* Services Section */
        .services-section {
          padding: 96px 0;
          color: white;
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, ${colors.primary}, ${colors.dark});
        }

        .services-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
        }

        @media (min-width: 768px) {
          .services-grid { grid-template-columns: repeat(3, 1fr); }
        }

        .service-card {
          padding: 40px;
          border-radius: 24px;
          text-align: center;
          cursor: pointer;
          border: 2px solid rgba(255, 255, 255, 0.2);
          transition: transform 0.4s, background-color 0.4s, box-shadow 0.4s;
          background: rgba(255, 255, 255, 0.08);
          position: relative;
          overflow: hidden;
        }

        .service-card:hover {
          transform: translateY(-20px) scale(1.05);
          background: rgba(255, 255, 255, 0.15);
          box-shadow: 0 30px 60px rgba(0,0,0,0.5);
        }

        .service-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 16px;
          font-size: 48px;
          background: rgba(255, 255, 255, 0.15);
          border: 2px solid rgba(255, 255, 255, 0.3);
        }

        .service-card h3 {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 16px;
          color: ${heroTextColor};
          text-shadow: 0 2px 6px rgba(0,0,0,0.5);
        }

        .service-card p {
          line-height: 1.5;
          margin-bottom: 24px;
          color: ${heroTextColor};
          opacity: 0.85;
          text-shadow: 0 1px 3px rgba(0,0,0,0.4);
        }

        /* Contact Section */
        .contact-section {
          padding: 96px 0;
          background: #f9fafb;
          position: relative;
          overflow: hidden;
        }

        .contact-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 64px;
          align-items: center;
        }

        @media (min-width: 768px) {
          .contact-grid { grid-template-columns: repeat(2, 1fr); }
        }

        .contact-item {
          display: flex;
          gap: 20px;
          margin-bottom: 32px;
          padding: 24px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          transition: box-shadow 0.3s, transform 0.3s;
          cursor: pointer;
        }

        .contact-item:hover {
          box-shadow: 0 20px 50px rgba(0,0,0,0.15);
          transform: translateX(10px);
        }

        .contact-icon {
          width: 56px;
          height: 56px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          background: linear-gradient(135deg, ${colors.primary}, ${colors.accent});
          color: ${heroTextColor};
        }

        .contact-item strong {
          display: block;
          font-size: 20px;
          font-weight: bold;
          color: #111827;
          margin-bottom: 8px;
        }

        .contact-item p {
          color: #4b5563;
          font-weight: 500;
        }

        /* Footer */
        footer {
          background: #111827;
          color: #9ca3af;
          padding: 80px 0;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 64px;
          margin-bottom: 40px;
        }

        @media (min-width: 768px) {
          .footer-grid { grid-template-columns: repeat(3, 1fr); }
        }

        footer h4 {
          color: white;
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 20px;
        }

        footer p, footer li {
          margin-bottom: 12px;
          line-height: 1.5;
        }

        footer ul {
          list-style: none;
        }

        footer a {
          color: #9ca3af;
          text-decoration: none;
          transition: color 0.3s;
        }

        footer a:hover { color: ${colors.primary}; }

        .footer-bottom {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 32px;
          text-align: center;
        }

        /* WhatsApp Button */
        .whatsapp-float {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 64px;
          height: 64px;
          background: #25d366;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 40px rgba(0,0,0,0.3);
          z-index: 100;
          animation: pulse 2s ease-in-out infinite;
          cursor: pointer;
          text-decoration: none;
        }

        .whatsapp-float:hover { transform: scale(1.1); }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.05); }
        }

        @keyframes floatSlow {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(5deg); }
          66% { transform: translate(-20px, 20px) rotate(-5deg); }
        }
    </style>
</head>
<body>
    <!-- Header -->
    <header>
        <div class="container">
            <div class="logo">${siteData.logo ? `<img src="${siteData.logo}" alt="${siteData.name}" class="logo-img">` : siteData.name}</div>
            <nav>
                <a href="#">Início</a>
                ${site.siteData.sections.includes('services') ? '<a href="#servicos">Serviços</a>' : ''}
                ${site.siteData.sections.includes('gallery') ? '<a href="#galeria">Galeria</a>' : ''}
                ${site.siteData.sections.includes('contact') ? '<a href="#contato">Contato</a>' : ''}
            </nav>
            <a href="${siteData.phone ? `https://api.whatsapp.com/send/?phone=${siteData.phone.replace(/\\D/g, '')}&text=${encodeURIComponent('Olá! Gostaria de entrar em contato')}` : '#contato'}" ${siteData.phone ? 'target="_blank" rel="noopener noreferrer"' : ''} class="cta-button" style="text-decoration: none; display: inline-block;">Fale Conosco</a>

            <!-- Mobile Menu Button -->
            <button class="mobile-menu-btn" onclick="toggleMobileMenu()">
                <span></span>
                <span></span>
                <span></span>
            </button>
        </div>
    </header>

    <!-- Mobile Menu Overlay -->
    <div class="mobile-menu-overlay" onclick="toggleMobileMenu()"></div>

    <!-- Mobile Menu Drawer -->
    <div class="mobile-menu">
        <nav>
            <a href="#" onclick="toggleMobileMenu()">Início</a>
            ${site.siteData.sections.includes('services') ? '<a href="#servicos" onclick="toggleMobileMenu()">Serviços</a>' : ''}
            ${site.siteData.sections.includes('gallery') ? '<a href="#galeria" onclick="toggleMobileMenu()">Galeria</a>' : ''}
            ${site.siteData.sections.includes('contact') ? '<a href="#contato" onclick="toggleMobileMenu()">Contato</a>' : ''}
        </nav>
        <a href="${siteData.phone ? `https://api.whatsapp.com/send/?phone=${siteData.phone.replace(/\\D/g, '')}&text=${encodeURIComponent('Olá! Gostaria de entrar em contato')}` : '#contato'}" ${siteData.phone ? 'target="_blank" rel="noopener noreferrer"' : ''} class="cta-button" onclick="toggleMobileMenu()" style="text-decoration: none; display: inline-block;">Fale Conosco</a>
    </div>

    <!-- Hero -->
    ${
      site.siteData.sections.includes('hero')
        ? `
    <section class="hero">
        <!-- Elementos decorativos de fundo -->
        <div class="hero-decorative" style="width: 500px; height: 500px; top: -200px; left: -150px; opacity: 0.15; animation: floatSlow 12s ease-in-out infinite;"></div>
        <div class="hero-decorative" style="width: 350px; height: 350px; bottom: -100px; right: -80px; opacity: 0.15; animation: pulse 4s ease-in-out infinite; animation-delay: 1s;"></div>
        <div class="hero-decorative" style="width: 200px; height: 200px; top: 100px; right: 150px; opacity: 0.1; animation: float 6s ease-in-out infinite; animation-delay: 2s;"></div>
        <div class="hero-decorative" style="width: 280px; height: 280px; top: 50%; left: 10%; opacity: 0.12; animation: pulse 4s ease-in-out infinite; animation-delay: 3s;"></div>

        <!-- Partículas de luz animadas - AUMENTADAS -->
        <div class="hero-light-particle" style="width: 24px; height: 24px; top: 80px; left: 80px; opacity: 0.6; animation-delay: 0.5s;"></div>
        <div class="hero-light-particle" style="width: 20px; height: 20px; top: 160px; right: 128px; opacity: 0.5; animation: pulse 4s ease-in-out infinite; animation-delay: 1.5s;"></div>
        <div class="hero-light-particle" style="width: 32px; height: 32px; bottom: 128px; left: 160px; opacity: 0.4; animation: floatSlow 12s ease-in-out infinite; animation-delay: 2.5s;"></div>
        <div class="hero-light-particle" style="width: 16px; height: 16px; top: 240px; left: 25%; opacity: 0.7; animation: pulse 4s ease-in-out infinite; animation-delay: 3.5s;"></div>
        <div class="hero-light-particle" style="width: 20px; height: 20px; bottom: 160px; right: 25%; opacity: 0.55; animation: float 6s ease-in-out infinite; animation-delay: 4s;"></div>
        <div class="hero-light-particle" style="width: 24px; height: 24px; top: 33.333%; right: 80px; opacity: 0.45; animation: floatSlow 12s ease-in-out infinite; animation-delay: 2s;"></div>

        <!-- NOVAS partículas adicionais -->
        <div class="hero-light-particle" style="width: 28px; height: 28px; top: 40px; right: 25%; opacity: 0.65; animation: pulse 4s ease-in-out infinite; animation-delay: 0.8s;"></div>
        <div class="hero-light-particle" style="width: 20px; height: 20px; bottom: 80px; left: 33.333%; opacity: 0.6; animation: float 6s ease-in-out infinite; animation-delay: 1.2s;"></div>
        <div class="hero-light-particle" style="width: 24px; height: 24px; top: 50%; left: 40px; opacity: 0.5; animation: floatSlow 12s ease-in-out infinite; animation-delay: 3s;"></div>
        <div class="hero-light-particle" style="width: 16px; height: 16px; bottom: 240px; right: 160px; opacity: 0.7; animation: pulse 4s ease-in-out infinite; animation-delay: 4.5s;"></div>
        <div class="hero-light-particle" style="width: 32px; height: 32px; top: 320px; right: 40px; opacity: 0.45; animation: float 6s ease-in-out infinite; animation-delay: 0.3s;"></div>
        <div class="hero-light-particle" style="width: 24px; height: 24px; bottom: 40px; left: 80px; opacity: 0.55; animation: floatSlow 12s ease-in-out infinite; animation-delay: 5s;"></div>
        <div class="hero-light-particle" style="width: 20px; height: 20px; top: 25%; left: 50%; opacity: 0.6; animation: pulse 4s ease-in-out infinite; animation-delay: 1.8s;"></div>
        <div class="hero-light-particle" style="width: 28px; height: 28px; bottom: 33.333%; right: 33.333%; opacity: 0.5; animation: float 6s ease-in-out infinite; animation-delay: 3.2s;"></div>
        <div class="hero-light-particle" style="width: 16px; height: 16px; top: 384px; left: 240px; opacity: 0.65; animation: floatSlow 12s ease-in-out infinite; animation-delay: 2.3s;"></div>

        <!-- Raios de luz sutis -->
        <div class="hero-light-ray" style="left: 25%; transform: rotate(15deg); animation-delay: 1s;"></div>
        <div class="hero-light-ray" style="right: 33.333%; transform: rotate(-10deg); animation-delay: 2s;"></div>

        <div class="container hero-content">
            <div class="hero-badge">
                <span>🔥</span> ${siteData.area}
            </div>
            <h1>${siteData.slogan || siteData.name}</h1>
            <p class="hero-description">${siteData.description}</p>
            <div class="hero-buttons">
                <a href="${siteData.phone ? `https://api.whatsapp.com/send/?phone=${siteData.phone.replace(/\\\\D/g, '')}&text=${encodeURIComponent('Olá! Quero começar agora')}` : '#contato'}" ${siteData.phone ? 'target="_blank" rel="noopener noreferrer"' : ''} class="hero-cta-primary">Começar Agora</a>
                <a href="${siteData.phone ? `https://api.whatsapp.com/send/?phone=${siteData.phone.replace(/\\\\D/g, '')}&text=${encodeURIComponent('Olá! Gostaria de saber mais')}` : '#contato'}" ${siteData.phone ? 'target="_blank" rel="noopener noreferrer"' : ''} class="hero-cta-secondary">Saiba Mais</a>
            </div>
            <div class="hero-stats">
                ${(
                  filteredHeroStats.length > 0 ? filteredHeroStats : [
                    { value: '500+', label: 'Clientes Satisfeitos' },
                    { value: '4.9★', label: 'Avaliação Média' },
                    { value: '10+', label: 'Anos de Experiência' },
                  ]
                )
                  .map(
                    (stat: { value: string; label: string }) => `
                <div class="hero-stat">
                    <h3>${stat.value}</h3>
                    <p>${stat.label}</p>
                </div>
                `,
                  )
                  .join('')}
            </div>
        </div>
    </section>
    `
        : ''
    }

    <!-- Features -->
    <section class="features-section">
        <div class="container">
            <div style="text-align: center; margin-bottom: 64px;">
                <span class="section-badge">Por Que Escolher a Gente?</span>
                <h2 class="section-title">
                    Benefícios <span class="highlight">Exclusivos</span>
                </h2>
            </div>
            <div class="features-grid">
                ${(
                  siteData.features || [
                    {
                      title: 'Experiência Premium',
                      description:
                        'Muito mais que um serviço, uma verdadeira experiência de luxo e conforto',
                    },
                    {
                      title: 'Profissionais Qualificados',
                      description:
                        'Equipe altamente treinada e experiente no que faz',
                    },
                    {
                      title: 'Atendimento Fácil',
                      description: 'Agende com total praticidade e rapidez',
                    },
                  ]
                )
                  .map(
                    (feature) => `
                <div class="feature-card">
                    <div class="feature-icon">
                        <svg width="48" height="48" viewBox="0 0 40 40" fill="none" stroke="white" stroke-width="2.5">
                            <path d="M20 5L25 15H35L27.5 22.5L30 32.5L20 26.25L10 32.5L12.5 22.5L5 15H15L20 5Z"/>
                        </svg>
                    </div>
                    <h3>${feature.title}</h3>
                    <p>${feature.description}</p>
                </div>
                `,
                  )
                  .join('')}
            </div>
        </div>
    </section>

    <!-- About -->
    ${
      site.siteData.sections.includes('about')
        ? `
    <section class="py-24 bg-white relative overflow-hidden">
        <div class="container">
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 80px; align-items: center;">
                <div>
                    <div style="position: relative; height: 600px;">
                        <img src="https://via.placeholder.com/400x500" alt="Sobre" style="position: absolute; top: 0; left: 0; width: 70%; height: 70%; object-fit: cover; border-radius: 24px; box-shadow: 0 20px 50px rgba(0,0,0,0.3);" />
                        <img src="https://via.placeholder.com/400x500" alt="Sobre" style="position: absolute; bottom: 0; right: 0; width: 70%; height: 70%; object-fit: cover; border-radius: 24px; box-shadow: 0 20px 50px rgba(0,0,0,0.3);" />
                        <div style="position: absolute; bottom: 20px; left: 20px; background: white; padding: 24px; border-radius: 16px; box-shadow: 0 20px 50px rgba(0,0,0,0.3); display: flex; align-items: center; gap: 16px; z-index: 20;">
                            <div style="width: 64px; height: 64px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 32px; background: linear-gradient(135deg, ${colors.primary}, ${colors.accent});">⭐</div>
                            <div>
                                <strong style="display: block; font-size: 36px; font-weight: 900; line-height: 1; color: ${colors.primary};">4.9</strong>
                                <p style="font-size: 14px; color: #4b5563; font-weight: 600;">Avaliação</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <span class="section-badge">Sobre Nós</span>
                    <h2 style="font-size: 60px; font-weight: 900; margin-bottom: 24px; line-height: 1.2; color: #111827;">
                        ${siteData.aboutContent?.title || 'Do Sonho à'}<br/>
                        <span style="color: ${colors.primary};">
                            ${siteData.aboutContent?.subtitle || 'Realidade'}
                        </span>
                    </h2>
                    <p style="font-size: 20px; font-weight: 500; color: #374151; margin-bottom: 20px; line-height: 1.5;">
                        Nossa empresa foi projetada para ser um ponto de referência em qualidade, inovação e excelência.
                    </p>
                    <p style="color: #4b5563; margin-bottom: 32px; line-height: 1.5;">
                        ${siteData.description}
                    </p>
                    <div style="margin: 32px 0;">
                        ${(
                          siteData.aboutContent?.checklist || [
                            'Profissionais certificados',
                            'Produtos premium',
                            'Ambiente climatizado',
                          ]
                        )
                          .map(
                            (item) => `
                        <div style="display: flex; align-items: center; gap: 16px; padding: 16px; border-radius: 12px; margin-bottom: 16px;">
                            <div style="width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: rgba(${parseInt(colors.primary.slice(1, 3), 16)}, ${parseInt(colors.primary.slice(3, 5), 16)}, ${parseInt(colors.primary.slice(5, 7), 16)}, 0.15);">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${colors.primary}" stroke-width="3">
                                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke-linecap="round"/>
                                </svg>
                            </div>
                            <span style="font-weight: 600; color: #1f2937;">${item}</span>
                        </div>
                        `,
                          )
                          .join('')}
                    </div>
                    <button class="hero-cta-primary">Agende seu horário</button>
                </div>
            </div>
        </div>
    </section>
    `
        : ''
    }

    <!-- Gallery -->
    ${
      site.siteData.sections.includes('gallery') && site.siteData.gallery.length > 0
        ? `
    <section id="galeria" style="padding: 96px 0; background: #f9fafb; position: relative; overflow: hidden;">
        <div class="container">
            <div style="text-align: center; margin-bottom: 64px;">
                <span class="section-badge">Galeria</span>
                <h2 class="section-title">
                    Nosso <span class="highlight">Trabalho</span>
                </h2>
                <p style="font-size: 20px; color: #4b5563; margin-top: 16px; max-width: 896px; margin-left: auto; margin-right: auto;">
                    Confira alguns dos nossos melhores projetos e trabalhos realizados
                </p>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px;">
                ${site.siteData.gallery
                  .map(
                    (img, idx) => `
                <div style="position: relative; overflow: hidden; border-radius: 24px; aspect-ratio: 4/3; cursor: pointer; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
                    <img src="${img}" alt="${siteData.name} - Galeria ${idx + 1}" style="width: 100%; height: 100%; object-fit: cover;" loading="lazy" />
                </div>
                `,
                  )
                  .join('')}
            </div>
            <div style="text-align: center; margin-top: 48px;">
                <button class="hero-cta-primary">Ver Mais Projetos</button>
            </div>
        </div>
    </section>
    `
        : ''
    }

    <!-- Testimonials -->
    ${
      site.siteData.sections.includes('testimonials')
        ? `
    <section style="padding: 96px 0; background: white; position: relative; overflow: hidden;">
        <div class="container">
            <div style="text-align: center; margin-bottom: 64px;">
                <span class="section-badge">Depoimentos</span>
                <h2 class="section-title">
                    O que dizem<br/>
                    <span class="highlight">Nossos Clientes</span>
                </h2>
                <p style="font-size: 20px; color: #4b5563; margin-top: 16px; max-width: 896px; margin-left: auto; margin-right: auto;">
                    Veja o que nossos clientes satisfeitos têm a dizer sobre nossos serviços
                </p>
            </div>
            <div class="services-grid">
                ${(
                  siteData.testimonials || [
                    {
                      name: 'Ana Silva',
                      role: 'Cliente desde 2024',
                      text: 'Excelente serviço! Profissionais atenciosos e ambiente incrível. Recomendo muito!',
                    },
                    {
                      name: 'Carlos Santos',
                      role: 'Cliente desde 2023',
                      text: 'Superou todas as minhas expectativas! Qualidade premium com atendimento impecável.',
                    },
                    {
                      name: 'Maria Costa',
                      role: 'Cliente desde 2024',
                      text: 'Simplesmente perfeito! A melhor experiência que já tive. Voltarei sempre!',
                    },
                  ]
                )
                  .map(
                    (testimonial) => `
                <div class="feature-card">
                    <div style="margin-bottom: 24px; color: #fbbf24; display: flex; gap: 4px;">
                        ${'⭐'.repeat(5)}
                    </div>
                    <p style="font-size: 18px; font-style: italic; color: #374151; line-height: 1.5; margin-bottom: 32px; position: relative; z-index: 10;">
                        "${testimonial.text}"
                    </p>
                    <div style="width: 64px; height: 4px; margin: 0 auto 24px; border-radius: 9999px; background: linear-gradient(90deg, ${colors.primary}, ${colors.accent});"></div>
                    <div style="display: flex; align-items: center; gap: 16px;">
                        <div style="width: 64px; height: 64px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; flex-shrink: 0; background: linear-gradient(135deg, ${colors.primary}, ${colors.accent}); color: ${heroTextColor}; box-shadow: 0 5px 20px rgba(${parseInt(colors.primary.slice(1, 3), 16)}, ${parseInt(colors.primary.slice(3, 5), 16)}, ${parseInt(colors.primary.slice(5, 7), 16)}, 0.25);">
                            ${testimonial.name.charAt(0)}
                        </div>
                        <div>
                            <strong style="display: block; font-size: 18px; font-weight: bold; color: #111827;">${testimonial.name}</strong>
                            <span style="font-size: 14px; font-weight: 500; color: ${colors.primary};">${testimonial.role}</span>
                        </div>
                    </div>
                </div>
                `,
                  )
                  .join('')}
            </div>
            <div style="text-align: center; margin-top: 64px;">
                <p style="font-size: 18px; color: #4b5563; margin-bottom: 24px;">Você também é nosso cliente? Deixe seu depoimento!</p>
                <button class="hero-cta-primary">Deixar Depoimento</button>
            </div>
        </div>
    </section>
    `
        : ''
    }

    <!-- Pricing -->
    ${
      site.siteData.sections.includes('pricing')
        ? `
    <section style="padding: 96px 0; background: #f9fafb;">
        <div class="container">
            <div style="text-align: center; margin-bottom: 64px;">
                <span class="section-badge">Preços</span>
                <h2 class="section-title">
                    Planos que <span class="highlight">Cabem no Bolso</span>
                </h2>
            </div>
            <div class="services-grid">
                ${(
                  filteredPricing.length > 0 ? filteredPricing : [
                    {
                      name: 'Básico',
                      price: 'R$ 99',
                      features: [
                        'Atendimento básico',
                        'Produtos padrão',
                        'Sem agendamento',
                      ],
                    },
                    {
                      name: 'Premium',
                      price: 'R$ 199',
                      features: [
                        'Atendimento premium',
                        'Produtos premium',
                        'Agendamento prioritário',
                        'Brindes exclusivos',
                      ],
                    },
                    {
                      name: 'VIP',
                      price: 'R$ 299',
                      features: [
                        'Atendimento VIP',
                        'Produtos top de linha',
                        'Agendamento exclusivo',
                        'Tratamento especial',
                        'Benefícios extras',
                      ],
                    },
                  ]
                )
                  .map((plan: { name: string; price: string; features: string[] }, idx: number) => {
                    const isPopular = idx === 1;
                    return `
                    <div class="feature-card" style="${isPopular ? 'transform: scale(1.05); border: 2px solid ' + colors.primary : 'border: 1px solid #e5e7eb'}; position: relative;">
                        ${isPopular ? `<div style="position: absolute; top: -16px; left: 50%; transform: translateX(-50%); padding: 4px 24px; border-radius: 9999px; font-size: 14px; font-weight: bold; color: white; background: ${colors.primary};">POPULAR</div>` : ''}
                        <h3 style="font-size: 24px; font-weight: bold; margin-bottom: 16px; color: #111827;">${plan.name}</h3>
                        <div style="margin-bottom: 24px;">
                            <span style="font-size: 48px; font-weight: 900; color: ${colors.primary};">${plan.price}</span>
                            <span style="color: #4b5563;">/mês</span>
                        </div>
                        <ul style="list-style: none; margin-bottom: 32px;">
                            ${plan.features
                              .map(
                                (feature) => `
                            <li style="display: flex; align-items: start; gap: 12px; margin-bottom: 16px;">
                                <svg style="width: 24px; height: 24px; flex-shrink: 0; margin-top: 2px;" fill="none" stroke="${colors.primary}" viewBox="0 0 24 24" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                                <span style="color: #374151;">${feature}</span>
                            </li>
                            `,
                              )
                              .join('')}
                        </ul>
                        <button class="${isPopular ? 'hero-cta-primary' : 'hero-cta-secondary'}" style="width: 100%;">
                            Escolher Plano
                        </button>
                    </div>
                    `;
                  })
                  .join('')}
            </div>
        </div>
    </section>
    `
        : ''
    }

    <!-- Team -->
    ${
      site.siteData.sections.includes('team')
        ? `
    <section style="padding: 96px 0; background: white;">
        <div class="container">
            <div style="text-align: center; margin-bottom: 64px;">
                <span class="section-badge">Nossa Equipe</span>
                <h2 class="section-title">
                    Conheça nosso <span class="highlight">Time</span>
                </h2>
            </div>
            <div class="services-grid">
                ${(
                  filteredTeam.length > 0 ? filteredTeam : [
                    { name: 'João Silva', role: 'CEO & Fundador' },
                    { name: 'Maria Santos', role: 'Diretora de Operações' },
                    { name: 'Pedro Costa', role: 'Gerente de Atendimento' },
                  ]
                )
                  .map(
                    (member: { name: string; role: string }) => `
                <div style="text-align: center;">
                    <div style="position: relative; margin-bottom: 24px; display: inline-block;">
                        <div style="width: 192px; height: 192px; margin: 0 auto; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 60px; font-weight: bold; background: linear-gradient(to bottom right, ${colors.primary}, ${colors.accent}); color: ${heroTextColor};">
                            ${member.name.charAt(0)}
                        </div>
                    </div>
                    <h3 style="font-size: 24px; font-weight: bold; margin-bottom: 8px; color: #111827;">${member.name}</h3>
                    <p style="font-weight: 500; margin-bottom: 16px; color: ${colors.primary};">${member.role}</p>
                    <div style="display: flex; justify-content: center; gap: 12px;">
                        <a href="#" style="width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; background: #f3f4f6; border-radius: 50%; color: #6b7280; transition: all 0.3s;">
                            <svg viewBox="0 0 24 24" fill="currentColor" style="width: 20px; height: 20px;">
                                <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 0 1 1.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772 4.915 4.915 0 0 1-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772A4.897 4.897 0 0 1 5.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2z" />
                            </svg>
                        </a>
                    </div>
                </div>
                `,
                  )
                  .join('')}
            </div>
        </div>
    </section>
    `
        : ''
    }

    <!-- FAQ -->
    ${
      site.siteData.sections.includes('faq') &&
      siteData.faq &&
      siteData.faq.length > 0
        ? `
    <section style="padding: 96px 0; background: white;">
        <div class="container">
            <div style="text-align: center; margin-bottom: 64px;">
                <span class="section-badge">FAQ</span>
                <h2 class="section-title">
                    Perguntas <span class="highlight">Frequentes</span>
                </h2>
            </div>
            <div style="max-width: 896px; margin: 0 auto;">
                ${siteData.faq
                  .map(
                    (item) => `
                <details style="background: #f9fafb; border-radius: 16px; overflow: hidden; border: 1px solid rgba(${parseInt(colors.primary.slice(1, 3), 16)}, ${parseInt(colors.primary.slice(3, 5), 16)}, ${parseInt(colors.primary.slice(5, 7), 16)}, 0.13); margin-bottom: 16px;">
                    <summary style="display: flex; align-items: center; justify-content: between; padding: 24px; cursor: pointer; list-style: none;">
                        <h3 style="font-size: 18px; font-weight: bold; color: #111827; flex: 1;">${item.question}</h3>
                        <svg style="width: 24px; height: 24px; transform: rotate(0deg); transition: transform 0.3s;" fill="none" stroke="${colors.primary}" viewBox="0 0 24 24" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                    </summary>
                    <div style="padding: 0 24px 24px;">
                        <p style="color: #4b5563; line-height: 1.5;">${item.answer}</p>
                    </div>
                </details>
                `,
                  )
                  .join('')}
            </div>
        </div>
    </section>
    `
        : ''
    }

    <!-- App Download -->
    ${
      site.siteData.sections.includes('app')
        ? `
    <section style="padding: 96px 0; color: white; background: linear-gradient(135deg, ${colors.primary}, ${colors.accent});">
        <div class="container">
            <div style="display: grid; grid-template-columns: 1fr; gap: 80px; align-items: center;">
                <div>
                    <span style="display: inline-block; padding: 8px 20px; border-radius: 9999px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 20px; background: rgba(255,255,255,0.25); color: #ffffff; text-shadow: 0 2px 4px rgba(0,0,0,0.4);">
                        Nosso App
                    </span>
                    <h2 style="font-size: 60px; font-weight: 900; margin-bottom: 24px; line-height: 1.2; color: #ffffff; text-shadow: 0 4px 8px rgba(0,0,0,0.5);">
                        Agende pelo<br/>
                        <span style="text-shadow: 0 4px 8px rgba(0,0,0,0.6);">Aplicativo</span>
                    </h2>
                    <p style="font-size: 20px; margin-bottom: 32px; line-height: 1.5; color: #ffffff; text-shadow: 0 2px 4px rgba(0,0,0,0.4);">
                        Baixe nosso app e tenha acesso a horários disponíveis, promoções exclusivas e muito mais!
                    </p>
                    <div style="margin-bottom: 40px;">
                        <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px; color: #ffffff;">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M7 10L9 12L13 8M19 10C19 14.9706 14.9706 19 10 19C5.02944 19 1 14.9706 1 10C1 5.02944 5.02944 1 10 1C14.9706 1 19 5.02944 19 10Z"/>
                            </svg>
                            <span style="font-weight: 500; text-shadow: 0 2px 4px rgba(0,0,0,0.4);">Agendamento em segundos</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 16px; color: #ffffff;">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M7 10L9 12L13 8M19 10C19 14.9706 14.9706 19 10 19C5.02944 19 1 14.9706 1 10C1 5.02944 5.02944 1 10 1C14.9706 1 19 5.02944 19 10Z"/>
                            </svg>
                            <span style="font-weight: 500; text-shadow: 0 2px 4px rgba(0,0,0,0.4);">Lembretes automáticos</span>
                        </div>
                    </div>
                    <div style="display: flex; gap: 20px; flex-wrap: wrap;">
                        <button style="padding: 12px 32px; background: white; border-radius: 9999px; font-weight: 600; color: ${colors.primary}; border: none; cursor: pointer;">
                            📱 Google Play
                        </button>
                        <button style="padding: 12px 32px; background: white; border-radius: 9999px; font-weight: 600; color: ${colors.primary}; border: none; cursor: pointer;">
                            🍎 App Store
                        </button>
                    </div>
                </div>
                <div style="position: relative; text-align: center;">
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 384px; height: 384px; background: rgba(255,255,255,0.2); border-radius: 50%; filter: blur(80px);"></div>
                    <img src="https://via.placeholder.com/300x600/1a1a1a/ffffff?text=App+Preview" alt="App" style="position: relative; z-index: 10; max-width: 300px; margin: 0 auto; filter: drop-shadow(0 25px 50px rgba(0,0,0,0.5)); border-radius: 24px;" />
                </div>
            </div>
        </div>
    </section>
    `
        : ''
    }

    <!-- Services -->
    ${
      site.siteData.sections.includes('services') && site.siteData.services.length > 0
        ? `
    <section id="servicos" class="services-section">
        <div class="container">
            <div style="text-align: center; max-width: 896px; margin: 0 auto 64px;">
                <span class="section-badge" style="background: rgba(255,255,255,0.2); color: ${heroTextColor}; border: 2px solid rgba(255,255,255,0.3);">Nossos Serviços</span>
                <h2 class="section-title" style="color: ${heroTextColor}; text-shadow: 0 4px 20px rgba(0,0,0,0.4);">
                    Serviços que<br/>
                    <span style="text-shadow: 0 6px 30px rgba(0,0,0,0.6);">Transformam</span>
                </h2>
                <p style="font-size: 20px; line-height: 1.5; color: ${heroTextColor}; opacity: 0.9; text-shadow: 0 2px 10px rgba(0,0,0,0.3);">
                    Oferecemos uma gama completa de serviços de excelência
                </p>
            </div>
            <div class="services-grid">
                ${site.siteData.services
                  .slice(0, 6)
                  .map(
                    (service) => `
                <div class="service-card">
                    <div class="service-icon">✨</div>
                    <h3>${service}</h3>
                    <p>Serviço de qualidade premium com resultados excepcionais</p>
                    <div style="width: 64px; height: 4px; margin: 0 auto 24px; border-radius: 9999px; background: rgba(255,255,255,0.3);"></div>
                    <button style="padding: 8px 24px; border-radius: 9999px; font-size: 14px; font-weight: 600; transition: transform 0.3s; background: rgba(255,255,255,0.2); color: ${heroTextColor}; border: 1px solid rgba(255,255,255,0.4); cursor: pointer;">
                        Saiba Mais
                    </button>
                </div>
                `,
                  )
                  .join('')}
            </div>
        </div>
    </section>
    `
        : ''
    }

    <!-- Contact -->
    ${
      site.siteData.sections.includes('contact')
        ? `
    <section id="contato" class="contact-section">
        <div class="container">
            <div style="text-align: center; margin-bottom: 64px;">
                <span class="section-badge">Fale Conosco</span>
                <h2 class="section-title">
                    Venha nos <span class="highlight">Visitar</span>
                </h2>
                <p style="font-size: 20px; color: #4b5563; max-width: 896px; margin: 0 auto;">
                    Estamos prontos para atender você da melhor forma possível
                </p>
            </div>
            <div class="contact-grid">
                <div>
                    ${
                      site.siteData.address
                        ? `
                    <div class="contact-item">
                        <div class="contact-icon">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z"/>
                                <circle cx="12" cy="9" r="2.5"/>
                            </svg>
                        </div>
                        <div>
                            <strong>Endereço</strong>
                            <p>${site.siteData.address}</p>
                        </div>
                    </div>
                    `
                        : ''
                    }
                    ${
                      siteData.phone
                        ? `
                    <div class="contact-item">
                        <div class="contact-icon">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M3 5C3 3.89543 3.89543 3 5 3H8.27924C8.70967 3 9.09181 3.27543 9.22792 3.68377L10.7257 8.17721C10.8831 8.64932 10.6694 9.16531 10.2243 9.38787L7.96701 10.5165C9.06925 12.9612 11.0388 14.9308 13.4835 16.033L14.6121 13.7757C14.8347 13.3306 15.3507 13.1169 15.8228 13.2743L20.3162 14.7721C20.7246 14.9082 21 15.2903 21 15.7208V19C21 20.1046 20.1046 21 19 21H18C9.71573 21 3 14.2843 3 6V5Z"/>
                            </svg>
                        </div>
                        <div>
                            <strong>Telefone</strong>
                            <p>${siteData.phone}</p>
                        </div>
                    </div>
                    `
                        : ''
                    }
                    ${
                      siteData.email
                        ? `
                    <div class="contact-item">
                        <div class="contact-icon">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M3 8L10.89 13.26C11.5389 13.7165 12.4611 13.7165 13.11 13.26L21 8M5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19Z"/>
                            </svg>
                        </div>
                        <div>
                            <strong>E-mail</strong>
                            <p>${siteData.email}</p>
                        </div>
                    </div>
                    `
                        : ''
                    }
                    <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.siteData.address || '')}" target="_blank" rel="noopener" class="hero-cta-primary" style="margin-top: 40px; display: inline-block; text-decoration: none;">Como Chegar</a>
                </div>
                ${siteData.showMap !== false ? `
                <div style="height: 500px; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.2);">
                    <iframe
                        src="https://maps.google.com/maps?q=${siteData.mapCoordinates ? `${siteData.mapCoordinates.lat},${siteData.mapCoordinates.lng}` : encodeURIComponent(site.siteData.address || 'Brasil')}&t=&z=15&ie=UTF8&iwloc=&output=embed"
                        style="width: 100%; height: 100%; border: 0;"
                        allowfullscreen
                        loading="lazy"
                    ></iframe>
                </div>
                ` : ''}
            </div>
        </div>
    </section>
    `
        : ''
    }

    <!-- Footer -->
    <footer>
        <div class="container">
            <div class="footer-grid">
                <div>
                    <h4>${siteData.name}</h4>
                    <p>Experiencia premium desde 2024</p>
                    ${siteData.socialLinks && Object.keys(siteData.socialLinks).filter(k => k !== 'processed' && siteData.socialLinks?.[k as keyof typeof siteData.socialLinks]).length > 0 ? `
                    <div class="social-links" style="display: flex; gap: 12px; margin-top: 16px;">
                        ${siteData.socialLinks.instagram ? `<a href="${siteData.socialLinks.instagram.startsWith('http') ? siteData.socialLinks.instagram : 'https://instagram.com/' + siteData.socialLinks.instagram.replace('@', '')}" target="_blank" rel="noopener" style="color: #9ca3af; transition: color 0.3s;" title="Instagram" onmouseover="this.style.color='${colors.primary}'" onmouseout="this.style.color='#9ca3af'">
                            <svg viewBox="0 0 24 24" fill="currentColor" style="width: 24px; height: 24px;">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                            </svg>
                        </a>` : ''}
                        ${siteData.socialLinks.facebook ? `<a href="${siteData.socialLinks.facebook.startsWith('http') ? siteData.socialLinks.facebook : 'https://facebook.com/' + siteData.socialLinks.facebook}" target="_blank" rel="noopener" style="color: #9ca3af; transition: color 0.3s;" title="Facebook" onmouseover="this.style.color='${colors.primary}'" onmouseout="this.style.color='#9ca3af'">
                            <svg viewBox="0 0 24 24" fill="currentColor" style="width: 24px; height: 24px;">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                        </a>` : ''}
                        ${siteData.socialLinks.linkedin ? `<a href="${siteData.socialLinks.linkedin.startsWith('http') ? siteData.socialLinks.linkedin : 'https://linkedin.com/in/' + siteData.socialLinks.linkedin}" target="_blank" rel="noopener" style="color: #9ca3af; transition: color 0.3s;" title="LinkedIn" onmouseover="this.style.color='${colors.primary}'" onmouseout="this.style.color='#9ca3af'">
                            <svg viewBox="0 0 24 24" fill="currentColor" style="width: 24px; height: 24px;">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                            </svg>
                        </a>` : ''}
                        ${siteData.socialLinks.youtube ? `<a href="${siteData.socialLinks.youtube.startsWith('http') ? siteData.socialLinks.youtube : 'https://youtube.com/@' + siteData.socialLinks.youtube}" target="_blank" rel="noopener" style="color: #9ca3af; transition: color 0.3s;" title="YouTube" onmouseover="this.style.color='${colors.primary}'" onmouseout="this.style.color='#9ca3af'">
                            <svg viewBox="0 0 24 24" fill="currentColor" style="width: 24px; height: 24px;">
                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                            </svg>
                        </a>` : ''}
                        ${siteData.socialLinks.tiktok ? `<a href="${siteData.socialLinks.tiktok.startsWith('http') ? siteData.socialLinks.tiktok : 'https://tiktok.com/@' + siteData.socialLinks.tiktok.replace('@', '')}" target="_blank" rel="noopener" style="color: #9ca3af; transition: color 0.3s;" title="TikTok" onmouseover="this.style.color='${colors.primary}'" onmouseout="this.style.color='#9ca3af'">
                            <svg viewBox="0 0 24 24" fill="currentColor" style="width: 24px; height: 24px;">
                                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                            </svg>
                        </a>` : ''}
                        ${siteData.socialLinks.twitter ? `<a href="${siteData.socialLinks.twitter.startsWith('http') ? siteData.socialLinks.twitter : 'https://twitter.com/' + siteData.socialLinks.twitter.replace('@', '')}" target="_blank" rel="noopener" style="color: #9ca3af; transition: color 0.3s;" title="Twitter/X" onmouseover="this.style.color='${colors.primary}'" onmouseout="this.style.color='#9ca3af'">
                            <svg viewBox="0 0 24 24" fill="currentColor" style="width: 24px; height: 24px;">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                            </svg>
                        </a>` : ''}
                    </div>
                    ` : ''}
                </div>
                <div>
                    <h4>Links Rapidos</h4>
                    <ul>
                        <li><a href="#">Sobre Nos</a></li>
                        ${site.siteData.sections.includes('services') ? '<li><a href="#servicos">Servicos</a></li>' : ''}
                        ${site.siteData.sections.includes('gallery') ? '<li><a href="#galeria">Galeria</a></li>' : ''}
                        ${site.siteData.sections.includes('contact') ? '<li><a href="#contato">Contato</a></li>' : ''}
                    </ul>
                </div>
                <div>
                    <h4>Contato</h4>
                    <ul>
                        ${site.siteData.address ? `<li>${site.siteData.address}</li>` : ''}
                        ${siteData.phone ? `<li>${siteData.phone}</li>` : ''}
                        ${siteData.email ? `<li>${siteData.email}</li>` : ''}
                    </ul>
                    ${siteData.businessHours ? `
                    <div style="margin-top: 16px;">
                        <h5 style="margin-bottom: 8px; font-size: 14px;">Horario de Funcionamento</h5>
                        <p style="font-size: 13px; opacity: 0.8;">
                            ${siteData.businessHours.monday && !siteData.businessHours.monday.closed ? `Seg-Sex: ${siteData.businessHours.monday.open} - ${siteData.businessHours.monday.close}` : ''}
                            ${siteData.businessHours.saturday && !siteData.businessHours.saturday.closed ? `<br>Sab: ${siteData.businessHours.saturday.open} - ${siteData.businessHours.saturday.close}` : ''}
                            ${siteData.businessHours.sunday && !siteData.businessHours.sunday.closed ? `<br>Dom: ${siteData.businessHours.sunday.open} - ${siteData.businessHours.sunday.close}` : siteData.businessHours.sunday?.closed ? '<br>Dom: Fechado' : ''}
                        </p>
                    </div>
                    ` : ''}
                </div>
            </div>
            <div class="footer-bottom">
                <p>© 2025 ${siteData.name}. Todos os direitos reservados.</p>
            </div>
        </div>
    </footer>

    <!-- WhatsApp Float -->
    ${
      siteData.phone
        ? `
    <a href="https://api.whatsapp.com/send/?phone=${siteData.phone.replace(/\D/g, '')}&text=${encodeURIComponent(whatsappMessage)}" target="_blank" rel="noopener noreferrer" class="whatsapp-float">
        <svg viewBox="0 0 24 24" fill="white" style="width: 32px; height: 32px;">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
    </a>
    `
        : ''
    }

    <script>
        function toggleMobileMenu() {
            const mobileMenu = document.querySelector('.mobile-menu');
            const overlay = document.querySelector('.mobile-menu-overlay');
            const menuBtn = document.querySelector('.mobile-menu-btn');

            mobileMenu.classList.toggle('active');
            overlay.classList.toggle('active');
            menuBtn.classList.toggle('active');
        }
    </script>
</body>
</html>`;
}
