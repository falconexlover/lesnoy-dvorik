/**
 * Скрипт для ленивой загрузки изображений
 * Гостиница "Лесной дворик"
 */

document.addEventListener('DOMContentLoaded', function() {
    // Проверяем поддержку IntersectionObserver
    if ('IntersectionObserver' in window) {
        const lazyImages = document.querySelectorAll('img[data-src], source[data-srcset], iframe[data-src]');
        
        // Настройки наблюдателя
        const options = {
            root: null, // использовать viewport в качестве области видимости
            rootMargin: '0px 0px 200px 0px', // добавляем буфер 200px снизу
            threshold: 0.01 // начать загрузку, когда 1% элемента видим
        };
        
        // Создаем наблюдателя
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    
                    // Обработка изображений
                    if (element.dataset.src) {
                        element.src = element.dataset.src;
                        element.removeAttribute('data-src');
                    }
                    
                    // Обработка источников (для тега picture)
                    if (element.dataset.srcset) {
                        element.srcset = element.dataset.srcset;
                        element.removeAttribute('data-srcset');
                    }
                    
                    // Обработка iframe (для карт, видео и т.д.)
                    if (element.tagName.toLowerCase() === 'iframe' && element.dataset.src) {
                        element.src = element.dataset.src;
                        element.removeAttribute('data-src');
                    }
                    
                    // Добавляем класс loaded для плавного появления
                    element.classList.add('loaded');
                    
                    // Прекращаем наблюдение за элементом
                    observer.unobserve(element);
                }
            });
        }, options);
        
        // Начинаем наблюдение за элементами
        lazyImages.forEach(image => {
            observer.observe(image);
        });
    } else {
        // Фолбэк для браузеров без поддержки IntersectionObserver
        lazyImages.forEach(image => {
            if (image.dataset.src) {
                image.src = image.dataset.src;
                image.removeAttribute('data-src');
            }
            if (image.dataset.srcset) {
                image.srcset = image.dataset.srcset;
                image.removeAttribute('data-srcset');
            }
            image.classList.add('loaded');
        });
    }
    
    // Добавляем класс для фоновых изображений
    const lazyBackgrounds = document.querySelectorAll('.lazy-background');
    
    if ('IntersectionObserver' in window) {
        const backgroundObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    
                    if (element.dataset.background) {
                        element.style.backgroundImage = `url(${element.dataset.background})`;
                        element.classList.add('loaded');
                        element.removeAttribute('data-background');
                    }
                    
                    backgroundObserver.unobserve(element);
                }
            });
        }, options);
        
        lazyBackgrounds.forEach(bg => {
            backgroundObserver.observe(bg);
        });
    } else {
        // Фолбэк для браузеров без поддержки IntersectionObserver
        lazyBackgrounds.forEach(bg => {
            if (bg.dataset.background) {
                bg.style.backgroundImage = `url(${bg.dataset.background})`;
                bg.classList.add('loaded');
            }
        });
    }
}); 