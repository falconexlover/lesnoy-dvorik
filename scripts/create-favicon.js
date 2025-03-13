// Скрипт для создания favicon.ico
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const sizes = [16, 32, 48, 64];
const outputDir = path.join(__dirname, '../dist');

// Убедимся, что директория существует
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Создание простого зеленого квадрата с буквой "Л"
async function createFavicon() {
  try {
    // Создаем основной квадрат зеленого цвета
    const size = 64;
    const background = '#3a8c5f';
    const textColor = '#ffffff';
    
    const svg = `
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${size}" height="${size}" fill="${background}" />
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="40" 
              fill="${textColor}" text-anchor="middle" dominant-baseline="middle">
          Л
        </text>
      </svg>
    `;
    
    // Создаем PNG 64x64
    await sharp(Buffer.from(svg))
      .png()
      .toFile(path.join(outputDir, 'favicon.png'));
      
    console.log('Favicon PNG создан успешно');
    
    // Копируем файл как favicon.ico
    fs.copyFileSync(
      path.join(outputDir, 'favicon.png'),
      path.join(outputDir, 'favicon.ico')
    );
    
    console.log('Favicon ICO создан успешно');
  } catch (error) {
    console.error('Ошибка при создании favicon:', error);
  }
}

createFavicon(); 