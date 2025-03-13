#!/bin/bash

# Скрипт для синхронизации исходных файлов из src в dist
# Автоматически копирует все CSS и JS файлы

# Создаем директории если они не существуют
mkdir -p dist/css
mkdir -p dist/js
mkdir -p dist/assets/images
mkdir -p dist/assets/fonts
mkdir -p dist/pages
mkdir -p dist/errors

# Копируем основные HTML файлы
echo "Копирование HTML файлов..."
cp src/index.html dist/
cp src/offline.html dist/
cp src/manifest.json dist/
cp src/service-worker.js dist/

# Копируем JS файлы
echo "Копирование JavaScript файлов..."
find src/js -name "*.js" -type f -exec cp {} dist/js/ \;

# Копируем CSS файлы
echo "Копирование CSS файлов..."
find src/css -name "*.css" -type f -exec cp {} dist/css/ \;

# Проверяем существование файла favicon.ico
if [ ! -f dist/assets/images/favicon.ico ]; then
  echo "Создание ссылки на favicon..."
  if [ -f src/assets/favicon/favicon.ico ]; then
    cp src/assets/favicon/favicon.ico dist/assets/images/
  elif [ -f public/assets/favicon/favicon.ico ]; then
    cp public/assets/favicon/favicon.ico dist/assets/images/
  else
    echo "ВНИМАНИЕ: Favicon не найден в исходных директориях"
  fi
fi

# Создаем символическую ссылку favicon.ico в корневой директории
ln -sf assets/images/favicon.ico dist/favicon.ico

# Копируем изображения если они еще не существуют
echo "Копирование изображений..."
if [ ! -d dist/assets/images/gallery ]; then
  mkdir -p dist/assets/images/gallery
  cp -r src/assets/images/gallery dist/assets/images/
fi

# Копируем логотипы и иконки
find src/assets/images -name "logo*.png" -o -name "icon*.png" -exec cp {} dist/assets/images/ \;

echo "Синхронизация завершена!" 