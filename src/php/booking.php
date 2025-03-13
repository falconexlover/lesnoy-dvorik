<?php
/**
 * Обработчик формы бронирования
 * Сохраняет данные бронирования в базу данных и отправляет уведомления
 */

// Подключаем класс безопасности
require_once __DIR__ . '/../includes/security.php';

// Настройки
$admin_email = getenv('ADMIN_EMAIL') ?: 'admin@lesnoy-dvorik.ru';
$admin_phone = '79151201744'; // Номер для WhatsApp без +

// Защита от прямого доступа к файлу
if (!defined('APP_RUNNING') && $_SERVER['SCRIPT_FILENAME'] == __FILE__) {
    header('HTTP/1.0 403 Forbidden');
    exit('Доступ запрещен');
}

// Проверка CSRF-токена
session_start();
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_POST['csrf_token']) || !Security::validateCSRFToken($_POST['csrf_token'])) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Ошибка проверки CSRF-токена. Пожалуйста, обновите страницу и попробуйте снова.']);
        exit;
    }
}

// Подключение к базе данных с использованием prepared statements
try {
    require_once __DIR__ . '/../includes/db_config.php';
    $db = getDBConnection();
} catch (PDOException $e) {
    error_log('Ошибка подключения к БД: ' . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Ошибка сервера. Пожалуйста, попробуйте позже.']);
    exit;
}

// Проверка метода запроса
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ../pages/booking.html');
    exit;
}

// Получение и очистка данных из формы с использованием класса безопасности
$input = Security::sanitize($_POST);

$name = $input['name'] ?? '';
$email = $input['email'] ?? '';
$phone = $input['phone'] ?? '';
$check_in_date = $input['check_in_date'] ?? '';
$check_out_date = $input['check_out_date'] ?? '';
$room_type = $input['room_type'] ?? '';
$adults = (int)($input['adults'] ?? 1);
$children = (int)($input['children'] ?? 0);
$special_requests = $input['special_requests'] ?? '';
$total_price = (float)($input['total_price'] ?? 0);

// Валидация данных с использованием класса безопасности
$errors = [];

if (empty($name)) {
    $errors[] = 'Пожалуйста, укажите ваше имя';
}

if (empty($email) || !Security::validateEmail($email)) {
    $errors[] = 'Пожалуйста, укажите корректный email';
}

if (empty($phone) || !Security::validatePhone($phone)) {
    $errors[] = 'Пожалуйста, укажите корректный телефон';
}

if (empty($check_in_date) || !Security::validateDate($check_in_date)) {
    $errors[] = 'Пожалуйста, укажите корректную дату заезда';
}

if (empty($check_out_date) || !Security::validateDate($check_out_date)) {
    $errors[] = 'Пожалуйста, укажите корректную дату выезда';
}

if (!Security::compareDates($check_out_date, $check_in_date, '>')) {
    $errors[] = 'Дата выезда должна быть позже даты заезда';
}

if (empty($room_type)) {
    $errors[] = 'Пожалуйста, выберите тип номера';
}

if ($adults < 1) {
    $errors[] = 'Количество взрослых должно быть не менее 1';
}

if ($total_price <= 0) {
    $errors[] = 'Ошибка расчета стоимости';
}

// Если есть ошибки, возвращаем их
if (!empty($errors)) {
    echo json_encode(['success' => false, 'errors' => $errors]);
    exit;
}

// Проверка доступности номера
try {
    // Получаем ID номера по типу
    $stmt = $db->prepare("SELECT id FROM rooms WHERE type = :type AND is_active = TRUE LIMIT 1");
    $stmt->bindParam(':type', $room_type);
    $stmt->execute();
    $room = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$room) {
        echo json_encode(['success' => false, 'message' => 'Выбранный тип номера недоступен']);
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
    
    if ($result['count'] > 0) {
        echo json_encode(['success' => false, 'message' => 'Выбранный номер недоступен на указанные даты. Пожалуйста, выберите другие даты или тип номера.']);
        exit;
    }
    
    // Сохраняем бронирование в базу данных
    $stmt = $db->prepare("
        INSERT INTO bookings (
            room_id, guest_name, guest_email, guest_phone, 
            check_in_date, check_out_date, adults, children, 
            special_requests, total_price, status
        ) VALUES (
            :room_id, :guest_name, :guest_email, :guest_phone, 
            :check_in_date, :check_out_date, :adults, :children, 
            :special_requests, :total_price, 'new'
        )
    ");
    
    $stmt->bindParam(':room_id', $room_id);
    $stmt->bindParam(':guest_name', $name);
    $stmt->bindParam(':guest_email', $email);
    $stmt->bindParam(':guest_phone', $phone);
    $stmt->bindParam(':check_in_date', $check_in_date);
    $stmt->bindParam(':check_out_date', $check_out_date);
    $stmt->bindParam(':adults', $adults);
    $stmt->bindParam(':children', $children);
    $stmt->bindParam(':special_requests', $special_requests);
    $stmt->bindParam(':total_price', $total_price);
    
    $stmt->execute();
    $booking_id = $db->lastInsertId();
    
    // Генерация уникального токена для доступа к бронированию
    $access_token = Security::generateToken();
    
    // Сохраняем токен в базе данных
    $stmt = $db->prepare("
        UPDATE bookings 
        SET access_token = :access_token 
        WHERE id = :booking_id
    ");
    
    $stmt->bindParam(':access_token', $access_token);
    $stmt->bindParam(':booking_id', $booking_id);
    $stmt->execute();
    
    // Отправка уведомления администратору
    $subject = "Новое бронирование #{$booking_id} - Лесной дворик";
    
    $message = "Новое бронирование #{$booking_id}\n\n";
    $message .= "Имя: {$name}\n";
    $message .= "Email: {$email}\n";
    $message .= "Телефон: {$phone}\n";
    $message .= "Даты: с {$check_in_date} по {$check_out_date}\n";
    $message .= "Тип номера: {$room_type}\n";
    $message .= "Гости: {$adults} взрослых, {$children} детей\n";
    $message .= "Особые пожелания: {$special_requests}\n";
    $message .= "Стоимость: {$total_price} руб.\n\n";
    $message .= "Перейти в панель управления: " . getenv('SITE_URL') . "/admin/\n";
    
    $headers = "From: booking@lesnoy-dvorik.ru\r\n";
    $headers .= "Reply-To: {$email}\r\n";
    
    mail($admin_email, $subject, $message, $headers);
    
    // Отправка подтверждения клиенту
    $subject_client = "Подтверждение бронирования - Гостиница 'Лесной дворик'";
    
    $message_client = "Уважаемый(ая) {$name},\n\n";
    $message_client .= "Благодарим вас за бронирование в гостинице 'Лесной дворик'!\n\n";
    $message_client .= "Детали вашего бронирования:\n";
    $message_client .= "Номер бронирования: {$booking_id}\n";
    $message_client .= "Даты: с {$check_in_date} по {$check_out_date}\n";
    $message_client .= "Тип номера: {$room_type}\n";
    $message_client .= "Гости: {$adults} взрослых, {$children} детей\n";
    $message_client .= "Стоимость: {$total_price} руб.\n\n";
    $message_client .= "Ваше бронирование находится в обработке. Мы свяжемся с вами в ближайшее время для подтверждения.\n\n";
    $message_client .= "Вы можете просмотреть детали вашего бронирования по ссылке:\n";
    $message_client .= getenv('SITE_URL') . "/pages/booking-view.html?id={$booking_id}&token={$access_token}\n\n";
    $message_client .= "С уважением,\nКоманда гостиницы 'Лесной дворик'\n";
    $message_client .= "Телефон: +7 (915) 120-17-44\n";
    $message_client .= "Email: info@lesnoy-dvorik.ru\n";
    
    $headers_client = "From: booking@lesnoy-dvorik.ru\r\n";
    
    mail($email, $subject_client, $message_client, $headers_client);
    
    // Возвращаем успешный ответ
    echo json_encode([
        'success' => true, 
        'message' => 'Бронирование успешно создано! Мы отправили подтверждение на ваш email.',
        'booking_id' => $booking_id,
        'access_token' => $access_token,
        'redirect' => '../pages/booking-confirmation.html?id=' . $booking_id . '&token=' . $access_token
    ]);
    
} catch (PDOException $e) {
    error_log('Ошибка при бронировании: ' . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Произошла ошибка при обработке бронирования. Пожалуйста, попробуйте позже.']);
} 