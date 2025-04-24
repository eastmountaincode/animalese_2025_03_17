import { Box, Heading, Tabs, Image, Flex, Center } from '@chakra-ui/react'
import './App.css'
import { lazy, Suspense, memo } from 'react'
import { useAtomValue } from 'jotai'
import { isCompleteAtom } from './atoms/recordingAtoms'
import RecordingsLoader from './components/RecordVoice/RecordingsLoader'
import { FaBan, FaCheckCircle } from 'react-icons/fa'

// Lazy load tab content components
const HowItWorks = lazy(() => import('./components/HowItWorks'))
const RecordVoice = lazy(() => import('./components/RecordVoice/RecordVoice'))
const CreateVoice = lazy(() => import('./components/CreateVoice/CreateVoice'))

// Memoized AppContent component to prevent unnecessary re-renders
const AppContent = memo(function AppContent() {
  const isComplete = useAtomValue(isCompleteAtom)
  
  return (
    <Box w="100%" display="flex" flexDir="column" alignItems="center" p={4}>
      <Heading maxW="md" mb={2} display="flex" flexDir="column" alignItems="center">
        <Image src="assets/ac_header.png" maxH={{ base: "80px", md: "160px" }} />
      </Heading>
      <Box w="100%">
        <Tabs.Root defaultValue="record-voice" justify="center" variant="outline">
          <Tabs.List gap={2}>
            <Tabs.Trigger value="how-it-works" textStyle={{ base: 'xs', sm: 'sm' }}>How it works</Tabs.Trigger>
            <Tabs.Trigger value="record-voice" textStyle={{ base: 'xs', sm: 'sm' }}>Record voice</Tabs.Trigger>
            <Tabs.Trigger value="create-voice" textStyle={{ base: 'xs', sm: 'sm' }}>
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
          <Suspense fallback={<Center w="100%" p={8}>Loading...</Center>}>
            <Tabs.Content value="how-it-works">
              <HowItWorks />
            </Tabs.Content>
            <Tabs.Content value="record-voice">
              <RecordVoice />
            </Tabs.Content>
            <Tabs.Content value="create-voice">
              <CreateVoice />
            </Tabs.Content>
          </Suspense>
        </Tabs.Root>
      </Box>
    </Box>
  )
})

function App() {
  return (
    <Box>
      <RecordingsLoader />
      <AppContent />
    </Box>
  )
}

export default App
