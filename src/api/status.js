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
    }
}

export default status