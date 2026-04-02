import {config} from '@vdegenne/koa'
import {PORT} from './constants.js'
// import {listVideos} from './functions.js'
import {somethingAPI} from './api.js'

config<somethingAPI>({
	apiVersion: 'api',

	port: PORT,

	statics: ['./public' /*, {prefix: '/videos', location: '..'}*/],

	get: {
		'/ping': () => 'pong',
		// info() {
		// 	return {
		// 		videos: listVideos(),
		// 	}
		// },
	},
})
