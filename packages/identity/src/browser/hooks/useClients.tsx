import { useQuery } from '@tanstack/react-query'
import { OAuth2Api } from '@ory/client'

const parseTokens = (link: string) => {
    const parsed = link.split(',').map((it) => {
        const startRel = it.lastIndexOf('rel="')
        const endRel = it.lastIndexOf('"')
        const rel = it.slice(startRel, endRel)
        const startToken = it.lastIndexOf('page_token=')
        const endToken = it.lastIndexOf('&')
        const token = it.slice(startToken, endToken)
        return [rel, token]
    })

    return new Map(parsed.map((obj) => [obj[0].replace('rel="', ''), obj[1].replace('page_token=', '')]))
}

export const useClients = (oauthSDK: OAuth2Api, pageToken: string) => {
    return useQuery(['oauth-clients', pageToken], async () => {
        const response = await oauthSDK.listOAuth2Clients({ pageSize: 10, pageToken })

        return {
            data: response.data,
            tokens: parseTokens(response.headers.link),
        }
    })
}

export const useOidcClient = (oauthSDK: OAuth2Api, clientID: string) => {
    return useQuery(['oauth-client', clientID], async () => {
        const response = await oauthSDK.getOAuth2Client({ id: clientID })

        return response.data
    })
}
