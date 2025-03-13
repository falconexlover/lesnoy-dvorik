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
    try {
        // Получение параметров запроса
        $arrival = isset($_GET['arrival']) ? $_GET['arrival'] : null;
        $departure = isset($_GET['departure']) ? $_GET['departure'] : null;
        $guests = isset($_GET['guests']) ? (int)$_GET['guests'] : 1;
        
        // Проверка наличия обязательных параметров
        if (!$arrival || !$departure) {
            header('Content-Type: application/json');
            echo json_encode([
                'success' => false,
                'message' => 'Необходимо указать даты заезда и выезда'
            ]);
            exit;
        }
        
        // Проверка корректности дат
        $arrivalDate = new DateTime($arrival);
        $departureDate = new DateTime($departure);
        $today = new DateTime();
        
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
        
        // Получение списка доступных номеров
        $sql = "SELECT r.id, r.name, r.description, r.price, r.capacity, r.amenities, r.images 
                FROM rooms r 
                WHERE r.is_active = 1 
                AND r.is_available = 1 
                AND r.capacity >= ? 
                AND r.id NOT IN (
                    SELECT DISTINCT room_id 
                    FROM bookings 
                    WHERE status IN ('confirmed', 'pending') 
                    AND (
                        (arrival_date <= ? AND departure_date > ?) OR 
                        (arrival_date < ? AND departure_date >= ?) OR 
                        (arrival_date >= ? AND departure_date <= ?)
                    )
                ) 
                ORDER BY r.price ASC";
        
        $rooms = fetchAll($sql, [
            $guests,
            $departure,
            $arrival,
            $departure,
            $arrival,
            $arrival,
            $departure
        ]);
        
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
            
            // Расчет общей стоимости проживания
            $interval = $arrivalDate->diff($departureDate);
            $nights = $interval->days;
            $room['total_price'] = $room['price'] * $nights;
            $room['total_price_formatted'] = number_format($room['total_price'], 0, ',', ' ') . ' ₽';
            $room['nights'] = $nights;
        }
        
        // Возвращаем доступные номера в формате JSON
        header('Content-Type: application/json');
        echo json_encode([
            'success' => true,
            'data' => [
                'rooms' => $rooms,
                'dates' => [
                    'arrival' => $arrival,
                    'departure' => $departure,
                    'nights' => $arrivalDate->diff($departureDate)->days
                ]
            ]
        ]);
        
    } catch (Exception $e) {
        // Логирование ошибки
        error_log("Ошибка при проверке доступности номеров: " . $e->getMessage());
        
        // Возвращаем сообщение об ошибке
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'message' => 'Произошла ошибка при проверке доступности номеров. Пожалуйста, попробуйте позже.'
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