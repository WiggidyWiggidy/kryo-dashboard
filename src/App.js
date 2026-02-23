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
  extendTheme
} from '@chakra-ui/react';
import IdeaLog from './components/IdeaLog';

const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: 'gray.50'
      }
    }
  }
});

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Box minH="100vh">
        <Container maxW="container.xl" py={5}>
          <Heading mb={5}>KRYO Command Centre</Heading>
          <Tabs isLazy>
            <TabList>
              <Tab>Idea Log</Tab>
              <Tab>Marketing Performance</Tab>
              <Tab>Token Usage</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <IdeaLog />
              </TabPanel>
              <TabPanel>
                <Box p={4}>Marketing Performance Dashboard (Coming Soon)</Box>
              </TabPanel>
              <TabPanel>
                <Box p={4}>Token Usage Analytics (Coming Soon)</Box>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Container>
      </Box>
    </ChakraProvider>
  );
}

export default App;