import { Box, Button, Text, VStack } from '@chakra-ui/react'

interface LetterCardProps {
  letter: string
}

export default function LetterCard({ letter }: LetterCardProps) {
  const handlePlay = () => {
    console.log(`Play letter: ${letter}`)
  }

  const handleRecord = () => {
    console.log(`Record letter: ${letter}`)
  }

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
      <Text fontSize="3xl" fontWeight="bold">
        {letter}
      </Text>

      <Button w="80%" onClick={handleRecord}>
        Record
      </Button>

      <Button variant="outline" size="lg" w="80%" onClick={handlePlay}>
        Play
      </Button>
    </Box>
  )
}
