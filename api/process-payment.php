<?php
/**
 * Обработчик платежей для гостиницы "Лесной дворик"
 */

// Подключаем необходимые файлы
require_once __DIR__ . '/../src/includes/config.php';
require_once __DIR__ . '/../src/includes/db.php';
require_once __DIR__ . '/../src/includes/security.php';
require_once __DIR__ . '/../src/includes/payment.php';

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
if (!isset($input['booking_id']) || !isset($input['amount'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Отсутствуют обязательные параметры']);
    exit;
}

// Получаем параметры
$bookingId = (int)$input['booking_id'];
$amount = (float)$input['amount'];
$description = isset($input['description']) ? $input['description'] : 'Оплата бронирования #' . $bookingId;
$returnUrl = isset($input['return_url']) ? $input['return_url'] : 'https://lesnoy-dvorik.ru/payment-success';
$cancelUrl = isset($input['cancel_url']) ? $input['cancel_url'] : 'https://lesnoy-dvorik.ru/payment-cancel';

try {
    // Подключаемся к базе данных
    $db = new DB();
    $conn = $db->getConnection();
    
    // Проверяем существование бронирования
    $stmt = $conn->prepare("SELECT * FROM bookings WHERE id = :id");
    $stmt->bindParam(':id', $bookingId);
    $stmt->execute();
    
    $booking = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$booking) {
        http_response_code(404);
        echo json_encode(['error' => 'Бронирование не найдено']);
        exit;
    }
    
    // Проверяем, что бронирование не оплачено
    if (isset($booking['payment_status']) && $booking['payment_status'] === 'paid') {
        http_response_code(400);
        echo json_encode(['error' => 'Бронирование уже оплачено']);
        exit;
    }
    
    // Создаем экземпляр класса Payment
    $payment = new Payment($conn);
    
    // Создаем платеж
    $paymentData = $payment->createPayment(
        $bookingId,
        $amount,
        $description,
        $returnUrl,
        $cancelUrl
    );
    
    // Обновляем статус бронирования
    $stmt = $conn->prepare("
        UPDATE bookings 
        SET payment_status = 'pending', updated_at = NOW() 
        WHERE id = :id
    ");
    $stmt->bindParam(':id', $bookingId);
    $stmt->execute();
    
    // Возвращаем данные платежа
    echo json_encode([
        'success' => true,
        'payment' => $paymentData
    ]);
    
} catch (Exception $e) {
    // Логируем ошибку
    error_log('Ошибка при создании платежа: ' . $e->getMessage());
    
    // Возвращаем ошибку
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка при создании платежа']);
} 