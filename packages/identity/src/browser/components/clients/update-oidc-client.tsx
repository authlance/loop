import React, { useCallback, useContext } from 'react'
import { HydraContext } from '@authlance/core/lib/browser/common/hydra-sdk'
import { JsonPatch, OAuth2Client } from '@ory/client'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@authlance/ui/lib/browser/components/button'
import { Input } from '@authlance/ui/lib/browser/components/input'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@authlance/ui/lib/browser/components/form'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@authlance/ui/lib/browser/hooks/use-toast'
import { useQueryClient } from '@tanstack/react-query'
import ReadOnlyField from '@authlance/ui/lib/browser/components/read-only-field'
import { useOidcClient } from '../../hooks/useClients'
import RenderIf from '@authlance/core/lib/browser/components/RenderIf'

interface ClientUpdateFormData {
    client_name: string
    redirect_uris: string
}

interface OidcClientUpdateComponentProps {
    client: OAuth2Client
}

export const OidcClientUpdate: React.FC<OidcClientUpdateComponentProps> = ({ client }) => {
    const navigate = useNavigate()
    const toast = useToast()
    const queryClient = useQueryClient()
    const { oauthSDK } = useContext(HydraContext)

    const oidcClientSchema = z.object({
        client_name: z.string().min(3, 'Client name must be at least 3 characters'),
        redirect_uris: z.string().min(5, 'At least one valid URL required'),
    })

    const form = useForm<ClientUpdateFormData>({
        resolver: zodResolver(oidcClientSchema),
        defaultValues: {
            client_name: client.client_name || '',
            redirect_uris: client.redirect_uris?.join(', ') || '',
        },
    })

    const onSubmit = useCallback(
        async (data: ClientUpdateFormData) => {
            try {
                const patchData: JsonPatch[] = [
                    {
                        op: 'replace',
                        path: '/client_name',
                        value: data.client_name,
                    },
                    {
                        op: 'replace',
                        path: '/redirect_uris',
                        value: [data.redirect_uris],
                    },
                ]

                const response = await oauthSDK.patchOAuth2Client({
                    id: client?.client_id as string,
                    jsonPatch: patchData,
                })

                if (response.status === 200) {
                    toast.toast({
                        title: 'Client updated',
                        description: 'OAuth2 client was updated successfully',
                        variant: 'default',
                        duration: 5000,
                    })
                    queryClient.invalidateQueries(['oauth-clients'])
                    navigate('/oauth-clients')
                } else {
                    toast.toast({
                        title: 'Error updating client',
                        description: 'An error occurred while updating the client',
                        variant: 'destructive',
                        duration: 5000,
                    })
                }
            } catch (error) {
                console.error('Error updating client:', error)
            }
        },
        [client, queryClient, toast, oauthSDK]
    )

    return (
        <div className="flex flex-col max-w-2xl">
            <h2 className="w-full mb-4 text-lg font-semibold">Update OIDC Client</h2>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
                    <FormField
                        control={form.control}
                        name="client_name"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>Client Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter client name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="redirect_uris"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>Redirect URIs (comma-separated)</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="https://your-app.com/auth/callback, https://app.example.com/callback"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="p-4 space-y-6 border rounded-xl bg-card">
                        <ReadOnlyField label="Client ID" value={client.client_id || ''} />
                        <ReadOnlyField
                            label="Token Endpoint Auth Method"
                            value={client.token_endpoint_auth_method || ''}
                        />
                        {client.client_secret && <ReadOnlyField label="Client Secret" value={client.client_secret} />}
                        {client.created_at && (
                            <ReadOnlyField label="Created At" value={new Date(client.created_at).toLocaleString()} />
                        )}
                    </div>

                    <Button type="submit" className="w-full">
                        Update Client
                    </Button>
                </form>
            </Form>
        </div>
    )
}

export const OidcClientUpdateComponent: React.FC<{ clientId: string }> = ({ clientId }) => {
    const { oauthSDK } = useContext(HydraContext)
    const clientData = useOidcClient(oauthSDK, clientId)
    return (
        <>
            <RenderIf isTrue={!!clientData.data}>
                <OidcClientUpdate client={clientData.data!} />
            </RenderIf>
            <RenderIf isTrue={clientData.isLoading}>
                <div>Loading...</div>
            </RenderIf>
        </>
    )
}

export default OidcClientUpdateComponent
