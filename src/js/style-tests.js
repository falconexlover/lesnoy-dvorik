/**
 * Система автоматического тестирования стилей для сайта "Лесной дворик"
 * Выявляет несоответствия в стилях между страницами и проверяет соответствие стандартам
 */

(function() {
    // Конфигурация тестирования
    const config = {
        // Режим отладки - при true будет больше информации в консоли
        debug: true,
        
        // Сохранять результаты в localStorage
        saveResults: true,
        
        // Ключевые страницы для сканирования
        pagesToTest: [
            '/',
            '/pages/hotel.html',
            '/pages/sauna.html',
            '/pages/banquet.html',
            '/pages/gallery.html',
            '/pages/contacts.html',
            '/pages/booking.html'
        ],
        
        // Элементы, которые нужно проверить на стилистическую согласованность
        elementsToTest: [
            { selector: 'h1', properties: ['font-family', 'font-size', 'color', 'line-height'] },
            { selector: 'h2', properties: ['font-family', 'font-size', 'color', 'line-height'] },
            { selector: 'p', properties: ['font-family', 'font-size', 'color', 'line-height'] },
            { selector: '.btn-primary', properties: ['background-color', 'color', 'padding', 'border-radius'] },
            { selector: '.room-card', properties: ['background-color', 'border-radius', 'box-shadow'] },
            { selector: 'header', properties: ['background-color', 'box-shadow', 'height'] },
            { selector: 'footer', properties: ['background-color', 'color', 'padding'] }
        ],
        
        // Эталонные значения для проверки (должны соответствовать CSS-переменным)
        referenceValues: {
            'primary-color': '#217148',
            'primary-dark': '#185a39',
            'primary-light': '#C8E6C9',
            'accent-color': '#FF9800',
            'text-color': '#333333',
            'background-color': '#FFFFFF',
            'border-radius-sm': '4px',
            'border-radius-md': '8px',
            'shadow-light': '0 2px 5px rgba(0, 0, 0, 0.1)',
            'shadow-medium': '0 4px 12px rgba(0, 0, 0, 0.15)'
        }
    };
    
    // Хранилище результатов
    let testResults = {
        timestamp: new Date().toISOString(),
        summary: {
            total: 0,
            passed: 0,
            failed: 0,
            warnings: 0
        },
        details: []
    };
    
    // Инициализация тестов
    function init() {
        logDebug('Инициализация системы тестирования стилей');
        
        // Создаем элементы интерфейса для тестирования, если мы в режиме разработки
        if (isDevMode()) {
            createTestUI();
        }
        
        // Автоматически запускаем базовый тест для текущей страницы
        runBasicTest();
        
        // Задаем горячую клавишу для запуска полного теста (Ctrl+Shift+T)
        document.addEventListener('keydown', function(e) {
            if (e.ctrlKey && e.shiftKey && e.key === 'T') {
                e.preventDefault();
                runFullTest();
            }
        });
    }
    
    // Проверка, находимся ли мы в режиме разработки
    function isDevMode() {
        return (
            window.location.hostname === 'localhost' || 
            window.location.hostname === '127.0.0.1' ||
            window.location.port === '8081'
        );
    }
    
    // Создание UI для запуска тестов (только в режиме разработки)
    function createTestUI() {
        const container = document.createElement('div');
        container.className = 'style-test-panel';
        container.innerHTML = `
            <div class="style-test-toggle">
                <i class="fas fa-flask"></i>
            </div>
            <div class="style-test-content">
                <h3>Тестирование стилей</h3>
                <p>Инструменты для тестирования стилистической согласованности</p>
                <div class="style-test-buttons">
                    <button id="run-basic-test" class="btn btn-primary btn-sm">Базовый тест</button>
                    <button id="run-full-test" class="btn btn-outline btn-sm">Полный тест</button>
                    <button id="view-results" class="btn btn-secondary btn-sm">Просмотр результатов</button>
                </div>
                <div class="style-test-status"></div>
            </div>
        `;
        
        // Добавляем стили для панели тестирования
        const style = document.createElement('style');
        style.textContent = `
            .style-test-panel {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background-color: white;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
                z-index: 9999;
                width: 300px;
                transform: translateX(310px);
                transition: transform 0.3s ease;
                overflow: hidden;
            }
            
            .style-test-panel.active {
                transform: translateX(0);
            }
            
            .style-test-toggle {
                position: absolute;
                top: 10px;
                left: -50px;
                width: 40px;
                height: 40px;
                background-color: var(--primary-color);
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
            }
            
            .style-test-content {
                padding: 20px;
            }
            
            .style-test-content h3 {
                margin-top: 0;
                margin-bottom: 10px;
                color: var(--primary-color);
            }
            
            .style-test-buttons {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                margin-top: 15px;
            }
            
            .style-test-status {
                margin-top: 15px;
                font-size: 14px;
                display: none;
            }
            
            .style-test-status.active {
                display: block;
            }
            
            .style-test-result-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.3s ease, visibility 0.3s ease;
            }
            
            .style-test-result-modal.active {
                opacity: 1;
                visibility: visible;
            }
            
            .style-test-result-content {
                background-color: white;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                width: 80%;
                max-width: 900px;
                max-height: 80vh;
                overflow-y: auto;
                padding: 30px;
                position: relative;
            }
            
            .style-test-result-close {
                position: absolute;
                top: 15px;
                right: 15px;
                background: none;
                border: none;
                font-size: 20px;
                cursor: pointer;
                color: var(--text-light);
            }
            
            .style-test-result-item {
                padding: 10px;
                border-radius: 4px;
                margin-bottom: 10px;
            }
            
            .style-test-result-item.pass {
                background-color: #e8f5e9;
                border-left: 3px solid #4caf50;
            }
            
            .style-test-result-item.fail {
                background-color: #ffebee;
                border-left: 3px solid #f44336;
            }
            
            .style-test-result-item.warning {
                background-color: #fff3e0;
                border-left: 3px solid #ff9800;
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(container);
        
        // Обработчики событий
        const toggle = container.querySelector('.style-test-toggle');
        toggle.addEventListener('click', function() {
            container.classList.toggle('active');
        });
        
        const basicTestBtn = container.querySelector('#run-basic-test');
        basicTestBtn.addEventListener('click', function() {
            runBasicTest();
        });
        
        const fullTestBtn = container.querySelector('#run-full-test');
        fullTestBtn.addEventListener('click', function() {
            runFullTest();
        });
        
        const viewResultsBtn = container.querySelector('#view-results');
        viewResultsBtn.addEventListener('click', function() {
            showResults();
        });
    }
    
    // Показать результаты тестирования в модальном окне
    function showResults() {
        // Создаем модальное окно, если оно еще не существует
        let modal = document.querySelector('.style-test-result-modal');
        
        if (!modal) {
            modal = document.createElement('div');
            modal.className = 'style-test-result-modal';
            modal.innerHTML = `
                <div class="style-test-result-content">
                    <button class="style-test-result-close">&times;</button>
                    <h2>Результаты тестирования стилей</h2>
                    <div class="style-test-result-summary">
                        <p>Всего проверок: <span id="test-total">0</span></p>
                        <p>Успешно: <span id="test-passed">0</span></p>
                        <p>Ошибок: <span id="test-failed">0</span></p>
                        <p>Предупреждений: <span id="test-warnings">0</span></p>
                    </div>
                    <h3>Детали проверок:</h3>
                    <div class="style-test-result-details">
                        <p>Нет данных. Запустите тест.</p>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Обработчик закрытия
            const closeBtn = modal.querySelector('.style-test-result-close');
            closeBtn.addEventListener('click', function() {
                modal.classList.remove('active');
            });
            
            // Закрытие по клику вне контента
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        }
        
        // Обновляем данные
        const summary = modal.querySelector('.style-test-result-summary');
        summary.querySelector('#test-total').textContent = testResults.summary.total;
        summary.querySelector('#test-passed').textContent = testResults.summary.passed;
        summary.querySelector('#test-failed').textContent = testResults.summary.failed;
        summary.querySelector('#test-warnings').textContent = testResults.summary.warnings;
        
        // Обновляем детали
        const details = modal.querySelector('.style-test-result-details');
        
        if (testResults.details.length > 0) {
            let detailsHtml = '';
            
            testResults.details.forEach(item => {
                const statusClass = item.status === 'pass' ? 'pass' : (item.status === 'warning' ? 'warning' : 'fail');
                detailsHtml += `
                    <div class="style-test-result-item ${statusClass}">
                        <p><strong>${item.name}</strong></p>
                        <p>${item.message}</p>
                        ${item.expected ? `<p>Ожидается: ${item.expected}</p>` : ''}
                        ${item.actual ? `<p>Фактически: ${item.actual}</p>` : ''}
                    </div>
                `;
            });
            
            details.innerHTML = detailsHtml;
        } else {
            details.innerHTML = '<p>Нет данных. Запустите тест.</p>';
        }
        
        // Отображаем модальное окно
        modal.classList.add('active');
    }
    
    // Запуск базового теста для текущей страницы
    function runBasicTest() {
        logDebug('Запуск базового теста для текущей страницы');
        
        // Сбрасываем результаты
        resetResults();
        
        // Проверяем наличие всех необходимых CSS-файлов
        testCssFiles();
        
        // Проверяем основные переменные CSS
        testCssVariables();
        
        // Проверяем ключевые элементы на соответствие стилям
        testElements();
        
        // Обновляем статус в UI
        updateStatus();
        
        // Сохраняем результаты если это настроено
        if (config.saveResults) {
            saveResults();
        }
        
        return testResults;
    }
    
    // Запуск полного теста для всех страниц
    function runFullTest() {
        logDebug('Запуск полного теста для всех страниц');
        
        // Показываем уведомление о запуске
        showNotification('Запуск полного тестирования. Это может занять некоторое время.');
        
        // Сбрасываем результаты
        resetResults();
        
        // Создаем iframe для загрузки страниц и их проверки
        const iframe = document.createElement('iframe');
        iframe.style.cssText = 'position: absolute; width: 1200px; height: 800px; left: -9999px;';
        document.body.appendChild(iframe);
        
        // Счетчик проверенных страниц
        let pageIndex = 0;
        
        // Функция для проверки следующей страницы
        function testNextPage() {
            if (pageIndex < config.pagesToTest.length) {
                const pageUrl = config.pagesToTest[pageIndex];
                logDebug(`Тестирование страницы: ${pageUrl}`);
                
                // Обновляем статус в UI
                const statusEl = document.querySelector('.style-test-status');
                if (statusEl) {
                    statusEl.innerHTML = `Тестирование страницы ${pageIndex + 1} из ${config.pagesToTest.length}`;
                    statusEl.classList.add('active');
                }
                
                // Загружаем страницу в iframe
                iframe.src = pageUrl;
                
                // Ждем загрузки страницы и проверяем ее
                iframe.onload = function() {
                    try {
                        testPageInIframe(iframe, pageUrl);
                        pageIndex++;
                        setTimeout(testNextPage, 500);
                    } catch (error) {
                        logError(`Ошибка при тестировании страницы ${pageUrl}:`, error);
                        pageIndex++;
                        setTimeout(testNextPage, 500);
                    }
                };
            } else {
                // Все страницы проверены
                document.body.removeChild(iframe);
                
                // Обновляем статус в UI
                updateStatus();
                
                // Сохраняем результаты если это настроено
                if (config.saveResults) {
                    saveResults();
                }
                
                // Показываем уведомление о завершении
                showNotification(`Тестирование завершено. Всего тестов: ${testResults.summary.total}, ошибок: ${testResults.summary.failed}`);
                
                // Показываем результаты
                showResults();
            }
        }
        
        // Начинаем проверку страниц
        testNextPage();
    }
    
    // Проверка страницы в iframe
    function testPageInIframe(iframe, pageUrl) {
        const iframeWindow = iframe.contentWindow;
        const iframeDocument = iframeWindow.document;
        
        // Добавляем информацию о странице в результаты
        addResult({
            name: `Страница: ${pageUrl}`,
            status: 'info',
            message: 'Начало тестирования страницы'
        });
        
        // Проверяем наличие всех необходимых CSS-файлов
        testCssFilesInIframe(iframeDocument, pageUrl);
        
        // Проверяем ключевые элементы на соответствие стилям
        testElementsInIframe(iframeWindow, iframeDocument, pageUrl);
    }
    
    // Проверка наличия всех необходимых CSS-файлов
    function testCssFiles() {
        const requiredCssFiles = [
            'style.css',
            'components.css',
            'header-fix.css',
            'typography.css',
            'forms.css',
            'ui-components.css'
        ];
        
        const styleLinks = document.querySelectorAll('link[rel="stylesheet"]');
        
        requiredCssFiles.forEach(file => {
            let found = false;
            
            styleLinks.forEach(link => {
                if (link.href.includes(file)) {
                    found = true;
                }
            });
            
            if (found) {
                addResult({
                    name: `CSS-файл: ${file}`,
                    status: 'pass',
                    message: `Файл ${file} подключен к странице`
                });
            } else {
                addResult({
                    name: `CSS-файл: ${file}`,
                    status: 'fail',
                    message: `Файл ${file} не подключен к странице`
                });
            }
        });
    }
    
    // Проверка наличия всех необходимых CSS-файлов в iframe
    function testCssFilesInIframe(iframeDocument, pageUrl) {
        const requiredCssFiles = [
            'style.css',
            'components.css',
            'header-fix.css',
            'typography.css',
            'forms.css',
            'ui-components.css'
        ];
        
        const styleLinks = iframeDocument.querySelectorAll('link[rel="stylesheet"]');
        
        requiredCssFiles.forEach(file => {
            let found = false;
            
            styleLinks.forEach(link => {
                if (link.href.includes(file)) {
                    found = true;
                }
            });
            
            if (found) {
                addResult({
                    name: `CSS-файл: ${file} (${pageUrl})`,
                    status: 'pass',
                    message: `Файл ${file} подключен к странице ${pageUrl}`
                });
            } else {
                addResult({
                    name: `CSS-файл: ${file} (${pageUrl})`,
                    status: 'fail',
                    message: `Файл ${file} не подключен к странице ${pageUrl}`
                });
            }
        });
    }
    
    // Проверка CSS-переменных
    function testCssVariables() {
        const rootStyle = getComputedStyle(document.documentElement);
        
        // Проверяем наличие и значение основных CSS-переменных
        const requiredVariables = [
            { name: '--primary-color', expected: config.referenceValues['primary-color'] },
            { name: '--primary-dark', expected: config.referenceValues['primary-dark'] },
            { name: '--primary-light', expected: config.referenceValues['primary-light'] },
            { name: '--accent-color', expected: config.referenceValues['accent-color'] },
            { name: '--text-color', expected: config.referenceValues['text-color'] },
            { name: '--background-color', expected: config.referenceValues['background-color'] }
        ];
        
        requiredVariables.forEach(variable => {
            const value = rootStyle.getPropertyValue(variable.name).trim();
            
            if (value) {
                if (value === variable.expected) {
                    addResult({
                        name: `CSS-переменная: ${variable.name}`,
                        status: 'pass',
                        message: `Переменная ${variable.name} имеет ожидаемое значение`,
                        expected: variable.expected,
                        actual: value
                    });
                } else {
                    addResult({
                        name: `CSS-переменная: ${variable.name}`,
                        status: 'warning',
                        message: `Переменная ${variable.name} имеет неожидаемое значение`,
                        expected: variable.expected,
                        actual: value
                    });
                }
            } else {
                addResult({
                    name: `CSS-переменная: ${variable.name}`,
                    status: 'fail',
                    message: `Переменная ${variable.name} не определена`,
                    expected: variable.expected,
                    actual: 'не определена'
                });
            }
        });
    }
    
    // Проверка стилей ключевых элементов
    function testElements() {
        config.elementsToTest.forEach(element => {
            const selector = element.selector;
            const el = document.querySelector(selector);
            
            if (el) {
                const styles = getComputedStyle(el);
                
                // Проверяем нужные свойства
                element.properties.forEach(property => {
                    const value = styles[property];
                    
                    if (value) {
                        addResult({
                            name: `Элемент ${selector} - свойство ${property}`,
                            status: 'pass',
                            message: `Элемент ${selector} имеет свойство ${property}`,
                            actual: value
                        });
                    } else {
                        addResult({
                            name: `Элемент ${selector} - свойство ${property}`,
                            status: 'warning',
                            message: `Элемент ${selector} не имеет свойства ${property}`
                        });
                    }
                });
            } else {
                addResult({
                    name: `Элемент ${selector}`,
                    status: 'info',
                    message: `Элемент ${selector} не найден на странице`
                });
            }
        });
    }
    
    // Проверка стилей ключевых элементов в iframe
    function testElementsInIframe(iframeWindow, iframeDocument, pageUrl) {
        config.elementsToTest.forEach(element => {
            const selector = element.selector;
            const el = iframeDocument.querySelector(selector);
            
            if (el) {
                const styles = iframeWindow.getComputedStyle(el);
                
                // Проверяем нужные свойства
                element.properties.forEach(property => {
                    const value = styles[property];
                    
                    if (value) {
                        addResult({
                            name: `Элемент ${selector} - свойство ${property} (${pageUrl})`,
                            status: 'pass',
                            message: `Элемент ${selector} имеет свойство ${property} на странице ${pageUrl}`,
                            actual: value
                        });
                    } else {
                        addResult({
                            name: `Элемент ${selector} - свойство ${property} (${pageUrl})`,
                            status: 'warning',
                            message: `Элемент ${selector} не имеет свойства ${property} на странице ${pageUrl}`
                        });
                    }
                });
            } else {
                addResult({
                    name: `Элемент ${selector} (${pageUrl})`,
                    status: 'info',
                    message: `Элемент ${selector} не найден на странице ${pageUrl}`
                });
            }
        });
    }
    
    // Сброс результатов тестирования
    function resetResults() {
        testResults = {
            timestamp: new Date().toISOString(),
            summary: {
                total: 0,
                passed: 0,
                failed: 0,
                warnings: 0
            },
            details: []
        };
    }
    
    // Добавление результата теста
    function addResult(result) {
        testResults.details.push(result);
        testResults.summary.total++;
        
        if (result.status === 'pass') {
            testResults.summary.passed++;
        } else if (result.status === 'fail') {
            testResults.summary.failed++;
        } else if (result.status === 'warning') {
            testResults.summary.warnings++;
        }
    }
    
    // Обновление статуса в UI
    function updateStatus() {
        const statusEl = document.querySelector('.style-test-status');
        if (statusEl) {
            let statusText = '';
            let statusClass = '';
            
            if (testResults.summary.failed > 0) {
                statusText = `Ошибок: ${testResults.summary.failed}, предупреждений: ${testResults.summary.warnings}`;
                statusClass = 'error';
            } else if (testResults.summary.warnings > 0) {
                statusText = `Есть предупреждения: ${testResults.summary.warnings}`;
                statusClass = 'warning';
            } else {
                statusText = `Все тесты пройдены успешно!`;
                statusClass = 'success';
            }
            
            statusEl.innerHTML = statusText;
            statusEl.className = 'style-test-status active ' + statusClass;
        }
    }
    
    // Сохранение результатов в localStorage
    function saveResults() {
        try {
            const previousResults = localStorage.getItem('styleTestResults');
            let allResults = previousResults ? JSON.parse(previousResults) : [];
            
            // Ограничиваем количество сохраненных результатов
            if (allResults.length >= 10) {
                allResults = allResults.slice(-9);
            }
            
            allResults.push(testResults);
            localStorage.setItem('styleTestResults', JSON.stringify(allResults));
            logDebug('Результаты тестирования сохранены в localStorage');
        } catch (error) {
            logError('Ошибка при сохранении результатов:', error);
        }
    }
    
    // Показать уведомление
    function showNotification(message, type = 'info') {
        // Проверяем, существует ли уже уведомление
        let notification = document.querySelector('.style-test-notification');
        
        if (!notification) {
            // Создаем элемент уведомления
            notification = document.createElement('div');
            notification.className = 'style-test-notification';
            document.body.appendChild(notification);
            
            // Добавляем стили для уведомления
            const style = document.createElement('style');
            style.textContent = `
                .style-test-notification {
                    position: fixed;
                    bottom: 20px;
                    left: 20px;
                    background-color: white;
                    color: var(--text-color);
                    padding: 15px 20px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    z-index: 10000;
                    transform: translateY(150%);
                    transition: transform 0.3s ease;
                    max-width: 400px;
                }
                
                .style-test-notification.active {
                    transform: translateY(0);
                }
                
                .style-test-notification.info {
                    border-left: 4px solid #2196f3;
                }
                
                .style-test-notification.success {
                    border-left: 4px solid #4caf50;
                }
                
                .style-test-notification.warning {
                    border-left: 4px solid #ff9800;
                }
                
                .style-test-notification.error {
                    border-left: 4px solid #f44336;
                }
            `;
            document.head.appendChild(style);
        }
        
        // Устанавливаем текст уведомления и класс типа
        notification.textContent = message;
        notification.className = 'style-test-notification ' + type;
        
        // Показываем уведомление
        setTimeout(() => {
            notification.classList.add('active');
        }, 100);
        
        // Скрываем уведомление через 4 секунды
        setTimeout(() => {
            notification.classList.remove('active');
        }, 4000);
    }
    
    // Логирование в режиме отладки
    function logDebug(...args) {
        if (config.debug) {
            console.log('[Style Tests]', ...args);
        }
    }
    
    // Логирование ошибок
    function logError(...args) {
        console.error('[Style Tests]', ...args);
    }
    
    // Запускаем инициализацию когда DOM готов
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Экспортируем API для использования в консоли
    window.StyleTests = {
        runBasicTest,
        runFullTest,
        showResults,
        getResults: () => testResults
    };
})(); 