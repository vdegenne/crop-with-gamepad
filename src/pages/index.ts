import {$} from 'html-vision'
import {PageMain} from './page-main.js'

export const availablePages = ['main'] as const
export type Page = (typeof availablePages)[number]

export function getPage(name: Page) {
	return $(`page-${name}`, {shadows: true})
}
export function getMainPage() {
	return getPage('main') as PageMain
}
