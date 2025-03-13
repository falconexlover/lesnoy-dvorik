<?php
/**
 * Обработчик уведомлений от платежной системы для гостиницы "Лесной дворик"
 */

// Подключаем необходимые файлы
require_once __DIR__ . '/../src/includes/config.php';
require_once __DIR__ . '/../src/includes/db.php';
require_once __DIR__ . '/../src/includes/security.php';
require_once __DIR__ . '/../src/includes/payment.php';

// Устанавливаем заголовки для JSON
header('Content-Type: application/json');

// Проверяем метод запроса
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Метод не разрешен']);
    exit;
}

// Получаем данные запроса
$input = json_decode(file_get_contents('php://input'), true);

// Проверяем наличие необходимых параметров
if (!isset($input['payment_id']) || !isset($input['status'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Отсутствуют обязательные параметры']);
    exit;
}

try {
    // Подключаемся к базе данных
    $db = new DB();
    $conn = $db->getConnection();
    
    // Создаем экземпляр класса Payment
    $payment = new Payment($conn);
    
    // Обрабатываем уведомление
    $result = $payment->handleNotification($input);
    
    if ($result) {
        // Возвращаем успешный ответ
        echo json_encode(['success' => true]);
    } else {
        // Возвращаем ошибку
        http_response_code(400);
        echo json_encode(['error' => 'Ошибка при обработке уведомления']);
    }
    
} catch (Exception $e) {
    // Логируем ошибку
    error_log('Ошибка при обработке уведомления: ' . $e->getMessage());
    
    // Возвращаем ошибку
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка при обработке уведомления']);
} 