import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		animation: {
  			'fade-up': 'fade-up 0.6s ease-out both',
  			'fade-up-delay-1': 'fade-up 0.6s ease-out 0.1s both',
  			'fade-up-delay-2': 'fade-up 0.6s ease-out 0.2s both',
  			'fade-up-delay-3': 'fade-up 0.6s ease-out 0.3s both',
  			'fade-up-delay-4': 'fade-up 0.6s ease-out 0.4s both',
  			'slide-in-left': 'slide-in-left 0.5s ease-out both',
  			'slide-in-right': 'slide-in-right 0.5s ease-out both',
  			'scale-in': 'scale-in 0.4s ease-out both',
  			'float': 'float 6s ease-in-out infinite',
  			'shimmer': 'shimmer 2s linear infinite',
  			'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
  			'gradient-x': 'gradient-x 3s ease infinite',
  		},
  		backgroundImage: {
  			'hero-gradient': 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 50%, #bfdbfe 100%)',
  			'gradient-radial': 'radial-gradient(ellipse at center, var(--tw-gradient-stops))',
  		},
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
