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
  extendTheme,
  VStack,
  Text
} from '@chakra-ui/react';
import IdeaLog from './components/IdeaLog';
import FeatureQueue from './components/FeatureQueue';
import ExperimentQueue from './components/ExperimentQueue';

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
          <VStack spacing={4} align="stretch" mb={8}>
            <Heading>KRYO Command Centre</Heading>
            <Text color="gray.600">
              Centralized dashboard for ideas, features, and experiments
            </Text>
          </VStack>
          
          <Tabs isLazy variant="enclosed-colored">
            <TabList>
              <Tab>Idea Log</Tab>
              <Tab>Feature Queue</Tab>
              <Tab>Experiment Queue</Tab>
              <Tab>Token Usage</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <IdeaLog />
              </TabPanel>
              <TabPanel>
                <FeatureQueue />
              </TabPanel>
              <TabPanel>
                <ExperimentQueue />
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