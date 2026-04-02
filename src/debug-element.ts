import {ReactiveController} from '@snar/lit'
import {cquerySelectorAll} from 'html-vision'
import {html, LitElement} from 'lit'
import {withStyles} from 'lit-with-styles'
import {customElement, state} from 'lit/decorators.js'

function getAllElementProperties(el: any, depth: number = 1): string[] {
	const props = new Set<string>()

	let proto = Object.getPrototypeOf(el)
	let ctor = el.constructor
	let level = 0

	while (proto && ctor && level < depth) {
		const elementProps = ctor.elementProperties

		if (elementProps) {
			for (const p of Object.getOwnPropertyNames(proto)) {
				if (elementProps.has(p)) {
					props.add(p)
				}
			}
		}

		proto = Object.getPrototypeOf(proto)
		ctor = Object.getPrototypeOf(ctor)
		level++
	}

	return Array.from(props)
}

type DebuggableElement = string | LitElement | ReactiveController

@customElement('debug-viewer')
@withStyles()
class DebugViewer extends LitElement {
	@state() monitored: DebuggableElement[] = []

	constructor() {
		super()
		document.body.appendChild(this)

		setInterval(() => this.requestUpdate(), 2000)
	}

	render() {
		let elements: (HTMLElement | ReactiveController)[] = this.monitored.filter(
			(el) => typeof el !== 'string'
		)
		const elementsToQuery = this.monitored.filter(
			(el) => typeof el === 'string'
		)
		if (elementsToQuery.length) {
			elements = elements.concat(
				cquerySelectorAll<HTMLElement>(
					this.monitored.filter((el) => typeof el === 'string').join(', ')
				)
			)
		}

		return html`<!-- -->
			<div
				class="fixed bottom-0 left-0 bg-black text-white flex flex-col gap-1 z-10"
			>
				${elements.map((el) => {
					this.hookElement(el)
					let propNames: string[]
					try {
						/*propNames = Object.getOwnPropertyNames(
							Object.getPrototypeOf(el),
						).filter((p) => {
							return (el.constructor as any).elementProperties?.has(p)
						})*/
						/*propNames = Array.from(
							(el.constructor as any).elementProperties.keys(),
						)*/
						propNames = getAllElementProperties(el, 2)
					} catch {
						return null
					}
					return html`<!-- -->
						<div class="flex items-center gap-4">
							<div
								class="text-yellow-400 cursor-pointer"
								@click=${() => console.log(el)}
							>
								${el instanceof HTMLElement
									? el.tagName.toLowerCase()
									: el.constructor.name || 'store'}
							</div>
							${propNames.map((_name) => {
								const name = _name as keyof typeof el
								const value = el[name]
								return html`
									<div class="flex items-center gap-1">
										<div class="opacity-55">${name}</div>
										<div
											class="cursor-pointer whitespace-nowrap max-w-sm overflow-hidden text-ellipsis"
											title=${JSON.stringify(value, null, 2)}
											@click=${() => {
												if (typeof value === 'boolean') {
													;(el[name] as boolean) = !el[name]
												} else if (
													typeof value === 'string' ||
													value == null ||
													typeof value === undefined
												) {
													const newValue = prompt('New value:', value)
													if (newValue !== null) {
														if (newValue === '') {
															;(el[name] as undefined) = undefined
														} else if (newValue === '""') {
															;(el[name] as string) = ''
														} else if (newValue === 'null') {
															;(el[name] as null) = null
														} else {
															;(el[name] as string) = newValue
														}
													}
												}
											}}
										>
											${value !== undefined
												? JSON.stringify(value)
												: 'undefined'}
										</div>
									</div>
								`
							})}
						</div>
						<!-- -->`
				})}
			</div>
			<!-- -->`
	}

	hookElement(element: any) {
		if (element.updatedWasHooked) return

		const {updated} = element
		if (updated) {
			element.updated = (props: any) => {
				this.requestUpdate()
				updated.call(element, props)
			}
			element.updatedWasHooked = true
		}
	}
}

let viewer: DebugViewer | undefined
function getViewer() {
	return (viewer ??= new DebugViewer())
}

export function monitor(elements: DebuggableElement | DebuggableElement[]) {
	if (!Array.isArray(elements)) {
		elements = [elements]
	}

	const viewer = getViewer()

	viewer.monitored = Array.from(new Set([...viewer.monitored, ...elements]))
}
