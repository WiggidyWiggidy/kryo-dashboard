import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Select,
  HStack,
  Text,
  Progress,
  Tooltip,
  VStack,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
} from '@chakra-ui/react';

const calculatePriority = (ice, complexity, urgency) => {
  return ((ice * 0.5) + (complexity * 0.3) + (urgency * 0.2)).toFixed(1);
};

const calculateDevelopmentCost = (feature) => {
  const baseTokens = {
    'Core Feature': 10000,
    'Enhancement': 5000,
    'Integration': 7500,
    'Performance': 6000,
    'Security': 8000
  };

  const complexityMultiplier = feature.complexity / 5;
  return Math.round(baseTokens[feature.type] * complexityMultiplier);
};

const FeatureQueue = () => {
  const [features, setFeatures] = useState([]);
  const [sortBy, setSortBy] = useState('priority');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    const savedFeatures = localStorage.getItem('features');
    if (savedFeatures) {
      setFeatures(JSON.parse(savedFeatures));
    } else {
      // Load initial data if nothing in localStorage
      import('../../data/initialData').then(({ initialFeatures }) => {
        setFeatures(initialFeatures);
        localStorage.setItem('features', JSON.stringify(initialFeatures));
      });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('features', JSON.stringify(features));
  }, [features]);

  const sortedFeatures = [...features].sort((a, b) => {
    switch (sortBy) {
      case 'priority':
        return b.priority - a.priority;
      case 'cost':
        return b.token_cost - a.token_cost;
      case 'date':
        return new Date(b.created_at) - new Date(a.created_at);
      default:
        return 0;
    }
  });

  const filteredFeatures = filterType === 'all'
    ? sortedFeatures
    : sortedFeatures.filter(feature => feature.type === filterType);

  const totalTokenCost = filteredFeatures.reduce((sum, feature) => sum + feature.token_cost, 0);
  const averagePriority = filteredFeatures.reduce((sum, feature) => sum + feature.priority, 0) / filteredFeatures.length || 0;

  return (
    <Box p={5}>
      <VStack spacing={6} align="stretch">
        <StatGroup>
          <Stat>
            <StatLabel>Total Token Cost</StatLabel>
            <StatNumber>{totalTokenCost.toLocaleString()} tokens</StatNumber>
            <Text fontSize="sm" color="gray.500">(≈${(totalTokenCost * 0.00002).toFixed(2)})</Text>
          </Stat>
          <Stat>
            <StatLabel>Average Priority Score</StatLabel>
            <StatNumber>{averagePriority.toFixed(1)}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Features Queued</StatLabel>
            <StatNumber>{filteredFeatures.length}</StatNumber>
          </Stat>
        </StatGroup>

        <HStack spacing={4}>
          <Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            w="200px"
          >
            <option value="all">All Types</option>
            <option value="Core Feature">Core Features</option>
            <option value="Enhancement">Enhancements</option>
            <option value="Integration">Integrations</option>
            <option value="Performance">Performance</option>
            <option value="Security">Security</option>
          </Select>

          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            w="200px"
          >
            <option value="priority">Sort by Priority</option>
            <option value="cost">Sort by Token Cost</option>
            <option value="date">Sort by Date</option>
          </Select>
        </HStack>

        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Feature</Th>
              <Th>Type</Th>
              <Th>Description</Th>
              <Th isNumeric>Priority</Th>
              <Th isNumeric>ICE</Th>
              <Th isNumeric>Token Cost</Th>
              <Th>Status</Th>
              <Th>Progress</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredFeatures.map((feature) => (
              <Tr key={feature.id}>
                <Td fontWeight="bold">{feature.title}</Td>
                <Td>
                  <Badge colorScheme={
                    feature.type === 'Core Feature' ? 'red' :
                    feature.type === 'Enhancement' ? 'green' :
                    feature.type === 'Integration' ? 'blue' :
                    feature.type === 'Performance' ? 'yellow' :
                    'purple'
                  }>
                    {feature.type}
                  </Badge>
                </Td>
                <Td>{feature.description}</Td>
                <Td isNumeric>
                  <Badge colorScheme={
                    feature.priority >= 8 ? 'red' :
                    feature.priority >= 6 ? 'yellow' :
                    'green'
                  }>
                    {feature.priority}
                  </Badge>
                </Td>
                <Td isNumeric>{feature.ice_score.total.toFixed(1)}</Td>
                <Td isNumeric>
                  <Tooltip label={`≈$${(feature.token_cost * 0.00002).toFixed(2)}`}>
                    {feature.token_cost.toLocaleString()}
                  </Tooltip>
                </Td>
                <Td>
                  <Badge colorScheme={
                    feature.status === 'completed' ? 'green' :
                    feature.status === 'in-progress' ? 'yellow' :
                    feature.status === 'blocked' ? 'red' :
                    'gray'
                  }>
                    {feature.status}
                  </Badge>
                </Td>
                <Td>
                  <Progress
                    value={feature.progress || 0}
                    size="sm"
                    colorScheme={
                      feature.progress >= 80 ? 'green' :
                      feature.progress >= 40 ? 'yellow' :
                      'red'
                    }
                  />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </VStack>
    </Box>
  );
};

export default FeatureQueue;