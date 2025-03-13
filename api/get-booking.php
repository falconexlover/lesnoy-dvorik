<?php
/**
 * API для получения информации о бронировании
 * Гостиница "Лесной дворик"
 */

// Подключаем необходимые файлы
require_once __DIR__ . '/../src/includes/config.php';
require_once __DIR__ . '/../src/includes/db.php';
require_once __DIR__ . '/../src/includes/security.php';

// Устанавливаем заголовки для JSON
header('Content-Type: application/json');

// Обрабатываем CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Обрабатываем предварительный запрос OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Проверяем метод запроса
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Метод не разрешен']);
    exit;
}

// Получаем параметры запроса
$bookingId = isset($_GET['booking_id']) ? (int)$_GET['booking_id'] : 0;
$token = isset($_GET['token']) ? $_GET['token'] : '';

// Проверяем наличие необходимых параметров
if (!$bookingId || !$token) {
    http_response_code(400);
    echo json_encode(['error' => 'Отсутствуют обязательные параметры']);
    exit;
}

try {
    // Подключаемся к базе данных
    $db = new DB();
    $conn = $db->getConnection();
    
    // Получаем информацию о бронировании
    $stmt = $conn->prepare("
        SELECT * FROM bookings 
        WHERE id = :id AND access_token = :token
    ");
    
    $stmt->bindParam(':id', $bookingId);
    $stmt->bindParam(':token', $token);
    $stmt->execute();
    
    $booking = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$booking) {
        http_response_code(404);
        echo json_encode(['error' => 'Бронирование не найдено или токен недействителен']);
        exit;
    }
    
    // Очищаем конфиденциальные данные
    unset($booking['access_token']);
    
    // Возвращаем информацию о бронировании
    echo json_encode([
        'success' => true,
        'booking' => $booking
    ]);
    
} catch (Exception $e) {
    // Логируем ошибку
    error_log('Ошибка при получении информации о бронировании: ' . $e->getMessage());
    
    // Возвращаем ошибку
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка при получении информации о бронировании']);
} 