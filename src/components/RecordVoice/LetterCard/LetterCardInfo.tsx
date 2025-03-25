import { Box, Text } from '@chakra-ui/react'

interface LetterCardInfoProps {
    letter: string
}

export default function LetterCardInfo({ letter }: LetterCardInfoProps) {
    return (
        <Box>
            <Text fontSize="3xl" fontWeight="bold">
                {letter}
            </Text>
        </Box>
    )
}