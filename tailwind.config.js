/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  purge: ['./src/**/*.{html,ts}'],
  content: ['./em-fe/**/*.{html,ts}'],
  safelist: [
    'grid-cols-[1fr,auto]',
    'border-[#E4E4E7]',
    'border-[#58CAF5]',
    'border-[#009FDA]',
    '!border-[#D52B1E]',
    'text-[#BABABA]',
    'text-[#009FDA]',
    'text-[#D52B1E]',
    'text-[10px]',
    'focus:border-[#009FDA]',
    'focus:bg-[#F4F4F4]',
    'disabled:bg-[#F4F4F4]',
    'font-[400]',
    'font-[500]',
    'font-[600]',
    'font-[700]',
    'h-[36px]',
    'h-[26px]',
    'h-[22px]',
    'h-[18px]',
    'w-[26px]',
    'w-[22px]',
    'w-[18px]',
    'px-[10px]',
    'px-[15px]',
    'bg-[#009FDA]',
    'bg-[#BABABA]',
    'hover:bg-[#009FDA0D]',
    'hover:bg-[#f4f4f4]'
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary-color)',
        secondary: 'var(--secondary-color)',
        infomation: 'var(--info-color)',
        success: 'var(--success-color)',
        error: 'var(--error-color)',
        label: 'var(--label-color)',
        disable: 'var(--disable-color)'
      },
      fontFamily: {
        helvetica: ['Tahoma']
      },
      borderRadius: {
        DEFAULT: '10px',
        half: '50%'
      },
      fontSize: {
        '2xs': '0.625rem',
        '3xs': '0.469rem',
        'clamp-xs': 'clamp(0.25rem, 1vw, 0.8rem)',
        'clamp-sm': 'clamp(0.6rem, 1.2vw, 1.5rem)',
        'clamp-md': 'clamp(0.75rem, 1.48vw, 2.125rem)',
        clamp: 'clamp(1rem, 1.8vw, 2.75rem)',
        'clamp-lg': 'clamp(1.25rem, 2.25vw, 4rem)',
        'clamp-xl': 'clamp(1.69rem, 3vw, 8rem)',
        'clamp-2xl': 'clamp(2rem, 4.5vw, 16rem)'
      }
    }
  },
  plugins: []
};
