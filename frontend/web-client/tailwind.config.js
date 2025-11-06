/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#FFCD42',
                    50: '#FFF9E6',
                    100: '#FFF3CC',
                    200: '#FFE799',
                    300: '#FFDB66',
                    400: '#FFCF33',
                    500: '#FFCD42',
                    600: '#FFBF00',
                    700: '#CC9900',
                    800: '#997300',
                    900: '#664D00',
                },
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                lacquer: ['Lacquer', 'cursive'],
            },
        },
    },
    plugins: [require('@tailwindcss/typography')],
}
