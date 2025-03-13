<?php
/**
 * API для получения истории бронирований пользователя
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

try {
    // Подключаемся к базе данных
    $db = new DB();
    $conn = $db->getConnection();
    
    // Создаем экземпляр класса User
    $user = new User($conn);
    
    // Проверяем, авторизован ли пользователь
    if (!$user->isLoggedIn()) {
        http_response_code(401);
        echo json_encode(['error' => 'Пользователь не авторизован']);
        exit;
    }
    
    // Получаем историю бронирований пользователя
    $bookings = $user->getBookingHistory();
    
    // Форматируем данные для ответа
    $formattedBookings = [];
    foreach ($bookings as $booking) {
        $formattedBookings[] = [
            'id' => $booking['id'],
            'check_in_date' => $booking['check_in_date'],
            'check_out_date' => $booking['check_out_date'],
            'room_type' => $booking['room_type'],
            'room_name' => $booking['room_name'],
            'room_image' => $booking['room_image'],
            'adults' => $booking['adults'],
            'children' => $booking['children'],
            'total_price' => $booking['total_price'],
            'status' => $booking['status'],
            'payment_status' => $booking['payment_status'],
            'created_at' => $booking['created_at']
        ];
    }
    
    // Возвращаем историю бронирований
    echo json_encode([
        'success' => true,
        'bookings' => $formattedBookings
    ]);
    
} catch (Exception $e) {
    // Логируем ошибку
    error_log('Ошибка при получении истории бронирований: ' . $e->getMessage());
    
    // Возвращаем ошибку
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка при получении истории бронирований']);
} 