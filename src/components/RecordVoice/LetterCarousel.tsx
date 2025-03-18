import { useState, useEffect } from 'react'
import { Box, Flex, Button, Text, useBreakpointValue, Popover, Portal } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import LetterCard from './LetterCard/LetterCard'

const MotionFlex = motion(Flex)
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
import { clearAllRecordings } from '../../idb/recordings_db'

export default function LetterCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [animateX, setAnimateX] = useState(0)
    const [resetPopoverOpen, setResetPopoverOpen] = useState(false)
    const cardWidth = 250
    const gapSize = 16

    const isMobile = useBreakpointValue({ base: true, md: false })
    const viewportWidth = isMobile ? cardWidth + 40 : cardWidth + 100

    const nextLetter = () => setCurrentIndex((curr) => Math.min(curr + 1, alphabet.length - 1))
    const prevLetter = () => setCurrentIndex((curr) => Math.max(curr - 1, 0))

    // -- CLEAR ALL RECORDINGS --
    async function handleResetAllRecordings() {
        try {
            await clearAllRecordings()
            console.log('All recordings have been cleared.')

            // Dispatch a global event so each LetterCardPlayTrim can recheck
            window.dispatchEvent(new CustomEvent('all-recordings-cleared'))
            // Then close the popover if you'd like:
            setResetPopoverOpen(false)
        } catch (error) {
            console.error('Error clearing all recordings:', error)
        }
    }

    useEffect(() => {
        const totalCardWidth = cardWidth + gapSize
        const centerOffset = viewportWidth / 2 - cardWidth / 2

        let newX = -(currentIndex * totalCardWidth - centerOffset)

        // Boundaries to keep A and Z centered
        const maxOffset = centerOffset
        const minOffset = -(alphabet.length * totalCardWidth - gapSize - viewportWidth + centerOffset)

        newX = Math.min(maxOffset, Math.max(minOffset, newX))
        setAnimateX(newX)
    }, [currentIndex, viewportWidth])

    return (
        <Box textAlign="center" mx="auto" maxW="800px">
            <Flex direction="column" align="center" gap={4}>
                <Flex align="center" justify="center" gap={4} width="100%">
                    <Button
                        display={{ base: 'none', md: 'inline-flex' }}
                        onClick={prevLetter}
                        disabled={currentIndex === 0}
                    >
                        ←
                    </Button>

                    <Box
                        width={`${viewportWidth}px`}
                        height="320px"
                        overflow="hidden"
                        position="relative"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                    >
                        <MotionFlex
                            animate={{ x: animateX }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            gap={`${gapSize}px`}
                            position="absolute"
                            left={0}
                            height="100%"
                            alignItems="center"
                        >
                            {alphabet.map((letter) => (
                                <LetterCard key={letter} letter={letter} />
                            ))}
                        </MotionFlex>
                    </Box>

                    <Button
                        display={{ base: 'none', md: 'inline-flex' }}
                        onClick={nextLetter}
                        disabled={currentIndex === alphabet.length - 1}
                    >
                        →
                    </Button>
                </Flex>

                <Flex gap={4} display={{ base: 'flex', md: 'none' }} justify="center">
                    <Button onClick={prevLetter} disabled={currentIndex === 0}>←</Button>
                    <Button onClick={nextLetter} disabled={currentIndex === alphabet.length - 1}>→</Button>
                </Flex>

                <Text mt={4}>
                    {currentIndex + 1} / {alphabet.length}
                </Text>

                {/* Reset Recordings Button */}
                <Popover.Root open={resetPopoverOpen} onOpenChange={(e) => setResetPopoverOpen(e.open)} positioning={{ placement: 'top' }}>
                    <Popover.Trigger asChild>
                        <Button size="xs" variant="outline">
                            Reset All Recordings
                        </Button>
                    </Popover.Trigger>
                    <Portal>
                        <Popover.Positioner>
                            <Popover.Content w="fit-content">
                                <Popover.Arrow />
                                <Popover.Body>
                                    <Flex direction="column" gap={2} align="center">
                                        <Text>Are you sure?</Text>
                                        <Button onClick={handleResetAllRecordings} variant="outline" size="xs">Yes</Button>
                                    </Flex>
                                </Popover.Body>
                            </Popover.Content>
                        </Popover.Positioner>
                    </Portal>
                </Popover.Root>
            </Flex>
        </Box>
    )
}
