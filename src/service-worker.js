/**
 * Service Worker для гостиницы "Лесной дворик"
 * Обеспечивает кэширование и работу в режиме оффлайн
 */

// Имя и версия кэша
const CACHE_NAME = 'lesnoy-dvorik-cache-v1.1';

// Файлы для предварительного кэширования
const CACHE_ASSETS = [
    '/',
    '/index.html',
    '/offline.html',
    '/css/style.css',
    '/css/components.css',
    '/css/form-enhancements.css',
    '/css/animations.css',
    '/js/main.js',
    '/js/booking.js',
    '/js/gallery.js',
    '/js/lazy-loading.js',
    '/js/room-gallery.js',
    '/assets/images/logo.svg',
    '/assets/images/hero.jpg',
    '/assets/images/footer-bg.jpg',
    '/assets/images/icons/icon-192x192.png',
    '/assets/images/icons/icon-512x512.png',
    '/assets/images/rooms/room-preview-1.jpg',
    '/assets/images/rooms/room-preview-2.jpg',
    '/assets/images/rooms/room-preview-3.jpg',
    '/manifest.json'
];

// Установка service worker'а
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Установка');
    
    // Предварительное кэширование файлов
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Предварительное кэширование файлов');
                return cache.addAll(CACHE_ASSETS);
            })
            .then(() => {
                console.log('[Service Worker] Переход к активации без ожидания');
                return self.skipWaiting();
            })
    );
});

// Активация service worker'а и очистка устаревших кэшей
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Активация');
    
    // Удаление старых версий кэша
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('[Service Worker] Удаление старого кэша:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('[Service Worker] Захват клиентов');
                return self.clients.claim();
            })
    );
});

// Стратегия кэширования: Network First с переходом на Cache, затем на Offline
self.addEventListener('fetch', (event) => {
    // Пропускаем запросы к API или административной панели
    if (event.request.url.includes('/api/') || 
        event.request.url.includes('/admin/') || 
        event.request.url.includes('/php/')) {
        return;
    }
    
    event.respondWith(
        // Сначала пытаемся получить данные из сети
        fetch(event.request)
            .then((response) => {
                // Если ответ получен успешно, клонируем его для кэширования
                if (response && response.status === 200) {
                    const responseClone = response.clone();
                    
                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            // Кэшируем только HTML, CSS, JS, изображения и шрифты
                            const url = event.request.url;
                            if (url.endsWith('.html') || 
                                url.endsWith('.css') || 
                                url.endsWith('.js') || 
                                url.includes('/images/') || 
                                url.includes('/fonts/') ||
                                url.includes('/assets/')) {
                                cache.put(event.request, responseClone);
                            }
                        });
                }
                
                return response;
            })
            .catch(() => {
                // Если сеть недоступна, пытаемся получить данные из кэша
                return caches.match(event.request)
                    .then((cachedResponse) => {
                        // Если ресурс найден в кэше, возвращаем его
                        if (cachedResponse) {
                            return cachedResponse;
                        }
                        
                        // Проверяем, запрашивается ли HTML-файл
                        const url = new URL(event.request.url);
                        if (url.pathname.endsWith('.html') || url.pathname === '/' || url.pathname === '') {
                            // Для HTML-файлов возвращаем offline.html
                            return caches.match('/offline.html');
                        }
                        
                        // Для других типов файлов просто возвращаем ничего
                        return null;
                    });
            })
    );
});

// Обработка push-уведомлений
self.addEventListener('push', (event) => {
    console.log('[Service Worker] Получено push-уведомление');
    
    const data = event.data.json();
    
    const options = {
        body: data.body || 'Новое уведомление от "Лесной дворик"',
        icon: '/assets/images/icons/icon-192x192.png',
        badge: '/assets/images/icons/badge-72x72.png',
        vibrate: [100, 50, 100, 50, 100],
        data: {
            url: data.url || '/'
        }
    };
    
    event.waitUntil(
        self.registration.showNotification(
            data.title || 'Гостиница "Лесной дворик"',
            options
        )
    );
});

// Обработка клика по уведомлению
self.addEventListener('notificationclick', (event) => {
    console.log('[Service Worker] Клик по уведомлению');
    
    event.notification.close();
    
    // Открытие указанного URL при клике на уведомление
    event.waitUntil(
        clients.openWindow(event.notification.data.url || '/')
    );
});

// Периодическая синхронизация для обновления данных
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'update-content') {
        console.log('[Service Worker] Выполнение периодической синхронизации');
        
        event.waitUntil(
            // Обновление кэша для ключевых страниц
            fetch('/')
                .then((response) => {
                    const responseClone = response.clone();
                    
                    return caches.open(CACHE_NAME)
                        .then((cache) => {
                            return cache.put('/', responseClone);
                        });
                })
                .catch((error) => {
                    console.error('[Service Worker] Ошибка при обновлении кэша:', error);
                })
        );
    }
}); 