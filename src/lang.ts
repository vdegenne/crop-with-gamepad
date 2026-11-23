export const ocrLanguages = {
	fr: {
		flag: '🇫🇷',
		fullname: 'French',
	},
	en: {
		flag: '🇬🇧',
		fullname: 'English',
	},
	japan: {
		flag: '🇯🇵',
		fullname: 'Japanese',
	},
	ch: {
		flag: '🇨🇳',
		fullname: 'Chinese',
	},
	grc: {
		flag: '🇬🇷',
		fullname: 'Ancient Greek',
	},
} as const

export type AvailableOcrLanguages = keyof typeof ocrLanguages
export type OcrLanguageList = AvailableOcrLanguages[]

export function getOcrLanguageList(): OcrLanguageList {
	return Object.keys(ocrLanguages) as OcrLanguageList
}
