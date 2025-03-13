<?php
// Проверка авторизации
if (!isAdminLoggedIn()) {
    header('Location: index.php');
    exit;
}

// Получаем настройки метапоисковиков
$metasearchSettings = getMetasearchSettings($pdo);

// Значения по умолчанию
$defaultSettings = [
    'google_hotel_ads_enabled' => '0',
    'google_hotel_ads_id' => '',
    'google_hotel_ads_feed_url' => '',
    'yandex_travel_enabled' => '0',
    'yandex_travel_id' => '',
    'yandex_travel_feed_url' => '',
    'trivago_enabled' => '0',
    'trivago_id' => '',
    'trivago_feed_url' => '',
    'tripadvisor_enabled' => '0',
    'tripadvisor_id' => '',
    'tripadvisor_feed_url' => '',
    'booking_com_enabled' => '0',
    'booking_com_id' => '',
    'booking_com_feed_url' => ''
];

// Объединяем настройки из БД с настройками по умолчанию
$settings = array_merge($defaultSettings, $metasearchSettings);
?>

<div class="content-wrapper">
    <div class="content-header">
        <h1>Интеграция с метапоисковиками</h1>
        <p>Настройка интеграции с популярными метапоисковиками для увеличения прямых бронирований</p>
    </div>
    
    <div class="content-body">
        <?php if (isset($message)): ?>
            <div class="alert alert-<?php echo $message_type; ?>">
                <?php echo $message; ?>
            </div>
        <?php endif; ?>
        
        <div class="alert alert-info">
            <i class="fa fa-info-circle"></i> Метапоисковики позволяют показывать цены вашего официального сайта в результатах поиска, что увеличивает количество прямых бронирований. Для настройки интеграции вам потребуется зарегистрироваться в соответствующих сервисах и получить идентификаторы.
        </div>
        
        <form action="index.php?action=save_metasearch_settings" method="post" class="metasearch-form">
            <div class="row">
                <div class="col-md-6">
                    <div class="card mb-4">
                        <div class="card-header">
                            <h3>Google Hotel Ads</h3>
                        </div>
                        <div class="card-body">
                            <div class="form-group">
                                <div class="custom-control custom-switch">
                                    <input type="checkbox" class="custom-control-input" id="google_hotel_ads_enabled" 
                                           name="settings[google_hotel_ads_enabled]" value="1" 
                                           <?php echo $settings['google_hotel_ads_enabled'] ? 'checked' : ''; ?>>
                                    <label class="custom-control-label" for="google_hotel_ads_enabled">Включить интеграцию с Google Hotel Ads</label>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="google_hotel_ads_id">Идентификатор отеля в Google:</label>
                                <input type="text" class="form-control" id="google_hotel_ads_id" 
                                       name="settings[google_hotel_ads_id]" 
                                       value="<?php echo htmlspecialchars($settings['google_hotel_ads_id']); ?>">
                            </div>
                            
                            <div class="form-group">
                                <label for="google_hotel_ads_feed_url">URL фида цен:</label>
                                <input type="url" class="form-control" id="google_hotel_ads_feed_url" 
                                       name="settings[google_hotel_ads_feed_url]" 
                                       value="<?php echo htmlspecialchars($settings['google_hotel_ads_feed_url']); ?>">
                            </div>
                            
                            <div class="form-text text-muted">
                                <p><i class="fa fa-external-link-alt"></i> <a href="https://support.google.com/hotelprices/answer/6101897" target="_blank">Подробнее о настройке Google Hotel Ads</a></p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card mb-4">
                        <div class="card-header">
                            <h3>Яндекс.Путешествия</h3>
                        </div>
                        <div class="card-body">
                            <div class="form-group">
                                <div class="custom-control custom-switch">
                                    <input type="checkbox" class="custom-control-input" id="yandex_travel_enabled" 
                                           name="settings[yandex_travel_enabled]" value="1" 
                                           <?php echo $settings['yandex_travel_enabled'] ? 'checked' : ''; ?>>
                                    <label class="custom-control-label" for="yandex_travel_enabled">Включить интеграцию с Яндекс.Путешествия</label>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="yandex_travel_id">Идентификатор отеля в Яндекс:</label>
                                <input type="text" class="form-control" id="yandex_travel_id" 
                                       name="settings[yandex_travel_id]" 
                                       value="<?php echo htmlspecialchars($settings['yandex_travel_id']); ?>">
                            </div>
                            
                            <div class="form-group">
                                <label for="yandex_travel_feed_url">URL фида цен:</label>
                                <input type="url" class="form-control" id="yandex_travel_feed_url" 
                                       name="settings[yandex_travel_feed_url]" 
                                       value="<?php echo htmlspecialchars($settings['yandex_travel_feed_url']); ?>">
                            </div>
                            
                            <div class="form-text text-muted">
                                <p><i class="fa fa-external-link-alt"></i> <a href="https://yandex.ru/dev/travel/doc/ru/concepts/about" target="_blank">Подробнее о настройке Яндекс.Путешествия</a></p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="col-md-6">
                    <div class="card mb-4">
                        <div class="card-header">
                            <h3>Trivago</h3>
                        </div>
                        <div class="card-body">
                            <div class="form-group">
                                <div class="custom-control custom-switch">
                                    <input type="checkbox" class="custom-control-input" id="trivago_enabled" 
                                           name="settings[trivago_enabled]" value="1" 
                                           <?php echo $settings['trivago_enabled'] ? 'checked' : ''; ?>>
                                    <label class="custom-control-label" for="trivago_enabled">Включить интеграцию с Trivago</label>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="trivago_id">Идентификатор отеля в Trivago:</label>
                                <input type="text" class="form-control" id="trivago_id" 
                                       name="settings[trivago_id]" 
                                       value="<?php echo htmlspecialchars($settings['trivago_id']); ?>">
                            </div>
                            
                            <div class="form-group">
                                <label for="trivago_feed_url">URL фида цен:</label>
                                <input type="url" class="form-control" id="trivago_feed_url" 
                                       name="settings[trivago_feed_url]" 
                                       value="<?php echo htmlspecialchars($settings['trivago_feed_url']); ?>">
                            </div>
                            
                            <div class="form-text text-muted">
                                <p><i class="fa fa-external-link-alt"></i> <a href="https://www.trivago.com/hotelmanager" target="_blank">Подробнее о настройке Trivago</a></p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card mb-4">
                        <div class="card-header">
                            <h3>TripAdvisor</h3>
                        </div>
                        <div class="card-body">
                            <div class="form-group">
                                <div class="custom-control custom-switch">
                                    <input type="checkbox" class="custom-control-input" id="tripadvisor_enabled" 
                                           name="settings[tripadvisor_enabled]" value="1" 
                                           <?php echo $settings['tripadvisor_enabled'] ? 'checked' : ''; ?>>
                                    <label class="custom-control-label" for="tripadvisor_enabled">Включить интеграцию с TripAdvisor</label>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="tripadvisor_id">Идентификатор отеля в TripAdvisor:</label>
                                <input type="text" class="form-control" id="tripadvisor_id" 
                                       name="settings[tripadvisor_id]" 
                                       value="<?php echo htmlspecialchars($settings['tripadvisor_id']); ?>">
                            </div>
                            
                            <div class="form-group">
                                <label for="tripadvisor_feed_url">URL фида цен:</label>
                                <input type="url" class="form-control" id="tripadvisor_feed_url" 
                                       name="settings[tripadvisor_feed_url]" 
                                       value="<?php echo htmlspecialchars($settings['tripadvisor_feed_url']); ?>">
                            </div>
                            
                            <div class="form-text text-muted">
                                <p><i class="fa fa-external-link-alt"></i> <a href="https://www.tripadvisor.com/business/direct-connect" target="_blank">Подробнее о настройке TripAdvisor</a></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row">
                <div class="col-md-12">
                    <div class="card mb-4">
                        <div class="card-header">
                            <h3>Booking.com</h3>
                        </div>
                        <div class="card-body">
                            <div class="form-group">
                                <div class="custom-control custom-switch">
                                    <input type="checkbox" class="custom-control-input" id="booking_com_enabled" 
                                           name="settings[booking_com_enabled]" value="1" 
                                           <?php echo $settings['booking_com_enabled'] ? 'checked' : ''; ?>>
                                    <label class="custom-control-label" for="booking_com_enabled">Включить интеграцию с Booking.com</label>
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="booking_com_id">Идентификатор отеля в Booking.com:</label>
                                <input type="text" class="form-control" id="booking_com_id" 
                                       name="settings[booking_com_id]" 
                                       value="<?php echo htmlspecialchars($settings['booking_com_id']); ?>">
                            </div>
                            
                            <div class="form-group">
                                <label for="booking_com_feed_url">URL фида цен:</label>
                                <input type="url" class="form-control" id="booking_com_feed_url" 
                                       name="settings[booking_com_feed_url]" 
                                       value="<?php echo htmlspecialchars($settings['booking_com_feed_url']); ?>">
                            </div>
                            
                            <div class="form-text text-muted">
                                <p><i class="fa fa-external-link-alt"></i> <a href="https://www.booking.com/hotel/extranet" target="_blank">Подробнее о настройке Booking.com</a></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="form-actions">
                <button type="submit" class="btn btn-primary">
                    <i class="fa fa-save"></i> Сохранить настройки
                </button>
            </div>
        </form>
        
        <div class="row mt-4">
            <div class="col-md-12">
                <div class="card">
                    <div class="card-header">
                        <h3>Генерация фидов для метапоисковиков</h3>
                    </div>
                    <div class="card-body">
                        <p>Для работы с метапоисковиками необходимо предоставить им фид с ценами и доступностью номеров. Вы можете сгенерировать фиды для каждого метапоисковика, нажав на соответствующую кнопку ниже.</p>
                        
                        <div class="btn-group">
                            <a href="index.php?action=generate_feed&type=google" class="btn btn-outline-primary">
                                <i class="fa fa-google"></i> Google Hotel Ads
                            </a>
                            <a href="index.php?action=generate_feed&type=yandex" class="btn btn-outline-primary">
                                <i class="fa fa-yandex"></i> Яндекс.Путешествия
                            </a>
                            <a href="index.php?action=generate_feed&type=trivago" class="btn btn-outline-primary">
                                <i class="fa fa-hotel"></i> Trivago
                            </a>
                            <a href="index.php?action=generate_feed&type=tripadvisor" class="btn btn-outline-primary">
                                <i class="fa fa-tripadvisor"></i> TripAdvisor
                            </a>
                            <a href="index.php?action=generate_feed&type=booking" class="btn btn-outline-primary">
                                <i class="fa fa-bed"></i> Booking.com
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div> 