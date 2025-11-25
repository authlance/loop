import React, { useCallback, useContext } from 'react'
import { HydraContext } from '@authlance/core/lib/browser/common/hydra-sdk'
import { OAuth2ApiCreateOAuth2ClientRequest } from '@ory/client'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@authlance/ui/lib/browser/components/button'
import { Input } from '@authlance/ui/lib/browser/components/input'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@authlance/ui/lib/browser/components/form'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@authlance/ui/lib/browser/hooks/use-toast'
import { useQueryClient } from '@tanstack/react-query'
import { generateRandom } from '@authlance/core/lib/common/random-generator'
import { InfoIcon } from 'lucide-react'

interface ClientFormData {
    client_name: string
    client_secret: string
    redirect_uris: string
}

const oidcClientSchema = z.object({
    client_name: z.string().min(3, "Client name must be at least 3 characters"),
    client_secret: z.string()
        .min(16, "Client secret must be at least 8 characters"),
    redirect_uris: z.string().min(5, "At least one valid URL required"),
});

export const OidcClientCreateComponent: React.FC = () => {
    const navigate = useNavigate()
    const toast = useToast()
    const queryClient = useQueryClient()
    const { oauthSDK } = useContext(HydraContext)

    const form = useForm<ClientFormData>({
        resolver: zodResolver(oidcClientSchema),
        defaultValues: {
            client_name: '',
            client_secret: generateRandom(16),
            redirect_uris: '',
        },
    });

    const onSubmit = useCallback(async (data: ClientFormData) => {
        try {
            const redirectUrisArray = data.redirect_uris.split(',').map(uri => uri.trim());

            const clientData: OAuth2ApiCreateOAuth2ClientRequest = {
                oAuth2Client: {
                    client_name: data.client_name,
                    client_secret: data.client_secret,
                    skip_consent: true,
                    grant_types: ["authorization_code", "refresh_token"],
                    response_types: ["code"],
                    redirect_uris: redirectUrisArray,
                    scope: "openid profile email",
                    token_endpoint_auth_method: "client_secret_basic",
                }
            };

            const response = await oauthSDK.createOAuth2Client(clientData);

            if (response.status === 201) {
                toast.toast({
                    title: "Client Created",
                    description: `Client "${data.client_name}" created successfully!`,
                    variant: 'default',
                    duration: 5000,
                });

                queryClient.invalidateQueries(['oauth-clients'])
                navigate('/oauth-clients');
            } else {
                toast.toast({
                    title: "Error Creating Client",
                    description: "An unexpected error occurred while creating the client.",
                    variant: 'destructive',
                    duration: 5000,
                });
            }
        } catch (error: any) {
            console.error("Error creating client:", error);
            toast.toast({
                title: "Creation Failed",
                description: error.response?.data?.error_description || "Failed to create the client.",
                variant: 'destructive',
                duration: 5000,
            });
        }
    }, [queryClient, toast, oauthSDK, navigate]);

    return (
        <div className="flex flex-col max-w-2xl">
            <div className="flex items-center p-4 mb-6 text-yellow-700 bg-yellow-100 border-l-4 border-yellow-500 rounded-md">
                <InfoIcon className="w-5 h-5 mr-2 text-yellow-700" />
                <p className="text-sm">
                    <strong>Warning:</strong> Remember to store the client secret before creating. It <strong>cannot be modified</strong> later.
                </p>
            </div>
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
                        name="client_secret"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>Client Secret</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter client secret" {...field} />
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
                                    <Input placeholder="https://your-app.com/auth/callback, https://app.example.com/callback" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" className="w-full">
                        Create Client
                    </Button>
                </form>
            </Form>
        </div>
    );
};

export default OidcClientCreateComponent;
