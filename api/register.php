<?php
/**
 * API для регистрации пользователей
 * Гостиница "Лесной дворик"
 */

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
if (!isset($input['name']) || !isset($input['email']) || !isset($input['password'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Отсутствуют обязательные параметры']);
    exit;
}

// Получаем параметры
$name = $input['name'];
$email = $input['email'];
$password = $input['password'];
$phone = isset($input['phone']) ? $input['phone'] : '';

// Валидируем email
if (!Security::validateEmail($email)) {
    http_response_code(400);
    echo json_encode(['error' => 'Некорректный email']);
    exit;
}

// Валидируем телефон, если он указан
if (!empty($phone) && !Security::validatePhone($phone)) {
    http_response_code(400);
    echo json_encode(['error' => 'Некорректный телефон']);
    exit;
}

// Проверяем сложность пароля
if (!Security::checkPasswordStrength($password)) {
    http_response_code(400);
    echo json_encode(['error' => 'Пароль должен содержать не менее 8 символов, включая буквы верхнего и нижнего регистра, цифры и специальные символы']);
    exit;
}

try {
    // Подключаемся к базе данных
    $db = new DB();
    $conn = $db->getConnection();
    
    // Создаем экземпляр класса User
    $user = new User($conn);
    
    // Регистрируем пользователя
    $result = $user->register($name, $email, $password, $phone);
    
    if ($result['success']) {
        // Возвращаем успешный ответ
        echo json_encode([
            'success' => true,
            'user_id' => $result['user_id'],
            'message' => 'Регистрация успешно завершена'
        ]);
    } else {
        // Возвращаем ошибку
        http_response_code(400);
        echo json_encode([
            'error' => $result['error']
        ]);
    }
    
} catch (Exception $e) {
    // Логируем ошибку
    error_log('Ошибка при регистрации пользователя: ' . $e->getMessage());
    
    // Возвращаем ошибку
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка при регистрации пользователя']);
} 