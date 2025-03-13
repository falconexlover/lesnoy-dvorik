<?php
/**
 * API для выхода пользователей
 * Гостиница "Лесной дворик"
 */

// Запускаем сессию
session_start();

// Подключаем необходимые файлы
require_once __DIR__ . '/../src/includes/config.php';
require_once __DIR__ . '/../src/includes/db.php';
require_once __DIR__ . '/../src/includes/security.php';
require_once __DIR__ . '/../src/includes/user.php';

// Устанавливаем заголовки для JSON
header('Content-Type: application/json');

// Обрабатываем CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Обрабатываем предварительный запрос OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    // Подключаемся к базе данных
    $db = new DB();
    $conn = $db->getConnection();
    
    // Создаем экземпляр класса User
    $user = new User($conn);
    
    // Выходим из системы
    $result = $user->logout();
    
    // Возвращаем успешный ответ
    echo json_encode([
        'success' => true,
        'message' => 'Выход успешно выполнен'
    ]);
    
} catch (Exception $e) {
    // Логируем ошибку
    error_log('Ошибка при выходе пользователя: ' . $e->getMessage());
    
    // Возвращаем ошибку
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка при выходе пользователя']);
} 