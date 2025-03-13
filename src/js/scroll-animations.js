/**
 * Скрипт для анимаций при скролле
 * Гостиница "Лесной дворик"
 */

document.addEventListener('DOMContentLoaded', function() {
    // Элементы с анимацией при скролле
    const animateElements = document.querySelectorAll('.animate-on-scroll');
    
    // Проверка поддержки IntersectionObserver
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Опционально: отключаем наблюдение после первого появления
                    // observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15, // Элемент должен быть виден на 15% для активации анимации
            rootMargin: '0px 0px -50px 0px' // Смещение области наблюдения
        });
        
        // Наблюдаем за всеми элементами с классом animate-on-scroll
        animateElements.forEach(element => {
            observer.observe(element);
        });
    } else {
        // Фолбэк для браузеров без поддержки IntersectionObserver
        animateElements.forEach(element => {
            element.classList.add('visible');
        });
    }
    
    // Анимация для элементов с задержкой
    const staggeredElements = document.querySelectorAll('.staggered');
    if (staggeredElements.length > 0) {
        staggeredElements.forEach((element, index) => {
            element.style.transitionDelay = `${index * 0.1}s`;
        });
    }
    
    // Параллакс эффект для фоновых изображений
    const parallaxElements = document.querySelectorAll('.parallax-bg');
    if (parallaxElements.length > 0) {
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset;
            
            parallaxElements.forEach(element => {
                const speed = element.dataset.speed || 0.5;
                const offset = scrollTop * speed;
                element.style.transform = `translateY(${offset}px)`;
            });
        });
    }
    
    // Анимация счетчиков
    const counters = document.querySelectorAll('.counter');
    if (counters.length > 0) {
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = entry.target;
                    const countTo = parseInt(target.dataset.count);
                    let count = 0;
                    const duration = 2000; // 2 секунды
                    const interval = duration / countTo;
                    
                    const counter = setInterval(() => {
                        count++;
                        target.textContent = count;
                        
                        if (count >= countTo) {
                            clearInterval(counter);
                        }
                    }, interval);
                    
                    counterObserver.unobserve(target);
                }
            });
        }, {
            threshold: 0.5
        });
        
        counters.forEach(counter => {
            counterObserver.observe(counter);
        });
    }
    
    // Плавный скролл для якорных ссылок
    const smoothScrollLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');
    smoothScrollLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Анимация для хедера при скролле
    const header = document.querySelector('header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }
    
    // Инициализация кнопки "Назад к началу"
    setupBackToTopButton();
    
    // Инициализация анимаций для элементов при прокрутке
    setupScrollAnimations();
    
    // Инициализация плавной прокрутки для якорных ссылок
    setupSmoothScrolling();
});

/**
 * Настройка кнопки "Назад к началу"
 */
function setupBackToTopButton() {
    // Добавляем кнопку, если её ещё нет в DOM
    if (!document.querySelector('.back-to-top')) {
        const backToTopButton = document.createElement('button');
        backToTopButton.className = 'back-to-top';
        backToTopButton.innerHTML = '<i class="fas fa-chevron-up"></i>';
        backToTopButton.setAttribute('aria-label', 'Вернуться к началу страницы');
        document.body.appendChild(backToTopButton);
    }
    
    const backToTopButton = document.querySelector('.back-to-top');
    
    // Обработчик скролла для показа/скрытия кнопки
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    });
    
    // Плавная прокрутка наверх при клике
    backToTopButton.addEventListener('click', function(e) {
        e.preventDefault();
        
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

/**
 * Настройка анимаций элементов при прокрутке
 */
function setupScrollAnimations() {
    // Используем IntersectionObserver для анимации элементов, когда они появляются в области видимости
    if ('IntersectionObserver' in window) {
        const animateElements = document.querySelectorAll('.animate-on-scroll');
        
        const options = {
            root: null, // использовать область просмотра как корневой элемент
            rootMargin: '0px 0px -100px 0px', // срабатывать, когда элемент на 100px ниже нижнего края экрана
            threshold: 0.1 // срабатывать, когда 10% элемента видимы
        };
        
        const observer = new IntersectionObserver(function(entries, observer) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    observer.unobserve(entry.target); // перестаем наблюдать за элементом после анимации
                }
            });
        }, options);
        
        animateElements.forEach(element => {
            observer.observe(element);
        });
    } else {
        // Для браузеров, не поддерживающих IntersectionObserver, просто показываем все элементы
        document.querySelectorAll('.animate-on-scroll').forEach(element => {
            element.classList.add('animated');
        });
    }
    
    // Эффект параллакса для фоновых изображений
    const parallaxElements = document.querySelectorAll('.parallax-bg');
    
    window.addEventListener('scroll', function() {
        parallaxElements.forEach(element => {
            const scrollTop = window.pageYOffset;
            const elementOffset = element.offsetTop;
            const distance = scrollTop - elementOffset;
            const speed = element.dataset.speed || 0.3;
            
            if (element.offsetTop < (scrollTop + window.innerHeight) && 
                elementOffset + element.offsetHeight > scrollTop) {
                element.style.transform = `translateY(${distance * speed}px)`;
            }
        });
    });
}

/**
 * Настройка плавной прокрутки для якорных ссылок
 */
function setupSmoothScrolling() {
    // Находим все ссылки с хэшами (якорями)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            
            // Игнорируем ссылки, которые не указывают на элемент на странице
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                e.preventDefault();
                
                // Прокрутка с учетом фиксированного меню (если есть)
                const headerOffset = document.querySelector('header.fixed') ? 
                    document.querySelector('header.fixed').offsetHeight : 0;
                
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Обновляем URL
                history.pushState(null, null, targetId);
            }
        });
    });
} 