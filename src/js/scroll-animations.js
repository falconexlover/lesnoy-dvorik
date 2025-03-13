/**
 * Скрипт для обработки анимаций при прокрутке страницы
 * Гостиница "Лесной дворик"
 * Оптимизировано с использованием Intersection Observer API
 */

document.addEventListener('DOMContentLoaded', () => {
    // Проверка поддержки Intersection Observer
    const supportsIntersectionObserver = 'IntersectionObserver' in window;
    
    // Элементы, которые будут анимироваться при прокрутке
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    // Прогресс-бар прокрутки
    let scrollProgress = document.querySelector('.scroll-progress');
    
    // Кнопка "Наверх"
    let backToTopButton = document.querySelector('.back-to-top');
    
    // Хедер
    const header = document.querySelector('header');
    
    // Создаем прогресс-бар прокрутки, если его нет
    if (!scrollProgress) {
        scrollProgress = document.createElement('div');
        scrollProgress.className = 'scroll-progress';
        document.body.appendChild(scrollProgress);
    }
    
    // Создаем кнопку "Наверх", если её нет
    if (!backToTopButton) {
        backToTopButton = document.createElement('a');
        backToTopButton.className = 'back-to-top';
        backToTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
        backToTopButton.href = '#';
        document.body.appendChild(backToTopButton);
        
        backToTopButton.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: supportsScrollBehavior() ? 'smooth' : 'auto'
            });
        });
    }
    
    // Проверка поддержки smooth scroll
    function supportsScrollBehavior() {
        return 'scrollBehavior' in document.documentElement.style;
    }
    
    // Функция для проверки, находится ли элемент в видимой области (для браузеров без поддержки Intersection Observer)
    const isElementInViewport = (el, offset = 150) => {
        const rect = el.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight - offset) &&
            rect.bottom >= 0
        );
    };
    
    // Функция для анимации элементов при прокрутке (для браузеров без поддержки Intersection Observer)
    const animateOnScrollLegacy = () => {
        animatedElements.forEach(element => {
            if (isElementInViewport(element) && !element.classList.contains('visible')) {
                element.classList.add('visible');
            }
        });
    };
    
    // Настройка Intersection Observer для анимации элементов при прокрутке
    if (supportsIntersectionObserver) {
        const observerOptions = {
            root: null, // viewport
            rootMargin: '0px 0px -100px 0px', // срабатывает, когда элемент на 100px ниже нижней границы viewport
            threshold: 0.1 // срабатывает, когда 10% элемента видимы
        };
        
        const animationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Отключаем наблюдение после срабатывания
                    animationObserver.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        // Добавляем все элементы для наблюдения
        animatedElements.forEach(element => {
            animationObserver.observe(element);
        });
    } else {
        // Запускаем анимацию при загрузке страницы для браузеров без поддержки Intersection Observer
        animateOnScrollLegacy();
        // Добавляем обработчик события прокрутки
        window.addEventListener('scroll', animateOnScrollLegacy, { passive: true });
    }
    
    // Функция для обновления прогресс-бара прокрутки с использованием requestAnimationFrame
    const updateScrollProgress = () => {
        requestAnimationFrame(() => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrollPercent = scrollTop / docHeight;
            scrollProgress.style.width = scrollPercent * 100 + '%';
        });
    };
    
    // Функция для обработки кнопки "Наверх"
    const handleBackToTopButton = () => {
        if (window.scrollY > 300) {
            if (!backToTopButton.classList.contains('visible')) {
                backToTopButton.classList.add('visible');
            }
        } else {
            if (backToTopButton.classList.contains('visible')) {
                backToTopButton.classList.remove('visible');
            }
        }
    };
    
    // Функция для обработки хедера при прокрутке
    const handleHeaderOnScroll = () => {
        if (header) {
            if (window.scrollY > 100) {
                if (!header.classList.contains('scrolled')) {
                    header.classList.add('scrolled');
                }
            } else {
                if (header.classList.contains('scrolled')) {
                    header.classList.remove('scrolled');
                }
            }
        }
    };
    
    // Оптимизированный обработчик события прокрутки с использованием throttle
    let ticking = false;
    const handleScroll = () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                updateScrollProgress();
                handleBackToTopButton();
                handleHeaderOnScroll();
                ticking = false;
            });
            ticking = true;
        }
    };
    
    // Добавляем обработчик события прокрутки с флагом passive для улучшения производительности
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Запускаем обработчики при загрузке страницы
    updateScrollProgress();
    handleBackToTopButton();
    handleHeaderOnScroll();
    
    // Добавляем классы анимации к элементам секций, если они еще не добавлены
    const addAnimationClasses = () => {
        const selectors = [
            '.section-title',
            '.service-card',
            '.gallery-item',
            '.about-image',
            '.about-text',
            '.booking-form',
            '.contact-info',
            '.room-card'
        ];
        
        selectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                if (!el.classList.contains('animate-on-scroll')) {
                    el.classList.add('animate-on-scroll');
                    // Если используем Intersection Observer, добавляем элемент для наблюдения
                    if (supportsIntersectionObserver && typeof animationObserver !== 'undefined') {
                        animationObserver.observe(el);
                    }
                }
            });
        });
    };
    
    // Вызываем функцию добавления классов анимации
    addAnimationClasses();
    
    // Обработка анимаций при изменении размера окна с debounce
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (!supportsIntersectionObserver) {
                animateOnScrollLegacy();
            }
            updateScrollProgress();
        }, 100);
    }, { passive: true });
    
    // Проверка предпочтений пользователя по уменьшению движения
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
        // Если пользователь предпочитает уменьшенное движение, отключаем анимации
        document.documentElement.classList.add('reduced-motion');
        
        // Делаем все элементы видимыми сразу
        animatedElements.forEach(element => {
            element.classList.add('visible');
        });
    }
}); 