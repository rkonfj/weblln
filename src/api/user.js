import http from './net'

const user = {
    logout: async function(session) {
        return http.delete('/i/authorize', {
            session: session
        })
    },
    follow: async function(uniqueName, session) {
        return http.post(`/i/follow/user/${uniqueName}`, {session: session})
    }
}

export default user 