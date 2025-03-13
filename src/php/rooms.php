<?php
/**
 * Обработчик запросов информации о номерах гостиницы "Лесной дворик"
 */

// Подключение конфигурации базы данных
require_once '../includes/db_config.php';

// Определение действия
$action = isset($_GET['action']) ? $_GET['action'] : 'list';

// Получение списка всех номеров
if ($action === 'list') {
    try {
        // Получение всех номеров
        $rooms = fetchAll(
            "SELECT id, name, description, price, capacity, amenities, images, is_available 
             FROM rooms 
             WHERE is_active = 1 
             ORDER BY price ASC"
        );
        
        // Преобразование строковых данных в массивы
        foreach ($rooms as &$room) {
            // Преобразование строки с удобствами в массив
            if (isset($room['amenities'])) {
                $room['amenities'] = json_decode($room['amenities'], true);
            } else {
                $room['amenities'] = [];
            }
            
            // Преобразование строки с изображениями в массив
            if (isset($room['images'])) {
                $room['images'] = json_decode($room['images'], true);
            } else {
                $room['images'] = [];
            }
            
            // Форматирование цены
            $room['price_formatted'] = number_format($room['price'], 0, ',', ' ') . ' ₽';
        }
        
        // Возвращаем номера в формате JSON
        header('Content-Type: application/json');
        echo json_encode([
            'success' => true,
            'data' => $rooms
        ]);
        
    } catch (Exception $e) {
        // Логирование ошибки
        error_log("Ошибка при получении списка номеров: " . $e->getMessage());
        
        // Возвращаем сообщение об ошибке
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'message' => 'Произошла ошибка при загрузке списка номеров. Пожалуйста, попробуйте позже.'
        ]);
    }
}
// Получение информации о конкретном номере
elseif ($action === 'get' && isset($_GET['id'])) {
    try {
        $roomId = (int)$_GET['id'];
        
        // Получение информации о номере
        $room = fetchOne(
            "SELECT id, name, description, price, capacity, amenities, images, is_available, details 
             FROM rooms 
             WHERE id = ? AND is_active = 1",
            [$roomId]
        );
        
        if (!$room) {
            // Если номер не найден
            header('Content-Type: application/json');
            echo json_encode([
                'success' => false,
                'message' => 'Номер не найден'
            ]);
            exit;
        }
        
        // Преобразование строковых данных в массивы
        if (isset($room['amenities'])) {
            $room['amenities'] = json_decode($room['amenities'], true);
        } else {
            $room['amenities'] = [];
        }
        
        if (isset($room['images'])) {
            $room['images'] = json_decode($room['images'], true);
        } else {
            $room['images'] = [];
        }
        
        if (isset($room['details'])) {
            $room['details'] = json_decode($room['details'], true);
        } else {
            $room['details'] = [];
        }
        
        // Форматирование цены
        $room['price_formatted'] = number_format($room['price'], 0, ',', ' ') . ' ₽';
        
        // Возвращаем информацию о номере в формате JSON
        header('Content-Type: application/json');
        echo json_encode([
            'success' => true,
            'data' => $room
        ]);
        
    } catch (Exception $e) {
        // Логирование ошибки
        error_log("Ошибка при получении информации о номере: " . $e->getMessage());
        
        // Возвращаем сообщение об ошибке
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'message' => 'Произошла ошибка при загрузке информации о номере. Пожалуйста, попробуйте позже.'
        ]);
    }
}
// Проверка доступности номеров на определенные даты
elseif ($action === 'check_availability') {
    // Получение параметров запроса
    $arrival = isset($_GET['arrival']) ? $_GET['arrival'] : null;
    $departure = isset($_GET['departure']) ? $_GET['departure'] : null;
    $room_type = isset($_GET['room_type']) ? $_GET['room_type'] : null;
    $guests = isset($_GET['guests']) ? (int)$_GET['guests'] : 1;
    
    // Проверка наличия обязательных параметров
    if (!$arrival || !$departure || !$room_type) {
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'message' => 'Необходимо указать даты заезда, выезда и тип номера'
        ]);
        exit;
    }
    
    try {
        // Проверка корректности дат
        $arrivalDate = new DateTime($arrival);
        $departureDate = new DateTime($departure);
        $today = new DateTime();
        $today->setTime(0, 0, 0); // Сбрасываем время до начала дня
        
        if ($arrivalDate < $today) {
            header('Content-Type: application/json');
            echo json_encode([
                'success' => false,
                'message' => 'Дата заезда не может быть в прошлом'
            ]);
            exit;
        }
        
        if ($departureDate <= $arrivalDate) {
            header('Content-Type: application/json');
            echo json_encode([
                'success' => false,
                'message' => 'Дата выезда должна быть позже даты заезда'
            ]);
            exit;
        }
        
        // Подключение к базе данных
        $db = getDBConnection();
        
        // Запрос для проверки наличия свободных номеров указанного типа на заданные даты
        $query = "
            SELECT COUNT(*) as available_rooms
            FROM rooms r
            WHERE r.room_type = :room_type
            AND r.capacity >= :guests
            AND r.status = 'Доступен'
            AND r.id NOT IN (
                SELECT DISTINCT b.room_id
                FROM bookings b
                WHERE 
                    (b.arrival_date < :departure_date AND b.departure_date > :arrival_date)
                    AND b.status NOT IN ('Отменено', 'Отклонено')
            )
        ";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':room_type', $room_type);
        $stmt->bindParam(':guests', $guests);
        $stmt->bindParam(':arrival_date', $arrival);
        $stmt->bindParam(':departure_date', $departure);
        $stmt->execute();
        
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        $availableRooms = (int)$result['available_rooms'];
        
        // Получаем базовую цену номера и рассчитываем общую стоимость
        $priceQuery = "
            SELECT price_per_night
            FROM rooms 
            WHERE room_type = :room_type
            LIMIT 1
        ";
        
        $priceStmt = $db->prepare($priceQuery);
        $priceStmt->bindParam(':room_type', $room_type);
        $priceStmt->execute();
        
        $priceResult = $priceStmt->fetch(PDO::FETCH_ASSOC);
        $basePrice = $priceResult ? (float)$priceResult['price_per_night'] : 0;
        
        // Расчет количества ночей
        $nights = $arrivalDate->diff($departureDate)->days;
        
        // Расчет общей стоимости (простой вариант без учета скидок и доп. услуг)
        $totalPrice = $basePrice * $nights;
        
        if ($availableRooms > 0) {
            // Номера доступны
            header('Content-Type: application/json');
            echo json_encode([
                'success' => true,
                'message' => 'Номер доступен для бронирования',
                'availability' => [
                    'available' => true,
                    'available_rooms' => $availableRooms,
                    'base_price' => $basePrice,
                    'nights' => $nights,
                    'total_price' => $totalPrice
                ]
            ]);
        } else {
            // Номера не доступны
            // Проверяем ближайшие свободные даты (опционально)
            $alternativeDates = findAlternativeDates($db, $room_type, $arrival, $departure, $guests);
            
            header('Content-Type: application/json');
            echo json_encode([
                'success' => false,
                'message' => 'К сожалению, на выбранные даты нет доступных номеров указанного типа',
                'availability' => [
                    'available' => false,
                    'alternative_dates' => $alternativeDates
                ]
            ]);
        }
    } catch (Exception $e) {
        error_log('Ошибка при проверке доступности номеров: ' . $e->getMessage());
        
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'message' => 'Произошла ошибка при проверке доступности. Пожалуйста, попробуйте позже.'
        ]);
    }
}
// Неизвестное действие
else {
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => 'Неизвестное действие'
    ]);
}

/**
 * Функция поиска альтернативных дат для бронирования
 * 
 * @param PDO $db Подключение к базе данных
 * @param string $roomType Тип номера
 * @param string $arrival Дата заезда
 * @param string $departure Дата выезда
 * @param int $guests Количество гостей
 * @return array Массив с альтернативными датами
 */
function findAlternativeDates($db, $roomType, $arrival, $departure, $guests) {
    $alternatives = [];
    
    try {
        $arrivalDate = new DateTime($arrival);
        $departureDate = new DateTime($departure);
        $requestedNights = $arrivalDate->diff($departureDate)->days;
        
        // Проверяем даты на неделю вперед
        $checkDate = clone $arrivalDate;
        $checkDate->add(new DateInterval('P3D')); // Проверяем на 3 дня вперед
        
        for ($i = 0; $i < 7; $i++) {
            $checkArrival = $checkDate->format('Y-m-d');
            $checkDeparture = (clone $checkDate)->add(new DateInterval('P' . $requestedNights . 'D'))->format('Y-m-d');
            
            // Проверяем доступность номеров на эти даты
            $query = "
                SELECT COUNT(*) as available_rooms
                FROM rooms r
                WHERE r.room_type = :room_type
                AND r.capacity >= :guests
                AND r.status = 'Доступен'
                AND r.id NOT IN (
                    SELECT DISTINCT b.room_id
                    FROM bookings b
                    WHERE 
                        (b.arrival_date < :departure_date AND b.departure_date > :arrival_date)
                        AND b.status NOT IN ('Отменено', 'Отклонено')
                )
            ";
            
            $stmt = $db->prepare($query);
            $stmt->bindParam(':room_type', $roomType);
            $stmt->bindParam(':guests', $guests);
            $stmt->bindParam(':arrival_date', $checkArrival);
            $stmt->bindParam(':departure_date', $checkDeparture);
            $stmt->execute();
            
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            $availableRooms = (int)$result['available_rooms'];
            
            if ($availableRooms > 0) {
                $alternatives[] = [
                    'arrival' => $checkArrival,
                    'departure' => $checkDeparture,
                    'available_rooms' => $availableRooms
                ];
                
                // Если нашли 3 альтернативы, возвращаем результат
                if (count($alternatives) >= 3) {
                    break;
                }
            }
            
            $checkDate->add(new DateInterval('P1D')); // Проверяем следующий день
        }
    } catch (Exception $e) {
        error_log('Ошибка при поиске альтернативных дат: ' . $e->getMessage());
    }
    
    return $alternatives;
} 