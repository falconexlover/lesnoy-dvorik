<?php
/**
 * Скрипт для оптимизации изображений сайта
 * Обеспечивает сжатие, изменение размеров и создание webp-версий
 */

// Определяем флаг для защиты php-файлов от прямого доступа
define('APP_RUNNING', true);

// Настройки
$sourceDirectory = __DIR__ . '/../assets/images/original/';
$destinationDirectory = __DIR__ . '/../assets/images/';
$webpDirectory = __DIR__ . '/../assets/images/webp/';
$thumbnailsDirectory = __DIR__ . '/../assets/images/thumbnails/';

// Настройки размеров и качества
$quality = 85;
$maxWidth = 1920;
$maxHeight = 1080;
$thumbnailWidth = 320;
$thumbnailHeight = 240;

// Создаем необходимые директории если их нет
if (!is_dir($destinationDirectory)) mkdir($destinationDirectory, 0755, true);
if (!is_dir($webpDirectory)) mkdir($webpDirectory, 0755, true);
if (!is_dir($thumbnailsDirectory)) mkdir($thumbnailsDirectory, 0755, true);

// Получаем список файлов для обработки
$files = glob($sourceDirectory . '*.{jpg,jpeg,png,gif}', GLOB_BRACE);

// Функция логирования
function logMessage($message) {
    echo date('Y-m-d H:i:s') . " - $message" . PHP_EOL;
}

// Функция для оптимизации изображения
function optimizeImage($sourcePath, $destinationPath, $maxWidth, $maxHeight, $quality) {
    // Получаем информацию об изображении
    $imageInfo = getimagesize($sourcePath);
    if (!$imageInfo) {
        logMessage("Ошибка: не удалось получить информацию об изображении $sourcePath");
        return false;
    }
    
    $sourceWidth = $imageInfo[0];
    $sourceHeight = $imageInfo[1];
    $mimeType = $imageInfo['mime'];
    
    // Вычисляем новые размеры с сохранением пропорций
    if ($sourceWidth > $maxWidth || $sourceHeight > $maxHeight) {
        $ratio = min($maxWidth / $sourceWidth, $maxHeight / $sourceHeight);
        $newWidth = round($sourceWidth * $ratio);
        $newHeight = round($sourceHeight * $ratio);
    } else {
        $newWidth = $sourceWidth;
        $newHeight = $sourceHeight;
    }
    
    // Создаем изображение на основе типа файла
    switch ($mimeType) {
        case 'image/jpeg':
            $sourceImage = imagecreatefromjpeg($sourcePath);
            break;
        case 'image/png':
            $sourceImage = imagecreatefrompng($sourcePath);
            break;
        case 'image/gif':
            $sourceImage = imagecreatefromgif($sourcePath);
            break;
        default:
            logMessage("Ошибка: неподдерживаемый тип изображения $mimeType");
            return false;
    }
    
    if (!$sourceImage) {
        logMessage("Ошибка: не удалось создать изображение из файла $sourcePath");
        return false;
    }
    
    // Создаем новое изображение
    $newImage = imagecreatetruecolor($newWidth, $newHeight);
    
    // Сохраняем прозрачность для PNG и GIF
    if ($mimeType == 'image/png' || $mimeType == 'image/gif') {
        imagealphablending($newImage, false);
        imagesavealpha($newImage, true);
        $transparent = imagecolorallocatealpha($newImage, 255, 255, 255, 127);
        imagefilledrectangle($newImage, 0, 0, $newWidth, $newHeight, $transparent);
    }
    
    // Интерполируем новое изображение
    imagecopyresampled(
        $newImage, $sourceImage,
        0, 0, 0, 0,
        $newWidth, $newHeight, $sourceWidth, $sourceHeight
    );
    
    // Сохраняем оптимизированное изображение
    $success = false;
    switch ($mimeType) {
        case 'image/jpeg':
            $success = imagejpeg($newImage, $destinationPath, $quality);
            break;
        case 'image/png':
            // Для PNG используем более высокое качество сжатия (9 - максимальное сжатие)
            $pngQuality = floor(($quality - 10) / 10);
            $success = imagepng($newImage, $destinationPath, $pngQuality);
            break;
        case 'image/gif':
            $success = imagegif($newImage, $destinationPath);
            break;
    }
    
    // Освобождаем память
    imagedestroy($sourceImage);
    imagedestroy($newImage);
    
    return $success;
}

// Функция для создания WebP версии изображения
function createWebP($sourcePath, $destinationPath, $quality) {
    // Получаем информацию об изображении
    $imageInfo = getimagesize($sourcePath);
    if (!$imageInfo) {
        logMessage("Ошибка: не удалось получить информацию об изображении $sourcePath");
        return false;
    }
    
    $mimeType = $imageInfo['mime'];
    
    // Создаем изображение на основе типа файла
    switch ($mimeType) {
        case 'image/jpeg':
            $sourceImage = imagecreatefromjpeg($sourcePath);
            break;
        case 'image/png':
            $sourceImage = imagecreatefrompng($sourcePath);
            break;
        case 'image/gif':
            $sourceImage = imagecreatefromgif($sourcePath);
            break;
        default:
            logMessage("Ошибка: неподдерживаемый тип изображения $mimeType");
            return false;
    }
    
    if (!$sourceImage) {
        logMessage("Ошибка: не удалось создать изображение из файла $sourcePath");
        return false;
    }
    
    // Сохраняем прозрачность для PNG и GIF
    if ($mimeType == 'image/png' || $mimeType == 'image/gif') {
        imagepalettetotruecolor($sourceImage);
        imagealphablending($sourceImage, true);
        imagesavealpha($sourceImage, true);
    }
    
    // Создаем WebP версию
    $success = imagewebp($sourceImage, $destinationPath, $quality);
    
    // Освобождаем память
    imagedestroy($sourceImage);
    
    return $success;
}

// Обрабатываем все файлы
$processedCount = 0;
$errorCount = 0;

foreach ($files as $file) {
    $filename = basename($file);
    $newFilePath = $destinationDirectory . $filename;
    $webpFilePath = $webpDirectory . pathinfo($filename, PATHINFO_FILENAME) . '.webp';
    $thumbnailFilePath = $thumbnailsDirectory . $filename;
    
    logMessage("Обработка файла: $filename");
    
    // Оптимизируем основное изображение
    if (optimizeImage($file, $newFilePath, $maxWidth, $maxHeight, $quality)) {
        logMessage("  ✓ Оптимизировано основное изображение");
        $processedCount++;
        
        // Создаем WebP версию
        if (function_exists('imagewebp') && createWebP($newFilePath, $webpFilePath, $quality)) {
            logMessage("  ✓ Создана WebP версия");
        } else {
            logMessage("  ✕ Не удалось создать WebP версию");
            $errorCount++;
        }
        
        // Создаем миниатюру
        if (optimizeImage($file, $thumbnailFilePath, $thumbnailWidth, $thumbnailHeight, $quality)) {
            logMessage("  ✓ Создана миниатюра");
        } else {
            logMessage("  ✕ Не удалось создать миниатюру");
            $errorCount++;
        }
    } else {
        logMessage("  ✕ Не удалось оптимизировать изображение");
        $errorCount++;
    }
}

logMessage("Обработка завершена. Обработано успешно: $processedCount, с ошибками: $errorCount"); 