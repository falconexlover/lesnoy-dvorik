/**
 * Скрипт для автоматического подключения хедера и основных стилей ко всем страницам
 * Гостиница "Лесной дворик"
 */

(function() {
    // Функция для добавления CSS файла
    function addStylesheet(href) {
        // Проверяем, не добавлен ли уже такой файл
        if (document.querySelector(`link[href="${href}"]`)) {
            return;
        }
        
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
    }
    
    // Функция для добавления JavaScript файла
    function addScript(src, callback) {
        // Проверяем, не добавлен ли уже такой файл
        if (document.querySelector(`script[src="${src}"]`)) {
            return;
        }
        
        const script = document.createElement('script');
        script.src = src;
        script.onload = callback;
        document.body.appendChild(script);
    }
    
    // Определяем путь к корню сайта
    let rootPath = '';
    const currentPath = window.location.pathname;
    
    if (currentPath.includes('/pages/')) {
        rootPath = '../';
    }
    
    // Основной набор CSS-файлов для согласованного дизайна
    const essentialStyles = [
        'css/style.css',
        'css/components.css',
        'css/header-fix.css',
        'css/typography.css',
        'css/forms.css',
        'css/ui-components.css'
    ];
    
    // Добавляем Font Awesome, если его еще нет
    if (!document.querySelector('link[href*="font-awesome"]')) {
        addStylesheet('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css');
    }
    
    // Добавляем шрифты Google, если их еще нет
    if (!document.querySelector('link[href*="fonts.googleapis.com"]')) {
        addStylesheet('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&family=Playfair+Display:wght@400;500;600;700&display=swap');
    }
    
    // Добавляем все необходимые CSS файлы
    essentialStyles.forEach(style => {
        addStylesheet(rootPath + style);
    });
    
    // Добавляем скрипт для применения варианта 2 хедера
    addScript(rootPath + 'js/apply-header.js', function() {
        // После загрузки скрипта вызываем функцию применения хедера
        if (typeof applyHeaderVariant === 'function') {
            applyHeaderVariant();
            console.info(
                '%c🌿 Хедер успешно применен 🌿',
                'background:#217148; color:white; padding:5px 10px; border-radius:4px; font-weight:bold;'
            );
        } else {
            console.error('Функция applyHeaderVariant не найдена');
        }
    });
    
    // Добавляем скрипт ленивой загрузки изображений для всех страниц
    addScript(rootPath + 'js/lazy-loading.js', function() {
        // После загрузки скрипта автоматически конвертируем все существующие изображения
        if (window.LazyLoader) {
            // Конвертируем все изображения на странице
            window.LazyLoader.convertElements('img:not([data-src])');
            
            // Конвертируем элементы с фоновыми изображениями
            window.LazyLoader.convertElements('.room-card, .gallery-item, .testimonial-item, .hero-section, .facility-item');
            
            console.info(
                '%c🌿 Ленивая загрузка активирована 🌿',
                'background:#217148; color:white; padding:5px 10px; border-radius:4px; font-weight:bold;'
            );
        }
    });
    
    // Добавляем скрипт доступности
    addScript(rootPath + 'js/accessibility.js');
    
    // Определяем, находимся ли мы в режиме разработки
    const isDevMode = (
        window.location.hostname === 'localhost' || 
        window.location.hostname === '127.0.0.1' ||
        window.location.port === '8081'
    );
    
    // Подключаем систему тестирования стилей только в режиме разработки
    if (isDevMode) {
        addScript(rootPath + 'js/style-tests.js');
        
        // Добавляем информацию в консоль для разработчиков
        console.info(
            '%c🌿 Лесной дворик - режим разработки 🌿',
            'background:#217148; color:white; padding:5px 10px; border-radius:4px; font-weight:bold;',
            '\nДоступны горячие клавиши:\n',
            'Ctrl+Shift+T: Запустить полное тестирование стилей\n',
            'Alt+A: Открыть панель доступности\n',
            'Доступно API в консоли: StyleTests.runFullTest(), LazyLoader.getStatistics()'
        );
    }
})(); 