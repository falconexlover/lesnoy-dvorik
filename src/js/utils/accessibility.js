/**
 * Система улучшения доступности для сайта "Лесной дворик"
 * Добавляет функции для людей с ограниченными возможностями, улучшая опыт использования сайта
 */

(function() {
    // Конфигурация системы доступности
    const config = {
        // Автоматически запускать улучшения доступности
        autoInit: true,
        
        // Показывать панель доступности
        showAccessibilityPanel: true,
        
        // Сохранять настройки пользователя в localStorage
        saveSettings: true,
        
        // Ключ для localStorage
        localStorageKey: 'lesnoy_dvorik_accessibility',
        
        // Доступные функции
        features: {
            // Увеличение размера текста
            increaseText: true,
            
            // Высококонтрастный режим
            highContrast: true,
            
            // Подсветка ссылок
            highlightLinks: true,
            
            // Подсветка заголовков
            highlightHeadings: true,
            
            // Режим чтения (убирает отвлекающие элементы)
            readingMode: true,
            
            // Клавиатурная навигация с фокусом
            keyboardNavigation: true,
            
            // Режим дислексии (использует специальный шрифт)
            dyslexiaFont: true
        }
    };
    
    // Текущие настройки пользователя
    let userSettings = {
        textSize: 0, // -1: уменьшенный, 0: нормальный, 1: средний, 2: большой
        contrast: false, // Высокий контраст
        links: false, // Подсветка ссылок
        headings: false, // Подсветка заголовков
        readingMode: false, // Режим чтения
        dyslexiaFont: false, // Шрифт для дислексии
    };
    
    /**
     * Инициализация системы доступности
     */
    function init() {
        log('Инициализация системы доступности');
        
        // Загружаем сохраненные настройки, если они есть
        loadSettings();
        
        // Создаем панель доступности, если настроено
        if (config.showAccessibilityPanel) {
            createAccessibilityPanel();
        }
        
        // Добавляем обработчики клавиатурной навигации
        if (config.features.keyboardNavigation) {
            setupKeyboardNavigation();
        }
        
        // Применяем сохраненные настройки
        applySettings();
        
        // Добавляем метатег для адаптивного дизайна с учетом масштабирования
        addAccessibilityMetaTags();
    }
    
    /**
     * Создание панели доступности
     */
    function createAccessibilityPanel() {
        // Создаем контейнер для панели
        const panel = document.createElement('div');
        panel.className = 'accessibility-panel';
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-labelledby', 'accessibility-title');
        panel.setAttribute('aria-modal', 'false');
        
        // Иконка для вызова панели
        const trigger = document.createElement('button');
        trigger.className = 'accessibility-trigger';
        trigger.innerHTML = '<i class="fas fa-universal-access"></i>';
        trigger.setAttribute('aria-label', 'Открыть панель доступности');
        trigger.setAttribute('aria-expanded', 'false');
        
        // Содержимое панели
        panel.innerHTML = `
            <div class="accessibility-panel-inner">
                <h2 id="accessibility-title">Настройки доступности</h2>
                <button class="accessibility-close" aria-label="Закрыть панель доступности">&times;</button>
                
                <div class="accessibility-section">
                    <h3>Размер текста</h3>
                    <div class="accessibility-option">
                        <button id="decrease-text" class="accessibility-btn" aria-label="Уменьшить размер текста">
                            <i class="fas fa-font fa-xs"></i> Меньше
                        </button>
                        <button id="default-text" class="accessibility-btn" aria-label="Стандартный размер текста">
                            <i class="fas fa-font"></i> Стандартный
                        </button>
                        <button id="increase-text" class="accessibility-btn" aria-label="Увеличить размер текста">
                            <i class="fas fa-font fa-lg"></i> Больше
                        </button>
                        <button id="large-text" class="accessibility-btn" aria-label="Большой размер текста">
                            <i class="fas fa-font fa-2x"></i> Большой
                        </button>
                    </div>
                </div>
                
                <div class="accessibility-section">
                    <h3>Улучшение читаемости</h3>
                    <div class="accessibility-option">
                        <label class="accessibility-switch">
                            <input type="checkbox" id="contrast-toggle">
                            <span class="accessibility-slider"></span>
                            <span class="accessibility-label">Высокий контраст</span>
                        </label>
                        
                        <label class="accessibility-switch">
                            <input type="checkbox" id="links-toggle">
                            <span class="accessibility-slider"></span>
                            <span class="accessibility-label">Подсветка ссылок</span>
                        </label>
                        
                        <label class="accessibility-switch">
                            <input type="checkbox" id="headings-toggle">
                            <span class="accessibility-slider"></span>
                            <span class="accessibility-label">Подсветка заголовков</span>
                        </label>
                        
                        <label class="accessibility-switch">
                            <input type="checkbox" id="dyslexia-toggle">
                            <span class="accessibility-slider"></span>
                            <span class="accessibility-label">Шрифт для дислексии</span>
                        </label>
                    </div>
                </div>
                
                <div class="accessibility-section">
                    <h3>Режимы чтения</h3>
                    <div class="accessibility-option">
                        <button id="reading-mode" class="accessibility-btn" aria-label="Включить режим чтения">
                            <i class="fas fa-book-reader"></i> Режим чтения
                        </button>
                        <button id="reset-all" class="accessibility-btn accessibility-reset" aria-label="Сбросить все настройки">
                            <i class="fas fa-undo"></i> Сбросить все
                        </button>
                    </div>
                </div>
                
                <div class="accessibility-footer">
                    <p>Нажмите <kbd>Tab</kbd> для навигации по элементам и <kbd>Enter</kbd> для активации.</p>
                </div>
            </div>
        `;
        
        // Добавляем к документу
        document.body.appendChild(trigger);
        document.body.appendChild(panel);
        
        // Добавляем стили
        addStyles();
        
        // Обработчики событий
        trigger.addEventListener('click', function() {
            panel.classList.toggle('active');
            trigger.setAttribute('aria-expanded', panel.classList.contains('active') ? 'true' : 'false');
        });
        
        // Закрытие панели
        const closeBtn = panel.querySelector('.accessibility-close');
        closeBtn.addEventListener('click', function() {
            panel.classList.remove('active');
            trigger.setAttribute('aria-expanded', 'false');
            trigger.focus(); // Возвращаем фокус на кнопку
        });
        
        // Обработчики для кнопок размера текста
        const decreaseBtn = panel.querySelector('#decrease-text');
        const defaultBtn = panel.querySelector('#default-text');
        const increaseBtn = panel.querySelector('#increase-text');
        const largeBtn = panel.querySelector('#large-text');
        
        decreaseBtn.addEventListener('click', function() {
            setTextSize(-1);
        });
        
        defaultBtn.addEventListener('click', function() {
            setTextSize(0);
        });
        
        increaseBtn.addEventListener('click', function() {
            setTextSize(1);
        });
        
        largeBtn.addEventListener('click', function() {
            setTextSize(2);
        });
        
        // Обработчики для переключателей
        const contrastToggle = panel.querySelector('#contrast-toggle');
        contrastToggle.checked = userSettings.contrast;
        contrastToggle.addEventListener('change', function() {
            userSettings.contrast = this.checked;
            applySettings();
            saveSettings();
        });
        
        const linksToggle = panel.querySelector('#links-toggle');
        linksToggle.checked = userSettings.links;
        linksToggle.addEventListener('change', function() {
            userSettings.links = this.checked;
            applySettings();
            saveSettings();
        });
        
        const headingsToggle = panel.querySelector('#headings-toggle');
        headingsToggle.checked = userSettings.headings;
        headingsToggle.addEventListener('change', function() {
            userSettings.headings = this.checked;
            applySettings();
            saveSettings();
        });
        
        const dyslexiaToggle = panel.querySelector('#dyslexia-toggle');
        dyslexiaToggle.checked = userSettings.dyslexiaFont;
        dyslexiaToggle.addEventListener('change', function() {
            userSettings.dyslexiaFont = this.checked;
            applySettings();
            saveSettings();
        });
        
        // Обработчик для режима чтения
        const readingModeBtn = panel.querySelector('#reading-mode');
        readingModeBtn.addEventListener('click', function() {
            userSettings.readingMode = !userSettings.readingMode;
            applySettings();
            saveSettings();
            this.classList.toggle('active', userSettings.readingMode);
            this.innerHTML = userSettings.readingMode 
                ? '<i class="fas fa-times"></i> Выключить режим' 
                : '<i class="fas fa-book-reader"></i> Режим чтения';
        });
        
        // Обработчик для сброса настроек
        const resetBtn = panel.querySelector('#reset-all');
        resetBtn.addEventListener('click', function() {
            resetSettings();
        });
        
        // Обработчик нажатия ESC для закрытия панели
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && panel.classList.contains('active')) {
                panel.classList.remove('active');
                trigger.setAttribute('aria-expanded', 'false');
                trigger.focus();
            }
        });
        
        // Обработчик клика вне панели для закрытия
        document.addEventListener('click', function(e) {
            if (panel.classList.contains('active') && 
                !panel.contains(e.target) && 
                e.target !== trigger) {
                panel.classList.remove('active');
                trigger.setAttribute('aria-expanded', 'false');
            }
        });
    }
    
    /**
     * Установка размера текста
     * @param {number} size Размер текста (-1: уменьшенный, 0: нормальный, 1: средний, 2: большой)
     */
    function setTextSize(size) {
        userSettings.textSize = size;
        applySettings();
        saveSettings();
        
        // Обновляем активную кнопку в панели
        const buttons = document.querySelectorAll('.accessibility-panel .accessibility-btn');
        buttons.forEach(btn => btn.classList.remove('active'));
        
        const buttonId = size === -1 ? '#decrease-text' : 
                         size === 0 ? '#default-text' : 
                         size === 1 ? '#increase-text' : '#large-text';
        
        const activeButton = document.querySelector(buttonId);
        if (activeButton) {
            activeButton.classList.add('active');
        }
    }
    
    /**
     * Применение настроек доступности
     */
    function applySettings() {
        // Удаляем существующие классы доступности
        document.documentElement.classList.remove(
            'accessibility-text-small',
            'accessibility-text-default',
            'accessibility-text-large',
            'accessibility-text-xl',
            'accessibility-high-contrast',
            'accessibility-highlight-links',
            'accessibility-highlight-headings',
            'accessibility-reading-mode',
            'accessibility-dyslexia-font'
        );
        
        // Применяем размер текста
        switch (userSettings.textSize) {
            case -1:
                document.documentElement.classList.add('accessibility-text-small');
                break;
            case 0:
                document.documentElement.classList.add('accessibility-text-default');
                break;
            case 1:
                document.documentElement.classList.add('accessibility-text-large');
                break;
            case 2:
                document.documentElement.classList.add('accessibility-text-xl');
                break;
        }
        
        // Применяем высокий контраст
        if (userSettings.contrast) {
            document.documentElement.classList.add('accessibility-high-contrast');
        }
        
        // Применяем подсветку ссылок
        if (userSettings.links) {
            document.documentElement.classList.add('accessibility-highlight-links');
        }
        
        // Применяем подсветку заголовков
        if (userSettings.headings) {
            document.documentElement.classList.add('accessibility-highlight-headings');
        }
        
        // Применяем режим чтения
        if (userSettings.readingMode) {
            document.documentElement.classList.add('accessibility-reading-mode');
            
            // Обновляем кнопку режима чтения, если она существует
            const readingModeBtn = document.querySelector('#reading-mode');
            if (readingModeBtn) {
                readingModeBtn.classList.add('active');
                readingModeBtn.innerHTML = '<i class="fas fa-times"></i> Выключить режим';
            }
        }
        
        // Применяем шрифт для дислексии
        if (userSettings.dyslexiaFont) {
            document.documentElement.classList.add('accessibility-dyslexia-font');
            
            // Загружаем шрифт OpenDyslexic, если он еще не загружен
            if (!document.querySelector('link[href*="opendyslexic"]')) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = 'https://cdn.jsdelivr.net/npm/font-opendyslexic@1.0.3/css/opendyslexic.min.css';
                document.head.appendChild(link);
            }
        }
    }
    
    /**
     * Сохранение настроек в localStorage
     */
    function saveSettings() {
        if (!config.saveSettings) return;
        
        try {
            localStorage.setItem(config.localStorageKey, JSON.stringify(userSettings));
            log('Настройки доступности сохранены');
        } catch (error) {
            console.error('Ошибка при сохранении настроек доступности:', error);
        }
    }
    
    /**
     * Загрузка настроек из localStorage
     */
    function loadSettings() {
        if (!config.saveSettings) return;
        
        try {
            const saved = localStorage.getItem(config.localStorageKey);
            if (saved) {
                userSettings = JSON.parse(saved);
                log('Настройки доступности загружены');
            }
        } catch (error) {
            console.error('Ошибка при загрузке настроек доступности:', error);
        }
    }
    
    /**
     * Сброс всех настроек доступности
     */
    function resetSettings() {
        // Сбрасываем в значения по умолчанию
        userSettings = {
            textSize: 0,
            contrast: false,
            links: false,
            headings: false,
            readingMode: false,
            dyslexiaFont: false
        };
        
        // Применяем настройки по умолчанию
        applySettings();
        
        // Сохраняем настройки
        saveSettings();
        
        // Обновляем состояние элементов управления в панели
        const buttons = document.querySelectorAll('.accessibility-panel .accessibility-btn');
        buttons.forEach(btn => btn.classList.remove('active'));
        
        const defaultTextBtn = document.querySelector('#default-text');
        if (defaultTextBtn) {
            defaultTextBtn.classList.add('active');
        }
        
        const checkboxes = document.querySelectorAll('.accessibility-panel input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        
        const readingModeBtn = document.querySelector('#reading-mode');
        if (readingModeBtn) {
            readingModeBtn.classList.remove('active');
            readingModeBtn.innerHTML = '<i class="fas fa-book-reader"></i> Режим чтения';
        }
        
        log('Настройки доступности сброшены');
    }
    
    /**
     * Настройка клавиатурной навигации
     */
    function setupKeyboardNavigation() {
        // Добавляем обработчик для подсветки элемента с фокусом
        document.addEventListener('keydown', function(e) {
            // Если нажата клавиша Tab, добавляем класс для обозначения режима клавиатуры
            if (e.key === 'Tab') {
                document.documentElement.classList.add('accessibility-keyboard-mode');
            }
            
            // Скрываем подсветку по Escape
            if (e.key === 'Escape') {
                document.documentElement.classList.remove('accessibility-keyboard-mode');
            }
        });
        
        // При клике мышью убираем подсветку фокуса
        document.addEventListener('mousedown', function() {
            document.documentElement.classList.remove('accessibility-keyboard-mode');
        });
        
        // Добавляем быстрые клавиши для панели доступности (Alt+A)
        document.addEventListener('keydown', function(e) {
            if (e.altKey && e.key === 'a') {
                e.preventDefault();
                const panel = document.querySelector('.accessibility-panel');
                const trigger = document.querySelector('.accessibility-trigger');
                
                if (panel && trigger) {
                    panel.classList.toggle('active');
                    trigger.setAttribute('aria-expanded', panel.classList.contains('active') ? 'true' : 'false');
                    
                    if (panel.classList.contains('active')) {
                        const firstFocusable = panel.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                        if (firstFocusable) {
                            firstFocusable.focus();
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Добавление метатегов для улучшения доступности
     */
    function addAccessibilityMetaTags() {
        // Метатег для улучшения масштабирования на мобильных устройствах
        let viewportMeta = document.querySelector('meta[name="viewport"]');
        
        if (!viewportMeta) {
            viewportMeta = document.createElement('meta');
            viewportMeta.name = 'viewport';
            document.head.appendChild(viewportMeta);
        }
        
        viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes';
    }
    
    /**
     * Добавление стилей для панели доступности и визуальных эффектов
     */
    function addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Панель доступности */
            .accessibility-trigger {
                position: fixed;
                right: 20px;
                bottom: 20px;
                background-color: var(--primary-color, #217148);
                color: white;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                border: none;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
                cursor: pointer;
                z-index: 9997;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                transition: background-color 0.3s, transform 0.3s;
            }
            
            .accessibility-trigger:hover, .accessibility-trigger:focus {
                background-color: var(--primary-dark, #185a39);
                transform: scale(1.1);
                outline: none;
            }
            
            .accessibility-panel {
                position: fixed;
                right: 20px;
                bottom: 80px;
                width: 320px;
                background-color: white;
                border-radius: 8px;
                box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
                z-index: 9998;
                overflow: hidden;
                transform: translateY(20px);
                opacity: 0;
                visibility: hidden;
                transition: transform 0.3s, opacity 0.3s, visibility 0.3s;
            }
            
            .accessibility-panel.active {
                transform: translateY(0);
                opacity: 1;
                visibility: visible;
            }
            
            .accessibility-panel-inner {
                padding: 20px;
            }
            
            .accessibility-panel h2 {
                margin-top: 0;
                margin-bottom: 15px;
                font-size: 20px;
                color: var(--primary-color, #217148);
            }
            
            .accessibility-panel h3 {
                margin-top: 15px;
                margin-bottom: 10px;
                font-size: 16px;
                color: var(--text-color, #333);
            }
            
            .accessibility-close {
                position: absolute;
                top: 10px;
                right: 10px;
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: var(--text-light, #777);
                padding: 5px;
            }
            
            .accessibility-section {
                margin-bottom: 20px;
                border-bottom: 1px solid #eee;
                padding-bottom: 15px;
            }
            
            .accessibility-section:last-child {
                border-bottom: none;
                margin-bottom: 0;
            }
            
            .accessibility-option {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                margin-top: 10px;
            }
            
            .accessibility-btn {
                background-color: #f5f5f5;
                border: 1px solid #ddd;
                border-radius: 4px;
                padding: 8px 12px;
                cursor: pointer;
                font-size: 14px;
                transition: background-color 0.2s, border-color 0.2s, color 0.2s;
                display: flex;
                align-items: center;
                gap: 5px;
            }
            
            .accessibility-btn:hover, .accessibility-btn:focus {
                background-color: #e9e9e9;
                border-color: #ccc;
                outline: none;
            }
            
            .accessibility-btn.active {
                background-color: var(--primary-light, #C8E6C9);
                border-color: var(--primary-color, #217148);
                color: var(--primary-color, #217148);
            }
            
            .accessibility-reset {
                background-color: #ffebee;
                border-color: #ffcdd2;
                color: #d32f2f;
                margin-left: auto;
            }
            
            .accessibility-reset:hover, .accessibility-reset:focus {
                background-color: #ffcdd2;
                border-color: #ef9a9a;
            }
            
            .accessibility-switch {
                display: flex;
                align-items: center;
                margin-bottom: 10px;
                cursor: pointer;
                width: 100%;
            }
            
            .accessibility-switch input {
                opacity: 0;
                width: 0;
                height: 0;
                position: absolute;
            }
            
            .accessibility-slider {
                position: relative;
                display: inline-block;
                width: 40px;
                height: 22px;
                background-color: #ccc;
                border-radius: 34px;
                transition: .4s;
                margin-right: 10px;
                flex-shrink: 0;
            }
            
            .accessibility-slider:before {
                position: absolute;
                content: "";
                height: 16px;
                width: 16px;
                left: 3px;
                bottom: 3px;
                background-color: white;
                border-radius: 50%;
                transition: .4s;
            }
            
            input:checked + .accessibility-slider {
                background-color: var(--primary-color, #217148);
            }
            
            input:focus + .accessibility-slider {
                box-shadow: 0 0 1px var(--primary-color, #217148);
            }
            
            input:checked + .accessibility-slider:before {
                transform: translateX(18px);
            }
            
            .accessibility-label {
                font-size: 14px;
            }
            
            .accessibility-footer {
                margin-top: 20px;
                font-size: 12px;
                color: #777;
            }
            
            .accessibility-footer kbd {
                background-color: #f7f7f7;
                border: 1px solid #ccc;
                border-radius: 3px;
                box-shadow: 0 1px 0 rgba(0,0,0,0.2);
                color: #333;
                display: inline-block;
                font-size: 11px;
                line-height: 1.4;
                margin: 0 2px;
                padding: 2px 5px;
                white-space: nowrap;
            }
            
            /* Стили размеров текста */
            .accessibility-text-small {
                --accessibility-scale: 0.85;
            }
            
            .accessibility-text-default {
                --accessibility-scale: 1;
            }
            
            .accessibility-text-large {
                --accessibility-scale: 1.15;
            }
            
            .accessibility-text-xl {
                --accessibility-scale: 1.3;
            }
            
            .accessibility-text-small body {
                font-size: calc(var(--font-size-base, 16px) * var(--accessibility-scale));
            }
            
            .accessibility-text-default body {
                font-size: calc(var(--font-size-base, 16px) * var(--accessibility-scale));
            }
            
            .accessibility-text-large body {
                font-size: calc(var(--font-size-base, 16px) * var(--accessibility-scale));
            }
            
            .accessibility-text-xl body {
                font-size: calc(var(--font-size-base, 16px) * var(--accessibility-scale));
            }
            
            /* Высокий контраст */
            .accessibility-high-contrast {
                --high-contrast-bg: #ffffff;
                --high-contrast-text: #000000;
                --high-contrast-link: #0000EE;
                --high-contrast-visited: #551A8B;
                --high-contrast-btn: #000000;
                --high-contrast-btn-text: #ffffff;
                --high-contrast-border: #000000;
            }
            
            .accessibility-high-contrast body,
            .accessibility-high-contrast main,
            .accessibility-high-contrast div,
            .accessibility-high-contrast section,
            .accessibility-high-contrast article,
            .accessibility-high-contrast aside,
            .accessibility-high-contrast header,
            .accessibility-high-contrast footer,
            .accessibility-high-contrast nav {
                background-color: var(--high-contrast-bg) !important;
                color: var(--high-contrast-text) !important;
            }
            
            .accessibility-high-contrast h1,
            .accessibility-high-contrast h2,
            .accessibility-high-contrast h3,
            .accessibility-high-contrast h4,
            .accessibility-high-contrast h5,
            .accessibility-high-contrast h6,
            .accessibility-high-contrast p,
            .accessibility-high-contrast span,
            .accessibility-high-contrast li {
                color: var(--high-contrast-text) !important;
            }
            
            .accessibility-high-contrast a {
                color: var(--high-contrast-link) !important;
                text-decoration: underline !important;
            }
            
            .accessibility-high-contrast a:visited {
                color: var(--high-contrast-visited) !important;
            }
            
            .accessibility-high-contrast button,
            .accessibility-high-contrast .btn,
            .accessibility-high-contrast input[type="button"],
            .accessibility-high-contrast input[type="submit"] {
                background-color: var(--high-contrast-btn) !important;
                color: var(--high-contrast-btn-text) !important;
                border: 2px solid var(--high-contrast-border) !important;
                padding: 5px 10px !important;
            }
            
            .accessibility-high-contrast img,
            .accessibility-high-contrast video {
                border: 2px solid var(--high-contrast-border) !important;
            }
            
            /* Подсветка ссылок */
            .accessibility-highlight-links a {
                text-decoration: underline !important;
                font-weight: bold !important;
                border-bottom: 2px solid currentColor !important;
            }
            
            .accessibility-highlight-links button,
            .accessibility-highlight-links .btn,
            .accessibility-highlight-links input[type="button"],
            .accessibility-highlight-links input[type="submit"] {
                border: 2px solid currentColor !important;
            }
            
            /* Подсветка заголовков */
            .accessibility-highlight-headings h1,
            .accessibility-highlight-headings h2,
            .accessibility-highlight-headings h3,
            .accessibility-highlight-headings h4,
            .accessibility-highlight-headings h5,
            .accessibility-highlight-headings h6 {
                background-color: #f8f9fa !important;
                border-left: 4px solid var(--primary-color, #217148) !important;
                padding: 5px 10px !important;
            }
            
            /* Режим чтения */
            .accessibility-reading-mode {
                --reading-mode-bg: #f8f9fa;
                --reading-mode-text: #333333;
                --reading-mode-width: 800px;
            }
            
            .accessibility-reading-mode body {
                background-color: var(--reading-mode-bg) !important;
                color: var(--reading-mode-text) !important;
            }
            
            .accessibility-reading-mode main {
                max-width: var(--reading-mode-width) !important;
                margin: 0 auto !important;
                padding: 20px !important;
                background-color: white !important;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1) !important;
                line-height: 1.6 !important;
            }
            
            .accessibility-reading-mode header,
            .accessibility-reading-mode footer,
            .accessibility-reading-mode aside,
            .accessibility-reading-mode nav,
            .accessibility-reading-mode .sidebar,
            .accessibility-reading-mode .ads,
            .accessibility-reading-mode .banner,
            .accessibility-reading-mode .social-buttons {
                display: none !important;
            }
            
            /* Исключение для основной навигации и хедера */
            .accessibility-reading-mode header.main-header,
            .accessibility-reading-mode nav.main-nav {
                display: block !important;
            }
            
            /* Шрифт для дислексии */
            .accessibility-dyslexia-font * {
                font-family: 'OpenDyslexic', sans-serif !important;
                letter-spacing: 0.5px !important;
                word-spacing: 2px !important;
                line-height: 1.6 !important;
            }
            
            /* Клавиатурная навигация */
            .accessibility-keyboard-mode *:focus {
                outline: 3px solid var(--primary-color, #217148) !important;
                outline-offset: 2px !important;
                box-shadow: 0 0 0 3px rgba(33, 113, 72, 0.4) !important;
                text-decoration: underline !important;
            }
            
            /* Адаптивность для мобильных устройств */
            @media (max-width: 767px) {
                .accessibility-panel {
                    right: 10px;
                    bottom: 70px;
                    width: calc(100% - 20px);
                    max-width: 320px;
                }
                
                .accessibility-trigger {
                    right: 10px;
                    bottom: 10px;
                    width: 40px;
                    height: 40px;
                    font-size: 20px;
                }
                
                .accessibility-option {
                    flex-direction: column;
                }
                
                .accessibility-btn {
                    width: 100%;
                    justify-content: center;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    /**
     * Логирование сообщений
     * @param {string} message Сообщение для вывода в консоль
     */
    function log(message) {
        console.log('%c[Accessibility]', 'color: #217148; font-weight: bold;', message);
    }
    
    // Экспортируем публичное API
    const AccessibilityTools = {
        init: init,
        setTextSize: setTextSize,
        applySettings: applySettings,
        resetSettings: resetSettings,
        getSettings: function() {
            return { ...userSettings };
        }
    };
    
    // Инициализация при загрузке страницы
    if (config.autoInit) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
        } else {
            init();
        }
    }
    
    // Делаем API доступным глобально
    window.AccessibilityTools = AccessibilityTools;
})(); 