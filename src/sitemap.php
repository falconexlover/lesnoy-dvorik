<?php
/**
 * Генерация XML-карты сайта для поисковых систем
 */

// Определяем флаг для защиты php-файлов от прямого доступа
define('APP_RUNNING', true);

// Подключение необходимых файлов
require_once 'includes/db_config.php';
require_once 'includes/seo.php';

try {
    // Получение соединения с базой данных
    $db = getDBConnection();
    
    // Инициализация SEO-модуля
    $seo = new SEOModule($db);
    
    // Генерация карты сайта
    $seo->generateSitemap();
    
} catch (Exception $e) {
    // В случае ошибки, возвращаем базовую карту сайта
    header('Content-Type: application/xml; charset=utf-8');
    echo '<?xml version="1.0" encoding="UTF-8"?>' . PHP_EOL;
    echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . PHP_EOL;
    
    // Базовые страницы
    $pages = [
        '' => '1.0',
        'hotel.html' => '0.9',
        'banquet.html' => '0.8',
        'sauna.html' => '0.8',
        'restaurant.html' => '0.8',
        'booking.html' => '0.9',
        'gallery.html' => '0.7',
        'contacts.html' => '0.8',
        'reviews.html' => '0.7',
        'info.html' => '0.6',
        'rules.html' => '0.6',
        'privacy.html' => '0.5'
    ];
    
    $baseUrl = 'https://lesnoy-dvorik.ru';
    $today = date('Y-m-d');
    
    foreach ($pages as $page => $priority) {
        echo '<url>' . PHP_EOL;
        echo '  <loc>' . htmlspecialchars($baseUrl . '/' . $page, ENT_XML1) . '</loc>' . PHP_EOL;
        echo '  <lastmod>' . $today . '</lastmod>' . PHP_EOL;
        echo '  <changefreq>monthly</changefreq>' . PHP_EOL;
        echo '  <priority>' . $priority . '</priority>' . PHP_EOL;
        echo '</url>' . PHP_EOL;
    }
    
    echo '</urlset>';
    
    // Логирование ошибки
    error_log("Ошибка при генерации sitemap: " . $e->getMessage());
} 