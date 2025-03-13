<?php
$port = 8000;
$root = __DIR__ . "/dist";

// Копируем скрипт-фикс в папку dist для доступа
if (!file_exists($root . '/fix-display-issues.js')) {
    copy(__DIR__ . '/fix-display-issues.js', $root . '/fix-display-issues.js');
}

echo "Запуск локального сервера для сайта 'Лесной дворик'\n";
echo "Корневая директория: {$root}\n";
echo "Порт: {$port}\n";
echo "Сервер доступен по адресу: http://localhost:{$port}\n";
echo "Для остановки сервера нажмите Ctrl+C\n\n";
echo "Внимание: Активирован модуль исправления проблем отображения!\n";

// Запуск сервера с нашим роутером
$command = "php -S localhost:{$port} -t {$root} " . __DIR__ . "/router.php";
passthru($command);
?> 