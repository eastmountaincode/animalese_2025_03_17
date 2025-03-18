import { useState } from 'react'
import { Box, Button, Text } from '@chakra-ui/react'
import LetterCarousel from './LetterCarousel'

// Function to check microphone permission status
async function checkMicrophonePermission() {
    if (!navigator.permissions) {
        return 'unknown' // Older browsers may not support the Permissions API
    }
    try {
        // @ts-ignore - 'microphone' is a valid value but TypeScript definitions may be outdated
        const permissionStatus = await navigator.permissions.query({ name: 'microphone' })
        return permissionStatus.state // 'granted', 'denied', or 'prompt'
    } catch (error) {
        console.error('Error checking mic permissions:', error)
        return 'unknown'
    }
}

// Browser-safeguard getUserMedia wrapper:
async function getMicrophoneAccess() {
    if (navigator.mediaDevices?.getUserMedia) {
        return navigator.mediaDevices.getUserMedia({ audio: true })
    }
    throw new Error('Your browser does not support getUserMedia.')
}

export default function RecordVoice() {
    const [hasMicPermission, setHasMicPermission] = useState(false)
    const [micError, setMicError] = useState<string | null>(null)
    const [micBlocked, setMicBlocked] = useState(false)

    async function requestMicPermission() {
        try {
            const micPermission = await checkMicrophonePermission()

            if (micPermission === 'denied') {
                setMicBlocked(true)
                return
            }

            await getMicrophoneAccess()
            setHasMicPermission(true)
            setMicError(null)
            setMicBlocked(false)
        } catch (error) {
            console.error('Mic access denied or unsupported:', error)
            setMicError(error instanceof Error ? error.message : String(error))
        }
    }

    if (micBlocked) {
        return (
            <Box textAlign="center" mx="auto" maxW="800px" mt={8} p={4}>
                <Text mb={4} fontSize="lg" color="red.500">
                    Microphone access is blocked.
                </Text>
                <Text fontSize="md">
                    To enable microphone access, follow these steps:
                </Text>
                <Box 
                    textAlign="left" 
                    fontSize="xs" 
                    mt={2} 
                    p={4} 
                    borderRadius="md"
                    maxW="300px"
                    mx="auto"

                >
                    <Text>1️⃣ Open your browser settings.</Text>
                    <Text>2️⃣ Find "Privacy & Security" or "Site Settings".</Text>
                    <Text>3️⃣ Look for "Microphone" and set it to "Allow".</Text>
                    <Text>4️⃣ Refresh this page and try again.</Text>
                </Box>
                <Button mt={4} onClick={() => window.location.reload()}>
                    Refresh and Try Again
                </Button>
            </Box>
        )
    }

    if (micError) {
        return (
            <Box textAlign="center" mx="auto" maxW="800px" mt={8}>
                <Text mb={4} fontSize="lg">
                    {micError}
                </Text>
                <Text fontSize="sm">
                    Make sure you are on HTTPS or localhost and that your browser allows microphone access.
                </Text>
            </Box>
        )
    }

    if (!hasMicPermission) {
        return (
            <Box textAlign="center" mx="auto" maxW="800px" mt={8} p={4}>
                <Text mb={4} fontSize="lg">
                    Microphone access is required for recording.
                </Text>
                <Button 
                    onClick={requestMicPermission}
                    textStyle='xs'
                    sm={{textStyle: 'sm'}}
                >
                    Request Microphone Permission
                </Button>
            </Box>
        )
    }

    return <LetterCarousel />
}
