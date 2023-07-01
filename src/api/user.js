import http from './net'

const user = {
    logout: async function(session) {
        return http.delete('/i/authorize', {
            session: session
        })
    }
}

export default user 