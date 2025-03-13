/**
 * Инструменты для отладки и диагностики сайта
 */

// Включаем отладку только на локальном сервере или в development-окружении
const isDevEnvironment = window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1';

// Глобальный объект для инструментов отладки
const DebugTools = {
    // Инициализация инструментов отладки
    init() {
        if (isDevEnvironment) {
            this.setupErrorLogger();
            this.setupPerformanceMonitoring();
            this.setupNetworkMonitoring();
            console.info('🛠️ Инструменты отладки активированы');
        }
    },

    // Настройка логирования ошибок
    setupErrorLogger() {
        window.addEventListener('error', (event) => {
            console.error('🔴 Ошибка JS:', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error
            });
            
            // Здесь можно добавить отправку ошибок на сервер для анализа
        });
        
        // Перехватываем необработанные промисы
        window.addEventListener('unhandledrejection', (event) => {
            console.error('🔴 Необработанное отклонение промиса:', event.reason);
        });
    },
    
    // Настройка мониторинга производительности
    setupPerformanceMonitoring() {
        // Замеряем время загрузки страницы и других метрик
        window.addEventListener('load', () => {
            setTimeout(() => {
                if (window.performance && window.performance.timing) {
                    const timing = window.performance.timing;
                    const pageLoadTime = timing.loadEventEnd - timing.navigationStart;
                    const domContentLoadedTime = timing.domContentLoadedEventEnd - timing.navigationStart;
                    
                    console.info('⏱️ Статистика загрузки страницы:', {
                        'Общее время загрузки': `${pageLoadTime}ms`,
                        'DOM готов': `${domContentLoadedTime}ms`,
                        'Время рендеринга': `${timing.domComplete - timing.domLoading}ms`,
                        'DNS поиск': `${timing.domainLookupEnd - timing.domainLookupStart}ms`,
                        'TCP подключение': `${timing.connectEnd - timing.connectStart}ms`
                    });
                }
                
                // Анализируем ресурсы
                if (window.performance && window.performance.getEntriesByType) {
                    const resources = window.performance.getEntriesByType('resource');
                    const slowResources = resources
                        .filter(resource => resource.duration > 500)
                        .sort((a, b) => b.duration - a.duration)
                        .slice(0, 5);
                    
                    if (slowResources.length > 0) {
                        console.warn('⚠️ Медленно загружаемые ресурсы:', slowResources.map(res => ({
                            url: res.name,
                            duration: `${Math.round(res.duration)}ms`
                        })));
                    }
                }
            }, 0);
        });
    },
    
    // Мониторинг сетевых запросов
    setupNetworkMonitoring() {
        // Перехватываем XHR запросы
        const originalXHROpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function(method, url) {
            const startTime = Date.now();
            
            this.addEventListener('load', function() {
                const duration = Date.now() - startTime;
                console.info(`📡 XHR ${method.toUpperCase()} ${url} - ${duration}ms - Статус: ${this.status}`);
            });
            
            return originalXHROpen.apply(this, arguments);
        };
        
        // Перехватываем fetch запросы
        const originalFetch = window.fetch;
        window.fetch = function() {
            const startTime = Date.now();
            const request = arguments[0];
            const url = typeof request === 'string' ? request : request.url;
            const method = typeof request === 'string' ? 'GET' : (request.method || 'GET');
            
            return originalFetch.apply(this, arguments)
                .then(response => {
                    const duration = Date.now() - startTime;
                    console.info(`📡 Fetch ${method.toUpperCase()} ${url} - ${duration}ms - Статус: ${response.status}`);
                    return response;
                })
                .catch(error => {
                    const duration = Date.now() - startTime;
                    console.error(`📡 Fetch ${method.toUpperCase()} ${url} - ${duration}ms - Ошибка:`, error);
                    throw error;
                });
        };
    },
    
    // Вывести все переменные CSS для помощи в отладке стилей
    logCSSVariables() {
        if (!isDevEnvironment) return;
        
        const styles = getComputedStyle(document.documentElement);
        const cssVariables = {};
        
        for (let i = 0; i < styles.length; i++) {
            const prop = styles[i];
            if (prop.startsWith('--')) {
                cssVariables[prop] = styles.getPropertyValue(prop).trim();
            }
        }
        
        console.info('🎨 CSS переменные:', cssVariables);
    }
};

// Инициализация инструментов отладки
document.addEventListener('DOMContentLoaded', () => {
    DebugTools.init();
});

// Экспорт для использования в других модулях
window.DebugTools = DebugTools;
