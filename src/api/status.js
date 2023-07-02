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
    explore: async (after, size, session) => {
        let afterQuery = ''
        if (after) {
            afterQuery = '&after=' + after
        }
        return await http.get(`/o/explore?size=${size}${afterQuery}`, { session: session })
    },
    search: async (opts) => {
        let afterQuery = ''
        if (opts.after) {
            afterQuery = '&after=' + opts.after
        }
        return await http.get(`/o/search?type=${opts.type}&value=${opts.value}&size=${opts.size}${afterQuery}`,
            { session: opts.session })
    }
}

export default status