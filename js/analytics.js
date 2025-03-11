/**
 * Аналитика для сайта "Лесной дворик"
 * Версия: 1.0.0
 * Отслеживает взаимодействие пользователей с сайтом
 */

(function() {
    'use strict';

    // Конфигурация аналитики
    const config = {
        // ID отслеживания (заменить на настоящий при интеграции с Google Analytics)
        trackingId: 'UA-XXXXXXXX-X',
        // Включить отслеживание страниц
        pageTracking: true,
        // Включить отслеживание событий
        eventTracking: true,
        // Включить отслеживание времени на странице
        timeTracking: true
    };

    // Объект аналитики
    const Analytics = {
        // Инициализация аналитики
        init: function() {
            this.setupPageTracking();
            this.setupEventTracking();
            this.setupTimeTracking();
            this.logMessage('Аналитика инициализирована');
        },

        // Подготовка к отслеживанию страниц
        setupPageTracking: function() {
            if (config.pageTracking) {
                this.trackPageView();
                this.logMessage('Отслеживание страниц активировано');
            }
        },

        // Подготовка к отслеживанию событий
        setupEventTracking: function() {
            if (config.eventTracking) {
                this.setupClickTracking();
                this.setupFormTracking();
                this.setupNavigationTracking();
                this.logMessage('Отслеживание событий активировано');
            }
        },

        // Подготовка к отслеживанию времени
        setupTimeTracking: function() {
            if (config.timeTracking) {
                this.startTimeTracker();
                this.logMessage('Отслеживание времени активировано');
            }
        },

        // Отслеживание просмотра страницы
        trackPageView: function() {
            const pageData = {
                title: document.title,
                url: window.location.href,
                referrer: document.referrer || 'direct',
                timestamp: new Date().toISOString()
            };
            
            this.sendData('pageview', pageData);
        },

        // Отслеживание кликов
        setupClickTracking: function() {
            document.addEventListener('click', (e) => {
                const target = e.target.closest('a, button, [data-track]');
                
                if (!target) return;
                
                const eventData = {
                    type: 'click',
                    element: target.tagName.toLowerCase(),
                    text: target.textContent.trim().substring(0, 50),
                    href: target.href || null,
                    classes: target.className,
                    id: target.id || null,
                    timestamp: new Date().toISOString()
                };
                
                this.sendData('event', eventData);
            });
        },

        // Отслеживание форм
        setupFormTracking: function() {
            document.addEventListener('submit', (e) => {
                if (e.target.tagName.toLowerCase() === 'form') {
                    const formData = {
                        type: 'form_submit',
                        formId: e.target.id || null,
                        formAction: e.target.action || window.location.href,
                        timestamp: new Date().toISOString()
                    };
                    
                    this.sendData('event', formData);
                }
            });
        },

        // Отслеживание навигации
        setupNavigationTracking: function() {
            const navLinks = document.querySelectorAll('nav a, .header a, .footer a');
            
            navLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    const linkData = {
                        type: 'navigation',
                        text: link.textContent.trim().substring(0, 50),
                        destination: link.href,
                        section: this.getNavSection(link),
                        timestamp: new Date().toISOString()
                    };
                    
                    this.sendData('event', linkData);
                });
            });
        },

        // Определение раздела навигации
        getNavSection: function(element) {
            const parents = [];
            let parent = element.parentElement;
            
            while (parent && parents.length < 3) {
                if (parent.id) {
                    parents.unshift(parent.id);
                } else if (parent.className) {
                    parents.unshift(Array.from(parent.classList).join('-'));
                }
                parent = parent.parentElement;
            }
            
            return parents.join(':') || 'unknown';
        },

        // Запуск отслеживания времени на странице
        startTimeTracker: function() {
            this.pageLoadTime = new Date();
            
            window.addEventListener('beforeunload', () => {
                const timeSpent = (new Date() - this.pageLoadTime) / 1000;
                
                const timeData = {
                    type: 'time_spent',
                    seconds: timeSpent,
                    page: window.location.pathname,
                    timestamp: new Date().toISOString()
                };
                
                this.sendData('timing', timeData);
            });
        },

        // Отправка данных (заглушка)
        sendData: function(hitType, data) {
            // В реальной реализации здесь был бы код отправки данных
            // в аналитический сервис, например, Google Analytics

            // Логирование для разработки/отладки
            if (window.localStorage.getItem('debug_analytics') === 'true') {
                console.log(`Analytics [${hitType}]:`, data);
            }
        },

        // Логирование для отладки
        logMessage: function(message) {
            if (window.localStorage.getItem('debug_analytics') === 'true') {
                console.log(`Analytics: ${message}`);
            }
        }
    };

    // Инициализация после загрузки страницы
    if (document.readyState === 'complete') {
        Analytics.init();
    } else {
        window.addEventListener('load', () => {
            Analytics.init();
        });
    }

    // Экспорт для использования в других скриптах
    window.LDAnalytics = Analytics;
})(); 