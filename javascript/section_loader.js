
/**
 * Section Loader - Carrega seções HTML dinamicamente
 */
class SectionLoader {
    constructor() {
        this.cache = new Map();
        this.loadingQueue = [];
        this.observers = new Map();
    }

    /**
     * Carrega uma seção HTML
     * @param {string} sectionId - ID da seção
     * @param {string} filePath - Caminho do arquivo HTML
     */
    async loadSection(sectionId, filePath) {
        try {
            // Verifica cache
            if (this.cache.has(sectionId)) {
                return this.cache.get(sectionId);
            }

            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`Erro ao carregar ${filePath}: ${response.status}`);
            }

            const html = await response.text();
            this.cache.set(sectionId, html);
            return html;
        } catch (error) {
            console.error(`Erro ao carregar seção ${sectionId}:`, error);
            return `<div class="error-message">Erro ao carregar conteúdo. <button onclick="location.reload()">Recarregar</button></div>`;
        }
    }

    /**
     * Injeta conteúdo HTML em um elemento
     * @param {string} targetId - ID do elemento alvo
     * @param {string} html - HTML a ser injetado
     */
    injectContent(targetId, html) {
        const target = document.getElementById(targetId);
        if (target) {
            target.innerHTML = html;
            this.initializeSectionScripts(target);
        }
    }

    /**
     * Inicializa scripts específicos da seção
     * @param {HTMLElement} section - Elemento da seção
     */
    initializeSectionScripts(section) {
        // Re-aplica animações reveal manualmente
        const revealElements = section.querySelectorAll('.reveal');
        revealElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;

            if (elementTop < windowHeight * 0.8) {
                element.classList.add('active');
            }
        });

        // Executa scripts inline se houver
        const scripts = section.querySelectorAll('script');
        scripts.forEach(script => {
            const newScript = document.createElement('script');
            newScript.textContent = script.textContent;
            script.parentNode.replaceChild(newScript, script);
        });
    }

    /**
     * Carrega todas as seções definidas
     */
    async loadAllSections() {
        const sections = [
            { id: 'introducao', file: 'sections/ProfileOverview.html' },
            { id: 'trajetoria', file: 'sections/JourneyTimeline.html' },
            { id: 'experiencia', file: 'sections/ExperienceOverview.html' },
            { id: 'carreira', file: 'sections/ProjectsAndHomelab.html' },
            { id: 'contato', file: 'sections/ContactAndAvailability.html' }
        ];

        // Carrega seções em paralelo
        const promises = sections.map(async ({ id, file }) => {
            const html = await this.loadSection(id, file);
            this.injectContent(id, html);
        });

        await Promise.all(promises);
        
        // Dispara evento customizado após todas as seções carregarem
        document.dispatchEvent(new CustomEvent('sectionsLoaded'));
    }

    /**
     * Lazy loading - carrega seção quando visível
     * @param {string} sectionId - ID da seção
     * @param {string} filePath - Caminho do arquivo
     */
    lazyLoadSection(sectionId, filePath) {
        const target = document.getElementById(sectionId);
        if (!target) return;

        const observer = new IntersectionObserver(
            async (entries) => {
                entries.forEach(async (entry) => {
                    if (entry.isIntersecting && !this.cache.has(sectionId)) {
                        const html = await this.loadSection(sectionId, filePath);
                        this.injectContent(sectionId, html);
                        observer.unobserve(entry.target);
                    }
                });
            },
            { rootMargin: '100px' }
        );

        observer.observe(target);
        this.observers.set(sectionId, observer);
    }
}

// Inicializa o carregador
const sectionLoader = new SectionLoader();

// Carrega seções quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        sectionLoader.loadAllSections();
    });
} else {
    sectionLoader.loadAllSections();
}
