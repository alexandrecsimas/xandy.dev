/* ==========================================
   MENU TOGGLE (MOBILE)
   ========================================== */

const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('nav');

if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
        nav.classList.toggle('active');
        menuToggle.classList.toggle('active');
        
        // Atualizar aria-expanded para acessibilidade
        const isExpanded = nav.classList.contains('active');
        menuToggle.setAttribute('aria-expanded', isExpanded);
    });
    
    // Fechar menu ao clicar em um link
    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('active');
            menuToggle.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
        });
    });
    
    // Fechar menu ao clicar fora
    document.addEventListener('click', (e) => {
        if (!nav.contains(e.target) && !menuToggle.contains(e.target)) {
            nav.classList.remove('active');
            menuToggle.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
        }
    });
}

/* ==========================================
   THEME TOGGLE (DARK/LIGHT MODE)
   ========================================== */

const themeToggle = document.querySelector('.theme-toggle');
const root = document.documentElement;

// Verificar preferência salva no localStorage
const currentTheme = localStorage.getItem('theme');
if (currentTheme) {
    root.setAttribute('data-theme', currentTheme);
    updateThemeIcon(currentTheme);
}

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const currentTheme = root.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        root.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });
}

function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector('i');
    if (icon) {
        if (theme === 'dark') {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    }
}

/* ==========================================
   SCROLL REVEAL ANIMATIONS
   ========================================== */

const revealElements = document.querySelectorAll('.reveal');

const revealOnScroll = () => {
    revealElements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        // Revelar quando o elemento estiver 80% visível na viewport
        if (elementTop < windowHeight * 0.8) {
            element.classList.add('active');
        }
    });
};

// Executar no carregamento e no scroll
window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', revealOnScroll);

/* ==========================================
   SMOOTH SCROLL COM OFFSET PARA HEADER FIXO
   ========================================== */

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            const headerHeight = document.querySelector('header').offsetHeight;
            const targetPosition = targetElement.offsetTop - headerHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

/* ==========================================
   HEADER SCROLL EFFECT
   ========================================== */

const header = document.querySelector('header');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    // Adicionar sombra quando rolar
    if (currentScroll > 50) {
        header.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    } else {
        header.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.1)';
    }
    
    lastScroll = currentScroll;
});

/* ==========================================
   LOADING PERFORMANCE
   ========================================== */

// Lazy loading para imagens
if ('loading' in HTMLImageElement.prototype) {
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
        img.src = img.src;
    });
} else {
    // Fallback para navegadores antigos
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
    document.body.appendChild(script);
}

/* ==========================================
   CONSOLE MESSAGE
   ========================================== */

console.log('%c👋 Olá, Developer!', 'font-size: 20px; color: #0b3d91; font-weight: bold;');
console.log('%cInteressado no código? Visite meu GitHub!', 'font-size: 14px; color: #555;');