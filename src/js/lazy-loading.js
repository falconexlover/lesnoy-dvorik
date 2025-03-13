/**
 * Система ленивой загрузки изображений для сайта "Лесной дворик"
 * Повышает производительность сайта за счет загрузки изображений только при их появлении в зоне видимости
 */

(function() {
    // Настройки ленивой загрузки
    const config = {
        // Использовать IntersectionObserver (современные браузеры)
        useIntersectionObserver: true,
        
        // Отступ загрузки изображений (в пикселях) - запустить загрузку, когда 
        // изображение находится в пределах 300px от видимой области
        rootMargin: '300px',
        
        // Селекторы элементов для ленивой загрузки
        selectors: {
            images: 'img[data-src]', // Изображения с атрибутом data-src
            backgroundImages: '[data-bg-src]', // Элементы с фоновыми изображениями
            iframes: 'iframe[data-src]', // Iframes
            videos: 'video[data-src]' // Видео
        },
        
        // CSS классы
        classes: {
            loading: 'lazy-loading', // Класс во время загрузки
            loaded: 'lazy-loaded',   // Класс после загрузки
            error: 'lazy-error'      // Класс при ошибке загрузки
        },
        
        // Автоматически инициализировать на всех страницах
        autoInit: true,
        
        // Показывать отладочную информацию в консоли
        debug: false
    };
    
    // Сохраняем ссылку на IntersectionObserver, если он используется
    let observer = null;
    
    // Статистика загрузки для отчетности
    let stats = {
        loaded: 0,
        errors: 0,
        skipped: 0,
        elements: {
            images: 0,
            backgrounds: 0,
            iframes: 0,
            videos: 0
        }
    };
    
    /**
     * Инициализация системы ленивой загрузки
     */
    function init() {
        log('Инициализация системы ленивой загрузки');
        
        // Если используем IntersectionObserver и он доступен
        if (config.useIntersectionObserver && 'IntersectionObserver' in window) {
            // Создаем IntersectionObserver
            observer = new IntersectionObserver(onIntersection, {
                rootMargin: config.rootMargin,
                threshold: 0
            });
            
            // Получаем все элементы для ленивой загрузки
            const lazyElements = getAllLazyElements();
            
            // Добавляем элементы в наблюдатель
            lazyElements.forEach(element => {
                observer.observe(element);
                element.classList.add(config.classes.loading);
                
                // Обновляем статистику
                updateElementStats(element);
            });
            
            log(`Добавлено ${lazyElements.length} элементов для ленивой загрузки`);
        } else {
            // Если IntersectionObserver не поддерживается, загружаем все 
            // элементы с небольшой задержкой для улучшения начальной загрузки страницы
            setTimeout(() => {
                const lazyElements = getAllLazyElements();
                lazyElements.forEach(element => loadElement(element));
                
                log(`Загружено ${lazyElements.length} элементов в режиме совместимости`);
            }, 1000);
        }
        
        // Устанавливаем обработчик события прокрутки для резервного механизма
        if (!config.useIntersectionObserver || !('IntersectionObserver' in window)) {
            window.addEventListener('scroll', throttle(checkVisibleElements, 200));
            window.addEventListener('resize', throttle(checkVisibleElements, 200));
            window.addEventListener('orientationchange', throttle(checkVisibleElements, 200));
            
            // Проверяем видимые элементы при загрузке страницы
            checkVisibleElements();
        }
    }
    
    /**
     * Обработчик события IntersectionObserver
     * @param {Array} entries Массив элементов, пересекших зону наблюдения
     */
    function onIntersection(entries) {
        entries.forEach(entry => {
            // Если элемент видим
            if (entry.isIntersecting) {
                // Прекращаем наблюдение
                observer.unobserve(entry.target);
                
                // Загружаем элемент
                loadElement(entry.target);
            }
        });
    }
    
    /**
     * Загрузка элемента
     * @param {HTMLElement} element Элемент для загрузки
     */
    function loadElement(element) {
        // Проверяем, не был ли элемент уже загружен
        if (element.classList.contains(config.classes.loaded)) {
            stats.skipped++;
            return;
        }
        
        // Тип элемента для загрузки
        const isImage = element.tagName.toLowerCase() === 'img';
        const isIframe = element.tagName.toLowerCase() === 'iframe';
        const isVideo = element.tagName.toLowerCase() === 'video';
        const isBackground = element.hasAttribute('data-bg-src');
        
        try {
            if (isImage || isIframe || isVideo) {
                // Для изображений, iframe и видео
                const dataSrc = element.getAttribute('data-src');
                
                // Если есть различные разрешения для разных устройств
                if (element.hasAttribute('data-srcset')) {
                    element.srcset = element.getAttribute('data-srcset');
                }
                
                // Для всех элементов с src
                if (dataSrc) {
                    element.src = dataSrc;
                    
                    // Обработчик загрузки
                    element.onload = () => {
                        element.classList.remove(config.classes.loading);
                        element.classList.add(config.classes.loaded);
                        element.removeAttribute('data-src');
                        element.removeAttribute('data-srcset');
                        stats.loaded++;
                        log(`Элемент загружен: ${dataSrc}`);
                    };
                    
                    // Обработчик ошибки
                    element.onerror = () => {
                        element.classList.remove(config.classes.loading);
                        element.classList.add(config.classes.error);
                        stats.errors++;
                        log(`Ошибка загрузки: ${dataSrc}`, 'error');
                    };
                }
            } else if (isBackground) {
                // Для фоновых изображений
                const dataBgSrc = element.getAttribute('data-bg-src');
                
                if (dataBgSrc) {
                    // Предварительно загружаем изображение
                    const img = new Image();
                    img.src = dataBgSrc;
                    
                    img.onload = () => {
                        element.style.backgroundImage = `url('${dataBgSrc}')`;
                        element.classList.remove(config.classes.loading);
                        element.classList.add(config.classes.loaded);
                        element.removeAttribute('data-bg-src');
                        stats.loaded++;
                        log(`Фоновое изображение загружено: ${dataBgSrc}`);
                    };
                    
                    img.onerror = () => {
                        element.classList.remove(config.classes.loading);
                        element.classList.add(config.classes.error);
                        stats.errors++;
                        log(`Ошибка загрузки фона: ${dataBgSrc}`, 'error');
                    };
                }
            }
        } catch (error) {
            element.classList.remove(config.classes.loading);
            element.classList.add(config.classes.error);
            stats.errors++;
            log(`Ошибка при загрузке элемента: ${error}`, 'error');
        }
    }
    
    /**
     * Обновляет статистику по типам элементов
     * @param {HTMLElement} element Элемент для анализа
     */
    function updateElementStats(element) {
        const isImage = element.tagName.toLowerCase() === 'img';
        const isIframe = element.tagName.toLowerCase() === 'iframe';
        const isVideo = element.tagName.toLowerCase() === 'video';
        const isBackground = element.hasAttribute('data-bg-src');
        
        if (isImage) {
            stats.elements.images++;
        } else if (isBackground) {
            stats.elements.backgrounds++;
        } else if (isIframe) {
            stats.elements.iframes++;
        } else if (isVideo) {
            stats.elements.videos++;
        }
    }
    
    /**
     * Проверка видимых элементов (запасной вариант без IntersectionObserver)
     */
    function checkVisibleElements() {
        const lazyElements = getAllLazyElements();
        
        lazyElements.forEach(element => {
            if (isElementInViewport(element)) {
                loadElement(element);
            }
        });
    }
    
    /**
     * Определяет, находится ли элемент в видимой части экрана
     * @param {HTMLElement} element Элемент для проверки
     * @returns {boolean} Находится ли элемент в видимой области
     */
    function isElementInViewport(element) {
        const rect = element.getBoundingClientRect();
        const margin = parseInt(config.rootMargin, 10) || 300;
        
        return (
            rect.bottom >= 0 - margin &&
            rect.right >= 0 - margin &&
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) + margin &&
            rect.left <= (window.innerWidth || document.documentElement.clientWidth) + margin
        );
    }
    
    /**
     * Получает все элементы для ленивой загрузки на странице
     * @returns {Array} Массив элементов для ленивой загрузки
     */
    function getAllLazyElements() {
        const selectors = Object.values(config.selectors).join(',');
        return Array.from(document.querySelectorAll(selectors));
    }
    
    /**
     * Преобразует обычные изображения и другие элементы в элементы для ленивой загрузки
     * @param {string} selector Селектор для поиска элементов
     * @param {boolean} includeExisting Включать ли уже существующие элементы с data-src
     */
    function convertElements(selector = 'img:not([data-src])', includeExisting = false) {
        const elements = Array.from(document.querySelectorAll(selector));
        
        elements.forEach(element => {
            // Пропускаем, если элемент уже настроен для ленивой загрузки и не нужно включать существующие
            if (!includeExisting && (
                element.hasAttribute('data-src') || 
                element.classList.contains(config.classes.loaded)
            )) {
                return;
            }
            
            const isImage = element.tagName.toLowerCase() === 'img';
            const isIframe = element.tagName.toLowerCase() === 'iframe';
            const isVideo = element.tagName.toLowerCase() === 'video';
            
            if (isImage || isIframe || isVideo) {
                // Сохраняем оригинальный src в data-src
                if (element.src && !element.hasAttribute('data-src')) {
                    element.setAttribute('data-src', element.src);
                    
                    // Устанавливаем placeholder для изображений
                    if (isImage) {
                        // Если не указан явно пустой placeholder, устанавливаем его
                        element.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E';
                    } else {
                        element.src = '';
                    }
                }
                
                // Сохраняем srcset, если есть
                if (element.srcset && !element.hasAttribute('data-srcset')) {
                    element.setAttribute('data-srcset', element.srcset);
                    element.srcset = '';
                }
            } else if (element.style.backgroundImage && element.style.backgroundImage.includes('url')) {
                // Извлекаем URL из background-image: url('...')
                const match = element.style.backgroundImage.match(/url\(['"]?([^'"]+)['"]?\)/);
                if (match && match[1]) {
                    element.setAttribute('data-bg-src', match[1]);
                    element.style.backgroundImage = '';
                }
            }
            
            element.classList.add(config.classes.loading);
            
            // Обновляем статистику
            updateElementStats(element);
        });
        
        // Если используем IntersectionObserver и он уже создан
        if (observer) {
            elements.forEach(element => {
                if (
                    element.hasAttribute('data-src') || 
                    element.hasAttribute('data-bg-src')
                ) {
                    observer.observe(element);
                }
            });
        } else {
            // Проверяем видимые элементы в запасном режиме
            checkVisibleElements();
        }
        
        log(`Преобразовано ${elements.length} элементов для ленивой загрузки`);
    }
    
    /**
     * Выводит отладочную информацию в консоль
     * @param {string} message Сообщение для вывода
     * @param {string} type Тип сообщения (log, error, warn, info)
     */
    function log(message, type = 'log') {
        if (!config.debug) return;
        
        const prefix = '%c[LazyLoader]';
        const style = 'color: #217148; font-weight: bold;';
        
        switch (type) {
            case 'error':
                console.error(prefix, style, message);
                break;
            case 'warn':
                console.warn(prefix, style, message);
                break;
            case 'info':
                console.info(prefix, style, message);
                break;
            default:
                console.log(prefix, style, message);
        }
    }
    
    /**
     * Ограничивает частоту вызова функции (для оптимизации обработчиков событий)
     * @param {Function} func Функция для ограничения
     * @param {number} wait Интервал в миллисекундах
     * @returns {Function} Функция с ограниченной частотой вызова
     */
    function throttle(func, wait) {
        let lastTime = 0;
        return function() {
            const now = new Date().getTime();
            if (now - lastTime >= wait) {
                func.apply(this, arguments);
                lastTime = now;
            }
        };
    }
    
    /**
     * Получает статистику ленивой загрузки
     * @returns {Object} Объект со статистикой
     */
    function getStatistics() {
        return {
            ...stats,
            total: stats.loaded + stats.errors + stats.skipped
        };
    }
    
    /**
     * Принудительно загружает все элементы с ленивой загрузкой
     */
    function loadAll() {
        const lazyElements = getAllLazyElements();
        lazyElements.forEach(element => loadElement(element));
        
        log(`Принудительно загружено ${lazyElements.length} элементов`);
    }
    
    // Добавляем стили для эффектов загрузки
    function addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .lazy-loading {
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            
            .lazy-loaded {
                opacity: 1;
                transition: opacity 0.3s ease;
            }
            
            .lazy-error {
                opacity: 0.5;
                filter: grayscale(1);
                transition: opacity 0.3s ease;
            }
            
            /* Заглушка для изображений во время загрузки */
            img.lazy-loading:not([src]) {
                min-height: 100px;
                background: linear-gradient(110deg, #ececec 8%, #f5f5f5 18%, #ececec 33%);
                background-size: 200% 100%;
                animation: 1.5s shine linear infinite;
            }
            
            @keyframes shine {
                to {
                    background-position-x: -200%;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Экспортируем публичное API
    const LazyLoader = {
        init: init,
        convertElements: convertElements,
        loadElement: loadElement,
        loadAll: loadAll,
        getStatistics: getStatistics,
        config: config
    };
    
    // Выполняем инициализацию, если включен автозапуск
    if (config.autoInit) {
        // Если DOM уже загружен
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            setTimeout(function() {
                addStyles();
                init();
            }, 1);
        } else {
            // Если DOM еще загружается
            document.addEventListener('DOMContentLoaded', function() {
                addStyles();
                init();
            });
        }
    } else {
        // Добавляем стили в любом случае
        addStyles();
    }
    
    // Делаем API доступным глобально
    window.LazyLoader = LazyLoader;
})(); 