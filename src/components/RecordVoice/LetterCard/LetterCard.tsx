import { Box } from '@chakra-ui/react'
import LetterCardInfo from './LetterCardInfo'
import LetterCardRecord from './LetterCardRecord'
import LetterCardPlayTrim from './LetterCardPlayTrim'

interface LetterCardProps {
    letter: string
}

export default function LetterCard({ letter }: LetterCardProps) {
    return (
        <Box
            borderWidth="2px"
            borderRadius="xl"
            shadow="md"
            w="250px"
            h="275px"
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            gap={4}
            p={6}
        >
            <LetterCardInfo letter={letter} />
            <LetterCardRecord letter={letter} />
            <LetterCardPlayTrim letter={letter} />
        </Box>
    )
}