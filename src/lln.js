import he from 'he'
import { marked } from 'marked'
import { fileApi, cutQuery11 } from './config'
import misc from './api/misc'

const atRegex = /@([a-zA-Z\u00C0-\u017F\d_]+)/g
const labelRegex = /#([a-zA-Z\u4e00-\u9fa5\d_]+)/g
const renderer = new marked.Renderer()

renderer.text = (text) => {
    text = text.replaceAll(atRegex, m => `<a class="at" href="/${m.substring(1)}">${m}</a>`)
    text = text.replaceAll(labelRegex, m => {
        let t = `&${m};`
        if (he.unescape(t) != t) {
            return m
        }
        return `<a class="label" href="/search/labels/${m.substring(1)}">${m}</a>`
    })
    return text
}

renderer.image = (herf) => {
    return `<a href="${herf}">${herf}</a>`
}

renderer.code = (code) => {
    if (!code || code.length == 0) {
        return ''
    }
    return `<div class="codeblock"><div class="copy">Copy</div><pre><code>${code}</code></pre></div>`
}

marked.use({ renderer: renderer, breaks: true, mangle: false, headerIds: false })

function renderText(text) {
    return marked.parse(text)
}

export function loadSession() {
    let sessionStr = window.localStorage.getItem("session")
    if (sessionStr) {
        return JSON.parse(sessionStr)
    }
}

function avatarPreview(src) {
    if (src.startsWith('https')) {
        return src
    }
    return `${fileApi}${src}?${cutQuery11}`
}

export async function loadSettings() {
    let settings = JSON.parse(window.localStorage.getItem('settings'))
    if (settings) {
        updateSettings(settings.modRev)
        return settings
    }
    return await updateSettings(0)
}

async function updateSettings(modRev) {
    let resp = await misc.settings(modRev)
    if (resp.code == 200) {
        window.localStorage.setItem('settings', JSON.stringify(resp.v))
    }
    return resp.v
}


const lln = {
    renderText: renderText,
    loadSession: loadSession,
    avatarPreview: avatarPreview,
}

export default lln