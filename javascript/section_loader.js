/**
 * Section Loader - Carrega seções HTML dinamicamente
 */
class SectionLoader {
    constructor() {
        this.cache = new Map();
        this.observers = new Map();
        this.revealObserver = null;
        this.initRevealObserver();
    }

    /**
     * Inicializa o observer global para animações reveal
     */
    initRevealObserver() {
        this.revealObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('active');
                        console.log(`🎬 Animação ativada para: ${entry.target.tagName}`);
                    }
                });
            },
            {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            }
        );
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
                console.log(`📦 Usando cache para: ${sectionId}`);
                return this.cache.get(sectionId);
            }

            console.log(`🌐 Fazendo fetch de: ${filePath}`);
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`Erro ao carregar ${filePath}: ${response.status} ${response.statusText}`);
            }

            const html = await response.text();
            console.log(`✅ Conteúdo carregado: ${sectionId} (${html.length} caracteres)`);
            this.cache.set(sectionId, html);
            return html;
        } catch (error) {
            console.error(`❌ Erro ao carregar seção ${sectionId}:`, error);
            return `<div class="error-message">
                <p>❌ Erro ao carregar conteúdo da seção "${sectionId}"</p>
                <p>Arquivo: ${filePath}</p>
                <p>Erro: ${error.message}</p>
                <button onclick="location.reload()">🔄 Recarregar</button>
            </div>`;
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

            // Ativa elementos que já estão visíveis na viewport
            if (elementTop < windowHeight * 0.75) {
                element.classList.add('active');
                console.log(`✨ Elemento já visível ativado: ${element.tagName} na seção ${section.id}`);
            } else {
                // Observa elementos que ainda não estão visíveis
                this.revealObserver.observe(element);
                console.log(`👀 Observando elemento: ${element.tagName} na seção ${section.id}`);
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
            console.log(`🔄 Carregando seção: ${id} de ${file}`);
            const html = await this.loadSection(id, file);
            this.injectContent(id, html);
            console.log(`✅ Seção ${id} carregada com sucesso`);
        });

        await Promise.all(promises);
        
        console.log('🎉 Todas as seções foram carregadas!');
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
                for (const entry of entries) {
                    if (entry.isIntersecting && !this.cache.has(sectionId)) {
                        const html = await this.loadSection(sectionId, filePath);
                        this.injectContent(sectionId, html);
                        observer.unobserve(entry.target);
                    }
                }
            },
            { rootMargin: '100px' }
        );

        observer.observe(target);
        this.observers.set(sectionId, observer);
    }

    /**
     * Cleanup - remove observers quando necessário
     */
    cleanup() {
        if (this.revealObserver) {
            this.revealObserver.disconnect();
        }
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();
    }
}

// Inicializa o carregador
const sectionLoader = new SectionLoader();

// Garante que o DOM esteja pronto antes de carregar
window.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM Carregado - Iniciando carregamento das seções...');
    sectionLoader.loadAllSections().catch(error => {
        console.error('❌ Erro crítico no carregamento das seções:', error);
    });
});

// Cleanup ao descarregar a página
window.addEventListener('beforeunload', () => {
    sectionLoader.cleanup();
});
