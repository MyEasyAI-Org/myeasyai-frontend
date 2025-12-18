/**
 * MyEasyWebsite - Premium Template JavaScript
 * Template profissional com animações avançadas e interações suaves
 * 
 * Funcionalidades:
 * - Page Loader com animação suave
 * - Menu mobile com transições elegantes
 * - Header com efeito de scroll
 * - Scroll reveal animations
 * - Smooth scroll navigation
 * - FAQ accordion
 * - Gallery lightbox
 * - Counter animation
 * - WhatsApp button visibility
 * - Parallax effects
 * - Typing effect (opcional)
 */

// ==============================================
// PAGE LOADER
// ==============================================

/**
 * Esconde o loader após o carregamento da página
 */
function initPageLoader() {
    const loader = document.getElementById('pageLoader');
    
    if (!loader) return;

    // Esconde o loader quando a página estiver carregada
    window.addEventListener('load', () => {
        setTimeout(() => {
            loader.classList.add('hidden');
            // Remove o loader do DOM após a animação
            setTimeout(() => {
                loader.remove();
            }, 500);
        }, 800);
    });

    // Fallback: esconde após 3 segundos mesmo se não carregar
    setTimeout(() => {
        if (!loader.classList.contains('hidden')) {
            loader.classList.add('hidden');
        }
    }, 3000);
}


// ==============================================
// MENU MOBILE
// ==============================================

/**
 * Toggle do menu mobile com animação
 */
function toggleMobileMenu() {
    const mobileMenu = document.querySelector('.mobile-menu');
    const overlay = document.querySelector('.mobile-menu-overlay');
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const body = document.body;

    if (mobileMenu && overlay && menuBtn) {
        const isActive = mobileMenu.classList.contains('active');
        
        mobileMenu.classList.toggle('active');
        overlay.classList.toggle('active');
        menuBtn.classList.toggle('active');

        // Previne scroll do body quando menu está aberto
        if (!isActive) {
            body.style.overflow = 'hidden';
            body.style.paddingRight = getScrollbarWidth() + 'px';
        } else {
            body.style.overflow = '';
            body.style.paddingRight = '';
        }
    }
}

/**
 * Calcula a largura da scrollbar
 */
function getScrollbarWidth() {
    const outer = document.createElement('div');
    outer.style.visibility = 'hidden';
    outer.style.overflow = 'scroll';
    document.body.appendChild(outer);
    
    const inner = document.createElement('div');
    outer.appendChild(inner);
    
    const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
    outer.parentNode.removeChild(outer);
    
    return scrollbarWidth;
}

/**
 * Fecha o menu ao clicar em um link
 */
function initMobileMenuLinks() {
    const mobileMenuLinks = document.querySelectorAll('.mobile-menu nav a');

    mobileMenuLinks.forEach(link => {
        link.addEventListener('click', () => {
            const mobileMenu = document.querySelector('.mobile-menu');
            if (mobileMenu && mobileMenu.classList.contains('active')) {
                setTimeout(() => {
                    toggleMobileMenu();
                }, 100);
            }
        });
    });
}

/**
 * Fecha menu ao pressionar ESC
 */
function initEscapeClose() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const mobileMenu = document.querySelector('.mobile-menu');
            if (mobileMenu && mobileMenu.classList.contains('active')) {
                toggleMobileMenu();
            }
            
            // Também fecha o lightbox
            const lightbox = document.querySelector('.lightbox.active');
            if (lightbox) {
                closeLightbox();
            }
        }
    });
}


// ==============================================
// HEADER SCROLL EFFECT
// ==============================================

/**
 * Adiciona classe ao header quando scrollar
 */
function initHeaderScroll() {
    const header = document.querySelector('header');
    
    if (!header) return;

    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateHeader = () => {
        const currentScrollY = window.scrollY;

        // Adiciona/remove classe scrolled
        if (currentScrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        lastScrollY = currentScrollY;
        ticking = false;
    };

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateHeader);
            ticking = true;
        }
    }, { passive: true });
}


// ==============================================
// SMOOTH SCROLL
// ==============================================

/**
 * Smooth scroll para links de âncora
 */
function initSmoothScroll() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');

    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            
            if (targetId === '#' || targetId === '') return;

            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                e.preventDefault();

                const header = document.querySelector('header');
                const headerHeight = header ? header.offsetHeight : 80;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // Atualiza URL sem recarregar
                history.pushState(null, null, targetId);
            }
        });
    });
}


// ==============================================
// SCROLL REVEAL ANIMATIONS
// ==============================================

/**
 * Inicializa animações ao scroll
 */
function initScrollReveal() {
    if (!('IntersectionObserver' in window)) {
        // Fallback para browsers antigos
        document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => {
            el.classList.add('active');
        });
        return;
    }

    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -80px 0px',
        threshold: 0.1
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });
}


// ==============================================
// FAQ ACCORDION
// ==============================================

/**
 * Accordion para FAQ - fecha outros ao abrir um
 */
function initFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        item.addEventListener('toggle', function() {
            if (this.open) {
                // Fecha outros items
                faqItems.forEach(otherItem => {
                    if (otherItem !== this && otherItem.open) {
                        otherItem.open = false;
                    }
                });
            }
        });
    });
}


// ==============================================
// GALLERY LIGHTBOX
// ==============================================

let lightboxElement = null;

/**
 * Cria e inicializa o lightbox da galeria
 */
function initGalleryLightbox() {
    const galleryItems = document.querySelectorAll('.gallery-item img');

    if (galleryItems.length === 0) return;

    // Cria o lightbox
    lightboxElement = document.createElement('div');
    lightboxElement.className = 'lightbox';
    lightboxElement.innerHTML = `
        <div class="lightbox-overlay"></div>
        <div class="lightbox-content">
            <button class="lightbox-close" aria-label="Fechar">&times;</button>
            <img src="" alt="Imagem ampliada" />
        </div>
    `;
    document.body.appendChild(lightboxElement);

    // Adiciona eventos de click nas imagens
    galleryItems.forEach(img => {
        img.addEventListener('click', () => {
            openLightbox(img.src);
        });
    });

    // Eventos para fechar
    lightboxElement.querySelector('.lightbox-overlay').addEventListener('click', closeLightbox);
    lightboxElement.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
}

/**
 * Abre o lightbox com a imagem
 */
function openLightbox(src) {
    if (!lightboxElement) return;
    
    const img = lightboxElement.querySelector('img');
    img.src = src;
    lightboxElement.classList.add('active');
    document.body.style.overflow = 'hidden';
}

/**
 * Fecha o lightbox
 */
function closeLightbox() {
    if (!lightboxElement) return;
    
    lightboxElement.classList.remove('active');
    document.body.style.overflow = '';
}


// ==============================================
// COUNTER ANIMATION
// ==============================================

/**
 * Anima números de estatísticas
 */
function initCounterAnimation() {
    const statElements = document.querySelectorAll('.hero-stat h3');

    if (statElements.length === 0) return;

    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px'
    };

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const text = element.textContent;
                
                // Extrai número e sufixo
                const match = text.match(/^([+-]?\d+(?:\.\d+)?)(.*)/);
                
                if (match) {
                    const targetNum = parseFloat(match[1]);
                    const suffix = match[2] || '';
                    
                    animateNumber(element, targetNum, suffix);
                }
                
                counterObserver.unobserve(element);
            }
        });
    }, observerOptions);

    statElements.forEach(el => {
        counterObserver.observe(el);
    });
}

/**
 * Anima um número de 0 até o valor alvo
 */
function animateNumber(element, target, suffix) {
    const duration = 2000;
    const frameDuration = 1000 / 60;
    const totalFrames = Math.round(duration / frameDuration);
    const easeOutQuad = t => t * (2 - t);
    
    let frame = 0;
    const countTo = target;
    
    const counter = setInterval(() => {
        frame++;
        const progress = easeOutQuad(frame / totalFrames);
        const currentCount = Math.round(countTo * progress);
        
        if (parseInt(element.textContent) !== currentCount) {
            element.textContent = currentCount + suffix;
        }
        
        if (frame === totalFrames) {
            clearInterval(counter);
            element.textContent = target + suffix;
        }
    }, frameDuration);
}


// ==============================================
// WHATSAPP BUTTON VISIBILITY
// ==============================================

/**
 * Mostra botão do WhatsApp após scroll
 */
function initWhatsAppFloat() {
    const whatsappBtn = document.querySelector('.whatsapp-float');

    if (!whatsappBtn) return;

    // Inicialmente escondido
    whatsappBtn.style.opacity = '0';
    whatsappBtn.style.transform = 'translateY(20px) scale(0.8)';
    whatsappBtn.style.pointerEvents = 'none';

    let ticking = false;

    const updateVisibility = () => {
        if (window.scrollY > 400) {
            whatsappBtn.style.opacity = '1';
            whatsappBtn.style.transform = 'translateY(0) scale(1)';
            whatsappBtn.style.pointerEvents = 'auto';
        } else {
            whatsappBtn.style.opacity = '0';
            whatsappBtn.style.transform = 'translateY(20px) scale(0.8)';
            whatsappBtn.style.pointerEvents = 'none';
        }
        ticking = false;
    };

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateVisibility);
            ticking = true;
        }
    }, { passive: true });
}


// ==============================================
// ACTIVE NAVIGATION
// ==============================================

/**
 * Destaca link de navegação ativo baseado na seção visível
 */
function initActiveNavigation() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.desktop-nav a, .mobile-menu nav a');

    if (sections.length === 0 || navLinks.length === 0) return;

    const observerOptions = {
        root: null,
        rootMargin: '-50% 0px -50% 0px',
        threshold: 0
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        sectionObserver.observe(section);
    });
}


// ==============================================
// PARALLAX EFFECT (sutil)
// ==============================================

/**
 * Efeito parallax sutil nos elementos decorativos
 */
function initParallax() {
    const decorativeElements = document.querySelectorAll('.hero-decorative');
    
    if (decorativeElements.length === 0) return;
    
    // Desativa em dispositivos móveis para performance
    if (window.innerWidth < 768) return;

    let ticking = false;

    const updateParallax = () => {
        const scrollY = window.scrollY;
        
        decorativeElements.forEach((el, index) => {
            const speed = 0.05 + (index * 0.02);
            const yPos = scrollY * speed;
            el.style.transform = `translateY(${yPos}px)`;
        });
        
        ticking = false;
    };

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }, { passive: true });
}


// ==============================================
// LAZY LOADING
// ==============================================

/**
 * Lazy loading para imagens
 */
function initLazyLoading() {
    // Navegadores modernos já suportam loading="lazy" nativamente
    // Este é um fallback para browsers mais antigos
    
    if ('loading' in HTMLImageElement.prototype) {
        // Browser suporta lazy loading nativo
        const images = document.querySelectorAll('img[loading="lazy"]');
        images.forEach(img => {
            if (img.dataset.src) {
                img.src = img.dataset.src;
            }
        });
    } else if ('IntersectionObserver' in window) {
        // Fallback com IntersectionObserver
        const lazyImages = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px'
        });

        lazyImages.forEach(img => imageObserver.observe(img));
    }
}


// ==============================================
// BUTTON RIPPLE EFFECT
// ==============================================

/**
 * Adiciona efeito ripple nos botões
 */
function initRippleEffect() {
    const buttons = document.querySelectorAll('.hero-cta-primary, .hero-cta-secondary, .cta-button, .service-btn');

    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const ripple = document.createElement('span');
            ripple.style.cssText = `
                position: absolute;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                pointer-events: none;
                width: 100px;
                height: 100px;
                left: ${x - 50}px;
                top: ${y - 50}px;
                transform: scale(0);
                animation: rippleEffect 0.6s ease-out;
            `;

            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);

            setTimeout(() => ripple.remove(), 600);
        });
    });

    // Adiciona a animação CSS
    if (!document.querySelector('#ripple-style')) {
        const style = document.createElement('style');
        style.id = 'ripple-style';
        style.textContent = `
            @keyframes rippleEffect {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}


// ==============================================
// SCROLL TO TOP
// ==============================================

/**
 * Scroll suave para o topo ao clicar no logo
 */
function initScrollToTop() {
    const logo = document.querySelector('header .logo');
    
    if (!logo) return;

    logo.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}


// ==============================================
// PREFERS REDUCED MOTION
// ==============================================

/**
 * Respeita preferência de movimento reduzido
 */
function checkReducedMotion() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
        document.documentElement.style.setProperty('--transition-fast', '0s');
        document.documentElement.style.setProperty('--transition-normal', '0s');
        document.documentElement.style.setProperty('--transition-slow', '0s');
        
        // Remove animações
        document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => {
            el.style.transition = 'none';
            el.classList.add('active');
        });
    }
}


// ==============================================
// INICIALIZAÇÃO
// ==============================================

/**
 * Inicializa todas as funcionalidades
 */
document.addEventListener('DOMContentLoaded', function() {
    // Respeita preferências de acessibilidade
    checkReducedMotion();
    
    // Inicializa o loader
    initPageLoader();
    
    // Navegação e interações
    initMobileMenuLinks();
    initEscapeClose();
    initHeaderScroll();
    initSmoothScroll();
    initScrollToTop();
    initActiveNavigation();
    
    // Animações
    initScrollReveal();
    initCounterAnimation();
    initParallax();
    initRippleEffect();
    
    // Componentes
    initFaqAccordion();
    initGalleryLightbox();
    initWhatsAppFloat();
    initLazyLoading();

    // Log de sucesso
    console.log('%c✨ MyEasyWebsite Premium Template carregado!', 'color: #ea580c; font-weight: bold; font-size: 14px;');
});


// ==============================================
// UTILIDADES GLOBAIS
// ==============================================

/**
 * Debounce function para otimização
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function para otimização
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}


// ==============================================
// EXPORTAÇÃO
// ==============================================

// Para uso em módulos se necessário
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        toggleMobileMenu,
        initPageLoader,
        initHeaderScroll,
        initSmoothScroll,
        initScrollReveal,
        initFaqAccordion,
        initGalleryLightbox,
        initCounterAnimation,
        initWhatsAppFloat,
        initActiveNavigation,
        initParallax,
        initLazyLoading,
        initRippleEffect,
        debounce,
        throttle
    };
}
