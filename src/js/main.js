/**
 * Основной JavaScript файл для сайта гостиницы "Лесной дворик"
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM загружен, инициализация скриптов...");
    
    // Мобильное меню
    initMobileMenu();
    
    // Инициализация формы бронирования
    initBookingForm();
    
    // Плавная прокрутка к якорям
    initSmoothScroll();
    
    // Анимация при скролле
    initScrollAnimation();
    
    // Обработка фиксированного заголовка при прокрутке
    initFixedHeader();
    
    // Инициализация лайтбокса для галереи
    initLightbox();
    
    // Ленивая загрузка изображений
    initLazyLoading();
    
    // Отложенная загрузка скриптов
    initDeferredScripts();
});

/**
 * Инициализация фиксированного заголовка
 */
function initFixedHeader() {
    const header = document.querySelector('header');
    
    if (header) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }
}

/**
 * Инициализация мобильного меню с поддержкой доступности
 */
function initMobileMenu() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mainMenu = document.querySelector('.main-menu');
    const body = document.body;
    const dropdowns = document.querySelectorAll('.dropdown');
    
    if (mobileMenuToggle && mainMenu) {
        // Добавляем атрибуты доступности (ARIA)
        mobileMenuToggle.setAttribute('aria-label', 'Открыть меню');
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        mobileMenuToggle.setAttribute('aria-controls', 'main-menu');
        
        if (mainMenu) {
            mainMenu.id = 'main-menu';
            mainMenu.setAttribute('aria-labelledby', 'mobile-menu-toggle');
        }
        
        mobileMenuToggle.addEventListener('click', function() {
            const expanded = this.getAttribute('aria-expanded') === 'true' || false;
            this.setAttribute('aria-expanded', !expanded);
            this.classList.toggle('active');
            mainMenu.classList.toggle('active');
            body.classList.toggle('menu-open');
            
            // Изменяем текст для скринридеров
            this.setAttribute('aria-label', expanded ? 'Открыть меню' : 'Закрыть меню');
            
            // Анимация иконки гамбургера
            const spans = mobileMenuToggle.querySelectorAll('span');
            if (mobileMenuToggle.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
        
        // Закрытие меню при клике вне его области
        document.addEventListener('click', function(event) {
            if (mainMenu.classList.contains('active') && 
                !mainMenu.contains(event.target) && 
                !mobileMenuToggle.contains(event.target)) {
                mainMenu.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
                body.classList.remove('menu-open');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
            }
        });
        
        // Обработка выпадающих меню на мобильных устройствах
        if (window.innerWidth <= 768) {
            dropdowns.forEach(function(dropdown) {
                const link = dropdown.querySelector('a');
                if (link) {
                    link.addEventListener('click', function(e) {
                        if (window.innerWidth <= 768) {
                            e.preventDefault();
                            // Закрываем другие открытые выпадающие меню
                            dropdowns.forEach(function(otherDropdown) {
                                if (otherDropdown !== dropdown && otherDropdown.classList.contains('active')) {
                                    otherDropdown.classList.remove('active');
                                }
                            });
                            dropdown.classList.toggle('active');
                        }
                    });
                }
            });
        }
    }
}

/**
 * Инициализация формы бронирования
 */
function initBookingForm() {
    const bookingForm = document.getElementById('booking-form');
    
    if (bookingForm) {
        // Установка минимальных дат для полей даты
        const checkInDate = document.getElementById('check-in-date');
        const checkOutDate = document.getElementById('check-out-date');
        
        if (checkInDate && checkOutDate) {
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            const formatDate = (date) => {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };
            
            checkInDate.min = formatDate(today);
            checkOutDate.min = formatDate(tomorrow);
            
            // Обновление минимальной даты выезда при изменении даты заезда
            checkInDate.addEventListener('change', function() {
                const selectedDate = new Date(this.value);
                const nextDay = new Date(selectedDate);
                nextDay.setDate(nextDay.getDate() + 1);
                checkOutDate.min = formatDate(nextDay);
                
                // Если текущая дата выезда меньше новой минимальной, обновляем её
                if (new Date(checkOutDate.value) <= selectedDate) {
                    checkOutDate.value = formatDate(nextDay);
                }
            });
        }
        
        // Валидация формы перед отправкой
        bookingForm.addEventListener('submit', function(e) {
            let isValid = true;
            const requiredFields = bookingForm.querySelectorAll('[required]');
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.classList.add('error');
                } else {
                    field.classList.remove('error');
                }
            });
            
            // Валидация email
            const emailField = document.getElementById('email');
            if (emailField && emailField.value && !validateEmail(emailField.value)) {
                isValid = false;
                emailField.classList.add('error');
            }
            
            // Валидация телефона
            const phoneField = document.getElementById('phone');
            if (phoneField && phoneField.value && !validatePhone(phoneField.value)) {
                isValid = false;
                phoneField.classList.add('error');
            }
            
            if (!isValid) {
                e.preventDefault();
                alert('Пожалуйста, заполните все обязательные поля корректно.');
            }
        });
    }
}

/**
 * Валидация email
 */
function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

/**
 * Валидация телефона
 */
function validatePhone(phone) {
    const re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    return re.test(String(phone));
}

/**
 * Инициализация плавной прокрутки к якорям
 */
function initSmoothScroll() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');
    
    anchorLinks.forEach(link => {
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
                
                // Закрываем мобильное меню после клика
                const mainMenu = document.querySelector('.main-menu');
                const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
                
                if (mainMenu && mainMenu.classList.contains('active')) {
                    mainMenu.classList.remove('active');
                    if (mobileMenuToggle) {
                        mobileMenuToggle.classList.remove('active');
                        mobileMenuToggle.setAttribute('aria-expanded', 'false');
                    }
                    document.body.classList.remove('menu-open');
                }
            }
        });
    });
}

/**
 * Инициализация анимации при скролле
 */
function initScrollAnimation() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    if (animatedElements.length > 0) {
        const isElementInViewport = (el) => {
            const rect = el.getBoundingClientRect();
            return (
                rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.8 &&
                rect.bottom >= 0
            );
        };
        
        const animateElements = () => {
            animatedElements.forEach(element => {
                if (isElementInViewport(element) && !element.classList.contains('animated')) {
                    element.classList.add('animated');
                }
            });
        };
        
        // Запускаем анимацию при загрузке и скролле
        animateElements();
        window.addEventListener('scroll', animateElements);
    }
}

/**
 * Проверка, находится ли элемент в области видимости
 */
function checkIfInView() {
    const elements = document.querySelectorAll('.fade-in');
    const windowHeight = window.innerHeight;
    
    elements.forEach(function(element) {
        const positionFromTop = element.getBoundingClientRect().top;
        
        if (positionFromTop - windowHeight <= 0) {
            element.classList.add('visible');
        }
    });
}

/**
 * Инициализация лайтбокса для галереи
 */
function initLightbox() {
    // Создаем элементы лайтбокса
    const lightboxHTML = `
        <div class="lightbox">
            <div class="lightbox-content">
                <img src="" alt="" class="lightbox-image">
                <button class="lightbox-close" aria-label="Закрыть">&times;</button>
                <button class="lightbox-prev" aria-label="Предыдущее изображение">&lsaquo;</button>
                <button class="lightbox-next" aria-label="Следующее изображение">&rsaquo;</button>
            </div>
        </div>
    `;
    
    // Добавляем лайтбокс в конец body
    document.body.insertAdjacentHTML('beforeend', lightboxHTML);
    
    const lightbox = document.querySelector('.lightbox');
    const lightboxImage = document.querySelector('.lightbox-image');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxPrev = document.querySelector('.lightbox-prev');
    const lightboxNext = document.querySelector('.lightbox-next');
    
    // Получаем все элементы галереи
    const galleryItems = document.querySelectorAll('.gallery-item');
    let currentIndex = 0;
    
    // Открытие лайтбокса при клике на элемент галереи
    galleryItems.forEach((item, index) => {
        item.addEventListener('click', function() {
            const imgSrc = this.querySelector('img').getAttribute('src');
            const imgAlt = this.querySelector('img').getAttribute('alt');
            
            lightboxImage.setAttribute('src', imgSrc);
            lightboxImage.setAttribute('alt', imgAlt);
            currentIndex = index;
            
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden'; // Блокируем прокрутку страницы
            
            // Устанавливаем фокус на лайтбокс для доступности
            lightbox.setAttribute('tabindex', '-1');
            lightbox.focus();
        });
    });
    
    // Закрытие лайтбокса
    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
    
    // Обработка клавиш
    document.addEventListener('keydown', function(e) {
        if (!lightbox.classList.contains('active')) return;
        
        if (e.key === 'Escape') {
            closeLightbox();
        } else if (e.key === 'ArrowLeft') {
            showPrevImage();
        } else if (e.key === 'ArrowRight') {
            showNextImage();
        }
    });
    
    // Переключение на предыдущее изображение
    lightboxPrev.addEventListener('click', showPrevImage);
    
    // Переключение на следующее изображение
    lightboxNext.addEventListener('click', showNextImage);
    
    // Функция закрытия лайтбокса
    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = ''; // Разблокируем прокрутку страницы
    }
    
    // Функция показа предыдущего изображения
    function showPrevImage() {
        currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
        updateLightboxImage();
    }
    
    // Функция показа следующего изображения
    function showNextImage() {
        currentIndex = (currentIndex + 1) % galleryItems.length;
        updateLightboxImage();
    }
    
    // Обновление изображения в лайтбоксе
    function updateLightboxImage() {
        const imgSrc = galleryItems[currentIndex].querySelector('img').getAttribute('src');
        const imgAlt = galleryItems[currentIndex].querySelector('img').getAttribute('alt');
        
        // Анимация смены изображения
        lightboxImage.style.opacity = '0';
        
        setTimeout(() => {
            lightboxImage.setAttribute('src', imgSrc);
            lightboxImage.setAttribute('alt', imgAlt);
            lightboxImage.style.opacity = '1';
        }, 300);
    }
}

/**
 * Оптимизированная ленивая загрузка изображений с использованием IntersectionObserver
 */
function initLazyLoading() {
    // Проверка поддержки IntersectionObserver
    if ('IntersectionObserver' in window) {
        const lazyImageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const lazyImage = entry.target;
                    const src = lazyImage.dataset.src;
                    
                    if (src) {
                        lazyImage.src = src;
                        lazyImage.classList.add('loaded');
                        lazyImage.removeAttribute('data-src');
                        lazyImageObserver.unobserve(lazyImage);
                    }
                }
            });
        }, {
            rootMargin: '100px 0px',
            threshold: 0.01
        });
        
        const lazyImages = document.querySelectorAll('.lazy-image');
        lazyImages.forEach(lazyImage => {
            lazyImageObserver.observe(lazyImage);
        });
    } else {
        // Фолбэк для браузеров без поддержки IntersectionObserver
        const lazyImages = document.querySelectorAll('.lazy-image');
        const lazyLoad = function() {
            let lazyImageTimeout;
            
            if (lazyImageTimeout) {
                clearTimeout(lazyImageTimeout);
            }
            
            lazyImageTimeout = setTimeout(() => {
                const scrollTop = window.pageYOffset;
                
                lazyImages.forEach(lazyImage => {
                    if (lazyImage.offsetTop < (window.innerHeight + scrollTop) && !lazyImage.classList.contains('loaded')) {
                        const src = lazyImage.dataset.src;
                        
                        if (src) {
                            lazyImage.src = src;
                            lazyImage.classList.add('loaded');
                            lazyImage.removeAttribute('data-src');
                        }
                    }
                });
                
                if (lazyImages.length === 0) {
                    document.removeEventListener('scroll', lazyLoad);
                    window.removeEventListener('resize', lazyLoad);
                    window.removeEventListener('orientationChange', lazyLoad);
                }
            }, 20);
        };
        
        document.addEventListener('scroll', lazyLoad);
        window.addEventListener('resize', lazyLoad);
        window.addEventListener('orientationChange', lazyLoad);
        
        // Инициализация при загрузке
        lazyLoad();
    }
}

/**
 * Отложенная загрузка скриптов
 */
function initDeferredScripts() {
    // Массив скриптов, которые нужно загрузить отложенно
    const scripts = [
        { src: 'js/analytics.js', defer: true, async: true },
        // Добавьте другие скрипты, которые можно загрузить отложенно
    ];
    
    // Функция для загрузки скрипта
    const loadScript = (src, defer = false, async = false) => {
        const script = document.createElement('script');
        script.src = src;
        if (defer) script.defer = true;
        if (async) script.async = true;
        document.body.appendChild(script);
    };
    
    // Загрузка скриптов с задержкой
    setTimeout(() => {
        scripts.forEach(script => {
            loadScript(script.src, script.defer, script.async);
        });
    }, 2000);
} 