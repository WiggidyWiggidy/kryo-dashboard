import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  FormControl,
  FormLabel,
  Textarea,
  NumberInput,
  NumberInputField,
  Badge,
  Select,
  useToast,
  HStack,
  VStack
} from '@chakra-ui/react';

const CATEGORIES = [
  'Feature Improvement',
  'New Ad Creative',
  'New Strategy',
  'User Experience',
  'Technical Enhancement',
  'Marketing Campaign',
  'Product Extension',
  'Growth Initiative'
];

const calculateTokenCost = (idea) => {
  // Base costs per category
  const baseCosts = {
    'Feature Improvement': 2000,
    'New Ad Creative': 1500,
    'New Strategy': 4000,
    'User Experience': 2500,
    'Technical Enhancement': 3000,
    'Marketing Campaign': 2500,
    'Product Extension': 4000,
    'Growth Initiative': 3500
  };

  const complexity = (idea.ice_score.impact + idea.ice_score.confidence + idea.ice_score.ease) / 30;
  return Math.round(baseCosts[idea.category] * complexity);
};

const IdeaLog = () => {
  const [ideas, setIdeas] = useState([]);
  const [newIdea, setNewIdea] = useState({
    title: '',
    description: '',
    category: '',
    impact: '',
    confidence: '',
    ease: ''
  });
  const [sortBy, setSortBy] = useState('ice');
  const [filterCategory, setFilterCategory] = useState('all');
  const toast = useToast();

  useEffect(() => {
    const savedIdeas = localStorage.getItem('ideas');
    if (savedIdeas) {
      setIdeas(JSON.parse(savedIdeas));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('ideas', JSON.stringify(ideas));
  }, [ideas]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!newIdea.title || !newIdea.description || !newIdea.category) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        status: 'error',
        duration: 3000,
        isClosable: true
      });
      return;
    }

    const ice_score = {
      impact: parseInt(newIdea.impact),
      confidence: parseInt(newIdea.confidence),
      ease: parseInt(newIdea.ease),
      total: (parseInt(newIdea.impact) + parseInt(newIdea.confidence) + parseInt(newIdea.ease)) / 3
    };

    const idea = {
      id: Date.now(),
      ...newIdea,
      ice_score,
      status: 'new',
      created_at: new Date().toISOString()
    };

    idea.token_cost = calculateTokenCost(idea);
    
    setIdeas([...ideas, idea]);
    setNewIdea({
      title: '',
      description: '',
      category: '',
      impact: '',
      confidence: '',
      ease: ''
    });

    toast({
      title: 'Idea added',
      description: 'Your idea has been successfully logged',
      status: 'success',
      duration: 3000,
      isClosable: true
    });
  };

  const sortedIdeas = [...ideas].sort((a, b) => {
    switch (sortBy) {
      case 'ice':
        return b.ice_score.total - a.ice_score.total;
      case 'cost':
        return b.token_cost - a.token_cost;
      case 'date':
        return new Date(b.created_at) - new Date(a.created_at);
      default:
        return 0;
    }
  });

  const filteredIdeas = filterCategory === 'all' 
    ? sortedIdeas 
    : sortedIdeas.filter(idea => idea.category === filterCategory);

  return (
    <Box p={5}>
      <VStack spacing={6} align="stretch">
        <Box as="form" onSubmit={handleSubmit}>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel>Title</FormLabel>
              <Input
                value={newIdea.title}
                onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
                placeholder="Idea title"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Description</FormLabel>
              <Textarea
                value={newIdea.description}
                onChange={(e) => setNewIdea({ ...newIdea, description: e.target.value })}
                placeholder="Describe your idea"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Category</FormLabel>
              <Select
                value={newIdea.category}
                onChange={(e) => setNewIdea({ ...newIdea, category: e.target.value })}
                placeholder="Select category"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </Select>
            </FormControl>

            <HStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Impact (1-10)</FormLabel>
                <NumberInput min={1} max={10}>
                  <NumberInputField
                    value={newIdea.impact}
                    onChange={(e) => setNewIdea({ ...newIdea, impact: e.target.value })}
                  />
                </NumberInput>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Confidence (1-10)</FormLabel>
                <NumberInput min={1} max={10}>
                  <NumberInputField
                    value={newIdea.confidence}
                    onChange={(e) => setNewIdea({ ...newIdea, confidence: e.target.value })}
                  />
                </NumberInput>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Ease (1-10)</FormLabel>
                <NumberInput min={1} max={10}>
                  <NumberInputField
                    value={newIdea.ease}
                    onChange={(e) => setNewIdea({ ...newIdea, ease: e.target.value })}
                  />
                </NumberInput>
              </FormControl>
            </HStack>

            <Button type="submit" colorScheme="blue">Add Idea</Button>
          </VStack>
        </Box>

        <HStack spacing={4}>
          <Select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            w="200px"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </Select>

          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            w="200px"
          >
            <option value="ice">Sort by ICE Score</option>
            <option value="cost">Sort by Token Cost</option>
            <option value="date">Sort by Date</option>
          </Select>
        </HStack>

        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Title</Th>
              <Th>Description</Th>
              <Th>Category</Th>
              <Th isNumeric>ICE Score</Th>
              <Th isNumeric>Token Cost</Th>
              <Th>Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredIdeas.map((idea) => (
              <Tr key={idea.id}>
                <Td>{idea.title}</Td>
                <Td>{idea.description}</Td>
                <Td>
                  <Badge colorScheme="blue">{idea.category}</Badge>
                </Td>
                <Td isNumeric>
                  <Badge colorScheme="green">{idea.ice_score.total.toFixed(1)}</Badge>
                </Td>
                <Td isNumeric>{idea.token_cost}</Td>
                <Td>
                  <Badge
                    colorScheme={
                      idea.status === 'completed' ? 'green' :
                      idea.status === 'in-progress' ? 'yellow' :
                      'gray'
                    }
                  >
                    {idea.status}
                  </Badge>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </VStack>
    </Box>
  );
};

export default IdeaLog;