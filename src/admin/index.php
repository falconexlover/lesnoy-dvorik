<?php
/**
 * Административная панель для управления бронированиями
 * Гостиница "Лесной дворик"
 */

// Запуск сессии для авторизации
session_start();

// Подключение конфигурации БД
require_once '../includes/db_config.php';

// Проверка авторизации
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    // Если не авторизованы и отправлена форма авторизации
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['login'], $_POST['password'])) {
        // Простая проверка логина и пароля (в реальном проекте лучше использовать хеширование)
        // ВНИМАНИЕ: Измените эти значения перед использованием!
        $admin_login = 'admin';
        $admin_password = 'password123';
        
        if ($_POST['login'] === $admin_login && $_POST['password'] === $admin_password) {
            $_SESSION['admin_logged_in'] = true;
            header('Location: ' . $_SERVER['PHP_SELF']);
            exit;
        } else {
            $error = 'Неверный логин или пароль';
        }
    }
    
    // Показать форму авторизации
    include 'login_form.php';
    exit;
}

// Обработка действий
$action = isset($_GET['action']) ? $_GET['action'] : 'list';
$message = '';
$message_type = '';

// Обработка выхода из системы
if ($action === 'logout') {
    session_destroy();
    header('Location: ' . $_SERVER['PHP_SELF']);
    exit;
}

// Обработка обновления статуса бронирования
if ($action === 'update_status' && isset($_POST['booking_id'], $_POST['status'])) {
    $booking_id = sanitize($_POST['booking_id']);
    $status = sanitize($_POST['status']);
    
    if (updateBookingStatus($pdo, $booking_id, $status)) {
        $message = 'Статус бронирования успешно обновлен';
    } else {
        $message = 'Ошибка при обновлении статуса бронирования';
    }
    
    // Перенаправление на список после действия
    header('Location: index.php?message=' . urlencode($message));
    exit;
}

// Обработка удаления бронирования
if ($action === 'delete' && isset($_GET['id'])) {
    $booking_id = sanitize($_GET['id']);
    
    if (deleteBooking($pdo, $booking_id)) {
        $message = 'Бронирование успешно удалено';
    } else {
        $message = 'Ошибка при удалении бронирования';
    }
    
    // Перенаправление на список после действия
    header('Location: index.php?message=' . urlencode($message));
    exit;
}

// Обработка экспорта в CSV
if ($action === 'export_csv') {
    $export = exportBookingsToCSV($pdo);
    
    if ($export) {
        // Установка заголовков для скачивания файла
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="' . $export['filename'] . '"');
        
        // Вывод содержимого CSV
        echo $export['content'];
        exit;
    } else {
        $message = 'Ошибка при экспорте бронирований';
    }
}

// Обработка действий CMS
if ($action === 'content') {
    // Страница управления контентом
    include 'templates/content_manager.php';
    exit;
} elseif ($action === 'add_section') {
    // Страница добавления новой секции
    include 'templates/section_editor.php';
    exit;
} elseif ($action === 'edit_section') {
    // Страница редактирования секции
    include 'templates/section_editor.php';
    exit;
} elseif ($action === 'save_section') {
    // Обработка сохранения новой секции
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $contentData = [
            'page' => sanitize($_POST['page']),
            'section' => sanitize($_POST['section']),
            'title' => sanitize($_POST['title']),
            'content' => $_POST['content'], // Не применяем sanitize к контенту, чтобы сохранить форматирование
            'image_path' => '',
            'sort_order' => (int)$_POST['sort_order']
        ];
        
        // Обработка загрузки изображения
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $imagePath = uploadImage($_FILES['image']);
            if ($imagePath) {
                $contentData['image_path'] = $imagePath;
            }
        }
        
        // Добавление секции в БД
        if (addSectionContent($pdo, $contentData)) {
            $message = 'Секция успешно добавлена';
            $message_type = 'success';
        } else {
            $message = 'Ошибка при добавлении секции';
            $message_type = 'danger';
        }
    }
    
    // Перенаправление на страницу управления контентом
    header('Location: index.php?action=content&page=' . $contentData['page'] . '&message=' . urlencode($message) . '&message_type=' . $message_type);
    exit;
} elseif ($action === 'update_section') {
    // Обработка обновления секции
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['id'])) {
        $sectionId = (int)$_GET['id'];
        
        $contentData = [
            'title' => sanitize($_POST['title']),
            'content' => $_POST['content'], // Не применяем sanitize к контенту, чтобы сохранить форматирование
            'image_path' => sanitize($_POST['current_image'] ?? '')
        ];
        
        // Обработка загрузки нового изображения
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $imagePath = uploadImage($_FILES['image']);
            if ($imagePath) {
                $contentData['image_path'] = $imagePath;
            }
        }
        
        // Обновление секции в БД
        if (updateSectionContent($pdo, $sectionId, $contentData)) {
            $message = 'Секция успешно обновлена';
            $message_type = 'success';
        } else {
            $message = 'Ошибка при обновлении секции';
            $message_type = 'danger';
        }
        
        // Получаем страницу для перенаправления
        $stmt = $pdo->prepare("SELECT page FROM content WHERE id = :id LIMIT 1");
        $stmt->bindParam(':id', $sectionId);
        $stmt->execute();
        $section = $stmt->fetch();
        $page = $section ? $section['page'] : 'main';
        
        // Перенаправление на страницу управления контентом
        header('Location: index.php?action=content&page=' . $page . '&message=' . urlencode($message) . '&message_type=' . $message_type);
        exit;
    }
} elseif ($action === 'delete_section') {
    // Обработка удаления секции
    if (isset($_GET['id'])) {
        $sectionId = (int)$_GET['id'];
        
        // Получаем страницу для перенаправления
        $stmt = $pdo->prepare("SELECT page FROM content WHERE id = :id LIMIT 1");
        $stmt->bindParam(':id', $sectionId);
        $stmt->execute();
        $section = $stmt->fetch();
        $page = $section ? $section['page'] : 'main';
        
        // Удаление секции из БД
        if (deleteSectionContent($pdo, $sectionId)) {
            $message = 'Секция успешно удалена';
            $message_type = 'success';
        } else {
            $message = 'Ошибка при удалении секции';
            $message_type = 'danger';
        }
        
        // Перенаправление на страницу управления контентом
        header('Location: index.php?action=content&page=' . $page . '&message=' . urlencode($message) . '&message_type=' . $message_type);
        exit;
    }
} elseif ($action === 'move_section') {
    // Обработка изменения порядка секций
    if (isset($_GET['id']) && isset($_GET['direction'])) {
        $sectionId = (int)$_GET['id'];
        $direction = $_GET['direction'];
        
        // Получаем данные секции
        $stmt = $pdo->prepare("SELECT * FROM content WHERE id = :id LIMIT 1");
        $stmt->bindParam(':id', $sectionId);
        $stmt->execute();
        $section = $stmt->fetch();
        
        if ($section) {
            $page = $section['page'];
            $currentOrder = (int)$section['sort_order'];
            $newOrder = ($direction === 'up') ? $currentOrder - 1 : $currentOrder + 1;
            
            // Обновляем порядок текущей секции
            $stmt = $pdo->prepare("UPDATE content SET sort_order = :new_order WHERE id = :id");
            $stmt->bindParam(':id', $sectionId);
            $stmt->bindParam(':new_order', $newOrder);
            $stmt->execute();
            
            // Обновляем порядок соседней секции
            if ($direction === 'up') {
                $stmt = $pdo->prepare("UPDATE content SET sort_order = :current_order WHERE page = :page AND sort_order = :new_order AND id != :id");
            } else {
                $stmt = $pdo->prepare("UPDATE content SET sort_order = :current_order WHERE page = :page AND sort_order = :new_order AND id != :id");
            }
            $stmt->bindParam(':page', $page);
            $stmt->bindParam(':current_order', $currentOrder);
            $stmt->bindParam(':new_order', $newOrder);
            $stmt->bindParam(':id', $sectionId);
            $stmt->execute();
            
            $message = 'Порядок секций обновлен';
            $message_type = 'success';
        } else {
            $message = 'Секция не найдена';
            $message_type = 'danger';
            $page = 'main';
        }
        
        // Перенаправление на страницу управления контентом
        header('Location: index.php?action=content&page=' . $page . '&message=' . urlencode($message) . '&message_type=' . $message_type);
        exit;
    }
} elseif ($action === 'analytics') {
    // Страница аналитики и статистики
    include 'templates/analytics.php';
    exit;
} elseif ($action === 'loyalty') {
    // Страница управления программой лояльности
    include 'templates/loyalty.php';
    exit;
} elseif ($action === 'services') {
    // Страница управления дополнительными услугами
    include 'templates/services.php';
    exit;
} elseif ($action === 'metasearch') {
    // Страница интеграции с метапоисковиками
    include 'templates/metasearch.php';
    exit;
} elseif ($action === 'reviews') {
    // Страница управления отзывами
    include 'templates/reviews.php';
    exit;
} elseif ($action === 'generate') {
    // Страница генерации сайта
    include 'templates/generate.php';
    exit;
} elseif ($action === 'generate_site') {
    // Обработка генерации сайта
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['pages'])) {
        $selectedPages = $_POST['pages'];
        $generatedPages = [];
        $failedPages = [];
        
        // Список шаблонов и выходных файлов
        $templates = [
            'main' => [
                'template' => '../templates/main.html',
                'output' => '../public/index.html'
            ],
            'hotel' => [
                'template' => '../templates/hotel.html',
                'output' => '../public/pages/hotel.html'
            ],
            'sauna' => [
                'template' => '../templates/sauna.html',
                'output' => '../public/pages/sauna.html'
            ],
            'banquet' => [
                'template' => '../templates/banquet.html',
                'output' => '../public/pages/banquet.html'
            ],
            'contacts' => [
                'template' => '../templates/contacts.html',
                'output' => '../public/pages/contacts.html'
            ]
        ];
        
        // Генерация выбранных страниц
        foreach ($selectedPages as $page) {
            if (isset($templates[$page])) {
                if (generateHtmlPage($pdo, $page, $templates[$page]['template'], $templates[$page]['output'])) {
                    $generatedPages[] = $page;
                } else {
                    $failedPages[] = $page;
                }
            }
        }
        
        if (empty($failedPages)) {
            $message = 'Все выбранные страницы успешно сгенерированы: ' . implode(', ', $generatedPages);
            $message_type = 'success';
        } else {
            $message = 'Некоторые страницы не удалось сгенерировать: ' . implode(', ', $failedPages);
            $message_type = 'warning';
        }
        
        // Перенаправление на страницу генерации
        header('Location: index.php?action=generate&message=' . urlencode($message) . '&message_type=' . $message_type);
        exit;
    }
} elseif ($action === 'deploy_netlify') {
    // Обработка деплоя на Netlify
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Запуск скрипта деплоя
        $output = [];
        $returnVar = 0;
        exec('powershell -File ../deploy.ps1 2>&1', $output, $returnVar);
        
        if ($returnVar === 0) {
            $message = 'Деплой на Netlify успешно выполнен';
            $message_type = 'success';
        } else {
            $message = 'Ошибка при выполнении деплоя на Netlify: ' . implode("\n", $output);
            $message_type = 'danger';
        }
        
        // Перенаправление на страницу генерации
        header('Location: index.php?action=generate&message=' . urlencode($message) . '&message_type=' . $message_type);
        exit;
    }
} elseif ($action === 'settings') {
    // Страница настроек
    include 'templates/settings.php';
    exit;
} elseif ($action === 'save_settings') {
    // Обработка сохранения настроек
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['settings'])) {
        $settings = $_POST['settings'];
        $success = true;
        
        foreach ($settings as $key => $value) {
            if (!updateSetting($pdo, $key, sanitize($value))) {
                $success = false;
            }
        }
        
        if ($success) {
            $message = 'Настройки успешно сохранены';
            $message_type = 'success';
        } else {
            $message = 'Ошибка при сохранении настроек';
            $message_type = 'danger';
        }
        
        // Перенаправление на страницу настроек
        header('Location: index.php?action=settings&message=' . urlencode($message) . '&message_type=' . $message_type);
        exit;
    }
}

// Обработка действий с программой лояльности
if ($action === 'add_loyalty_level') {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $levelData = [
            'name' => sanitize($_POST['name']),
            'min_nights' => (int)$_POST['min_nights'],
            'discount_percent' => (int)$_POST['discount_percent'],
            'description' => sanitize($_POST['description'])
        ];
        
        if (addLoyaltyLevel($pdo, $levelData)) {
            $message = 'Уровень лояльности успешно добавлен';
            $message_type = 'success';
        } else {
            $message = 'Ошибка при добавлении уровня лояльности';
            $message_type = 'danger';
        }
        
        header('Location: index.php?action=loyalty&message=' . urlencode($message) . '&message_type=' . $message_type);
        exit;
    }
} elseif ($action === 'update_loyalty_level') {
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['id'])) {
        $levelId = (int)$_GET['id'];
        $levelData = [
            'name' => sanitize($_POST['name']),
            'min_nights' => (int)$_POST['min_nights'],
            'discount_percent' => (int)$_POST['discount_percent'],
            'description' => sanitize($_POST['description'])
        ];
        
        if (updateLoyaltyLevel($pdo, $levelId, $levelData)) {
            $message = 'Уровень лояльности успешно обновлен';
            $message_type = 'success';
        } else {
            $message = 'Ошибка при обновлении уровня лояльности';
            $message_type = 'danger';
        }
        
        header('Location: index.php?action=loyalty&message=' . urlencode($message) . '&message_type=' . $message_type);
        exit;
    }
} elseif ($action === 'delete_loyalty_level') {
    if (isset($_GET['id'])) {
        $levelId = (int)$_GET['id'];
        
        $stmt = $pdo->prepare("DELETE FROM loyalty_levels WHERE id = :id");
        $stmt->bindParam(':id', $levelId);
        
        if ($stmt->execute()) {
            $message = 'Уровень лояльности успешно удален';
            $message_type = 'success';
        } else {
            $message = 'Ошибка при удалении уровня лояльности';
            $message_type = 'danger';
        }
        
        header('Location: index.php?action=loyalty&message=' . urlencode($message) . '&message_type=' . $message_type);
        exit;
    }
} elseif ($action === 'send_loyalty_email') {
    if (isset($_GET['id'])) {
        $userId = (int)$_GET['id'];
        
        // Получаем данные пользователя
        $stmt = $pdo->prepare("SELECT * FROM users WHERE id = :id");
        $stmt->bindParam(':id', $userId);
        $stmt->execute();
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($user) {
            // Отправка письма с информацией о программе лояльности
            // Здесь должен быть код для отправки письма
            
            $message = 'Письмо с информацией о программе лояльности успешно отправлено';
            $message_type = 'success';
        } else {
            $message = 'Пользователь не найден';
            $message_type = 'danger';
        }
        
        header('Location: index.php?action=loyalty&message=' . urlencode($message) . '&message_type=' . $message_type);
        exit;
    }
}

// Обработка действий с дополнительными услугами
if ($action === 'add_service') {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $serviceData = [
            'name' => sanitize($_POST['name']),
            'description' => sanitize($_POST['description']),
            'price' => (float)$_POST['price'],
            'image_path' => '',
            'is_active' => isset($_POST['is_active']) ? 1 : 0,
            'sort_order' => (int)$_POST['sort_order']
        ];
        
        // Обработка загрузки изображения
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $imagePath = uploadImage($_FILES['image']);
            if ($imagePath) {
                $serviceData['image_path'] = $imagePath;
            }
        }
        
        if (addService($pdo, $serviceData)) {
            $message = 'Услуга успешно добавлена';
            $message_type = 'success';
        } else {
            $message = 'Ошибка при добавлении услуги';
            $message_type = 'danger';
        }
        
        header('Location: index.php?action=services&message=' . urlencode($message) . '&message_type=' . $message_type);
        exit;
    }
} elseif ($action === 'update_service') {
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_GET['id'])) {
        $serviceId = (int)$_GET['id'];
        $serviceData = [
            'name' => sanitize($_POST['name']),
            'description' => sanitize($_POST['description']),
            'price' => (float)$_POST['price'],
            'image_path' => sanitize($_POST['current_image'] ?? ''),
            'is_active' => isset($_POST['is_active']) ? 1 : 0,
            'sort_order' => (int)$_POST['sort_order']
        ];
        
        // Обработка загрузки изображения
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $imagePath = uploadImage($_FILES['image']);
            if ($imagePath) {
                $serviceData['image_path'] = $imagePath;
            }
        }
        
        if (updateService($pdo, $serviceId, $serviceData)) {
            $message = 'Услуга успешно обновлена';
            $message_type = 'success';
        } else {
            $message = 'Ошибка при обновлении услуги';
            $message_type = 'danger';
        }
        
        header('Location: index.php?action=services&message=' . urlencode($message) . '&message_type=' . $message_type);
        exit;
    }
} elseif ($action === 'delete_service') {
    if (isset($_GET['id'])) {
        $serviceId = (int)$_GET['id'];
        
        if (deleteService($pdo, $serviceId)) {
            $message = 'Услуга успешно удалена';
            $message_type = 'success';
        } else {
            $message = 'Ошибка при удалении услуги';
            $message_type = 'danger';
        }
        
        header('Location: index.php?action=services&message=' . urlencode($message) . '&message_type=' . $message_type);
        exit;
    }
} elseif ($action === 'toggle_service') {
    if (isset($_GET['id']) && isset($_GET['status'])) {
        $serviceId = (int)$_GET['id'];
        $status = (int)$_GET['status'];
        
        $stmt = $pdo->prepare("UPDATE services SET is_active = :status WHERE id = :id");
        $stmt->bindParam(':status', $status);
        $stmt->bindParam(':id', $serviceId);
        
        if ($stmt->execute()) {
            $message = $status ? 'Услуга успешно активирована' : 'Услуга успешно деактивирована';
            $message_type = 'success';
        } else {
            $message = 'Ошибка при изменении статуса услуги';
            $message_type = 'danger';
        }
        
        header('Location: index.php?action=services&message=' . urlencode($message) . '&message_type=' . $message_type);
        exit;
    }
}

// Обработка действий с метапоисковиками
if ($action === 'save_metasearch_settings') {
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['settings'])) {
        $settings = $_POST['settings'];
        
        if (updateMetasearchSettings($pdo, $settings)) {
            $message = 'Настройки метапоисковиков успешно сохранены';
            $message_type = 'success';
        } else {
            $message = 'Ошибка при сохранении настроек метапоисковиков';
            $message_type = 'danger';
        }
        
        header('Location: index.php?action=metasearch&message=' . urlencode($message) . '&message_type=' . $message_type);
        exit;
    }
} elseif ($action === 'generate_feed') {
    if (isset($_GET['type'])) {
        $feedType = sanitize($_GET['type']);
        $validTypes = ['google', 'yandex', 'trivago', 'tripadvisor', 'booking'];
        
        if (in_array($feedType, $validTypes)) {
            // Здесь должен быть код для генерации фида
            // В зависимости от типа фида
            
            $message = 'Фид для ' . $feedType . ' успешно сгенерирован';
            $message_type = 'success';
        } else {
            $message = 'Неверный тип фида';
            $message_type = 'danger';
        }
        
        header('Location: index.php?action=metasearch&message=' . urlencode($message) . '&message_type=' . $message_type);
        exit;
    }
}

// Получение данных из БД в зависимости от действия
switch ($action) {
    case 'view':
        if (isset($_GET['id'])) {
            $booking_id = sanitize($_GET['id']);
            $booking = getBookingById($pdo, $booking_id);
            
            if (!$booking) {
                $message = 'Бронирование не найдено';
                // Перенаправление на список, если бронирование не найдено
                header('Location: index.php?message=' . urlencode($message));
                exit;
            }
        } else {
            header('Location: index.php');
            exit;
        }
        break;
        
    case 'stats':
        // Функция getBookingStats() используется из db_config.php
        // Не объявляем ее здесь, чтобы избежать конфликта
        break;
        
    case 'list':
    default:
        // Получение всех бронирований
        $bookings = getAllBookings($pdo);
        
        // Получение сообщения из URL, если есть
        if (isset($_GET['message'])) {
            $message = $_GET['message'];
        }
        break;
}

// Отображение сообщений
if (!empty($message)) {
    echo '<div class="alert">' . htmlspecialchars($message) . '</div>';
}

// Отображение соответствующего шаблона
switch ($action) {
    case 'view':
        include 'templates/booking_detail.php';
        break;
        
    case 'stats':
        // Функция getBookingStats() используется из db_config.php
        // Не объявляем ее здесь, чтобы избежать конфликта
        break;
        
    case 'list':
    default:
        include 'templates/booking_list.php';
        break;
}

// Функция для обновления HTML-файлов на основе шаблонов и данных
function updateHtmlFiles($page, $content_data) {
    // В зависимости от страницы обновляем соответствующие HTML-файлы
    switch ($page) {
        case 'main':
            updateMainPage($content_data);
            break;
        case 'hotel':
            updateHotelPage($content_data);
            break;
        case 'special':
            updateSpecialPage($content_data);
            break;
        case 'sauna':
            updateSaunaPage($content_data);
            break;
        case 'banquet':
            updateBanquetPage($content_data);
            break;
        case 'contacts':
            updateContactsInfo($content_data);
            break;
    }
}

// Функция для обновления главной страницы
function updateMainPage($content_data) {
    // Здесь должен быть код для обновления index.html
    // В реальном проекте это может быть более сложная логика с использованием шаблонизатора
    
    // Пример простой замены контента:
    $html_file = '../index.html';
    $html_content = file_get_contents($html_file);
    
    // Заменяем заголовок и подзаголовок слайдера
    if (isset($content_data['slider_title'])) {
        $html_content = preg_replace('/<h1>(.*?)<\/h1>/s', '<h1>' . $content_data['slider_title'] . '</h1>', $html_content);
    }
    
    if (isset($content_data['slider_subtitle'])) {
        $html_content = preg_replace('/<p>Идеальное место для отдыха(.*?)<\/p>/s', '<p>' . $content_data['slider_subtitle'] . '</p>', $html_content);
    }
    
    // Обновляем контактную информацию
    if (isset($content_data['contact_address'])) {
        $html_content = preg_replace('/г\. Москва, ул\. Лесная, д\. 10/', $content_data['contact_address'], $html_content);
    }
    
    if (isset($content_data['contact_phone'])) {
        $html_content = preg_replace('/\+7 \(495\) 123-45-67/', $content_data['contact_phone'], $html_content);
    }
    
    if (isset($content_data['contact_email'])) {
        $html_content = preg_replace('/info@lesnoy-dvorik\.ru/', $content_data['contact_email'], $html_content);
    }
    
    // Сохраняем обновленный HTML
    file_put_contents($html_file, $html_content);
}

// Функция для обновления страницы гостиницы
function updateHotelPage($content_data) {
    // Здесь должен быть код для обновления hotel.html
}

// Функция для обновления страницы спецпредложений
function updateSpecialPage($content_data) {
    // Здесь должен быть код для обновления special.html
}

// Функция для обновления страницы сауны
function updateSaunaPage($content_data) {
    // Здесь должен быть код для обновления sauna.html
}

// Функция для обновления страницы банкетного зала
function updateBanquetPage($content_data) {
    // Здесь должен быть код для обновления banquet.html
}

// Функция для обновления контактной информации на всех страницах
function updateContactsInfo($content_data) {
    // Обновляем контактную информацию на всех страницах
    $pages = ['index.html', 'hotel.html', 'special.html', 'sauna.html', 'banquet.html'];
    
    foreach ($pages as $page) {
        $html_file = '../' . $page;
        if (file_exists($html_file)) {
            $html_content = file_get_contents($html_file);
            
            // Обновляем адрес
            if (isset($content_data['contact_address'])) {
                $html_content = preg_replace('/г\. Москва, ул\. Лесная, д\. 10/', $content_data['contact_address'], $html_content);
            }
            
            // Обновляем телефон
            if (isset($content_data['contact_phone'])) {
                $html_content = preg_replace('/\+7 \(495\) 123-45-67/', $content_data['contact_phone'], $html_content);
            }
            
            // Обновляем email
            if (isset($content_data['contact_email'])) {
                $html_content = preg_replace('/info@lesnoy-dvorik\.ru/', $content_data['contact_email'], $html_content);
            }
            
            // Обновляем API-ключ Яндекс.Карт
            if (isset($content_data['map_api_key'])) {
                $html_content = preg_replace('/apikey=([^&]*)/', 'apikey=' . $content_data['map_api_key'], $html_content);
            }
            
            // Обновляем координаты на карте
            if (isset($content_data['map_coordinates'])) {
                $coordinates = explode(',', $content_data['map_coordinates']);
                if (count($coordinates) === 2) {
                    $lat = trim($coordinates[0]);
                    $lng = trim($coordinates[1]);
                    $html_content = preg_replace('/center: \[\d+\.\d+, \d+\.\d+\]/', 'center: [' . $lat . ', ' . $lng . ']', $html_content);
                    $html_content = preg_replace('/\[\d+\.\d+, \d+\.\d+\], {/', '[' . $lat . ', ' . $lng . '], {', $html_content);
                }
            }
            
            // Сохраняем обновленный HTML
            file_put_contents($html_file, $html_content);
        }
    }
}

// Функции для работы с программой лояльности
function getLoyaltyLevels($pdo) {
    $stmt = $pdo->query("SELECT * FROM loyalty_levels ORDER BY min_nights ASC");
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function getLoyaltyUsers($pdo, $limit = 10, $offset = 0) {
    $stmt = $pdo->prepare("SELECT u.*, 
                          (SELECT COUNT(*) FROM bookings WHERE user_id = u.id AND status = 'completed') as bookings_count,
                          (SELECT SUM(nights) FROM bookings WHERE user_id = u.id AND status = 'completed') as total_nights,
                          (SELECT l.name FROM loyalty_levels l WHERE l.min_nights <= (SELECT SUM(nights) FROM bookings WHERE user_id = u.id AND status = 'completed') ORDER BY l.min_nights DESC LIMIT 1) as loyalty_level
                          FROM users u
                          ORDER BY total_nights DESC
                          LIMIT :limit OFFSET :offset");
    $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
    $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function updateLoyaltyLevel($pdo, $level_id, $data) {
    $stmt = $pdo->prepare("UPDATE loyalty_levels SET 
                          name = :name, 
                          min_nights = :min_nights, 
                          discount_percent = :discount_percent,
                          description = :description
                          WHERE id = :id");
    $stmt->bindParam(':name', $data['name']);
    $stmt->bindParam(':min_nights', $data['min_nights']);
    $stmt->bindParam(':discount_percent', $data['discount_percent']);
    $stmt->bindParam(':description', $data['description']);
    $stmt->bindParam(':id', $level_id);
    return $stmt->execute();
}

function addLoyaltyLevel($pdo, $data) {
    $stmt = $pdo->prepare("INSERT INTO loyalty_levels (name, min_nights, discount_percent, description) 
                          VALUES (:name, :min_nights, :discount_percent, :description)");
    $stmt->bindParam(':name', $data['name']);
    $stmt->bindParam(':min_nights', $data['min_nights']);
    $stmt->bindParam(':discount_percent', $data['discount_percent']);
    $stmt->bindParam(':description', $data['description']);
    return $stmt->execute();
}

// Функции для работы с дополнительными услугами
function getServices($pdo) {
    $stmt = $pdo->query("SELECT * FROM services ORDER BY sort_order ASC");
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function getService($pdo, $service_id) {
    $stmt = $pdo->prepare("SELECT * FROM services WHERE id = :id");
    $stmt->bindParam(':id', $service_id);
    $stmt->execute();
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

function updateService($pdo, $service_id, $data) {
    $stmt = $pdo->prepare("UPDATE services SET 
                          name = :name, 
                          description = :description, 
                          price = :price,
                          image_path = :image_path,
                          is_active = :is_active,
                          sort_order = :sort_order
                          WHERE id = :id");
    $stmt->bindParam(':name', $data['name']);
    $stmt->bindParam(':description', $data['description']);
    $stmt->bindParam(':price', $data['price']);
    $stmt->bindParam(':image_path', $data['image_path']);
    $stmt->bindParam(':is_active', $data['is_active']);
    $stmt->bindParam(':sort_order', $data['sort_order']);
    $stmt->bindParam(':id', $service_id);
    return $stmt->execute();
}

function addService($pdo, $data) {
    $stmt = $pdo->prepare("INSERT INTO services (name, description, price, image_path, is_active, sort_order) 
                          VALUES (:name, :description, :price, :image_path, :is_active, :sort_order)");
    $stmt->bindParam(':name', $data['name']);
    $stmt->bindParam(':description', $data['description']);
    $stmt->bindParam(':price', $data['price']);
    $stmt->bindParam(':image_path', $data['image_path']);
    $stmt->bindParam(':is_active', $data['is_active']);
    $stmt->bindParam(':sort_order', $data['sort_order']);
    return $stmt->execute();
}

function deleteService($pdo, $service_id) {
    $stmt = $pdo->prepare("DELETE FROM services WHERE id = :id");
    $stmt->bindParam(':id', $service_id);
    return $stmt->execute();
}

// Функции для работы с метапоисковиками
function getMetasearchSettings($pdo) {
    $stmt = $pdo->query("SELECT * FROM metasearch_settings");
    $settings = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $settings[$row['meta_key']] = $row['meta_value'];
    }
    return $settings;
}

function updateMetasearchSettings($pdo, $settings) {
    $pdo->beginTransaction();
    try {
        foreach ($settings as $key => $value) {
            $stmt = $pdo->prepare("INSERT INTO metasearch_settings (meta_key, meta_value) 
                                  VALUES (:key, :value)
                                  ON DUPLICATE KEY UPDATE meta_value = :value");
            $stmt->bindParam(':key', $key);
            $stmt->bindParam(':value', $value);
            $stmt->execute();
        }
        $pdo->commit();
        return true;
    } catch (Exception $e) {
        $pdo->rollBack();
        return false;
    }
}

// Функции для аналитики
// Функция getBookingStats() используется из db_config.php
// Не объявляем ее здесь, чтобы избежать конфликта

function getRoomOccupancy($pdo, $start_date, $end_date) {
    $stmt = $pdo->prepare("SELECT 
                          r.name as room_name,
                          COUNT(b.id) as bookings_count,
                          SUM(b.nights) as booked_nights,
                          (SUM(b.nights) / (DATEDIFF(:end_date, :start_date) * r.count)) * 100 as occupancy_percent
                          FROM rooms r
                          LEFT JOIN bookings b ON b.room_id = r.id AND b.status = 'completed' 
                              AND (b.check_in BETWEEN :start_date AND :end_date OR b.check_out BETWEEN :start_date AND :end_date)
                          GROUP BY r.id
                          ORDER BY occupancy_percent DESC");
    $stmt->bindParam(':start_date', $start_date);
    $stmt->bindParam(':end_date', $end_date);
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}
?> 