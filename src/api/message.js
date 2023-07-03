import http from './net'


const message = {
    deleteMessages: async (msgs, session) => {
        return await http.delete(`/i/messages`, {
            body: msgs,
            session: session
        })
    },
    deleteTipMessages: async (msgs, session) => {
        return await http.delete(`/i/messages/tips`, {
            body: msgs,
            session: session
        })
    },
    listMessages: async (after, size, session) => {
        let afterQuery = ''
        if (after) {
            afterQuery = '&after=' + after
        }
        return await http.get(`/i/messages?size=${size}${afterQuery}`, {
            session: session
        })
    },
    tips: async (session) => {
        return await http.get(`/i/messages/tips`, { session: session })
    }
}

export default message