import { Box, Text } from '@chakra-ui/react'

interface LetterCardInfoProps {
    letter: string
}

export default function LetterCardInfo({ letter }: LetterCardInfoProps) {
    return (
        <Box border="1px solid green">
            <Text fontSize="3xl" fontWeight="bold">
                {letter}
            </Text>
        </Box>
    )
}