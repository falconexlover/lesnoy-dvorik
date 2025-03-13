/**
 * Скрипт для объединения и минификации CSS и JavaScript файлов
 * Гостиница "Лесной дворик"
 */

const fs = require('fs');
const path = require('path');
const { minify } = require('terser');
const CleanCSS = require('clean-css');
const glob = require('glob');

// Конфигурация
const config = {
    // Пути к исходным файлам
    css: {
        common: [
            'src/css/style.css',
            'src/css/components.css',
            'src/css/forms.css',
            'src/css/typography.css',
            'src/css/animations.css',
            'src/css/ui-components.css'
        ],
        pages: {
            'booking': [
                'src/css/form-enhancements.css'
            ],
            'gallery': [
                'src/css/gallery-style.css'
            ],
            'hotel': [
                'src/css/hotel-style.css'
            ]
        }
    },
    js: {
        common: [
            'src/js/script.js',
            'src/js/lazy-loading.js',
            'src/js/navigation-fix.js'
        ],
        pages: {
            'booking': [
                'src/js/booking.js'
            ],
            'gallery': [
                'src/js/gallery.js'
            ],
            'hotel': [
                'src/js/room-gallery.js'
            ]
        }
    },
    // Пути для выходных файлов
    output: {
        css: 'dist/css',
        js: 'dist/js'
    }
};

// Создание директорий для выходных файлов, если они не существуют
function ensureDirectoryExists(directory) {
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
    }
}

// Объединение и минификация CSS файлов
async function buildCSS() {
    console.log('Начинаю обработку CSS файлов...');
    ensureDirectoryExists(config.output.css);

    // Обработка общих CSS файлов
    const commonCssContent = config.css.common.map(file => fs.readFileSync(file, 'utf8')).join('\n');
    const minifiedCommonCss = new CleanCSS({ level: 2 }).minify(commonCssContent);
    
    fs.writeFileSync(path.join(config.output.css, 'common.min.css'), minifiedCommonCss.styles);
    console.log(`Создан файл common.min.css (${(minifiedCommonCss.stats.minifiedSize / 1024).toFixed(2)} KB)`);

    // Обработка CSS файлов для отдельных страниц
    for (const [page, files] of Object.entries(config.css.pages)) {
        if (files.length === 0) continue;

        const pageContent = files.map(file => fs.readFileSync(file, 'utf8')).join('\n');
        const minifiedPageCss = new CleanCSS({ level: 2 }).minify(pageContent);
        
        fs.writeFileSync(path.join(config.output.css, `${page}.min.css`), minifiedPageCss.styles);
        console.log(`Создан файл ${page}.min.css (${(minifiedPageCss.stats.minifiedSize / 1024).toFixed(2)} KB)`);
    }
}

// Объединение и минификация JavaScript файлов
async function buildJS() {
    console.log('Начинаю обработку JavaScript файлов...');
    ensureDirectoryExists(config.output.js);

    // Обработка общих JS файлов
    const commonJsContent = config.js.common.map(file => fs.readFileSync(file, 'utf8')).join('\n');
    const minifiedCommonJs = await minify(commonJsContent, { compress: true, mangle: true });
    
    fs.writeFileSync(path.join(config.output.js, 'common.min.js'), minifiedCommonJs.code);
    console.log(`Создан файл common.min.js (${(minifiedCommonJs.code.length / 1024).toFixed(2)} KB)`);

    // Обработка JS файлов для отдельных страниц
    for (const [page, files] of Object.entries(config.js.pages)) {
        if (files.length === 0) continue;

        const pageContent = files.map(file => fs.readFileSync(file, 'utf8')).join('\n');
        const minifiedPageJs = await minify(pageContent, { compress: true, mangle: true });
        
        fs.writeFileSync(path.join(config.output.js, `${page}.min.js`), minifiedPageJs.code);
        console.log(`Создан файл ${page}.min.js (${(minifiedPageJs.code.length / 1024).toFixed(2)} KB)`);
    }
}

// Копирование изображений и других статических файлов
function copyStaticFiles() {
    console.log('Копирую статические файлы...');
    
    // Создаем директории
    ensureDirectoryExists('dist/assets/images');
    ensureDirectoryExists('dist/assets/fonts');
    
    // Копируем изображения
    glob.sync('src/assets/images/**/*').forEach(file => {
        const dest = file.replace('src/', 'dist/');
        ensureDirectoryExists(path.dirname(dest));
        fs.copyFileSync(file, dest);
    });
    
    // Копируем шрифты
    glob.sync('src/assets/fonts/**/*').forEach(file => {
        const dest = file.replace('src/', 'dist/');
        ensureDirectoryExists(path.dirname(dest));
        fs.copyFileSync(file, dest);
    });
    
    console.log('Статические файлы скопированы.');
}

// Обновление ссылок на CSS и JS файлы в HTML файлах
function updateHtmlFiles() {
    console.log('Обновляю ссылки в HTML файлах...');
    
    // Обрабатываем все HTML файлы
    glob.sync('src/**/*.html').forEach(file => {
        let content = fs.readFileSync(file, 'utf8');
        const filename = path.basename(file, '.html');
        
        // Заменяем ссылки на CSS файлы
        content = content.replace(
            /<link rel="stylesheet" href="..\/css\/[^"]+\.css">\s*/g, 
            ''
        );
        
        // Добавляем минифицированные CSS файлы перед закрывающим тегом </head>
        let cssLinks = `<link rel="stylesheet" href="../css/common.min.css">`;
        if (Object.keys(config.css.pages).includes(filename)) {
            cssLinks += `\n    <link rel="stylesheet" href="../css/${filename}.min.css">`;
        }
        content = content.replace('</head>', `    ${cssLinks}\n</head>`);
        
        // Заменяем ссылки на JS файлы
        content = content.replace(
            /<script src="..\/js\/[^"]+\.js"><\/script>\s*/g, 
            ''
        );
        
        // Добавляем минифицированные JS файлы перед закрывающим тегом </body>
        let jsScripts = `<script src="../js/common.min.js"></script>`;
        if (Object.keys(config.js.pages).includes(filename)) {
            jsScripts += `\n    <script src="../js/${filename}.min.js"></script>`;
        }
        content = content.replace('</body>', `    ${jsScripts}\n</body>`);
        
        // Сохраняем обновленный файл в директорию dist
        const destFile = file.replace('src/', 'dist/');
        ensureDirectoryExists(path.dirname(destFile));
        fs.writeFileSync(destFile, content);
    });
    
    console.log('HTML файлы обновлены.');
}

// Основная функция сборки
async function build() {
    console.log('Начинаю сборку проекта...');
    
    try {
        // Очищаем директорию dist, если она существует
        if (fs.existsSync('dist')) {
            fs.rmSync('dist', { recursive: true, force: true });
        }
        
        // Создаем директорию dist
        ensureDirectoryExists('dist');
        
        // Выполняем задачи сборки
        await buildCSS();
        await buildJS();
        copyStaticFiles();
        updateHtmlFiles();
        
        console.log('Сборка проекта успешно завершена!');
    } catch (error) {
        console.error('Ошибка при сборке проекта:', error);
    }
}

// Запуск сборки
build(); 