import './assets/main.css'

import messages from './i18n'
import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import App from './App.vue'
import router from './router'

const i18n = createI18n({
    legacy: false,
    locale: localStorage.getItem('lang') || 'zh',
    messages: messages,
})

const app = createApp(App)

app.use(router)
app.use(i18n)

app.mount('#app')
