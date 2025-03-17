import { useState } from 'react'
import { Box, Button, Text, Flex } from '@chakra-ui/react'
import LetterCard from './LetterCard'
import { motion } from 'framer-motion'

const MotionFlex = motion(Flex)
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

export default function RecordVoice() {
    const [currentIndex, setCurrentIndex] = useState(0)

    const nextLetter = () => setCurrentIndex((current) => Math.min(current + 1, alphabet.length - 1))
    const prevLetter = () => setCurrentIndex((current) => Math.max(current - 1, 0))

    return (
        <Box textAlign="center" mx="auto" maxW="800px" border="1px solid red">
            <Flex direction="column" align="center" gap={4} border="1px solid blue">
                <Flex align="center" justify="center" gap={4} width="100%">
                    <Button display={{ base: 'none', sm: 'none', md: 'inline-flex' }} onClick={prevLetter} disabled={currentIndex === 0}>←</Button>
                    <Box width="100%" height="320px" overflow="hidden" position="relative" border="1px solid green" display="flex" alignItems="center">
                        <MotionFlex animate={{ x: `-${currentIndex * (250 + 16)}px` }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} gap={4} position="absolute" height="100%" border="1px solid yellow" display="flex" alignItems="center" justifyContent="center">
                            {alphabet.map((letter) => <LetterCard key={letter} letter={letter} />)}
                        </MotionFlex>
                    </Box>
                    <Button display={{ base: 'none', sm: 'none', md: 'inline-flex' }} onClick={nextLetter} disabled={currentIndex === alphabet.length - 1}>→</Button>
                </Flex>
            </Flex>
            <Flex gap={4} display={{ base: 'flex', sm: 'flex', md: 'none' }} justify="center" border="1px solid purple">
                    <Button onClick={prevLetter} disabled={currentIndex === 0}>←</Button>
                    <Button onClick={nextLetter} disabled={currentIndex === alphabet.length - 1}>→</Button>
            </Flex>

            <Text mt={4}>{currentIndex + 1} / {alphabet.length}</Text>
        </Box>
    )
}
