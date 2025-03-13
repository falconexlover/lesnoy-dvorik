/**
 * Скрипт для выявления и исправления проблем с отображением
 * на сайте "Лесной дворик"
 */

(function() {
    // Основные проблемы, которые выявил анализ:
    // 1. Проблемы с темной темой (dark mode) и неправильной реакцией на prefers-color-scheme
    // 2. Проблемы с ленивой загрузкой изображений
    // 3. Отсутствующие или некорректные пути к ресурсам
    // 4. Ошибки CSS с фоновыми элементами
    // 5. Проблемы с анимациями при скролле

    // Настройки фиксов
    const config = {
        // Проверка и исправление тёмной темы
        fixDarkMode: true,
        
        // Проверка и исправление изображений
        fixImages: true,
        
        // Проверка и исправление CSS-проблем
        fixCSS: true,
        
        // Проверка и исправление некорректных путей
        fixPaths: true,
        
        // Включение/выключение отладочных сообщений
        debug: true
    };

    // Счетчик обнаруженных и исправленных проблем
    let stats = {
        darkModeIssues: 0,
        imageIssues: 0,
        cssIssues: 0,
        pathIssues: 0
    };

    // Инициализация скрипта при загрузке страницы
    document.addEventListener('DOMContentLoaded', init);

    // Основная функция инициализации
    function init() {
        logMessage('🔍 Запуск диагностики проблем отображения...');

        if (config.fixDarkMode) fixDarkModeIssues();
        if (config.fixImages) fixImageIssues();
        if (config.fixCSS) fixCSSIssues();
        if (config.fixPaths) fixPathIssues();

        // Показать итоговую статистику через 2 секунды (после всех инициализаций)
        setTimeout(() => {
            logMessage('📊 Итоговая статистика исправлений:');
            logMessage(`- Проблемы с темной темой: ${stats.darkModeIssues}`);
            logMessage(`- Проблемы с изображениями: ${stats.imageIssues}`);
            logMessage(`- CSS проблемы: ${stats.cssIssues}`);
            logMessage(`- Проблемы с путями: ${stats.pathIssues}`);
        }, 2000);
    }

    // Исправление проблем с темной темой
    function fixDarkModeIssues() {
        logMessage('🌓 Проверка проблем с темной темой...');

        // 1. Проверяем, есть ли в теге html класс темной темы
        const htmlElement = document.documentElement;
        const hasDarkModeClass = htmlElement.classList.contains('dark-mode');
        const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

        // 2. Исправляем проблему с отображением темной темы при системных настройках
        if (prefersDarkMode && !hasDarkModeClass) {
            htmlElement.classList.add('dark-mode');
            stats.darkModeIssues++;
            logMessage('✅ Применён класс dark-mode к html элементу');
        }

        // 3. Проверяем и исправляем проблемы с CSS переменными для темной темы
        const style = document.createElement('style');
        style.textContent = `
            :root.dark-mode, .dark-mode :root {
                --text-color: #f5f5f5;
                --text-light: #e0e0e0;
                --text-lighter: #bdbdbd;
                --background-color: #121212;
                --background-light: #1e1e1e;
                --background-dark: #0a0a0a;
                --border-color: #333333;
            }
            
            @media (prefers-color-scheme: dark) {
                :root {
                    --text-color: #f5f5f5;
                    --text-light: #e0e0e0;
                    --text-lighter: #bdbdbd;
                    --background-color: #121212;
                    --background-light: #1e1e1e;
                    --background-dark: #0a0a0a;
                    --border-color: #333333;
                }
                
                body {
                    background-color: var(--background-color);
                    color: var(--text-color);
                }
                
                .bento-card,
                .room-card,
                .form-group input,
                .form-group textarea,
                .form-group select {
                    background-color: var(--background-light);
                    color: var(--text-color);
                    border-color: var(--border-color);
                }
            }
        `;
        document.head.appendChild(style);
        stats.darkModeIssues++;
        logMessage('✅ Добавлены дополнительные CSS правила для темной темы');

        // 4. Добавляем переключатель темной темы
        addDarkModeToggle();
    }

    // Добавление переключателя темной темы
    function addDarkModeToggle() {
        // Создаем кнопку переключения
        const toggleButton = document.createElement('button');
        toggleButton.className = 'dark-mode-toggle';
        toggleButton.innerHTML = '🌓';
        toggleButton.title = 'Переключить тему';
        toggleButton.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: var(--primary-color);
            color: white;
            font-size: 24px;
            border: none;
            cursor: pointer;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
        `;

        // Обработчик клика для переключения темы
        toggleButton.addEventListener('click', () => {
            document.documentElement.classList.toggle('dark-mode');
            localStorage.setItem('darkMode', document.documentElement.classList.contains('dark-mode'));
            stats.darkModeIssues++;
            logMessage('🔄 Тема переключена пользователем');
        });

        document.body.appendChild(toggleButton);
        logMessage('✅ Добавлен переключатель темной темы');

        // Восстановление сохраненных настроек
        const savedDarkMode = localStorage.getItem('darkMode');
        if (savedDarkMode === 'true') {
            document.documentElement.classList.add('dark-mode');
        }
    }

    // Исправление проблем с изображениями
    function fixImageIssues() {
        logMessage('🖼️ Проверка проблем с изображениями...');

        // 1. Фиксим ленивую загрузку изображений
        const lazyImages = document.querySelectorAll('img[data-src]');
        if (lazyImages.length > 0) {
            lazyImages.forEach(img => {
                if (!img.src || img.src === '') {
                    img.src = img.dataset.src;
                    stats.imageIssues++;
                    logMessage(`✅ Исправлено изображение с data-src: ${img.dataset.src}`);
                }
            });
        }

        // 2. Проверяем битые изображения
        const allImages = document.querySelectorAll('img');
        allImages.forEach(img => {
            img.addEventListener('error', function() {
                // Заменяем битые изображения на заглушку
                if (!this.dataset.errorFixed) {
                    this.dataset.errorFixed = 'true';
                    this.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNlMGUwZTAiLz48dGV4dCB4PSI1MCIgeT0iNTAiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGFsaWdubWVudC1iYXNlbGluZT0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZmlsbD0iIzlFOUU5RSI+0J3QtdGCINC40LfQvtCx0YDQsNC20LXQvdC40Y88L3RleHQ+PC9zdmc+';
                    this.style.maxWidth = '100%';
                    this.style.height = 'auto';
                    stats.imageIssues++;
                    logMessage(`🔄 Заменено битое изображение: ${this.alt || 'без alt текста'}`);
                }
            });
        });

        // 3. Проверяем фоновые изображения
        const elementsWithBg = document.querySelectorAll('[data-bg-src]');
        elementsWithBg.forEach(element => {
            if (!element.style.backgroundImage || element.style.backgroundImage === '') {
                element.style.backgroundImage = `url(${element.dataset.bgSrc})`;
                stats.imageIssues++;
                logMessage(`✅ Исправлено фоновое изображение: ${element.dataset.bgSrc}`);
            }
        });
    }

    // Исправление проблем с CSS
    function fixCSSIssues() {
        logMessage('🎨 Проверка CSS проблем...');

        // 1. Добавляем глобальные стили для исправления проблем с черными участками
        const style = document.createElement('style');
        style.textContent = `
            /* Фикс для черных участков и контрастности */
            body, main, .section, .container {
                background-color: var(--background-color);
                color: var(--text-color);
            }
            
            /* Фикс для проблем с контрастностью в темной теме */
            @media (prefers-color-scheme: dark) {
                .btn-primary {
                    background-color: #2a8654;
                    border-color: #2a8654;
                }
                
                .btn-secondary {
                    background-color: #ff9800;
                    border-color: #ff9800;
                }
                
                a {
                    color: #4db6ac;
                }
                
                .bento-card-glass {
                    background-color: rgba(33, 33, 33, 0.8);
                    backdrop-filter: blur(10px);
                }
            }
            
            /* Фикс для проблем с анимациями */
            .bento-card {
                opacity: 1 !important;
                transform: none !important;
            }
            
            /* Исправление проблем с невидимыми элементами */
            [style*="display: none"] {
                display: block !important;
            }
            
            [style*="visibility: hidden"] {
                visibility: visible !important;
            }
            
            /* Фикс для проблем с z-index */
            header, footer, .lightbox, .dark-mode-toggle {
                z-index: 9999 !important;
            }
        `;
        document.head.appendChild(style);
        stats.cssIssues++;
        logMessage('✅ Добавлены корректирующие CSS правила');

        // 2. Проверяем наличие элементов без фона в темной теме
        const elementsToCheck = document.querySelectorAll('.bento-card, .room-card, .info-box, .alert, .form-control');
        elementsToCheck.forEach(element => {
            const computedStyle = window.getComputedStyle(element);
            const backgroundColor = computedStyle.backgroundColor;
            
            // Если фон прозрачный или не задан
            if (backgroundColor === 'transparent' || backgroundColor === 'rgba(0, 0, 0, 0)') {
                element.style.backgroundColor = 'var(--background-light)';
                element.style.color = 'var(--text-color)';
                stats.cssIssues++;
                logMessage(`✅ Исправлен прозрачный фон для элемента: ${element.className}`);
            }
        });
    }

    // Исправление проблем с путями
    function fixPathIssues() {
        logMessage('🔗 Проверка проблем с путями...');

        // 1. Проверяем некорректные пути в ссылках на CSS
        const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');
        cssLinks.forEach(link => {
            if (link.href && !linkExists(link.href)) {
                // Пытаемся исправить путь
                const fixedPath = fixPath(link.href);
                if (fixedPath !== link.href) {
                    link.href = fixedPath;
                    stats.pathIssues++;
                    logMessage(`✅ Исправлен путь к CSS: ${fixedPath}`);
                }
            }
        });

        // 2. Проверяем некорректные пути в скриптах
        const scripts = document.querySelectorAll('script[src]');
        scripts.forEach(script => {
            if (script.src && !linkExists(script.src)) {
                const fixedPath = fixPath(script.src);
                if (fixedPath !== script.src) {
                    script.src = fixedPath;
                    stats.pathIssues++;
                    logMessage(`✅ Исправлен путь к JS: ${fixedPath}`);
                }
            }
        });
    }

    // Проверка существования ссылки
    function linkExists(url) {
        // Упрощенная проверка - в реальности тут должен быть более надежный метод
        return true; // Заглушка
    }

    // Исправление пути
    function fixPath(path) {
        // Простая логика исправления - в реальности нужна более сложная
        if (path.startsWith('/') && !path.startsWith('//')) {
            return path.substring(1);
        }
        return path;
    }

    // Вывод сообщений в консоль
    function logMessage(message) {
        if (config.debug) {
            console.log(`[FixDisplay] ${message}`);
        }
    }
})(); 