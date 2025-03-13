<?php
/**
 * API для проверки доступности номеров
 * Гостиница "Лесной дворик"
 */

// Подключаем класс безопасности
require_once __DIR__ . '/../src/includes/security.php';

// Заголовки для CORS и JSON
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Обработка предварительного запроса OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Проверка метода запроса
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Метод не разрешен. Используйте POST.']);
    exit;
}

// Получение данных из тела запроса
$input = json_decode(file_get_contents('php://input'), true);

// Проверка наличия необходимых параметров
if (!isset($input['check_in_date']) || !isset($input['check_out_date']) || !isset($input['room_type'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Отсутствуют обязательные параметры']);
    exit;
}

// Очистка и валидация входных данных с использованием класса безопасности
$input = Security::sanitize($input);
$check_in_date = $input['check_in_date'];
$check_out_date = $input['check_out_date'];
$room_type = $input['room_type'];

// Валидация дат
if (!Security::validateDate($check_in_date) || !Security::validateDate($check_out_date)) {
    http_response_code(400);
    echo json_encode(['error' => 'Некорректный формат дат']);
    exit;
}

// Проверка, что дата выезда позже даты заезда
if (!Security::compareDates($check_out_date, $check_in_date, '>')) {
    http_response_code(400);
    echo json_encode(['error' => 'Дата выезда должна быть позже даты заезда']);
    exit;
}

// Подключение к базе данных
try {
    require_once __DIR__ . '/../src/includes/db_config.php';
    $db = getDBConnection();
} catch (PDOException $e) {
    error_log('Ошибка подключения к БД: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка сервера при подключении к базе данных']);
    exit;
}

try {
    // Получаем ID номера по типу
    $stmt = $db->prepare("SELECT id FROM rooms WHERE type = :type AND is_active = TRUE LIMIT 1");
    $stmt->bindParam(':type', $room_type);
    $stmt->execute();
    $room = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$room) {
        echo json_encode([
            'available' => false,
            'message' => 'Выбранный тип номера недоступен'
        ]);
        exit;
    }
    
    $room_id = $room['id'];
    
    // Проверяем, нет ли пересечений с существующими бронированиями
    $stmt = $db->prepare("
        SELECT COUNT(*) as count FROM bookings 
        WHERE room_id = :room_id 
        AND status IN ('new', 'confirmed') 
        AND (
            (check_in_date <= :check_in_date AND check_out_date > :check_in_date) OR
            (check_in_date < :check_out_date AND check_out_date >= :check_out_date) OR
            (check_in_date >= :check_in_date AND check_out_date <= :check_out_date)
        )
    ");
    
    $stmt->bindParam(':room_id', $room_id);
    $stmt->bindParam(':check_in_date', $check_in_date);
    $stmt->bindParam(':check_out_date', $check_out_date);
    $stmt->execute();
    
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    // Возвращаем результат проверки
    echo json_encode([
        'available' => ($result['count'] == 0),
        'message' => ($result['count'] > 0) 
            ? 'Номер недоступен на выбранные даты' 
            : 'Номер доступен для бронирования'
    ]);
    
} catch (PDOException $e) {
    error_log('Ошибка при проверке доступности: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'error' => 'Ошибка сервера при проверке доступности',
        'available' => false
    ]);
} 