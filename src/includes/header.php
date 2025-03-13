<?php
/**
 * Шапка сайта для гостиницы "Лесной дворик"
 */

// Подключение конфигурации базы данных
require_once 'db_config.php';

// Получение настроек сайта
$settings = [];
try {
    $settingsData = fetchAll("SELECT setting_key, setting_value FROM settings");
    
    foreach ($settingsData as $setting) {
        $key = $setting['setting_key'];
        $value = $setting['setting_value'];
        
        // Попытка декодировать JSON, если это возможно
        $jsonValue = json_decode($value, true);
        if (json_last_error() === JSON_ERROR_NONE) {
            $settings[$key] = $jsonValue;
        } else {
            $settings[$key] = $value;
        }
    }
} catch (Exception $e) {
    error_log("Ошибка при получении настроек сайта: " . $e->getMessage());
}

// Определение текущей страницы
$currentPage = basename($_SERVER['PHP_SELF']);

// Получение заголовка и мета-данных для текущей страницы
$pageTitle = 'Гостиница "Лесной дворик"';
$metaDescription = 'Уютная гостиница в живописном месте. Комфортные номера, отличный сервис и доступные цены.';

// Если это не главная страница, получаем данные из базы
if ($currentPage !== 'index.php') {
    $section = pathinfo($currentPage, PATHINFO_FILENAME);
    
    try {
        $pageData = fetchOne(
            "SELECT title, meta_title, meta_description FROM content WHERE section = ?", 
            [$section]
        );
        
        if ($pageData) {
            $pageTitle = !empty($pageData['meta_title']) ? $pageData['meta_title'] : $pageData['title'];
            $metaDescription = !empty($pageData['meta_description']) ? $pageData['meta_description'] : $metaDescription;
        }
    } catch (Exception $e) {
        error_log("Ошибка при получении данных страницы: " . $e->getMessage());
    }
}

// Получение пунктов меню
$menuItems = [];
try {
    $menuItems = fetchAll(
        "SELECT title, url, parent_id, sort_order FROM menu WHERE is_active = 1 ORDER BY parent_id, sort_order"
    );
} catch (Exception $e) {
    error_log("Ошибка при получении пунктов меню: " . $e->getMessage());
}

// Формирование древовидной структуры меню
$menu = [];
$submenu = [];

foreach ($menuItems as $item) {
    if ($item['parent_id'] == 0) {
        $menu[] = $item;
    } else {
        if (!isset($submenu[$item['parent_id']])) {
            $submenu[$item['parent_id']] = [];
        }
        $submenu[$item['parent_id']][] = $item;
    }
}
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo htmlspecialchars($pageTitle); ?></title>
    <meta name="description" content="<?php echo htmlspecialchars($metaDescription); ?>">
    
    <!-- Favicon -->
    <link rel="icon" href="/src/img/favicon.ico" type="image/x-icon">
    <link rel="shortcut icon" href="/src/img/favicon.ico" type="image/x-icon">
    
    <!-- Стили -->
    <link rel="stylesheet" href="/src/css/style.css">
    <?php if ($currentPage === 'privacy.php'): ?>
    <link rel="stylesheet" href="/src/css/privacy-style.css">
    <?php endif; ?>
    <?php if (in_array($currentPage, ['404.php', '500.php'])): ?>
    <link rel="stylesheet" href="/src/css/error-style.css">
    <?php endif; ?>
    
    <!-- Шрифты -->
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet">
    
    <!-- Open Graph мета-теги -->
    <meta property="og:title" content="<?php echo htmlspecialchars($pageTitle); ?>">
    <meta property="og:description" content="<?php echo htmlspecialchars($metaDescription); ?>">
    <meta property="og:image" content="<?php echo isset($settings['og_image']) ? htmlspecialchars($settings['og_image']) : '/src/img/hotel-og.jpg'; ?>">
    <meta property="og:url" content="<?php echo 'https://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI']; ?>">
    <meta property="og:type" content="website">
    
    <!-- Структурированные данные для гостиницы -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "Hotel",
        "name": "Гостиница \"Лесной дворик\"",
        "description": "<?php echo htmlspecialchars($metaDescription); ?>",
        "url": "<?php echo 'https://' . $_SERVER['HTTP_HOST']; ?>",
        "image": "<?php echo isset($settings['og_image']) ? htmlspecialchars($settings['og_image']) : '/src/img/hotel-og.jpg'; ?>",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "<?php echo isset($settings['address']) ? htmlspecialchars($settings['address']) : ''; ?>",
            "addressLocality": "<?php echo isset($settings['city']) ? htmlspecialchars($settings['city']) : ''; ?>",
            "postalCode": "<?php echo isset($settings['postal_code']) ? htmlspecialchars($settings['postal_code']) : ''; ?>",
            "addressCountry": "RU"
        },
        "telephone": "<?php echo isset($settings['phone']) ? htmlspecialchars($settings['phone']) : ''; ?>",
        "priceRange": "$$"
    }
    </script>
</head>
<body>
    <header class="header">
        <div class="container">
            <div class="header-inner">
                <div class="logo">
                    <a href="/">
                        <img src="/src/img/logo.png" alt="Гостиница Лесной дворик" width="150" height="50">
                    </a>
                </div>
                
                <nav class="main-menu">
                    <ul class="menu">
                        <?php foreach ($menu as $item): ?>
                            <li class="menu-item <?php echo isset($submenu[$item['id']]) ? 'has-dropdown' : ''; ?> <?php echo strpos($_SERVER['REQUEST_URI'], $item['url']) !== false ? 'active' : ''; ?>">
                                <a href="<?php echo htmlspecialchars($item['url']); ?>"><?php echo htmlspecialchars($item['title']); ?></a>
                                
                                <?php if (isset($submenu[$item['id']])): ?>
                                <ul class="dropdown">
                                    <?php foreach ($submenu[$item['id']] as $subitem): ?>
                                    <li class="<?php echo $_SERVER['REQUEST_URI'] === $subitem['url'] ? 'active' : ''; ?>">
                                        <a href="<?php echo htmlspecialchars($subitem['url']); ?>"><?php echo htmlspecialchars($subitem['title']); ?></a>
                                    </li>
                                    <?php endforeach; ?>
                                </ul>
                                <?php endif; ?>
                            </li>
                        <?php endforeach; ?>
                    </ul>
                </nav>
                
                <div class="header-contacts">
                    <?php if (isset($settings['phone'])): ?>
                    <a href="tel:<?php echo preg_replace('/[^0-9+]/', '', $settings['phone']); ?>" class="phone">
                        <?php echo htmlspecialchars($settings['phone']); ?>
                    </a>
                    <?php endif; ?>
                    
                    <button class="btn-primary book-btn">Забронировать</button>
                </div>
                
                <div class="mobile-menu-toggle">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </div>
    </header>
    
    <div class="mobile-menu">
        <div class="container">
            <ul class="mobile-menu-list">
                <?php foreach ($menu as $item): ?>
                    <li class="mobile-menu-item <?php echo strpos($_SERVER['REQUEST_URI'], $item['url']) !== false ? 'active' : ''; ?>">
                        <a href="<?php echo htmlspecialchars($item['url']); ?>"><?php echo htmlspecialchars($item['title']); ?></a>
                        
                        <?php if (isset($submenu[$item['id']])): ?>
                        <ul class="mobile-submenu">
                            <?php foreach ($submenu[$item['id']] as $subitem): ?>
                            <li class="<?php echo $_SERVER['REQUEST_URI'] === $subitem['url'] ? 'active' : ''; ?>">
                                <a href="<?php echo htmlspecialchars($subitem['url']); ?>"><?php echo htmlspecialchars($subitem['title']); ?></a>
                            </li>
                            <?php endforeach; ?>
                        </ul>
                        <?php endif; ?>
                    </li>
                <?php endforeach; ?>
            </ul>
            
            <?php if (isset($settings['phone'])): ?>
            <div class="mobile-contacts">
                <a href="tel:<?php echo preg_replace('/[^0-9+]/', '', $settings['phone']); ?>" class="mobile-phone">
                    <?php echo htmlspecialchars($settings['phone']); ?>
                </a>
                <button class="btn-primary mobile-book-btn">Забронировать</button>
            </div>
            <?php endif; ?>
        </div>
    </div>
    
    <main class="main-content"> 