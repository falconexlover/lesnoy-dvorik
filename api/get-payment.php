<?php
/**
 * API для получения информации о платеже
 * Гостиница "Лесной дворик"
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

// Получаем ID платежа
$paymentId = isset($_GET['payment_id']) ? $_GET['payment_id'] : null;

// Проверяем наличие ID платежа
if (!$paymentId) {
    http_response_code(400);
    echo json_encode(['error' => 'Отсутствует ID платежа']);
    exit;
}

try {
    // Подключаемся к базе данных
    $db = new DB();
    $conn = $db->getConnection();
    
    // Создаем экземпляр класса Payment
    $payment = new Payment($conn);
    
    // Получаем информацию о платеже
    $paymentData = $payment->getPayment($paymentId);
    
    if (!$paymentData) {
        http_response_code(404);
        echo json_encode(['error' => 'Платеж не найден']);
        exit;
    }
    
    // Возвращаем информацию о платеже
    echo json_encode([
        'success' => true,
        'payment' => $paymentData
    ]);
    
} catch (Exception $e) {
    // Логируем ошибку
    error_log('Ошибка при получении информации о платеже: ' . $e->getMessage());
    
    // Возвращаем ошибку
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка при получении информации о платеже']);
} 