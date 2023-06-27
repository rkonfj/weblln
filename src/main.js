import './assets/main.css'
import router from './router'
import messages from './i18n'
import { llnApi, siteName } from './config'
import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import { Settings } from 'luxon'
import App from './App.vue'

const i18n = createI18n({
    legacy: false,
    locale: localStorage.getItem('lang') || 'zh',
    messages: messages,
})

Settings.defaultLocale = localStorage.getItem('lang') || 'zh'

router.beforeEach((to, _, next) => {
    document.title = i18n.global.t(`nav.${to.name}`, 'nil')
    if (document.title == 'nil') {
        document.title = siteName
    } else {
        document.title = `${document.title} / ${siteName}`
    }
    next()
})

const app = createApp(App)

app.provide('llnApi', llnApi)

app.use(router)
app.use(i18n)

app.mount('#app')
