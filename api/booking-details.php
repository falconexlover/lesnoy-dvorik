<?php
/**
 * API для получения деталей бронирования
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

// Получаем ID бронирования
$bookingId = isset($_GET['booking_id']) ? (int)$_GET['booking_id'] : 0;

// Проверяем наличие ID бронирования
if (!$bookingId) {
    http_response_code(400);
    echo json_encode(['error' => 'Отсутствует ID бронирования']);
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
    
    // Получаем детали бронирования
    $booking = $user->getBookingDetails($bookingId);
    
    if (!$booking) {
        http_response_code(404);
        echo json_encode(['error' => 'Бронирование не найдено']);
        exit;
    }
    
    // Получаем платежи для бронирования
    require_once __DIR__ . '/../src/includes/payment.php';
    $payment = new Payment($conn);
    $payments = $payment->getPaymentsByBooking($bookingId);
    
    // Форматируем данные для ответа
    $formattedBooking = [
        'id' => $booking['id'],
        'name' => $booking['name'],
        'email' => $booking['email'],
        'phone' => $booking['phone'],
        'check_in_date' => $booking['check_in_date'],
        'check_out_date' => $booking['check_out_date'],
        'room_id' => $booking['room_id'],
        'room_type' => $booking['room_type'],
        'room_name' => $booking['room_name'],
        'room_image' => $booking['room_image'],
        'adults' => $booking['adults'],
        'children' => $booking['children'],
        'special_requests' => $booking['special_requests'],
        'total_price' => $booking['total_price'],
        'status' => $booking['status'],
        'payment_status' => $booking['payment_status'],
        'created_at' => $booking['created_at'],
        'updated_at' => $booking['updated_at'],
        'payments' => $payments
    ];
    
    // Возвращаем детали бронирования
    echo json_encode([
        'success' => true,
        'booking' => $formattedBooking
    ]);
    
} catch (Exception $e) {
    // Логируем ошибку
    error_log('Ошибка при получении деталей бронирования: ' . $e->getMessage());
    
    // Возвращаем ошибку
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка при получении деталей бронирования']);
} 