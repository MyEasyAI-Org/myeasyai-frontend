import { memo, useMemo } from 'react';
import { TEMPLATE_CONFIGS, type TemplateConfig } from '../../constants/templateConfig';
import { TEMPLATE_STYLES } from '../../constants/templateStyles';

type TemplatePreviewProps = {
  templateId: number;
  className?: string;
};

/**
 * Gera HTML de preview minimalista do template
 * Mostra o estilo real do template (fontes, cores, layout)
 */
function generatePreviewHTML(templateId: number): string {
  const config = TEMPLATE_CONFIGS.find(t => t.id === templateId);
  const style = TEMPLATE_STYLES.find(s => s.id === templateId);

  if (!config || !style) return '';

  const { colors, fonts } = style;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="${fonts.googleFontsUrl}" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: '${fonts.body}', sans-serif;
      font-size: 4px;
      overflow: hidden;
      background: ${colors.light};
    }
    h1, h2, h3 { font-family: '${fonts.heading}', serif; }

    /* Header */
    .header {
      background: ${colors.primary};
      padding: 4px 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .logo {
      color: white;
      font-weight: bold;
      font-size: 6px;
      font-family: '${fonts.heading}', serif;
    }
    .nav {
      display: flex;
      gap: 6px;
    }
    .nav span {
      color: rgba(255,255,255,0.8);
      font-size: 3px;
    }

    /* Hero */
    .hero {
      background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark || colors.secondary} 100%);
      padding: 16px 8px;
      text-align: center;
      color: white;
    }
    .hero-badge {
      display: inline-block;
      background: rgba(255,255,255,0.2);
      padding: 2px 6px;
      border-radius: 8px;
      font-size: 3px;
      margin-bottom: 4px;
    }
    .hero h1 {
      font-size: 10px;
      margin-bottom: 4px;
      line-height: 1.2;
    }
    .hero p {
      font-size: 4px;
      opacity: 0.9;
      margin-bottom: 8px;
    }
    .hero-buttons {
      display: flex;
      gap: 4px;
      justify-content: center;
    }
    .btn-primary {
      background: white;
      color: ${colors.primary};
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 3px;
      font-weight: 600;
    }
    .btn-secondary {
      background: transparent;
      color: white;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 3px;
      border: 1px solid rgba(255,255,255,0.5);
    }

    /* Stats */
    .stats {
      display: flex;
      justify-content: center;
      gap: 12px;
      padding: 8px;
      background: ${colors.light};
    }
    .stat {
      text-align: center;
    }
    .stat-value {
      font-size: 8px;
      font-weight: bold;
      color: ${colors.primary};
      font-family: '${fonts.heading}', serif;
    }
    .stat-label {
      font-size: 3px;
      color: #666;
    }

    /* Services */
    .services {
      padding: 12px 8px;
      background: white;
    }
    .section-title {
      text-align: center;
      margin-bottom: 8px;
    }
    .section-badge {
      display: inline-block;
      background: ${colors.primary}15;
      color: ${colors.primary};
      padding: 2px 6px;
      border-radius: 8px;
      font-size: 3px;
      margin-bottom: 4px;
    }
    .section-title h2 {
      font-size: 8px;
      color: ${colors.secondary};
    }
    .cards {
      display: flex;
      gap: 4px;
      justify-content: center;
    }
    .card {
      background: ${colors.light};
      padding: 6px;
      border-radius: 4px;
      text-align: center;
      width: 40px;
    }
    .card-icon {
      width: 12px;
      height: 12px;
      background: ${colors.primary};
      border-radius: 50%;
      margin: 0 auto 4px;
    }
    .card h3 {
      font-size: 4px;
      color: ${colors.secondary};
      margin-bottom: 2px;
    }
    .card p {
      font-size: 3px;
      color: #666;
    }

    /* Footer */
    .footer {
      background: ${colors.secondary};
      padding: 8px;
      text-align: center;
    }
    .footer p {
      color: rgba(255,255,255,0.6);
      font-size: 3px;
    }

    /* Template specific styles */
    ${style.customStyles}
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">${config.name}</div>
    <div class="nav">
      <span>Início</span>
      <span>Serviços</span>
      <span>Contato</span>
    </div>
  </div>

  <div class="hero">
    <div class="hero-badge">✨ Template ${config.name}</div>
    <h1>Seu Negócio Aqui</h1>
    <p>${config.description}</p>
    <div class="hero-buttons">
      <div class="btn-primary">Saiba Mais</div>
      <div class="btn-secondary">Contato</div>
    </div>
  </div>

  <div class="stats">
    <div class="stat">
      <div class="stat-value">500+</div>
      <div class="stat-label">Clientes</div>
    </div>
    <div class="stat">
      <div class="stat-value">10+</div>
      <div class="stat-label">Anos</div>
    </div>
    <div class="stat">
      <div class="stat-value">98%</div>
      <div class="stat-label">Satisfação</div>
    </div>
  </div>

  <div class="services">
    <div class="section-title">
      <div class="section-badge">Serviços</div>
      <h2>O Que Oferecemos</h2>
    </div>
    <div class="cards">
      <div class="card">
        <div class="card-icon"></div>
        <h3>Serviço 1</h3>
        <p>Descrição breve</p>
      </div>
      <div class="card">
        <div class="card-icon"></div>
        <h3>Serviço 2</h3>
        <p>Descrição breve</p>
      </div>
      <div class="card">
        <div class="card-icon"></div>
        <h3>Serviço 3</h3>
        <p>Descrição breve</p>
      </div>
    </div>
  </div>

  <div class="footer">
    <p>© 2024 ${config.name} Template - MyEasyWebsite</p>
  </div>
</body>
</html>`;
}

/**
 * Componente que renderiza um preview real do template usando iframe
 */
export const TemplatePreview = memo(function TemplatePreview({
  templateId,
  className = '',
}: TemplatePreviewProps) {
  const previewHTML = useMemo(() => generatePreviewHTML(templateId), [templateId]);

  return (
    <iframe
      srcDoc={previewHTML}
      className={`w-full h-full border-0 pointer-events-none ${className}`}
      title={`Preview Template ${templateId}`}
      sandbox="allow-same-origin"
      loading="lazy"
    />
  );
});

/**
 * Hook para obter o HTML de preview de um template
 */
export function useTemplatePreviewHTML(templateId: number): string {
  return useMemo(() => generatePreviewHTML(templateId), [templateId]);
}
