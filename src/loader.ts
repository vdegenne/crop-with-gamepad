// This needs to be before anything else
// because it sets a shared stylesheet used by
// elements' construtor.
import './styles/styles.js'
import './styles/themeStore.js'

import './material-web.js'

import {app} from './app-shell/app-shell.js'
document.querySelector('material-shell')?.appendChild(app)
/** or Firebase */
// import './firebase.js';

// import './router.js';

import './global-listeners.js'

import './gamepad.js'

// app.updateComplete.then(() => {});

/**
 * Uncomment the follow for reactive object debugging
 */
// import {store} from './store.js'
// import {monitor} from './debug-element.js'
// monitor([store])
