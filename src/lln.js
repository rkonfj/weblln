import he from 'he'

const urlRegex = /https:\/\/([\w.-]+)\.([a-z]{2,6}\.?)(\/[\w.-]*)*\/?/g
const atRegex = /@([a-zA-Z\u00C0-\u017F\d_]+)/g
const labelRegex = /#([a-zA-Z\u4e00-\u9fa5\d_]+)/g
const codeSectionRegex = /```\n[\s\S]*?\n```/g
const codeRegex = /`[\s\S]*?`/g

const lln = {
    renderText: (text) => {
        text = text.replaceAll(codeSectionRegex, m => `[codepre]${m.substring(4, m.length - 4).replaceAll('`', '&#x60;')}[endcodepre]`)
        text = text.replaceAll(codeRegex, m => `[code]${m.substring(1, m.length - 1).replaceAll('`', '&#x60;')}[endcode]`)
        text = he.escape(text.replaceAll('&#x60;', '`'))
        text = text.replaceAll('[code]', '<code>')
        text = text.replaceAll('[endcode]', '</code>')
        text = text.replaceAll('[codepre]', '<pre>')
        text = text.replaceAll('[endcodepre]', '</pre>')
        text = text.replaceAll('\n', '<br />')
        text = text.replaceAll(atRegex, m => `<a href="/${m.substring(1)}">${m}</a>`)
        text = text.replaceAll(labelRegex, m => {
            let t = `&${m};`
            if (he.unescape(t) != t) {
                return m
            }
            return `<a href="/search/labels/${m.substring(1)}">${m}</a>`
        })
        text = text.replaceAll(urlRegex, m => `<a href="${m}">${m}</a>`)
        return text
    }
}

export default lln