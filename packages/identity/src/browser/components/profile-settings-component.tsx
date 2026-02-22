import React, { useState, useEffect, useCallback, useContext, useMemo, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent, CardFooter, CardHeader } from '@authlance/ui/lib/browser/components/card'
import { Button } from '@authlance/ui/lib/browser/components/button'
import { Label } from '@authlance/ui/lib/browser/components/label'
import { Input } from '@authlance/ui/lib/browser/components/input'
import { DatePicker } from '@authlance/ui/lib/browser/components/date-picker'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@authlance/ui/lib/browser/components/select'
import { User } from '@authlance/core/lib/browser/common/auth'
import { Upload, UserIcon } from 'lucide-react'
import { useToast } from '@authlance/ui/lib/browser/hooks/use-toast'
import { useQueryClient } from '@tanstack/react-query'
import { updateUser } from '../hooks/useUser'
import { SessionContext } from '@authlance/core/lib/browser/hooks/useAuth'
import { Avatar, AvatarFallback, AvatarImage } from '@authlance/ui/lib/browser/components/avatar'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FrontendApi, SettingsFlow, UiNode } from '@ory/client'
import { ProjectContext } from '@authlance/core/lib/browser/common/kratos'
import { useSdkError } from '@authlance/core/lib/browser/common/kratos-sdk'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@authlance/ui/lib/browser/components/dialog'
import RenderIf from '@authlance/core/lib/browser/components/RenderIf'
import LayoutContainer from '@authlance/core/lib/browser/containers/LayoutContainer'
import moment from 'moment'
import { OryWrapper } from '@authlance/core/lib/browser/components/layout/OryWrapper'
import { getRuntimeConfig } from '@authlance/core/lib/browser/runtime-config'

function getPasswordNodes(nodes: UiNode[]) {
  return nodes.filter((n: any) => {
    if (n.group === 'password') {
        return true
    }
    const name = n?.attributes?.name
    const val = n?.attributes?.value
    return name === 'csrf_token' || (name === 'method' && val === 'password')
  })
}

function findNode(nodes: UiNode[], name: string) {
  return nodes.find((n: any) => n?.attributes?.name === name) as any | undefined
}

function getAttr(nodes: UiNode[], name: string) {
  return findNode(nodes, name)?.attributes?.value ?? ''
}

export function PasswordOnlySettings({
    flow,
    orySDK,
    onSuccess,
}: {
    flow: SettingsFlow
    orySDK: FrontendApi
    onSuccess: () => void
}) {
    const [password, setPassword] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [localFlow, setLocalFlow] = useState(flow)
    const [networkError, setNetworkError] = useState<string>('')

    const nodes = getPasswordNodes(localFlow.ui.nodes)
    const csrf = getAttr(nodes, 'csrf_token')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        setNetworkError('')
        try {
            await orySDK.updateSettingsFlow({
                flow: localFlow.id,
                updateSettingsFlowBody: {
                    method: 'password',
                    password,
                    csrf_token: csrf,
                },
            })
            onSuccess()
        } catch (err: any) {
            const updatedFlow = err?.response?.data
            if (updatedFlow?.ui) {
                setLocalFlow(updatedFlow)
            } else {
                setNetworkError('An error occurred. Please try again.')
            }
        } finally {
            setSubmitting(false)
        }
    }

    const passwordNode = findNode(localFlow.ui.nodes, 'password') as any
    const fieldMessages: string[] = passwordNode?.messages?.map((m: any) => m.text) ?? []
    const flowMessages: string[] = localFlow.ui.messages?.map((m: any) => m.text) ?? []
    const allErrors = [...flowMessages, ...fieldMessages, ...(networkError ? [networkError] : [])]

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label className="block text-sm mb-1">New password</Label>
                <Input
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    className={`w-full border p-2 rounded${allErrors.length ? ' border-destructive' : ''}`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>

            {allErrors.length > 0 && (
                <div className="space-y-1">
                    {allErrors.map((msg, i) => (
                        <p key={i} className="text-sm text-destructive">{msg}</p>
                    ))}
                </div>
            )}

            <Button type="submit" className="px-4 py-2 rounded border" disabled={submitting || !password}>
                {submitting ? 'Changing…' : 'Change password'}
            </Button>
        </form>
    )
}

const PasswordComponent: React.FC<{}> = ({}) => {
    const [open, setOpen] = useState(false)
    const [searchParams, setSearchParams] = useSearchParams()
    const navigate = useNavigate()
    const [flow, setFlow] = useState<SettingsFlow | undefined>(undefined)
    const { orySDK } = useContext(ProjectContext)
    const toast = useToast()

    const getFlow = useCallback(
        (flowId: string) =>
            orySDK
                .getSettingsFlow({ id: flowId })
                .then((flow) => setFlow(flow.data))
                .catch((e) => console.error(e)),
        [orySDK]
    )

    const sdkErrorHandler = useSdkError(getFlow, setFlow, navigate, '/', true)

    const createFlow = useCallback(() => {
        const returnTo = () => searchParams.get('return_to') || undefined

        orySDK
            .createBrowserSettingsFlow({
                returnTo: returnTo(),
            })
            .then((flow) => {
                const passwordNodes = flow.data.ui.nodes.filter((n) => n.group === 'password')
                flow.data.ui.nodes = passwordNodes
                setSearchParams({ flow: flow.data.id })
                setFlow(flow.data)
            })
            .catch(sdkErrorHandler)
    }, [orySDK, setSearchParams, setFlow, sdkErrorHandler, searchParams])

    useEffect(() => {
        const flowId = searchParams.get('flow')
        if (flowId) {
            getFlow(flowId).catch(createFlow)
            return
        }
        createFlow()
    }, [createFlow, getFlow, searchParams])

    if (!flow) {
        return <></>
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button onClick={() => setOpen(true)} variant="outline">
                    Change Password
                </Button>
            </DialogTrigger>

            <DialogContent className="p-4 bg-background text-foreground">
                <DialogTitle>Change Password</DialogTitle>
                <DialogHeader className="hidden">{`Change your password`}</DialogHeader>
                <div className="w-full password">
                    <LayoutContainer>
                        {({ theme }) => (
                            <div className={`${theme === 'dark' ? 'dark' : ''}`}>
                                <OryWrapper>
                                    <PasswordOnlySettings
                                        flow={flow as any}
                                        orySDK={orySDK}
                                        onSuccess={() => {
                                            setOpen(false)
                                            toast.toast({
                                                title: 'Password changed',
                                                description: 'Your password was updated successfully.',
                                                variant: 'default',
                                                duration: 5000,
                                            })
                                        }}
                                    />
                                </OryWrapper>
                            </div>
                        )}
                    </LayoutContainer>
                </div>
            </DialogContent>
        </Dialog>
    )
}

const MAX_FILE_SIZE = 2 * 1024 * 1024

const useUtcDate = (date: string | undefined) => {
    if (!date) {
        return undefined
    }
    const m = moment.utc(date)
    return new Date(m.year(), m.month(), m.date())
}

const ProfileSettings: React.FC<{ user: User }> = ({ user }) => {
    const navigate = useNavigate()
    const [name, setName] = useState(user.firstName ? user.firstName : '')
    const [lastName, setLastName] = useState(user.lastName ? user.lastName : '')
    const [email] = useState(user.email)
    const { user: requestor, adminApi, usersApi, forceChallenge } = useContext(SessionContext)

    const [birthDate, setBirthDate] = useState<Date | undefined>(
        user.birthDate ? useUtcDate(user.birthDate) : undefined
    )
    const [gender, setGender] = useState<'' | 'male' | 'female' | 'other'>(user.gender ? user.gender : '')

    const {
        showProfileGender = true,
        showProfileBirthdate = true,
        showChangePassword = true,
    } = getRuntimeConfig()

    const [nameError, setNameError] = useState('')
    const [lastNameError, setLastNameError] = useState('')
    const [genderError, setGenderError] = useState('')

    const [image, setImage] = useState<File | undefined>(undefined)
    const [preview, setPreview] = useState<string | undefined>(user.avatar)
    const fileInputRef = useRef<HTMLInputElement | null>(null)
    const [fileError, setFileError] = useState<string | undefined>(undefined)
    const toast = useToast()
    const queryClient = useQueryClient()

    const { getRootProps, getInputProps, open } = useDropzone({
        accept: { 'image/*': [] },
        maxFiles: 1,
        noClick: true,
        onDrop: (acceptedFiles) => {
            const file = acceptedFiles[0]
            if (file.size > MAX_FILE_SIZE) {
                setFileError('File size exceeds 2MB. Please choose a smaller file.')
                return
            }

            setFileError(undefined)
            setImage(file)
            setPreview(URL.createObjectURL(file))
        },
    })

    const validateForm = useCallback(() => {
        let valid = true

        if (!name.trim()) {
            setNameError('First Name is required.')
            valid = false
        } else {
            setNameError('')
        }

        if (!lastName.trim()) {
            setLastNameError('Last Name is required.')
            valid = false
        } else {
            setLastNameError('')
        }

        if (showProfileGender && !gender) {
            setGenderError('Gender is required.')
            valid = false
        } else {
            setGenderError('')
        }

        return valid
    }, [name, lastName, gender, showProfileGender])

    const handleSubmit = useCallback(() => {
        if (!requestor || !validateForm()) {
            return
        }
        if (image && image.size > MAX_FILE_SIZE) {
            setFileError('File size exceeds 2MB. Please choose a smaller file.')
            return
        }

        const birthDateValue = birthDate ? moment(birthDate).toISOString() : undefined
        const tUser = {
            ...user,
            firstName: name,
            lastName: lastName,
            avatar: user.avatar,
            birthDate: birthDateValue,
            gender: gender === '' ? undefined : gender,
        }

        const formData = new FormData()
        formData.append('user', JSON.stringify(tUser))

        if (image) {
            formData.append('avatarImage', image)
        }
        const work = async () => {
            await updateUser(requestor, tUser, queryClient, formData, usersApi, adminApi)
            toast.toast({
                title: 'Profile updated',
                description: 'Profile was updated successfully',
                variant: 'default',
                duration: 5000,
            })
            forceChallenge()
        }
        work()
    }, [queryClient, validateForm, user, name, lastName, birthDate, gender, image, requestor, usersApi, adminApi])

    useEffect(() => {
        validateForm()
    }, [name, lastName, birthDate, gender, validateForm])

    useEffect(() => {
        if (fileError) {
            toast.toast({
                title: 'File Error',
                description: fileError,
            })
        }
    }, [fileError])

    const avatarFallback = useMemo(() => {
        if (name && lastName && name.length > 0 && lastName.length > 0) {
            return name.charAt(0) + lastName.charAt(0)
        }
        if (name && name.length >= 2) {
            return name.substring(0, 2)
        }
        return 'NA'
    }, [name, lastName])

    return (
        <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
            <aside className="w-full md:w-64">
                <Card>
                    <CardContent className="p-2">
                        <nav className="flex flex-col space-y-0.5 space-x-2 md:space-x-0">
                            <Button
                                variant="ghost"
                                type="button"
                                className="justify-start gap-2 bg-accent text-accent-foreground" // ADDED bg-accent text-accent-foreground only for selected buttons
                            >
                                <UserIcon className="w-4 h-4" /> Profile
                            </Button>
                        </nav>
                    </CardContent>
                </Card>
            </aside>
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <div className="flex justify-center">
                        <div
                            {...getRootProps()}
                            className="relative items-center justify-center w-24 h-24 overflow-hidden cursor-pointer border-2flex group"
                        >
                            <Avatar className="w-24 h-24 rounded-full">
                                <AvatarImage src={preview} alt={user.firstName} />
                                <AvatarFallback className="rounded-lg">{avatarFallback}</AvatarFallback>
                            </Avatar>
                            <div className="absolute inset-0 flex items-center justify-center text-xs text-white transition-opacity bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100">
                                Drag and drop
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-center">
                        <Button
                            variant="ghost"
                            type={'button'}
                            onClick={(e) => {
                                e.preventDefault()
                                open()
                            }}
                            className="flex items-center space-x-2"
                        >
                            <Upload className="w-4 h-4" />
                            <span>Upload New Image</span>
                        </Button>
                        <input type="file" ref={fileInputRef} className="hidden" {...getInputProps()} />
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <RenderIf isTrue={requestor?.identity === user.identity && user.verified !== true}>
                        <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm">
                            <p className="mb-2">Your account is not verified yet. Verify it to unlock subscription actions.</p>
                            <Button
                                type="button"
                                onClick={() => {
                                    const returnTo = `${window.location.pathname}${window.location.search}`
                                    navigate(`/verify?return_to=${encodeURIComponent(returnTo)}`)
                                }}
                            >
                                Verify account
                            </Button>
                        </div>
                    </RenderIf>
                    <div>
                        <Label htmlFor="name">First Name</Label>
                        <Input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={nameError ? 'border-destructive' : ''}
                        />
                        {nameError && <p className="text-sm text-destructive">{nameError}</p>}
                    </div>

                    <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                            id="lastName"
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className={lastNameError ? 'border-destructive' : ''}
                        />
                        {lastNameError && <p className="text-sm text-destructive">{lastNameError}</p>}
                    </div>

                    {showProfileBirthdate && (
                        <div>
                            <Label htmlFor="birthDate">Birth Date</Label>
                            <DatePicker date={birthDate} onChange={setBirthDate} />
                        </div>
                    )}

                    {showProfileGender && (
                        <div>
                            <Label htmlFor="gender">Gender</Label>
                            <Select value={gender} onValueChange={(v) => setGender(v as 'male' | 'female' | 'other')}>
                                <SelectTrigger id="gender" className={genderError ? 'border-destructive' : ''}>
                                    <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                            {genderError && <p className="text-sm text-destructive">{genderError}</p>}
                        </div>
                    )}

                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="text" value={email} disabled />
                    </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-2 md:flex-row">
                    <Button
                        onClick={(e) => {
                            e.preventDefault()
                            handleSubmit()
                        }}
                        disabled={!name || !lastName || (showProfileGender && !gender)}
                    >
                        Save Profile
                    </Button>
                    <RenderIf isTrue={requestor?.identity === user.identity && showChangePassword}>
                        <PasswordComponent />
                    </RenderIf>
                </CardFooter>
            </Card>
        </div>
    )
}

export default ProfileSettings
