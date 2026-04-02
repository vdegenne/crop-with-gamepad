import {Rest, type Endpoint} from '@vdegenne/mini-rest'

export interface somethingAPI {
	get: {
		'/ping': Endpoint<void, 'pong'>
	}
	// post: {
	// 	'/direct-upload': Endpoint<{}, void>
	// }
}

export function getApi(origin = 'http://localhost:46203/api') {
	return new Rest<somethingAPI>(origin)
}
