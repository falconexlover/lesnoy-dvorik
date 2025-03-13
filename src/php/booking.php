<?php
/**
 * Обработчик формы бронирования
 * Сохраняет данные бронирования в базу данных и отправляет уведомления
 */

// Настройки
$admin_email = 'admin@lesnoy-dvorik.ru';
$admin_phone = '79151201744'; // Номер для WhatsApp без +

// Защита от прямого доступа к файлу
if (!defined('APP_RUNNING') && $_SERVER['SCRIPT_FILENAME'] == __FILE__) {
    header('HTTP/1.0 403 Forbidden');
    exit('Доступ запрещен');
}

// Проверка CSRF-токена
session_start();
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_POST['csrf_token']) || $_POST['csrf_token'] !== $_SESSION['csrf_token']) {
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

// Функция для очистки входных данных с дополнительной защитой
function clean_input($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    return $data;
}

// Проверка метода запроса
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ../pages/booking.html');
    exit;
}

// Получение и очистка данных из формы
$name = isset($_POST['name']) ? clean_input($_POST['name']) : '';
$email = isset($_POST['email']) ? clean_input($_POST['email']) : '';
$phone = isset($_POST['phone']) ? clean_input($_POST['phone']) : '';
$room_type = isset($_POST['room_type']) ? clean_input($_POST['room_type']) : '';
$check_in_date = isset($_POST['check_in_date']) ? clean_input($_POST['check_in_date']) : '';
$check_out_date = isset($_POST['check_out_date']) ? clean_input($_POST['check_out_date']) : '';
$adults = isset($_POST['adults']) ? (int)$_POST['adults'] : 0;
$children = isset($_POST['children']) ? (int)$_POST['children'] : 0;
$comments = isset($_POST['comments']) ? clean_input($_POST['comments']) : '';
$privacy = isset($_POST['privacy']) ? true : false;

// Валидация данных
$errors = [];

if (empty($name) || strlen($name) < 2 || strlen($name) > 100) {
    $errors[] = 'Имя должно содержать от 2 до 100 символов';
}

if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Укажите корректный email';
}

// Улучшенная валидация телефона с использованием регулярного выражения
if (empty($phone) || !preg_match('/^[0-9\+\-\(\)\s]{7,20}$/', $phone)) {
    $errors[] = 'Укажите корректный номер телефона';
}

if (empty($room_type)) {
    $errors[] = 'Выберите тип номера';
}

// Улучшенная валидация дат
if (empty($check_in_date) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $check_in_date)) {
    $errors[] = 'Укажите корректную дату заезда в формате ГГГГ-ММ-ДД';
} 

if (empty($check_out_date) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $check_out_date)) {
    $errors[] = 'Укажите корректную дату выезда в формате ГГГГ-ММ-ДД';
}

if ($adults < 1 || $adults > 10) {
    $errors[] = 'Количество взрослых должно быть от 1 до 10 человек';
}

if ($children < 0 || $children > 10) {
    $errors[] = 'Количество детей должно быть от 0 до 10 человек';
}

if (strlen($comments) > 1000) {
    $errors[] = 'Комментарий не должен превышать 1000 символов';
}

if (!$privacy) {
    $errors[] = 'Необходимо согласие с политикой конфиденциальности';
}

// Проверка дат с использованием DateTime
try {
    $check_in = new DateTime($check_in_date);
    $check_out = new DateTime($check_out_date);
    $today = new DateTime();
    $today->setTime(0, 0, 0); // Сбрасываем время до начала дня
    
    if ($check_in < $today) {
        $errors[] = 'Дата заезда не может быть в прошлом';
    }
    
    if ($check_out <= $check_in) {
        $errors[] = 'Дата выезда должна быть позже даты заезда';
    }
    
    // Ограничение на длительность бронирования
    $interval = $check_in->diff($check_out);
    if ($interval->days > 30) {
        $errors[] = 'Длительность бронирования не может превышать 30 дней';
    }
} catch (Exception $e) {
    $errors[] = 'Ошибка в формате дат. Используйте формат ГГГГ-ММ-ДД';
}

// Если есть ошибки, возвращаем их
if (!empty($errors)) {
    echo json_encode(['success' => false, 'errors' => $errors]);
    exit;
}

// Генерация уникального кода бронирования
$booking_code = strtoupper(substr(md5(uniqid(rand(), true)), 0, 8));

// Сохранение данных в базу данных
try {
    $stmt = $db->prepare("
        INSERT INTO bookings (
            booking_code, name, email, phone, room_type, 
            check_in_date, check_out_date, adults, children, 
            comments, created_at, status
        ) VALUES (
            :booking_code, :name, :email, :phone, :room_type,
            :check_in_date, :check_out_date, :adults, :children,
            :comments, NOW(), 'pending'
        )
    ");
    
    $stmt->bindParam(':booking_code', $booking_code);
    $stmt->bindParam(':name', $name);
    $stmt->bindParam(':email', $email);
    $stmt->bindParam(':phone', $phone);
    $stmt->bindParam(':room_type', $room_type);
    $stmt->bindParam(':check_in_date', $check_in_date);
    $stmt->bindParam(':check_out_date', $check_out_date);
    $stmt->bindParam(':adults', $adults);
    $stmt->bindParam(':children', $children);
    $stmt->bindParam(':comments', $comments);
    
    $stmt->execute();
    $booking_id = $db->lastInsertId();
    
} catch (PDOException $e) {
    error_log('Ошибка сохранения бронирования: ' . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Ошибка сервера. Пожалуйста, попробуйте позже.']);
    exit;
}

// Формирование текста для уведомлений
$room_types = [
    'econom' => 'Эконом',
    'standard' => 'Стандарт',
    'family' => 'Семейный',
    'comfort' => 'Комфорт',
    'lux' => 'Люкс'
];

$room_type_text = isset($room_types[$room_type]) ? $room_types[$room_type] : $room_type;

$message = "Новое бронирование #{$booking_code}\n\n";
$message .= "Имя: {$name}\n";
$message .= "Email: {$email}\n";
$message .= "Телефон: {$phone}\n";
$message .= "Тип номера: {$room_type_text}\n";
$message .= "Дата заезда: {$check_in_date}\n";
$message .= "Дата выезда: {$check_out_date}\n";
$message .= "Взрослых: {$adults}\n";
$message .= "Детей: {$children}\n";

if (!empty($comments)) {
    $message .= "Комментарии: {$comments}\n";
}

// Отправка уведомления на email администратора
$subject = "Новое бронирование #{$booking_code} - Лесной дворик";
$headers = "From: booking@lesnoy-dvorik.ru\r\n";
$headers .= "Reply-To: {$email}\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

mail($admin_email, $subject, $message, $headers);

// Формирование ссылки для WhatsApp
$whatsapp_message = urlencode($message);
$whatsapp_link = "https://wa.me/{$admin_phone}?text={$whatsapp_message}";

// Отправка подтверждения клиенту
$client_subject = "Подтверждение бронирования #{$booking_code} - Лесной дворик";
$client_message = "Уважаемый(ая) {$name},\n\n";
$client_message .= "Благодарим Вас за бронирование в гостинице \"Лесной дворик\"!\n\n";
$client_message .= "Детали Вашего бронирования:\n";
$client_message .= "Номер бронирования: {$booking_code}\n";
$client_message .= "Тип номера: {$room_type_text}\n";
$client_message .= "Дата заезда: {$check_in_date}\n";
$client_message .= "Дата выезда: {$check_out_date}\n";
$client_message .= "Количество гостей: {$adults} взрослых, {$children} детей\n\n";
$client_message .= "Статус: Ожидает подтверждения\n\n";
$client_message .= "Мы свяжемся с Вами в ближайшее время для подтверждения бронирования.\n";
$client_message .= "Если у Вас возникнут вопросы, пожалуйста, свяжитесь с нами:\n";
$client_message .= "Телефон: 8 (498) 483-19-41\n";
$client_message .= "Email: info@lesnoy-dvorik.ru\n\n";
$client_message .= "С уважением,\n";
$client_message .= "Администрация гостиницы \"Лесной дворик\"";

$client_headers = "From: booking@lesnoy-dvorik.ru\r\n";
$client_headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

mail($email, $client_subject, $client_message, $client_headers);

// Возвращаем успешный ответ
$response = [
    'success' => true,
    'message' => 'Бронирование успешно отправлено! Номер вашего бронирования: ' . $booking_code,
    'booking_code' => $booking_code,
    'whatsapp_link' => $whatsapp_link
];

// Если это AJAX-запрос, возвращаем JSON
if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
    echo json_encode($response);
    exit;
}

// Иначе перенаправляем на страницу с сообщением
$_SESSION['booking_message'] = $response['message'];
$_SESSION['booking_code'] = $booking_code;
header('Location: ../pages/booking-confirmation.html');
exit; 