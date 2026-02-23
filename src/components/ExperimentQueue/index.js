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

const calculateConfidenceInterval = (experiment) => {
  return Math.min(((experiment.sample_size || 0) / 1000) * 100, 95);
};

const calculateExperimentCost = (experiment) => {
  const baseTokens = {
    'A/B Test': 3000,
    'Marketing Copy': 2000,
    'Landing Page': 5000,
    'Ad Campaign': 4000,
    'Price Test': 1500
  };

  const durationMultiplier = experiment.duration_days / 7; // weekly basis
  return Math.round(baseTokens[experiment.type] * durationMultiplier);
};

const ExperimentQueue = () => {
  const [experiments, setExperiments] = useState([]);
  const [sortBy, setSortBy] = useState('ice');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    const savedExperiments = localStorage.getItem('experiments');
    if (savedExperiments) {
      setExperiments(JSON.parse(savedExperiments));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('experiments', JSON.stringify(experiments));
  }, [experiments]);

  const sortedExperiments = [...experiments].sort((a, b) => {
    switch (sortBy) {
      case 'ice':
        return b.ice_score.total - a.ice_score.total;
      case 'cost':
        return b.token_cost - a.token_cost;
      case 'confidence':
        return calculateConfidenceInterval(b) - calculateConfidenceInterval(a);
      default:
        return 0;
    }
  });

  const filteredExperiments = filterType === 'all'
    ? sortedExperiments
    : sortedExperiments.filter(exp => exp.type === filterType);

  const totalTokenCost = filteredExperiments.reduce((sum, exp) => sum + exp.token_cost, 0);
  const averageIce = filteredExperiments.reduce((sum, exp) => sum + exp.ice_score.total, 0) / filteredExperiments.length || 0;

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
            <StatLabel>Average ICE Score</StatLabel>
            <StatNumber>{averageIce.toFixed(1)}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Active Experiments</StatLabel>
            <StatNumber>{filteredExperiments.length}</StatNumber>
          </Stat>
        </StatGroup>

        <HStack spacing={4}>
          <Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            w="200px"
          >
            <option value="all">All Types</option>
            <option value="A/B Test">A/B Tests</option>
            <option value="Marketing Copy">Marketing Copy</option>
            <option value="Landing Page">Landing Pages</option>
            <option value="Ad Campaign">Ad Campaigns</option>
            <option value="Price Test">Price Tests</option>
          </Select>

          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            w="200px"
          >
            <option value="ice">Sort by ICE Score</option>
            <option value="cost">Sort by Token Cost</option>
            <option value="confidence">Sort by Confidence</option>
          </Select>
        </HStack>

        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Experiment</Th>
              <Th>Type</Th>
              <Th>Hypothesis</Th>
              <Th isNumeric>ICE Score</Th>
              <Th isNumeric>Token Cost</Th>
              <Th>Status</Th>
              <Th>Confidence</Th>
              <Th>Results</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredExperiments.map((experiment) => (
              <Tr key={experiment.id}>
                <Td fontWeight="bold">{experiment.title}</Td>
                <Td>
                  <Badge colorScheme={
                    experiment.type === 'A/B Test' ? 'blue' :
                    experiment.type === 'Marketing Copy' ? 'green' :
                    experiment.type === 'Landing Page' ? 'purple' :
                    experiment.type === 'Ad Campaign' ? 'orange' :
                    'red'
                  }>
                    {experiment.type}
                  </Badge>
                </Td>
                <Td>{experiment.hypothesis}</Td>
                <Td isNumeric>
                  <Badge colorScheme={
                    experiment.ice_score.total >= 8 ? 'green' :
                    experiment.ice_score.total >= 6 ? 'yellow' :
                    'red'
                  }>
                    {experiment.ice_score.total.toFixed(1)}
                  </Badge>
                </Td>
                <Td isNumeric>
                  <Tooltip label={`≈$${(experiment.token_cost * 0.00002).toFixed(2)}`}>
                    {experiment.token_cost.toLocaleString()}
                  </Tooltip>
                </Td>
                <Td>
                  <Badge colorScheme={
                    experiment.status === 'completed' ? 'green' :
                    experiment.status === 'running' ? 'yellow' :
                    experiment.status === 'failed' ? 'red' :
                    'gray'
                  }>
                    {experiment.status}
                  </Badge>
                </Td>
                <Td>
                  <Progress
                    value={calculateConfidenceInterval(experiment)}
                    size="sm"
                    colorScheme={
                      calculateConfidenceInterval(experiment) >= 90 ? 'green' :
                      calculateConfidenceInterval(experiment) >= 70 ? 'yellow' :
                      'red'
                    }
                  />
                </Td>
                <Td>
                  {experiment.results ? (
                    <Badge colorScheme={
                      experiment.results.lift > 0 ? 'green' :
                      experiment.results.lift < 0 ? 'red' :
                      'yellow'
                    }>
                      {experiment.results.lift > 0 ? '+' : ''}{experiment.results.lift}%
                    </Badge>
                  ) : '-'}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </VStack>
    </Box>
  );
};

export default ExperimentQueue;