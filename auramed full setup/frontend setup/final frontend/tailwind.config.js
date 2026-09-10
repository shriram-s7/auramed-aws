/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#f0fdfa',
                    100: '#ccfbf1',
                    500: '#14b8a6', // Teal
                    600: '#0d9488',
                    900: '#134e4a',
                },
                secondary: {
                    50: '#eff6ff',
                    500: '#3b82f6', // Light Blue
                    900: '#1e3a8a',
                }
            }
        },
    },
    plugins: [],
}
