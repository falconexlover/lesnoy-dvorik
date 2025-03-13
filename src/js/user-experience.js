/**
 * Улучшения пользовательского опыта для сайта гостиницы "Лесной дворик"
 * Оптимизировано для работы совместно с scroll-animations.js
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('User experience improvements loaded');
    
    // Улучшенный лайтбокс для галереи
    function enhanceGallery() {
        const galleryItems = document.querySelectorAll('.gallery-item');
        
        if (galleryItems.length === 0) return;
        
        // Создаем контейнер для лайтбокса, если его еще нет
        if (!document.querySelector('.lightbox-container')) {
            const lightboxContainer = document.createElement('div');
            lightboxContainer.className = 'lightbox-container';
            lightboxContainer.innerHTML = `
                <div class="lightbox">
                    <div class="lightbox-content">
                        <img src="" alt="" class="lightbox-image">
                        <button class="lightbox-close">&times;</button>
                        <button class="lightbox-prev"><i class="fas fa-chevron-left"></i></button>
                        <button class="lightbox-next"><i class="fas fa-chevron-right"></i></button>
                    </div>
                </div>
            `;
            document.body.appendChild(lightboxContainer);
            
            // Добавляем стили для лайтбокса, если их еще нет
            if (!document.querySelector('#lightbox-styles')) {
                const style = document.createElement('style');
                style.id = 'lightbox-styles';
                style.textContent = `
                    .lightbox-prev, .lightbox-next {
                        position: absolute;
                        top: 50%;
                        transform: translateY(-50%);
                        background: rgba(0, 0, 0, 0.5);
                        color: white;
                        border: none;
                        width: 40px;
                        height: 40px;
                        border-radius: 50%;
                        font-size: 20px;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        z-index: 1001;
                    }
                    
                    .lightbox-prev:hover, .lightbox-next:hover {
                        background: rgba(33, 113, 72, 0.8);
                    }
                    
                    .lightbox-prev {
                        left: 20px;
                    }
                    
                    .lightbox-next {
                        right: 20px;
                    }
                `;
                document.head.appendChild(style);
            }
        }
        
        const lightbox = document.querySelector('.lightbox');
        const lightboxImage = document.querySelector('.lightbox-image');
        const lightboxClose = document.querySelector('.lightbox-close');
        const lightboxPrev = document.querySelector('.lightbox-prev');
        const lightboxNext = document.querySelector('.lightbox-next');
        
        let currentIndex = 0;
        const galleryImages = [];
        
        // Собираем все изображения галереи
        galleryItems.forEach((item, index) => {
            const img = item.querySelector('img');
            if (img) {
                // Используем data-src для ленивой загрузки или обычный src
                const src = img.getAttribute('data-src') || img.getAttribute('src');
                const alt = img.getAttribute('alt') || 'Изображение галереи';
                galleryImages.push({ src, alt });
                
                // Добавляем обработчик клика
                item.addEventListener('click', function(e) {
                    e.preventDefault();
                    currentIndex = index;
                    openLightbox(currentIndex);
                });
            }
        });
        
        // Функция открытия лайтбокса
        function openLightbox(index) {
            if (galleryImages.length === 0) return;
            
            const image = galleryImages[index];
            lightboxImage.setAttribute('src', image.src);
            lightboxImage.setAttribute('alt', image.alt);
            
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
        
        // Функция закрытия лайтбокса
        function closeLightbox() {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        }
        
        // Обработчики для навигации
        lightboxClose.addEventListener('click', closeLightbox);
        
        lightboxPrev.addEventListener('click', function() {
            currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
            openLightbox(currentIndex);
        });
        
        lightboxNext.addEventListener('click', function() {
            currentIndex = (currentIndex + 1) % galleryImages.length;
            openLightbox(currentIndex);
        });
        
        // Закрытие по клику на фон
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
        
        // Навигация с клавиатуры
        document.addEventListener('keydown', function(e) {
            if (!lightbox.classList.contains('active')) return;
            
            if (e.key === 'Escape') {
                closeLightbox();
            } else if (e.key === 'ArrowLeft') {
                currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
                openLightbox(currentIndex);
            } else if (e.key === 'ArrowRight') {
                currentIndex = (currentIndex + 1) % galleryImages.length;
                openLightbox(currentIndex);
            }
        });
    }
    
    // Улучшенные формы с валидацией
    function enhanceForms() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            const inputs = form.querySelectorAll('input, textarea, select');
            
            // Добавляем атрибут placeholder для всех полей
            inputs.forEach(input => {
                if (!input.hasAttribute('placeholder')) {
                    const label = input.parentElement.querySelector('label');
                    if (label) {
                        input.setAttribute('placeholder', ' ');
                    }
                }
                
                // Добавляем обработчики событий
                input.addEventListener('focus', function() {
                    this.parentElement.classList.add('focused');
                });
                
                input.addEventListener('blur', function() {
                    this.parentElement.classList.remove('focused');
                    validateInput(this);
                });
                
                // Валидация при вводе
                input.addEventListener('input', function() {
                    if (this.classList.contains('error')) {
                        validateInput(this);
                    }
                });
            });
            
            // Валидация формы перед отправкой
            form.addEventListener('submit', function(e) {
                let isValid = true;
                
                inputs.forEach(input => {
                    if (!validateInput(input)) {
                        isValid = false;
                    }
                });
                
                if (!isValid) {
                    e.preventDefault();
                    
                    // Прокручиваем к первому невалидному полю
                    const firstError = form.querySelector('.error');
                    if (firstError) {
                        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        firstError.focus();
                    }
                    
                    // Добавляем анимацию встряхивания для формы
                    form.classList.add('shake');
                    setTimeout(() => {
                        form.classList.remove('shake');
                    }, 800);
                } else {
                    // Показываем уведомление об успешной отправке
                    showNotification('Форма успешно отправлена!', 'success');
                }
            });
        });
        
        // Функция валидации поля
        function validateInput(input) {
            // Пропускаем поля, которые не требуют валидации
            if (!input.hasAttribute('required') && input.value === '') {
                return true;
            }
            
            let isValid = true;
            const errorMessage = input.parentElement.querySelector('.error-message');
            
            // Удаляем предыдущее сообщение об ошибке
            if (errorMessage) {
                errorMessage.remove();
            }
            
            // Проверяем валидность
            if (input.hasAttribute('required') && input.value === '') {
                isValid = false;
                showError(input, 'Это поле обязательно для заполнения');
            } else if (input.type === 'email' && input.value !== '') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(input.value)) {
                    isValid = false;
                    showError(input, 'Введите корректный email');
                }
            } else if (input.type === 'tel' && input.value !== '') {
                const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
                if (!phoneRegex.test(input.value)) {
                    isValid = false;
                    showError(input, 'Введите корректный номер телефона');
                }
            } else if (input.id === 'check-in-date' || input.id === 'check-out-date') {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const selectedDate = new Date(input.value);
                
                if (selectedDate < today) {
                    isValid = false;
                    showError(input, 'Дата не может быть в прошлом');
                }
                
                // Проверка, что дата выезда позже даты заезда
                if (input.id === 'check-out-date') {
                    const checkInInput = document.getElementById('check-in-date');
                    if (checkInInput && checkInInput.value) {
                        const checkInDate = new Date(checkInInput.value);
                        if (selectedDate <= checkInDate) {
                            isValid = false;
                            showError(input, 'Дата выезда должна быть позже даты заезда');
                        }
                    }
                }
            }
            
            // Обновляем классы
            if (isValid) {
                input.classList.remove('error');
                input.classList.add('valid');
            } else {
                input.classList.add('error');
                input.classList.remove('valid');
            }
            
            return isValid;
        }
        
        // Функция отображения ошибки
        function showError(input, message) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = message;
            input.parentElement.appendChild(errorDiv);
        }
    }
    
    // Функция для отображения уведомлений
    function showNotification(message, type = 'info') {
        // Удаляем предыдущие уведомления
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => {
            notification.remove();
        });
        
        // Создаем новое уведомление
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="notification-icon fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
                <span class="notification-message">${message}</span>
            </div>
            <button class="notification-close">&times;</button>
        `;
        
        // Добавляем стили для уведомлений, если их еще нет
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    max-width: 400px;
                    background-color: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
                    padding: 15px;
                    z-index: 1000;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    animation: slideInDown 0.5s cubic-bezier(0.25, 0.1, 0.25, 1) forwards;
                }
                
                .notification-content {
                    display: flex;
                    align-items: center;
                }
                
                .notification-icon {
                    margin-right: 10px;
                    font-size: 20px;
                }
                
                .notification-success .notification-icon {
                    color: #4CAF50;
                }
                
                .notification-error .notification-icon {
                    color: #F44336;
                }
                
                .notification-info .notification-icon {
                    color: #2196F3;
                }
                
                .notification-message {
                    font-size: 16px;
                }
                
                .notification-close {
                    background: none;
                    border: none;
                    font-size: 20px;
                    cursor: pointer;
                    color: #999;
                    margin-left: 10px;
                }
                
                .notification-close:hover {
                    color: #333;
                }
                
                @keyframes slideInDown {
                    from { transform: translateY(-50px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                
                @keyframes fadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Добавляем обработчик для закрытия уведомления
        const closeButton = notification.querySelector('.notification-close');
        closeButton.addEventListener('click', () => {
            notification.style.animation = 'fadeOut 0.3s forwards';
            setTimeout(() => {
                notification.remove();
            }, 300);
        });
        
        // Автоматически скрываем уведомление через 5 секунд
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.style.animation = 'fadeOut 0.3s forwards';
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 5000);
    }
    
    // Улучшение доступности
    function enhanceAccessibility() {
        // Добавляем атрибуты ARIA для улучшения доступности
        document.querySelectorAll('a').forEach(link => {
            if (!link.getAttribute('aria-label') && !link.textContent.trim()) {
                const icon = link.querySelector('i');
                if (icon) {
                    const iconClass = Array.from(icon.classList).find(cls => cls.startsWith('fa-'));
                    if (iconClass) {
                        const label = iconClass.replace('fa-', '').replace(/-/g, ' ');
                        link.setAttribute('aria-label', label);
                    }
                }
            }
        });
        
        // Добавляем подсказки для элементов
        document.querySelectorAll('[data-tooltip]').forEach(element => {
            element.addEventListener('mouseenter', function() {
                const tooltipText = this.getAttribute('data-tooltip');
                
                // Создаем подсказку
                const tooltip = document.createElement('div');
                tooltip.className = 'tooltip';
                tooltip.textContent = tooltipText;
                
                // Добавляем стили для подсказок, если их еще нет
                if (!document.querySelector('#tooltip-styles')) {
                    const style = document.createElement('style');
                    style.id = 'tooltip-styles';
                    style.textContent = `
                        .tooltip {
                            position: absolute;
                            background-color: rgba(0, 0, 0, 0.8);
                            color: white;
                            padding: 5px 10px;
                            border-radius: 4px;
                            font-size: 14px;
                            z-index: 1000;
                            pointer-events: none;
                        }
                    `;
                    document.head.appendChild(style);
                }
                
                // Позиционируем подсказку
                document.body.appendChild(tooltip);
                const rect = this.getBoundingClientRect();
                const tooltipRect = tooltip.getBoundingClientRect();
                
                tooltip.style.top = (rect.top - tooltipRect.height - 10 + window.scrollY) + 'px';
                tooltip.style.left = (rect.left + (rect.width / 2) - (tooltipRect.width / 2)) + 'px';
            });
            
            element.addEventListener('mouseleave', function() {
                const tooltip = document.querySelector('.tooltip');
                if (tooltip) {
                    tooltip.remove();
                }
            });
        });
    }
    
    // Ленивая загрузка изображений
    function enhanceLazyLoading() {
        // Проверяем поддержку Intersection Observer
        if ('IntersectionObserver' in window) {
            const lazyImages = document.querySelectorAll('img.lazy-image');
            
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        const src = img.getAttribute('data-src');
                        
                        if (src) {
                            img.src = src;
                            img.classList.add('loaded');
                            imageObserver.unobserve(img);
                        }
                    }
                });
            });
            
            lazyImages.forEach(img => {
                imageObserver.observe(img);
            });
        } else {
            // Запасной вариант для браузеров без поддержки Intersection Observer
            const lazyImages = document.querySelectorAll('img.lazy-image');
            
            function lazyLoad() {
                lazyImages.forEach(img => {
                    if (isElementInViewport(img)) {
                        const src = img.getAttribute('data-src');
                        
                        if (src) {
                            img.src = src;
                            img.classList.add('loaded');
                        }
                    }
                });
            }
            
            // Функция для проверки, находится ли элемент в видимой области
            function isElementInViewport(el) {
                const rect = el.getBoundingClientRect();
                return (
                    rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
                    rect.bottom >= 0
                );
            }
            
            // Запускаем ленивую загрузку при загрузке страницы и при прокрутке
            lazyLoad();
            window.addEventListener('scroll', lazyLoad, { passive: true });
        }
    }
    
    // Вызываем функции улучшения пользовательского опыта
    enhanceGallery();
    enhanceForms();
    enhanceAccessibility();
    enhanceLazyLoading();
}); 