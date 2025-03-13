/**
 * Улучшения дизайна для сайта гостиницы "Лесной дворик"
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Design improvements script loaded');
    
    // Функция для добавления анимаций при прокрутке
    function initScrollAnimations() {
        const animatedElements = document.querySelectorAll('.animate-on-scroll');
        
        if (animatedElements.length === 0) {
            // Если нет элементов с классом animate-on-scroll, добавляем его к некоторым элементам
            const elementsToAnimate = document.querySelectorAll('h2, .service-card, .gallery-item, .about-image, .booking-form');
            
            elementsToAnimate.forEach(element => {
                element.classList.add('animate-on-scroll');
                element.style.opacity = '0';
                element.style.transform = 'translateY(20px)';
                element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            });
        }
        
        // Функция для проверки, находится ли элемент в области видимости
        function isElementInViewport(el) {
            const rect = el.getBoundingClientRect();
            return (
                rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.8
            );
        }
        
        // Функция для анимации элементов при прокрутке
        function animateOnScroll() {
            const animatedElements = document.querySelectorAll('.animate-on-scroll');
            
            animatedElements.forEach(element => {
                if (isElementInViewport(element)) {
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                }
            });
        }
        
        // Вызываем функцию при загрузке страницы и при прокрутке
        animateOnScroll();
        window.addEventListener('scroll', animateOnScroll);
    }
    
    // Функция для улучшения галереи
    function enhanceGallery() {
        const galleryItems = document.querySelectorAll('.gallery-item');
        
        galleryItems.forEach(item => {
            // Добавляем эффект увеличения при наведении
            item.addEventListener('mouseenter', function() {
                const img = this.querySelector('img');
                if (img) {
                    img.style.transform = 'scale(1.1)';
                }
            });
            
            item.addEventListener('mouseleave', function() {
                const img = this.querySelector('img');
                if (img) {
                    img.style.transform = 'scale(1)';
                }
            });
            
            // Добавляем лайтбокс для просмотра изображений
            item.addEventListener('click', function() {
                const img = this.querySelector('img');
                if (img) {
                    const src = img.getAttribute('src');
                    const alt = img.getAttribute('alt') || 'Изображение галереи';
                    
                    // Создаем лайтбокс
                    const lightbox = document.createElement('div');
                    lightbox.className = 'lightbox';
                    lightbox.innerHTML = `
                        <div class="lightbox-content">
                            <img src="${src}" alt="${alt}" class="lightbox-image">
                            <button class="lightbox-close">&times;</button>
                        </div>
                    `;
                    
                    // Добавляем лайтбокс в DOM
                    document.body.appendChild(lightbox);
                    
                    // Показываем лайтбокс
                    setTimeout(() => {
                        lightbox.classList.add('active');
                    }, 10);
                    
                    // Обработчик закрытия лайтбокса
                    const closeButton = lightbox.querySelector('.lightbox-close');
                    closeButton.addEventListener('click', function() {
                        lightbox.classList.remove('active');
                        setTimeout(() => {
                            lightbox.remove();
                        }, 300);
                    });
                    
                    // Закрытие по клику на фон
                    lightbox.addEventListener('click', function(e) {
                        if (e.target === lightbox) {
                            lightbox.classList.remove('active');
                            setTimeout(() => {
                                lightbox.remove();
                            }, 300);
                        }
                    });
                }
            });
        });
    }
    
    // Функция для улучшения форм
    function enhanceForms() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            const inputs = form.querySelectorAll('input, textarea, select');
            
            inputs.forEach(input => {
                // Добавляем эффект фокуса
                input.addEventListener('focus', function() {
                    this.parentElement.classList.add('focused');
                });
                
                input.addEventListener('blur', function() {
                    this.parentElement.classList.remove('focused');
                });
                
                // Добавляем валидацию
                input.addEventListener('invalid', function() {
                    this.classList.add('error');
                });
                
                input.addEventListener('input', function() {
                    if (this.validity.valid) {
                        this.classList.remove('error');
                    }
                });
            });
        });
    }
    
    // Функция для улучшения кнопок
    function enhanceButtons() {
        const buttons = document.querySelectorAll('.btn');
        
        buttons.forEach(button => {
            // Добавляем эффект при наведении
            button.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-2px)';
            });
            
            button.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
            });
            
            // Добавляем эффект при клике
            button.addEventListener('mousedown', function() {
                this.style.transform = 'translateY(1px)';
            });
            
            button.addEventListener('mouseup', function() {
                this.style.transform = 'translateY(-2px)';
            });
        });
    }
    
    // Вызываем функции улучшения дизайна
    initScrollAnimations();
    enhanceGallery();
    enhanceForms();
    enhanceButtons();
}); 