import http from './net'

const misc = {
    restriction: async (session) => {
        return await http.get(`/i/restriction`, { session: session })
    }
}

export default misc