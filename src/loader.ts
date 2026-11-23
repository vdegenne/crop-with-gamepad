// This needs to be before anything else
// because it sets a shared stylesheet used by
// elements' construtor.
import './styles/styles.js'
import './styles/themeStore.js'

import mahmoodM3Styles from '@mahmoodkhalil/material-web-3-demo/labs/gb/styles/m3.cssresult.js'
import '@material/web/all.js'
import {adoptStyles} from '@material/web/labs/gb/styles/adopt-styles.js'
import m3Styles from '@material/web/labs/gb/styles/m3.cssresult.js'
adoptStyles(document, [m3Styles, mahmoodM3Styles])

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
