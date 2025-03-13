/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js,php}",
    "./src/pages/**/*.{html,js,php}",
    "./src/components/**/*.{html,js,php}",
    "./src/includes/**/*.{html,js,php}"
  ],
  theme: {
    extend: {
      colors: {
        'primary': {
          DEFAULT: '#217148',
          'dark': '#185a39',
          'light': '#C8E6C9'
        },
        'accent': '#FF9800',
        'text': '#333333',
        'background': '#FFFFFF'
      },
      fontFamily: {
        'primary': ['Roboto', 'Arial', 'sans-serif'],
        'secondary': ['Playfair Display', 'serif']
      },
      boxShadow: {
        'light': '0 2px 5px rgba(0, 0, 0, 0.1)'
      },
      screens: {
        'xs': '480px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      },
    },
  },
  plugins: [],
} 