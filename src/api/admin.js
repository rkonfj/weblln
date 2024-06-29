import http from './net'

export async function disableUser(uid, session) {
    return await http.post(`/v/user/${uid}/disabled`, { session: session })
}

export async function enableUser(uid, session) {
    return await http.delete(`/v/user/${uid}/disabled`, { session: session })
}

export async function deleteStatus(statusID, session) {
    return await http.delete(`/v/status/${statusID}`, { session: session })
}