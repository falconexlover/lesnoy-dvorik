/**
 * Скрипт для оптимизации изображений
 * 
 * Этот скрипт оптимизирует все изображения в директории assets/images
 * и создает их версии разных размеров для адаптивной загрузки.
 * 
 * Для запуска: node scripts/optimize-images.js
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const glob = require('glob');

// Конфигурация
const config = {
    // Исходная директория с изображениями
    sourceDir: 'src/assets/images',
    
    // Директория для оптимизированных изображений
    outputDir: 'public/assets/images',
    
    // Размеры для адаптивных изображений
    sizes: [
        { width: 320, suffix: 'xs' },
        { width: 640, suffix: 'sm' },
        { width: 960, suffix: 'md' },
        { width: 1280, suffix: 'lg' },
        { width: 1920, suffix: 'xl' }
    ],
    
    // Качество JPEG (0-100)
    jpegQuality: 80,
    
    // Качество WebP (0-100)
    webpQuality: 75,
    
    // Уровень сжатия PNG (0-9)
    pngCompressionLevel: 8
};

// Создаем выходную директорию, если она не существует
if (!fs.existsSync(config.outputDir)) {
    fs.mkdirSync(config.outputDir, { recursive: true });
}

// Получаем список всех изображений
const imageFiles = glob.sync(`${config.sourceDir}/**/*.{jpg,jpeg,png,gif}`);

// Функция для оптимизации изображения
async function optimizeImage(imagePath) {
    const filename = path.basename(imagePath);
    const ext = path.extname(filename).toLowerCase();
    const name = path.basename(filename, ext);
    const relativePath = path.relative(config.sourceDir, path.dirname(imagePath));
    const outputPath = path.join(config.outputDir, relativePath);
    
    // Создаем выходную директорию, если она не существует
    if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath, { recursive: true });
    }
    
    // Загружаем изображение
    const image = sharp(imagePath);
    const metadata = await image.metadata();
    
    // Оптимизируем оригинальное изображение
    if (ext === '.jpg' || ext === '.jpeg') {
        await image
            .jpeg({ quality: config.jpegQuality })
            .toFile(path.join(outputPath, filename));
        
        // Создаем WebP версию
        await image
            .webp({ quality: config.webpQuality })
            .toFile(path.join(outputPath, `${name}.webp`));
    } else if (ext === '.png') {
        await image
            .png({ compressionLevel: config.pngCompressionLevel })
            .toFile(path.join(outputPath, filename));
        
        // Создаем WebP версию
        await image
            .webp({ quality: config.webpQuality })
            .toFile(path.join(outputPath, `${name}.webp`));
    } else if (ext === '.gif') {
        // Просто копируем GIF-файлы
        fs.copyFileSync(imagePath, path.join(outputPath, filename));
    }
    
    // Создаем адаптивные версии изображений
    for (const size of config.sizes) {
        // Пропускаем, если оригинальное изображение меньше
        if (metadata.width <= size.width) continue;
        
        const resizedImage = image.resize(size.width);
        
        if (ext === '.jpg' || ext === '.jpeg') {
            await resizedImage
                .jpeg({ quality: config.jpegQuality })
                .toFile(path.join(outputPath, `${name}-${size.suffix}${ext}`));
            
            await resizedImage
                .webp({ quality: config.webpQuality })
                .toFile(path.join(outputPath, `${name}-${size.suffix}.webp`));
        } else if (ext === '.png') {
            await resizedImage
                .png({ compressionLevel: config.pngCompressionLevel })
                .toFile(path.join(outputPath, `${name}-${size.suffix}${ext}`));
            
            await resizedImage
                .webp({ quality: config.webpQuality })
                .toFile(path.join(outputPath, `${name}-${size.suffix}.webp`));
        }
    }
    
    console.log(`Оптимизировано: ${imagePath}`);
}

// Обрабатываем все изображения
async function processAllImages() {
    console.log(`Найдено ${imageFiles.length} изображений для оптимизации...`);
    
    for (const imagePath of imageFiles) {
        try {
            await optimizeImage(imagePath);
        } catch (error) {
            console.error(`Ошибка при оптимизации ${imagePath}:`, error);
        }
    }
    
    console.log('Оптимизация изображений завершена!');
}

// Запускаем обработку
processAllImages().catch(error => {
    console.error('Произошла ошибка:', error);
    process.exit(1);
}); 