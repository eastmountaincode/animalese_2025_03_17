import { Box, Heading, Tabs, Image, Text } from '@chakra-ui/react'
import './App.css'
import HowItWorks from './components/HowItWorks'
import RecordVoice from './components/RecordVoice'
import CreateVoice from './components/CreateVoice'


function AppContent() {
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
            <Tabs.Trigger value="create-voice" textStyle='xs' sm={{textStyle: 'sm'}}>Create voice</Tabs.Trigger>
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
      <AppContent />
    </Box>
  )
}

export default App
