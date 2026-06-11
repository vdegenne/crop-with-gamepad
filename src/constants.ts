/* vite only */
export const DEV = import.meta.env.DEV

export const availablePages = ['main', 'search'] as const
// true as AllValuesPresent<Page, typeof availablePages>

export const availableOcrLanguages = ['eng+fra', 'jpn', 'grc'] as const
export type AvailableOcrLanguages = (typeof availableOcrLanguages)[number]

export const ocrLanguageFlags = {
	'eng+fra': '🇬🇧',
	jpn: '🇯🇵',
	grc: '🇬🇷',
} as const
