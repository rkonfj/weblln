import { marked } from 'marked'

const atRegex = /@([a-zA-Z\u00C0-\u017F\d_]+)/g
const labelRegex = /#([a-zA-Z\u4e00-\u9fa5\d_]+)/g
const renderer = new marked.Renderer()

renderer.text = (text) => {
    text = text.replaceAll(atRegex, m => `<a href="/${m.substring(1)}">${m}</a>`)
    text = text.replaceAll(labelRegex, m => `<a href="/search/labels/${m.substring(1)}">${m}</a>`)
    return text
}

renderer.image = (herf) => {
    return `<a href="${herf}">${herf}</a>`
}

marked.use({ renderer: renderer, breaks: true, mangle: false, headerIds: false })

function renderText(text) {
    return marked.parse(text)
}

function loadSession() {
    let sessionStr = window.localStorage.getItem("session")
    if (sessionStr) {
        return JSON.parse(sessionStr)
    }
}

const lln = {
    renderText: renderText,
    loadSession: loadSession
}

export default lln