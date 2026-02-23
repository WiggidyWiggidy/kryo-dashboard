import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Input,
  Select,
  Text,
  Flex,
  Badge,
  useToast,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import { ChevronDownIcon, AddIcon, SearchIcon } from '@chakra-ui/icons';

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

const calculateICE = (impact, confidence, ease) => {
  return ((impact + confidence + ease) / 3).toFixed(1);
};

const IdeaLog = () => {
  const [ideas, setIdeas] = useState([]);
  const [newIdea, setNewIdea] = useState({
    title: '',
    description: '',
    category: '',
    impact: '',
    confidence: '',
    ease: '',
  });
  const [filter, setFilter] = useState('all');
  const [sortField, setSortField] = useState('ice');
  const [sortDirection, setSortDirection] = useState('desc');
  const toast = useToast();

  useEffect(() => {
    // Load ideas from localStorage
    const savedIdeas = localStorage.getItem('ideas');
    if (savedIdeas) {
      setIdeas(JSON.parse(savedIdeas));
    }
  }, []);

  useEffect(() => {
    // Save to localStorage whenever ideas change
    localStorage.setItem('ideas', JSON.stringify(ideas));
  }, [ideas]);

  const handleAddIdea = () => {
    if (!newIdea.title || !newIdea.description) {
      toast({
        title: 'Error',
        description: 'Title and description are required',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    const ice = calculateICE(
      parseInt(newIdea.impact),
      parseInt(newIdea.confidence),
      parseInt(newIdea.ease)
    );

    const idea = {
      id: Date.now(),
      ...newIdea,
      ice,
      timestamp: new Date().toISOString(),
      status: 'new'
    };

    setIdeas([...ideas, idea]);
    setNewIdea({
      title: '',
      description: '',
      category: '',
      impact: '',
      confidence: '',
      ease: '',
    });
  };

  const sortedIdeas = [...ideas].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case 'ice':
        comparison = b.ice - a.ice;
        break;
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'category':
        comparison = a.category.localeCompare(b.category);
        break;
      default:
        comparison = new Date(b.timestamp) - new Date(a.timestamp);
    }
    return sortDirection === 'asc' ? comparison * -1 : comparison;
  });

  const filteredIdeas = filter === 'all' 
    ? sortedIdeas 
    : sortedIdeas.filter(idea => idea.category === filter);

  return (
    <Box p={5}>
      <Flex mb={5} gap={4}>
        <Input
          placeholder="Title"
          value={newIdea.title}
          onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
        />
        <Input
          placeholder="Description"
          value={newIdea.description}
          onChange={(e) => setNewIdea({ ...newIdea, description: e.target.value })}
        />
        <Select
          placeholder="Category"
          value={newIdea.category}
          onChange={(e) => setNewIdea({ ...newIdea, category: e.target.value })}
        >
          {CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </Select>
        <Input
          placeholder="Impact (1-10)"
          type="number"
          min="1"
          max="10"
          value={newIdea.impact}
          onChange={(e) => setNewIdea({ ...newIdea, impact: e.target.value })}
        />
        <Input
          placeholder="Confidence (1-10)"
          type="number"
          min="1"
          max="10"
          value={newIdea.confidence}
          onChange={(e) => setNewIdea({ ...newIdea, confidence: e.target.value })}
        />
        <Input
          placeholder="Ease (1-10)"
          type="number"
          min="1"
          max="10"
          value={newIdea.ease}
          onChange={(e) => setNewIdea({ ...newIdea, ease: e.target.value })}
        />
        <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={handleAddIdea}>
          Add Idea
        </Button>
      </Flex>

      <Flex mb={5} gap={4}>
        <Select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          w="200px"
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </Select>
        <Menu>
          <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
            Sort by: {sortField}
          </MenuButton>
          <MenuList>
            <MenuItem onClick={() => setSortField('ice')}>ICE Score</MenuItem>
            <MenuItem onClick={() => setSortField('title')}>Title</MenuItem>
            <MenuItem onClick={() => setSortField('category')}>Category</MenuItem>
            <MenuItem onClick={() => setSortField('timestamp')}>Date Added</MenuItem>
          </MenuList>
        </Menu>
        <IconButton
          icon={sortDirection === 'asc' ? '↑' : '↓'}
          onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
        />
      </Flex>

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Title</Th>
            <Th>Description</Th>
            <Th>Category</Th>
            <Th>ICE Score</Th>
            <Th>Impact</Th>
            <Th>Confidence</Th>
            <Th>Ease</Th>
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
                <Badge colorScheme="green">{idea.ice}</Badge>
              </Td>
              <Td isNumeric>{idea.impact}</Td>
              <Td isNumeric>{idea.confidence}</Td>
              <Td isNumeric>{idea.ease}</Td>
              <Td>
                <Badge
                  colorScheme={
                    idea.status === 'completed'
                      ? 'green'
                      : idea.status === 'in-progress'
                      ? 'yellow'
                      : 'gray'
                  }
                >
                  {idea.status}
                </Badge>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default IdeaLog;