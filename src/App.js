import React from 'react';
import {
  ChakraProvider,
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Heading,
  Container,
} from '@chakra-ui/react';
import IdeaLog from './components/IdeaLog';

function App() {
  return (
    <ChakraProvider>
      <Box minH="100vh" bg="gray.50">
        <Container maxW="container.xl" py={5}>
          <Heading mb={5}>KRYO Command Centre</Heading>
          <Tabs isLazy>
            <TabList>
              <Tab>Marketing Performance</Tab>
              <Tab>Experiment Queue</Tab>
              <Tab>Idea Log</Tab>
              <Tab>Token Usage</Tab>
              <Tab>Live Tokens</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <Box p={4}>Marketing Performance Dashboard (Coming Soon)</Box>
              </TabPanel>
              <TabPanel>
                <Box p={4}>Experiment Queue (Coming Soon)</Box>
              </TabPanel>
              <TabPanel>
                <IdeaLog />
              </TabPanel>
              <TabPanel>
                <Box p={4}>Token Usage Analytics (Coming Soon)</Box>
              </TabPanel>
              <TabPanel>
                <Box p={4}>Live Token Monitoring (Coming Soon)</Box>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Container>
      </Box>
    </ChakraProvider>
  );
}

export default App;