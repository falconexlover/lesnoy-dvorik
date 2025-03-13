<?php
/**
 * Модуль SEO для улучшения поисковой оптимизации сайта
 * Содержит функции для генерации микроразметки Schema.org, мета-тегов и работы с URL
 */

class SEOModule {
    // Базовая конфигурация
    private $siteName = 'Гостиница "Лесной дворик"';
    private $defaultDescription = 'Уютная гостиница в живописном месте. Комфортные номера, отличный сервис и доступные цены.';
    private $defaultImage = '/assets/images/hotel-exterior.jpg';
    private $baseUrl = 'https://lesnoy-dvorik.ru';
    private $db;

    /**
     * Инициализация модуля
     */
    public function __construct($db) {
        $this->db = $db;
    }

    /**
     * Получение SEO-данных для текущей страницы
     */
    public function getPageSEO($currentPage) {
        // Определение раздела по имени файла
        $section = pathinfo($currentPage, PATHINFO_FILENAME);
        
        // Получение данных из базы
        try {
            $stmt = $this->db->prepare(
                "SELECT title, meta_title, meta_description, meta_keywords FROM content WHERE section = ?"
            );
            $stmt->execute([$section]);
            $pageData = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Если данные найдены, используем их
            if ($pageData) {
                return [
                    'title' => !empty($pageData['meta_title']) ? $pageData['meta_title'] : $pageData['title'],
                    'description' => !empty($pageData['meta_description']) ? $pageData['meta_description'] : $this->defaultDescription,
                    'keywords' => !empty($pageData['meta_keywords']) ? $pageData['meta_keywords'] : '',
                    'section' => $section
                ];
            }
        } catch (PDOException $e) {
            error_log("Ошибка получения SEO данных: " . $e->getMessage());
        }
        
        // Если данные не найдены, возвращаем значения по умолчанию
        return [
            'title' => $this->siteName,
            'description' => $this->defaultDescription,
            'keywords' => 'гостиница, отель, Лесной дворик, номера, бронирование',
            'section' => $section
        ];
    }

    /**
     * Генерация канонического URL для страницы
     */
    public function getCanonicalUrl($currentPage) {
        $path = str_replace('index.php', '', $currentPage);
        return rtrim($this->baseUrl, '/') . '/' . ltrim($path, '/');
    }

    /**
     * Вывод базовых SEO мета-тегов
     */
    public function outputMetaTags($seoData) {
        echo '<meta name="description" content="' . htmlspecialchars($seoData['description'], ENT_QUOTES, 'UTF-8') . '">' . PHP_EOL;
        
        if (!empty($seoData['keywords'])) {
            echo '<meta name="keywords" content="' . htmlspecialchars($seoData['keywords'], ENT_QUOTES, 'UTF-8') . '">' . PHP_EOL;
        }
        
        echo '<link rel="canonical" href="' . $this->getCanonicalUrl($_SERVER['REQUEST_URI']) . '">' . PHP_EOL;
        
        // Open Graph мета-теги
        echo '<meta property="og:title" content="' . htmlspecialchars($seoData['title'], ENT_QUOTES, 'UTF-8') . '">' . PHP_EOL;
        echo '<meta property="og:description" content="' . htmlspecialchars($seoData['description'], ENT_QUOTES, 'UTF-8') . '">' . PHP_EOL;
        echo '<meta property="og:type" content="website">' . PHP_EOL;
        echo '<meta property="og:url" content="' . $this->getCanonicalUrl($_SERVER['REQUEST_URI']) . '">' . PHP_EOL;
        echo '<meta property="og:image" content="' . rtrim($this->baseUrl, '/') . $this->defaultImage . '">' . PHP_EOL;
        echo '<meta property="og:site_name" content="' . htmlspecialchars($this->siteName, ENT_QUOTES, 'UTF-8') . '">' . PHP_EOL;
        
        // Twitter мета-теги
        echo '<meta name="twitter:card" content="summary_large_image">' . PHP_EOL;
        echo '<meta name="twitter:title" content="' . htmlspecialchars($seoData['title'], ENT_QUOTES, 'UTF-8') . '">' . PHP_EOL;
        echo '<meta name="twitter:description" content="' . htmlspecialchars($seoData['description'], ENT_QUOTES, 'UTF-8') . '">' . PHP_EOL;
        echo '<meta name="twitter:image" content="' . rtrim($this->baseUrl, '/') . $this->defaultImage . '">' . PHP_EOL;
    }
    
    /**
     * Генерация микроразметки Schema.org для гостиницы
     */
    public function generateHotelSchema() {
        // Формирование данных для микроразметки отеля
        $schema = [
            '@context' => 'https://schema.org',
            '@type' => 'Hotel',
            'name' => $this->siteName,
            'description' => $this->defaultDescription,
            'url' => $this->baseUrl,
            'image' => rtrim($this->baseUrl, '/') . $this->defaultImage,
            'address' => [
                '@type' => 'PostalAddress',
                'streetAddress' => 'ул. Туполева, 18',
                'addressLocality' => 'Жуковский',
                'addressRegion' => 'Московская область',
                'postalCode' => '140180',
                'addressCountry' => 'RU'
            ],
            'telephone' => '+7 (915) 120-17-44',
            'priceRange' => '₽₽',
            'amenityFeature' => [
                ['@type' => 'LocationFeatureSpecification', 'name' => 'Бесплатный Wi-Fi'],
                ['@type' => 'LocationFeatureSpecification', 'name' => 'Сауна'],
                ['@type' => 'LocationFeatureSpecification', 'name' => 'Парковка'],
                ['@type' => 'LocationFeatureSpecification', 'name' => 'Конференц-зал']
            ]
        ];
        
        // Добавление информации о номерах
        try {
            $stmt = $this->db->prepare("SELECT name, description, price FROM rooms WHERE active = 1");
            $stmt->execute();
            $rooms = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            if ($rooms) {
                $schema['containsPlace'] = [];
                
                foreach ($rooms as $room) {
                    $schema['containsPlace'][] = [
                        '@type' => 'HotelRoom',
                        'name' => $room['name'],
                        'description' => $room['description'],
                        'amenityFeature' => [
                            ['@type' => 'LocationFeatureSpecification', 'name' => 'Телевизор'],
                            ['@type' => 'LocationFeatureSpecification', 'name' => 'Душ'],
                            ['@type' => 'LocationFeatureSpecification', 'name' => 'Холодильник']
                        ],
                        'offers' => [
                            '@type' => 'Offer',
                            'price' => $room['price'],
                            'priceCurrency' => 'RUB',
                            'availability' => 'https://schema.org/InStock'
                        ]
                    ];
                }
            }
        } catch (PDOException $e) {
            error_log("Ошибка получения данных о номерах: " . $e->getMessage());
        }
        
        // Вывод микроразметки
        echo '<script type="application/ld+json">' . PHP_EOL;
        echo json_encode($schema, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        echo PHP_EOL . '</script>' . PHP_EOL;
    }
    
    /**
     * Генерация микроразметки для организации
     */
    public function generateOrganizationSchema() {
        $schema = [
            '@context' => 'https://schema.org',
            '@type' => 'Organization',
            'name' => $this->siteName,
            'url' => $this->baseUrl,
            'logo' => rtrim($this->baseUrl, '/') . '/assets/images/logo.png',
            'contactPoint' => [
                '@type' => 'ContactPoint',
                'telephone' => '+7 (915) 120-17-44',
                'contactType' => 'customer service',
                'availableLanguage' => ['Russian', 'English']
            ],
            'sameAs' => [
                'https://vk.com/lesoydvorik',
                'https://www.instagram.com/lesnoy_dvorik/'
            ]
        ];
        
        echo '<script type="application/ld+json">' . PHP_EOL;
        echo json_encode($schema, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        echo PHP_EOL . '</script>' . PHP_EOL;
    }
    
    /**
     * Генерация XML-карты сайта
     */
    public function generateSitemap() {
        header('Content-Type: application/xml; charset=utf-8');
        
        echo '<?xml version="1.0" encoding="UTF-8"?>' . PHP_EOL;
        echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . PHP_EOL;
        
        // Получение списка страниц из базы
        try {
            $stmt = $this->db->prepare("SELECT section, last_modified FROM content WHERE active = 1");
            $stmt->execute();
            $pages = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Добавление главной страницы
            echo '<url>' . PHP_EOL;
            echo '  <loc>' . htmlspecialchars($this->baseUrl, ENT_XML1) . '</loc>' . PHP_EOL;
            echo '  <lastmod>' . date('Y-m-d') . '</lastmod>' . PHP_EOL;
            echo '  <changefreq>weekly</changefreq>' . PHP_EOL;
            echo '  <priority>1.0</priority>' . PHP_EOL;
            echo '</url>' . PHP_EOL;
            
            // Добавление остальных страниц
            foreach ($pages as $page) {
                echo '<url>' . PHP_EOL;
                echo '  <loc>' . htmlspecialchars($this->baseUrl . '/' . $page['section'] . '.html', ENT_XML1) . '</loc>' . PHP_EOL;
                
                if (!empty($page['last_modified'])) {
                    echo '  <lastmod>' . date('Y-m-d', strtotime($page['last_modified'])) . '</lastmod>' . PHP_EOL;
                } else {
                    echo '  <lastmod>' . date('Y-m-d') . '</lastmod>' . PHP_EOL;
                }
                
                echo '  <changefreq>monthly</changefreq>' . PHP_EOL;
                echo '  <priority>0.8</priority>' . PHP_EOL;
                echo '</url>' . PHP_EOL;
            }
        } catch (PDOException $e) {
            error_log("Ошибка генерации sitemap: " . $e->getMessage());
        }
        
        echo '</urlset>';
    }
} 