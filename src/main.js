import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

// ---- PWA service worker ----
import { registerSW } from 'virtual:pwa-register'

import App from './App.vue'
import router from './router'

// CSS
import './assets/css/base.css'
import './assets/css/theme-light.css'
import './assets/css/theme-dark.css'

// ---- Font Awesome ----
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faSun,
  faMoon,
  faBell,
  faUser,
  faSignOutAlt,
  faRightFromBracket,
  faBars, // ✅ NEW — hamburger icon
  faTimes, // ✅ NEW — X close icon
  faPlus,
  faEdit,
  faTrash,
  faEye,
  faMap,
  faSeedling,
  faSyringe,
  faTractor,
  faCoins,
  faBug,
  faTasks,
  faThermometerHalf,
  faCog,
  faSync,
  faWater,
  faHome,
  faTruck,
  faClock,
  faUsers,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons'

// Register icons in the library
library.add(
  faSun,
  faMoon,
  faBell,
  faUser,
  faSignOutAlt,
  faRightFromBracket,
  faBars, // ✅ NEW
  faTimes, // ✅ NEW
  faPlus,
  faEdit,
  faTrash,
  faEye,
  faMap,
  faSeedling,
  faSyringe,
  faTractor,
  faCoins,
  faBug,
  faTasks,
  faThermometerHalf,
  faCog,
  faSync,
  faWater,
  faHome,
  faTruck,
  faClock,
  faUsers,
  faExclamationTriangle,
)

// ---- Pinia ----
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

// ---- App ----
const app = createApp(App)

// ✅ THIS IS THE MISSING LINE — registers <font-awesome-icon> globally
app.component('font-awesome-icon', FontAwesomeIcon)

app.use(pinia)
app.use(router)
app.mount('#app')

// ✅ Register service worker (auto-updates the app in the background)
registerSW({ immediate: true })
