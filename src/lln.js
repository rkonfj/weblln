import he from 'he'

const urlRegex = /https:\/\/([\w.-]+)\.([a-z]{2,6}\.?)(\/[\w.-]*)*\/?/g
const atRegex = /@([a-zA-Z\u00C0-\u017F\d_]+)/g
const labelRegex = /#([a-zA-Z\u4e00-\u9fa5\d_]+)/g

const lln = {
    renderText: (text) => {
        text = he.escape(text)
        text = text.replaceAll('\n', '<br />')
        text = text.replaceAll(atRegex, m => `<a href="/${m.substring(1)}">${m}</a>`)
        text = text.replaceAll(labelRegex, m => `<a href="/search/labels/${m.substring(1)}">${m}</a>`)
        text = text.replaceAll(urlRegex, m => `<a href="${m}">${m}</a>`)
        return text
    }
}

export default lln