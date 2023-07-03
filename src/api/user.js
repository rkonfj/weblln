import http from './net'

const user = {
    authorize: async (provider, state, code) => {
        return await http.post(`/o/authorize/${provider}?state=${state}&code=${code}`, {})
    },
    logout: async function (session) {
        return await http.delete('/i/authorize', {
            session: session
        })
    },
    follow: async function (uniqueName, session) {
        return await http.post(`/i/follow/user/${uniqueName}`, { session: session })
    },
    status: async (uniqueName, after, size, session) => {
        let afterQuery = ''
        if (after) {
            afterQuery = '&after=' + after
        }
        return await http.get(`/o/user/${uniqueName}/status?size=${size}${afterQuery}`,
            { session: session })
    },
    bookmarks: async (after, size, session) => {
        let afterQuery = ''
        if (after) {
            afterQuery = '&after=' + after
        }
        return await http.get(`/i/bookmarks?size=${size}${afterQuery}`, { session: session })
    }
}

export default user 