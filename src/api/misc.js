import http from './net'

const misc = {
    restriction: async (session) => {
        return await http.get(`/i/restriction`, { session: session })
    },
    getSignedUploadURL: async (filepath, session) => {
        return await http.get(`/i/signed-upload-url?object=${filepath}`, { session: session })
    },
    uploadFile: async (file, session) => {
        let resp = await misc.getSignedUploadURL("", session)
        let uploadResp = await fetch(resp.v.url, {
            method: 'PUT',
            body: file
        })
        if (uploadResp.status != 200) {
            throw new Error(await uploadResp.text())
        }
        return {
            path: resp.v.path,
            headers: uploadResp.headers
        }
    }
}

export default misc