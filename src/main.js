import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import App from './App.vue'
import router from './router'

// CSS
import './assets/css/base.css'
import './assets/css/theme-light.css'
import './assets/css/theme-dark.css'

// Font Awesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
// Import each icon once
import {
  faSun,
  faMoon,
  faBell,
  faUser,
  faSignOutAlt,
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
} from '@fortawesome/free-solid-svg-icons'

// Add all icons to the library
library.add(
  faSun,
  faMoon,
  faBell,
  faUser,
  faSignOutAlt,
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
)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

const app = createApp(App)
app.use(pinia)
app.use(router)
app.component('font-awesome-icon', FontAwesomeIcon)
app.mount('#app')
