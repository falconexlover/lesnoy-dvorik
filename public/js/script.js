/**
 * Общие скрипты для страницы отеля
 */

document.addEventListener('DOMContentLoaded', function() {
    // Инициализация UI компонентов
    initMobileMenu();
    initCarousels();
    initRoomFilter();
    initScrollAnimations();
    initBookingForm();
});

/**
 * Инициализация мобильного меню
 */
function initMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (!menuToggle || !mobileMenu) return;
    
    menuToggle.addEventListener('click', function() {
        mobileMenu.classList.toggle('active');
        this.classList.toggle('active');
        document.body.classList.toggle('menu-open');
    });
    
    // Закрытие меню при клике на ссылку
    const mobileLinks = mobileMenu.querySelectorAll('a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', function() {
            mobileMenu.classList.remove('active');
            menuToggle.classList.remove('active');
            document.body.classList.remove('menu-open');
        });
    });
}

/**
 * Инициализация всех каруселей на странице
 */
function initCarousels() {
    const carousels = document.querySelectorAll('.carousel');
    
    carousels.forEach(carousel => {
        const container = carousel.querySelector('.carousel-container');
        const slides = carousel.querySelectorAll('.carousel-slide');
        const prevBtn = carousel.querySelector('.carousel-prev');
        const nextBtn = carousel.querySelector('.carousel-next');
        
        if (!container || slides.length === 0) return;
        
        let currentIndex = 0;
        const slideWidth = slides[0].offsetWidth;
        const slideCount = slides.length;
        
        // Клонирование слайдов для бесконечной прокрутки
        if (slideCount > 1) {
            const firstSlideClone = slides[0].cloneNode(true);
            const lastSlideClone = slides[slideCount - 1].cloneNode(true);
            
            container.appendChild(firstSlideClone);
            container.insertBefore(lastSlideClone, slides[0]);
            
            container.style.transform = `translateX(-${slideWidth}px)`;
        }
        
        // Обработчики для кнопок навигации
        if (prevBtn && nextBtn) {
            prevBtn.addEventListener('click', () => {
                if (currentIndex === 0) {
                    // Переход к последнему слайду
                    container.style.transition = 'none';
                    currentIndex = slideCount;
                    container.style.transform = `translateX(-${(currentIndex + 1) * slideWidth}px)`;
                    
                    setTimeout(() => {
                        container.style.transition = 'transform 0.3s ease';
                        currentIndex--;
                        container.style.transform = `translateX(-${(currentIndex + 1) * slideWidth}px)`;
                    }, 10);
                } else {
                    currentIndex--;
                    container.style.transform = `translateX(-${(currentIndex + 1) * slideWidth}px)`;
                }
            });
            
            nextBtn.addEventListener('click', () => {
                if (currentIndex === slideCount - 1) {
                    // Переход к первому слайду
                    container.style.transition = 'none';
                    currentIndex = -1;
                    container.style.transform = `translateX(-${(currentIndex + 1) * slideWidth}px)`;
                    
                    setTimeout(() => {
                        container.style.transition = 'transform 0.3s ease';
                        currentIndex++;
                        container.style.transform = `translateX(-${(currentIndex + 1) * slideWidth}px)`;
                    }, 10);
                } else {
                    currentIndex++;
                    container.style.transform = `translateX(-${(currentIndex + 1) * slideWidth}px)`;
                }
            });
        }
    });
}

/**
 * Инициализация фильтра комнат
 */
function initRoomFilter() {
    const filterButtons = document.querySelectorAll('.room-filter-button');
    const rooms = document.querySelectorAll('.room-card');
    
    if (filterButtons.length === 0 || rooms.length === 0) return;
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Удаление активного класса у всех кнопок
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Добавление активного класса текущей кнопке
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            
            // Фильтрация комнат
            rooms.forEach(room => {
                if (filter === 'all') {
                    room.style.display = '';
                } else {
                    const roomType = room.getAttribute('data-type');
                    if (roomType === filter) {
                        room.style.display = '';
                    } else {
                        room.style.display = 'none';
                    }
                }
            });
        });
    });
}

/**
 * Инициализация анимаций при прокрутке
 */
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    if (animatedElements.length === 0) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });
    
    animatedElements.forEach(element => {
        observer.observe(element);
    });
}

/**
 * Инициализация формы бронирования
 */
function initBookingForm() {
    const bookingForm = document.querySelector('.booking-form');
    
    if (!bookingForm) return;
    
    const dateInputs = bookingForm.querySelectorAll('input[type="date"]');
    const today = new Date().toISOString().split('T')[0];
    
    // Установка минимальной даты для полей выбора даты
    dateInputs.forEach(input => {
        input.min = today;
    });
    
    // Валидация формы перед отправкой
    bookingForm.addEventListener('submit', function(e) {
        const checkIn = bookingForm.querySelector('#check-in').value;
        const checkOut = bookingForm.querySelector('#check-out').value;
        
        if (checkIn && checkOut && checkIn >= checkOut) {
            e.preventDefault();
            alert('Дата выезда должна быть позже даты заезда');
        }
    });
} 