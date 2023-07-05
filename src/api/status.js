import http from './net'

const status = {
    getStatus: async (statusID, session) => {
        return await http.get(`/o/status/${statusID}`, {
            session: session
        })
    },
    listComments: async (opts) => {
        let afterQuery = ''
        if (opts.after) {
            afterQuery = `&after=${opts.after}`
        }
        return await http.get(`/o/status/${opts.statusID}/comments?order=asc&size=${opts.size}${afterQuery}`,
            { session: opts.session })
    },
    bookmark: async (statusID, session) => {
        return await http.post(`/i/bookmark/status/${statusID}`, { session: session })
    },
    like: async (statusID, session) => {
        return await http.post(`/i/like/status/${statusID}`, { session: session })
    },
    delete: async (statusID, session) => {
        return await http.delete(`/i/status/${statusID}`, { session: session })
    },
    explore: async (opts, session) => {
        let afterQuery = ''
        if (opts.after) {
            afterQuery = '&after=' + opts.after
        }
        return await http.get(`/o/explore?size=${opts.size}&order=${opts.order}${afterQuery}`, { session: session })
    },
    search: async (opts) => {
        let afterQuery = ''
        if (opts.after) {
            afterQuery = '&after=' + opts.after
        }
        return await http.get(`/o/search?type=${opts.type}&value=${opts.value}&size=${opts.size}${afterQuery}`,
            { session: opts.session })
    },
    newsProbe: async (after, session) => {
        return await http.get(`/o/explore/news-probe?after=${after}`, { session: session })
    },
    labels: async (size, session) => {
        return await http.get(`/o/labels?size=${size}`, { session: session })
    }
}

export default status