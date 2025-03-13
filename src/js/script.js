/**
 * Основной файл скриптов для страниц отеля
 */

document.addEventListener('DOMContentLoaded', function() {
    // Инициализация всех компонентов
    initHeader();
    initSliders();
    initGallery();
    initBookingForm();
    initAnimations();
    initMobileMenu();
    initLazyLoading();
});

/**
 * Инициализация шапки сайта
 */
function initHeader() {
    const header = document.querySelector('.header');
    if (!header) return;

    // Добавление класса при прокрутке
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Активация текущего пункта меню
    const currentPath = window.location.pathname;
    const menuLinks = document.querySelectorAll('.header__menu-link');
    
    menuLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath || (href !== '/' && currentPath.includes(href))) {
            link.classList.add('active');
        }
    });
}

/**
 * Инициализация слайдеров
 */
function initSliders() {
    // Проверка наличия слайдеров на странице
    const heroSlider = document.querySelector('.hero-slider');
    if (heroSlider) {
        // Код для инициализации главного слайдера
        console.log('Hero slider initialized');
    }

    const roomSlider = document.querySelector('.room-slider');
    if (roomSlider) {
        // Код для инициализации слайдера номеров
        console.log('Room slider initialized');
    }
}

/**
 * Инициализация галереи
 */
function initGallery() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    if (galleryItems.length === 0) return;

    galleryItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const imageUrl = this.getAttribute('href') || this.querySelector('img').getAttribute('src');
            openGalleryModal(imageUrl);
        });
    });
}

/**
 * Открытие модального окна галереи
 */
function openGalleryModal(imageUrl) {
    // Создание модального окна
    const modal = document.createElement('div');
    modal.className = 'gallery-modal';
    modal.innerHTML = `
        <div class="gallery-modal__overlay"></div>
        <div class="gallery-modal__content">
            <img src="${imageUrl}" alt="Gallery image">
            <button class="gallery-modal__close">&times;</button>
        </div>
    `;

    // Добавление модального окна на страницу
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    // Обработчик закрытия
    const closeBtn = modal.querySelector('.gallery-modal__close');
    const overlay = modal.querySelector('.gallery-modal__overlay');

    closeBtn.addEventListener('click', closeGalleryModal);
    overlay.addEventListener('click', closeGalleryModal);

    function closeGalleryModal() {
        document.body.removeChild(modal);
        document.body.style.overflow = '';
    }
}

/**
 * Инициализация формы бронирования
 */
function initBookingForm() {
    const bookingForm = document.querySelector('.booking-form');
    if (!bookingForm) return;

    bookingForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Валидация формы
        const isValid = validateBookingForm(bookingForm);
        
        if (isValid) {
            // Отправка формы
            console.log('Booking form submitted');
            // Здесь будет код для отправки данных на сервер
        }
    });
}

/**
 * Валидация формы бронирования
 */
function validateBookingForm(form) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.classList.add('error');
        } else {
            field.classList.remove('error');
        }
    });
    
    return isValid;
}

/**
 * Инициализация анимаций
 */
function initAnimations() {
    // Анимация при скролле
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    if (animatedElements.length === 0) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
            }
        });
    }, { threshold: 0.1 });
    
    animatedElements.forEach(element => {
        observer.observe(element);
    });
}

/**
 * Инициализация мобильного меню
 */
function initMobileMenu() {
    const burgerBtn = document.querySelector('.header__burger');
    const mobileMenu = document.querySelector('.header__menu');
    
    if (!burgerBtn || !mobileMenu) return;
    
    burgerBtn.addEventListener('click', function() {
        mobileMenu.classList.toggle('active');
        burgerBtn.classList.toggle('active');
    });
}

/**
 * Инициализация ленивой загрузки изображений
 */
function initLazyLoading() {
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    if (lazyImages.length === 0) return;
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });
    
    lazyImages.forEach(img => {
        imageObserver.observe(img);
    });
} 