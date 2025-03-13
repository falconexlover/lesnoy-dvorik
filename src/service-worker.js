/**
 * Service Worker для сайта гостиницы "Лесной дворик"
 * Обеспечивает работу PWA и оффлайн-функциональность
 */

// Версия кэша, обновляется при изменении контента
const CACHE_VERSION = 'v1.0.0';

// Имя кэша
const CACHE_NAME = `lesnoy-dvorik-cache-${CACHE_VERSION}`;

// Ресурсы для предварительного кэширования
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/css/components.css',
  '/css/forms.css',
  '/css/header-fix.css',
  '/js/main.js',
  '/js/lazy-loading.js',
  '/js/booking.js',
  '/js/header-autoload.js',
  '/manifest.json',
  '/assets/images/logo.png',
  '/assets/images/favicon.ico',
  '/assets/images/hotel-exterior.jpg',
  '/offline.html'
];

// Установка Service Worker
self.addEventListener('install', event => {
  console.log('[Service Worker] Установка');
  
  // Предварительное кэширование ресурсов
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Предварительное кэширование');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => {
        console.log('[Service Worker] Предварительное кэширование завершено');
        return self.skipWaiting();
      })
  );
});

// Активация Service Worker
self.addEventListener('activate', event => {
  console.log('[Service Worker] Активация');
  
  // Удаление старых версий кэша
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName.startsWith('lesnoy-dvorik-cache-') && cacheName !== CACHE_NAME;
        }).map(cacheName => {
          console.log(`[Service Worker] Удаление старого кэша: ${cacheName}`);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      console.log('[Service Worker] Активация завершена');
      return self.clients.claim();
    })
  );
});

// Стратегия кэширования: сначала кэш, затем сеть с обновлением кэша
self.addEventListener('fetch', event => {
  // Пропускаем запросы к API
  if (event.request.url.includes('/api/')) {
    return;
  }
  
  // Обработка запросов к статическим ресурсам
  if (event.request.method === 'GET') {
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          // Возвращаем кэшированный ответ, если он есть
          if (cachedResponse) {
            // Обновляем кэш в фоне
            fetch(event.request)
              .then(response => {
                if (response && response.status === 200) {
                  caches.open(CACHE_NAME)
                    .then(cache => cache.put(event.request, response));
                }
              })
              .catch(error => console.log('[Service Worker] Ошибка обновления кэша:', error));
            
            return cachedResponse;
          }
          
          // Если ресурса нет в кэше, пытаемся получить его из сети
          return fetch(event.request)
            .then(response => {
              // Проверяем, что ответ валидный
              if (!response || response.status !== 200) {
                return response;
              }
              
              // Клонируем ответ, так как он может быть использован только один раз
              const responseToCache = response.clone();
              
              // Добавляем ответ в кэш
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
              
              return response;
            })
            .catch(error => {
              console.log('[Service Worker] Ошибка получения из сети:', error);
              
              // Если запрос к HTML-странице, возвращаем оффлайн-страницу
              if (event.request.headers.get('accept').includes('text/html')) {
                return caches.match('/offline.html');
              }
              
              // Для других типов ресурсов возвращаем ошибку
              return new Response('Нет подключения к интернету', {
                status: 503,
                statusText: 'Сервис недоступен'
              });
            });
        })
    );
  }
});

// Обработка push-уведомлений
self.addEventListener('push', event => {
  console.log('[Service Worker] Получено push-уведомление');
  
  const data = event.data.json();
  const options = {
    body: data.body || 'Новое уведомление от гостиницы "Лесной дворик"',
    icon: data.icon || '/assets/images/icons/icon-192x192.png',
    badge: '/assets/images/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(
      data.title || 'Лесной дворик',
      options
    )
  );
});

// Обработка клика по уведомлению
self.addEventListener('notificationclick', event => {
  console.log('[Service Worker] Клик по уведомлению');
  
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
}); 