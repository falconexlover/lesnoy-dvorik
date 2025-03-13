<?php
/**
 * API для авторизации пользователей
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
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Обрабатываем предварительный запрос OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Проверяем метод запроса
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Метод не разрешен']);
    exit;
}

// Получаем данные запроса
$input = json_decode(file_get_contents('php://input'), true);

// Проверяем наличие необходимых параметров
if (!isset($input['email']) || !isset($input['password'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Отсутствуют обязательные параметры']);
    exit;
}

// Получаем параметры
$email = $input['email'];
$password = $input['password'];

try {
    // Подключаемся к базе данных
    $db = new DB();
    $conn = $db->getConnection();
    
    // Создаем экземпляр класса User
    $user = new User($conn);
    
    // Авторизуем пользователя
    $result = $user->login($email, $password);
    
    if ($result['success']) {
        // Возвращаем успешный ответ
        echo json_encode([
            'success' => true,
            'user_id' => $result['user_id'],
            'session_token' => $result['session_token'],
            'message' => 'Авторизация успешно завершена'
        ]);
    } else {
        // Возвращаем ошибку
        http_response_code(401);
        echo json_encode([
            'error' => $result['error']
        ]);
    }
    
} catch (Exception $e) {
    // Логируем ошибку
    error_log('Ошибка при авторизации пользователя: ' . $e->getMessage());
    
    // Возвращаем ошибку
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка при авторизации пользователя']);
} 