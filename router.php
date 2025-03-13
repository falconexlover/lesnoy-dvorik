<?php
/**
 * Роутер для локального сервера гостиницы "Лесной дворик"
 * Автоматически внедряет скрипты исправления проблем отображения
 */

// Получаем запрашиваемый путь
$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);
$ext = pathinfo($path, PATHINFO_EXTENSION);

// Определяем директорию исполнения скрипта
$rootDir = __DIR__;

// Если запрашивается файл fix-display-issues.js
if ($path === '/fix-display-issues.js') {
    header('Content-Type: application/javascript');
    readfile($rootDir . '/fix-display-issues.js');
    exit;
}

// Для HTML файлов или запросов без расширения
if ($ext === 'html' || $path === '/' || empty($ext)) {
    // Определяем реальный путь к файлу
    $filePath = $rootDir . '/dist' . ($path === '/' ? '/index.html' : $path);
    
    // Если это директория, ищем index.html
    if (is_dir($filePath)) {
        $filePath = rtrim($filePath, '/') . '/index.html';
    }
    
    // Если файл не найден, используем index.html из dist
    if (!file_exists($filePath) || is_dir($filePath)) {
        $filePath = $rootDir . '/dist/index.html';
    }
    
    // Если файл существует, обрабатываем его
    if (file_exists($filePath)) {
        // Читаем содержимое файла
        $content = file_get_contents($filePath);
        
        // Определяем тип контента
        header('Content-Type: text/html; charset=UTF-8');
        
        // Внедряем наш скрипт-фикс перед закрывающим тегом body
        $fixScript = '<script src="/fix-display-issues.js"></script>';
        $content = str_replace('</body>', "$fixScript\n</body>", $content);
        
        // Добавляем отладочную информацию
        $debugInfo = "<!-- Страница обработана маршрутизатором fix-display -->\n";
        $content = $debugInfo . $content;
        
        // Выводим модифицированный контент
        echo $content;
        exit;
    }
}

// Для всех остальных запросов используем стандартную обработку
// Формируем путь к запрашиваемому файлу
$filePath = $rootDir . '/dist' . $path;

// Проверяем, существует ли файл
if (file_exists($filePath) && !is_dir($filePath)) {
    // Определяем MIME-тип на основе расширения файла
    $mime_types = array(
        'css' => 'text/css',
        'js' => 'application/javascript',
        'jpg' => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'png' => 'image/png',
        'gif' => 'image/gif',
        'svg' => 'image/svg+xml',
        'webp' => 'image/webp',
        'ico' => 'image/x-icon',
        'json' => 'application/json',
        'woff' => 'font/woff',
        'woff2' => 'font/woff2',
        'ttf' => 'font/ttf',
        'eot' => 'application/vnd.ms-fontobject',
        'otf' => 'font/otf',
        'xml' => 'application/xml',
        'pdf' => 'application/pdf',
        'txt' => 'text/plain',
        'mp4' => 'video/mp4',
        'webm' => 'video/webm',
        'mp3' => 'audio/mpeg',
    );
    
    // Получаем расширение файла
    $file_ext = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
    
    // Устанавливаем MIME-тип
    if (array_key_exists($file_ext, $mime_types)) {
        header('Content-Type: ' . $mime_types[$file_ext]);
    }
    
    // Для изображений добавляем кэширование
    if (in_array($file_ext, ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'ico'])) {
        header('Cache-Control: max-age=86400, public');
    }
    
    // Отправляем файл
    readfile($filePath);
    exit;
}

// Если файл не найден, возвращаем 404
header('HTTP/1.0 404 Not Found');
echo "<h1>404 Not Found</h1>";
echo "<p>Запрашиваемая страница не найдена.</p>";
echo "<p><a href='/'>Вернуться на главную</a></p>";
exit; 