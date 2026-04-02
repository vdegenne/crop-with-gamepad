import {createFirebase} from '@vdegenne/firebase'
import {AuthManagerBase} from '@vdegenne/firebase/AuthManagerBase'
import {UserController} from '@vdegenne/firebase/UserController'
import {type User as FirebaseUser} from 'firebase/auth'
import toast from 'toastit'

export const firebase = createFirebase({
	// PASTE YOUR KEYS HERE
})

class AuthManager extends AuthManagerBase {
	async onAuthStateChanged(user: FirebaseUser | null): Promise<void> {
		// 	if (user) {
		// 		console.log(await user.getIdTokenResult())
		// 	}
	}

	async onUserConnected(user: UserController) {
		if (user.isPremium) {
			const {app} = await import('./app-shell/app-shell.js')
			shell.appendChild(app)
			// const {daysManager} = await import('./day/daysManager.js');
			// await daysManager.loadObjects();
		} else {
			await this.logout()
			toast('Access denied')
		}
	}

	async onUserDisconnected() {
		if (window.app && window.app.isConnected) {
			window.app.remove()
			toast('Disconnected')
		} else {
			toast('Authentication required.')
		}
		const {loginInterface} = await import(
			'./login-interface/login-interface.js'
		)
		if (!loginInterface.isConnected) {
			shell.appendChild(loginInterface)
		}
	}
}

export const userCtrl = new UserController()
export const authManager = new AuthManager(userCtrl)
