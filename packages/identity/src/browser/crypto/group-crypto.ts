/**
 * Group Cryptography Utilities
 *
 * This module provides zero-knowledge encryption for group secrets.
 * - AES-256-GCM for encrypting group secrets
 * - X25519/ECDH for secure key exchange between devices
 * - All encryption is client-side, the server never sees plaintext
 */

// Key storage constants
const DEVICE_KEY_STORAGE = 'authlance_device_keypair'
const GROUP_KEY_STORAGE_PREFIX = 'authlance_group_key_'

// Utility functions for Base64 encoding/decoding
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i)
    }
    return bytes.buffer
}

// Generate a random AES-256 key for group encryption
export async function generateGroupKey(): Promise<CryptoKey> {
    return await crypto.subtle.generateKey(
        {
            name: 'AES-GCM',
            length: 256,
        },
        true, // extractable
        ['encrypt', 'decrypt']
    )
}

// Generate a device keypair for key exchange (ECDH)
export async function generateDeviceKeyPair(): Promise<CryptoKeyPair> {
    return await crypto.subtle.generateKey(
        {
            name: 'ECDH',
            namedCurve: 'P-256',
        },
        true, // extractable
        ['deriveKey', 'deriveBits']
    )
}

// Export public key to base64 for transmission
export async function exportPublicKey(publicKey: CryptoKey): Promise<string> {
    const exported = await crypto.subtle.exportKey('spki', publicKey)
    return arrayBufferToBase64(exported)
}

// Import public key from base64
export async function importPublicKey(base64: string): Promise<CryptoKey> {
    const keyData = base64ToArrayBuffer(base64)
    return await crypto.subtle.importKey(
        'spki',
        keyData,
        {
            name: 'ECDH',
            namedCurve: 'P-256',
        },
        true,
        []
    )
}

// Export private key for secure storage
export async function exportPrivateKey(privateKey: CryptoKey): Promise<string> {
    const exported = await crypto.subtle.exportKey('pkcs8', privateKey)
    return arrayBufferToBase64(exported)
}

// Import private key from storage
export async function importPrivateKey(base64: string): Promise<CryptoKey> {
    const keyData = base64ToArrayBuffer(base64)
    return await crypto.subtle.importKey(
        'pkcs8',
        keyData,
        {
            name: 'ECDH',
            namedCurve: 'P-256',
        },
        true,
        ['deriveKey', 'deriveBits']
    )
}

// Export AES key for encryption/storage
export async function exportAESKey(key: CryptoKey): Promise<string> {
    const exported = await crypto.subtle.exportKey('raw', key)
    return arrayBufferToBase64(exported)
}

// Import AES key
export async function importAESKey(base64: string): Promise<CryptoKey> {
    const keyData = base64ToArrayBuffer(base64)
    return await crypto.subtle.importKey(
        'raw',
        keyData,
        {
            name: 'AES-GCM',
            length: 256,
        },
        true,
        ['encrypt', 'decrypt']
    )
}

// Derive shared secret using ECDH for encrypting group key
export async function deriveSharedKey(
    privateKey: CryptoKey,
    publicKey: CryptoKey
): Promise<CryptoKey> {
    return await crypto.subtle.deriveKey(
        {
            name: 'ECDH',
            public: publicKey,
        },
        privateKey,
        {
            name: 'AES-GCM',
            length: 256,
        },
        false,
        ['encrypt', 'decrypt']
    )
}

// Encrypt group key for a specific device's public key
export async function encryptGroupKeyForDevice(
    groupKey: CryptoKey,
    myPrivateKey: CryptoKey,
    recipientPublicKey: CryptoKey
): Promise<string> {
    // Derive shared secret
    const sharedKey = await deriveSharedKey(myPrivateKey, recipientPublicKey)

    // Export group key
    const rawGroupKey = await crypto.subtle.exportKey('raw', groupKey)

    // Encrypt group key with shared secret
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const encrypted = await crypto.subtle.encrypt(
        {
            name: 'AES-GCM',
            iv: iv,
        },
        sharedKey,
        rawGroupKey
    )

    // Combine IV and ciphertext
    const result = new Uint8Array(iv.length + encrypted.byteLength)
    result.set(iv)
    result.set(new Uint8Array(encrypted), iv.length)

    return arrayBufferToBase64(result.buffer)
}

// Decrypt group key received from another device
export async function decryptGroupKeyFromDevice(
    encryptedGroupKey: string,
    myPrivateKey: CryptoKey,
    senderPublicKey: CryptoKey
): Promise<CryptoKey> {
    // Derive shared secret
    const sharedKey = await deriveSharedKey(myPrivateKey, senderPublicKey)

    // Decode and split IV and ciphertext
    const combined = new Uint8Array(base64ToArrayBuffer(encryptedGroupKey))
    const iv = combined.slice(0, 12)
    const ciphertext = combined.slice(12)

    // Decrypt group key
    const rawGroupKey = await crypto.subtle.decrypt(
        {
            name: 'AES-GCM',
            iv: iv,
        },
        sharedKey,
        ciphertext
    )

    // Import as AES key
    return await crypto.subtle.importKey(
        'raw',
        rawGroupKey,
        {
            name: 'AES-GCM',
            length: 256,
        },
        true,
        ['encrypt', 'decrypt']
    )
}

// Encrypt secrets payload with group key
export async function encryptSecrets(
    payload: object,
    groupKey: CryptoKey
): Promise<string> {
    const plaintext = new TextEncoder().encode(JSON.stringify(payload))
    const iv = crypto.getRandomValues(new Uint8Array(12))

    const encrypted = await crypto.subtle.encrypt(
        {
            name: 'AES-GCM',
            iv: iv,
        },
        groupKey,
        plaintext
    )

    // Combine IV and ciphertext
    const result = new Uint8Array(iv.length + encrypted.byteLength)
    result.set(iv)
    result.set(new Uint8Array(encrypted), iv.length)

    return arrayBufferToBase64(result.buffer)
}

// Decrypt secrets payload with group key
export async function decryptSecrets<T = object>(
    encryptedPayload: string,
    groupKey: CryptoKey
): Promise<T> {
    const combined = new Uint8Array(base64ToArrayBuffer(encryptedPayload))
    const iv = combined.slice(0, 12)
    const ciphertext = combined.slice(12)

    const decrypted = await crypto.subtle.decrypt(
        {
            name: 'AES-GCM',
            iv: iv,
        },
        groupKey,
        ciphertext
    )

    const plaintext = new TextDecoder().decode(decrypted)
    return JSON.parse(plaintext) as T
}

// Device key management

export interface StoredDeviceKeys {
    publicKey: string
    privateKey: string
    deviceId?: string
}

// Get or create device keypair (stored in localStorage)
export async function getOrCreateDeviceKeyPair(): Promise<{
    keyPair: CryptoKeyPair
    publicKeyBase64: string
    isNew: boolean
}> {
    const stored = localStorage.getItem(DEVICE_KEY_STORAGE)

    if (stored) {
        try {
            const parsed: StoredDeviceKeys = JSON.parse(stored)
            const publicKey = await importPublicKey(parsed.publicKey)
            const privateKey = await importPrivateKey(parsed.privateKey)
            return {
                keyPair: { publicKey, privateKey },
                publicKeyBase64: parsed.publicKey,
                isNew: false,
            }
        } catch (error) {
            console.error('Error loading stored device keys, generating new ones', error)
        }
    }

    // Generate new keypair
    const keyPair = await generateDeviceKeyPair()
    const publicKeyBase64 = await exportPublicKey(keyPair.publicKey)
    const privateKeyBase64 = await exportPrivateKey(keyPair.privateKey)

    // Store in localStorage
    const toStore: StoredDeviceKeys = {
        publicKey: publicKeyBase64,
        privateKey: privateKeyBase64,
    }
    localStorage.setItem(DEVICE_KEY_STORAGE, JSON.stringify(toStore))

    return {
        keyPair,
        publicKeyBase64,
        isNew: true,
    }
}

// Update stored device ID
export function updateStoredDeviceId(deviceId: string): void {
    const stored = localStorage.getItem(DEVICE_KEY_STORAGE)
    if (stored) {
        const parsed: StoredDeviceKeys = JSON.parse(stored)
        parsed.deviceId = deviceId
        localStorage.setItem(DEVICE_KEY_STORAGE, JSON.stringify(parsed))
    }
}

// Get stored device ID
export function getStoredDeviceId(): string | undefined {
    const stored = localStorage.getItem(DEVICE_KEY_STORAGE)
    if (stored) {
        const parsed: StoredDeviceKeys = JSON.parse(stored)
        return parsed.deviceId
    }
    return undefined
}

// Group key management (stored per group)

// Store group key for a specific group
export async function storeGroupKey(groupId: number, groupKey: CryptoKey): Promise<void> {
    const exported = await exportAESKey(groupKey)
    localStorage.setItem(`${GROUP_KEY_STORAGE_PREFIX}${groupId}`, exported)
}

// Get stored group key for a specific group
export async function getStoredGroupKey(groupId: number): Promise<CryptoKey | null> {
    const stored = localStorage.getItem(`${GROUP_KEY_STORAGE_PREFIX}${groupId}`)
    if (!stored) {
        return null
    }
    try {
        return await importAESKey(stored)
    } catch (error) {
        console.error('Error loading stored group key', error)
        return null
    }
}

// Check if we have a group key stored
export function hasStoredGroupKey(groupId: number): boolean {
    return !!localStorage.getItem(`${GROUP_KEY_STORAGE_PREFIX}${groupId}`)
}

// Remove group key from storage
export function removeStoredGroupKey(groupId: number): void {
    localStorage.removeItem(`${GROUP_KEY_STORAGE_PREFIX}${groupId}`)
}

// Helper to detect device type
export function detectDeviceType(): string {
    const ua = navigator.userAgent.toLowerCase()
    if (/iphone|ipad|ipod/.test(ua)) {
        return 'ios'
    }
    if (/android/.test(ua)) {
        return 'android'
    }
    if (/windows/.test(ua)) {
        return 'windows'
    }
    if (/mac/.test(ua)) {
        return 'macos'
    }
    if (/linux/.test(ua)) {
        return 'linux'
    }
    return 'web'
}

// Generate a device name based on browser/platform
export function generateDeviceName(): string {
    const type = detectDeviceType()
    const browser = detectBrowser()
    return `${browser} on ${type.charAt(0).toUpperCase() + type.slice(1)}`
}

function detectBrowser(): string {
    const ua = navigator.userAgent
    if (ua.includes('Firefox')) {
        return 'Firefox'
    }
    if (ua.includes('Chrome')) {
        return 'Chrome'
    }
    if (ua.includes('Safari')) {
        return 'Safari'
    }
    if (ua.includes('Edge')) {
        return 'Edge'
    }
    if (ua.includes('Opera')) {
        return 'Opera'
    }
    return 'Browser'
}
