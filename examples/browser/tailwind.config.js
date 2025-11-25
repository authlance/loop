const { fontFamily } = require('tailwindcss/defaultTheme')
const path = require('path')
const { link } = require('fs')

/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ['selector', 'class'],
    content: [
		'./src-gen/frontend/**/*.{js,ts,jsx,tsx}',
		'../../packages/core/src/**/*.{js,ts,jsx,tsx}',
		'../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
		'../../packages/payments/src/**/*.{js,ts,jsx,tsx}',
		'../../packages/identity/src/**/*.{js,ts,jsx,tsx}',
        '../../packages/sidebar/src/**/*.{js,ts,jsx,tsx}'
	  ],
    theme: {
    	container: {
    		center: true,
    		padding: '2rem',
    		screens: {
    			'2xl': '1400px'
    		}
    	},
    	extend: {
    		colors: {
    			border: 'hsl(var(--border))',
    			input: 'hsl(var(--input))',
    			ring: 'hsl(var(--ring))',
    			background: 'hsl(var(--background))',
    			foreground: 'hsl(var(--foreground))',
				link: 'hsl(var(--link))',
    			primary: {
    				DEFAULT: 'hsl(var(--primary))',
    				foreground: 'hsl(var(--primary-foreground))'
    			},
    			secondary: {
    				DEFAULT: 'hsl(var(--secondary))',
    				foreground: 'hsl(var(--secondary-foreground))'
    			},
    			destructive: {
    				DEFAULT: 'hsl(var(--destructive))',
    				foreground: 'hsl(var(--destructive-foreground))'
    			},
    			muted: {
    				DEFAULT: 'hsl(var(--muted))',
    				foreground: 'hsl(var(--muted-foreground))'
    			},
    			accent: {
    				DEFAULT: 'hsl(var(--accent))',
    				foreground: 'hsl(var(--accent-foreground))'
    			},
    			popover: {
    				DEFAULT: 'hsl(var(--popover))',
    				foreground: 'hsl(var(--popover-foreground))'
    			},
    			card: {
    				DEFAULT: 'hsl(var(--card))',
    				foreground: 'hsl(var(--card-foreground))'
    			},
    			sidebar: {
    				DEFAULT: 'hsl(var(--sidebar))',
					background: 'hsl(var(--sidebar))',
    				foreground: 'hsl(var(--sidebar-foreground))',
    				primary: 'hsl(var(--sidebar-primary))',
    				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
    				accent: 'hsl(var(--sidebar-accent))',
    				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
    				border: 'hsl(var(--sidebar-border))',
    				ring: 'hsl(var(--sidebar-ring))'
    			}
    		},
    		fontFamily: {
    			ory: 'var(--ory-theme-font-family)',
                sans: ['var(--font-sans)'],
                body: ['var(--font-sans)'],
                monospace: ['var(--font-mono)'],
				headings: ['var(--font-headings)']
    		},
    		fontSize: {
    			h1: '2.441rem',
    			h2: '1.953rem',
    			h3: '1.563rem',
    			h4: '1.25rem'
    		},
			borderColor: {
				DEFAULT: 'hsl(var(--border))'
			},
    		borderRadius: {
    			lg: 'var(--radius)',
    			md: 'calc(var(--radius) - 2px)',
    			sm: 'calc(var(--radius) - 4px)'
    		},
			boxShadow: {
				'sm': 'var(--shadow-sm)',
				DEFAULT: 'var(--shadow)',
				'md': 'var(--shadow-md)',
				'lg': 'var(--shadow-lg)',
				'xl': 'var(--shadow-xl)',
				'2xl': 'var(--shadow-2xl)',
			},
			ringColor: {
				DEFAULT: 'hsl(var(--ring))'
			},
    		width: {
    			md: '720px',
    			lg: '960px',
    			xl: '1140px'
    		},
    		height: {
    			header: '60px'
    		}
    	}
    },
    plugins: [require('tailwindcss-animate')],
}
