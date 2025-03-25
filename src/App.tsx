import { Box, Heading, Tabs, Image, Flex } from '@chakra-ui/react'
import './App.css'
import HowItWorks from './components/HowItWorks'
import RecordVoice from './components/RecordVoice/RecordVoice'
import CreateVoice from './components/CreateVoice'
import { useAtomValue } from 'jotai'
import { isCompleteAtom } from './atoms/recordingAtoms'
import RecordingsLoader from './components/RecordVoice/RecordingsLoader'
import { FaBan, FaCheckCircle } from 'react-icons/fa'

function AppContent() {
  const isComplete = useAtomValue(isCompleteAtom)
  
  return (
    <Box w="100%" display="flex" flexDir="column" alignItems="center" p={4}>
      <Heading maxW="md" mb={2} display="flex" flexDir="column" alignItems="center">
        <Image src="assets/ac_header.png" maxH="80px" md={{maxH:"160px"}} />
      </Heading>
      <Box w="100%">
        <Tabs.Root defaultValue="record-voice" justify="center" variant="outline">
          <Tabs.List gap={2}>
            <Tabs.Trigger value="how-it-works" textStyle='xs' sm={{textStyle: 'sm'}}>How it works</Tabs.Trigger>
            <Tabs.Trigger value="record-voice" textStyle='xs' sm={{textStyle: 'sm'}}>Record voice</Tabs.Trigger>
            <Tabs.Trigger value="create-voice" textStyle='xs' sm={{textStyle: 'sm'}}>
              <Flex align="center">
                Create voice
                {isComplete ? (
                  <FaCheckCircle color="green" size={16} style={{ marginLeft: '8px' }} />
                ) : (
                  <FaBan color="#A0AEC0" size={16} style={{ marginLeft: '8px' }} />
                )}
              </Flex>
            </Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="how-it-works">
            <HowItWorks />
          </Tabs.Content>
          <Tabs.Content value="record-voice">
            <RecordVoice />
          </Tabs.Content>
          <Tabs.Content value="create-voice">
            <CreateVoice />
          </Tabs.Content>
        </Tabs.Root>
      </Box>
    </Box>
  )
}

function App() {
  return (
    <Box>
      <RecordingsLoader />
      <AppContent />
    </Box>
  )
}

export default App
