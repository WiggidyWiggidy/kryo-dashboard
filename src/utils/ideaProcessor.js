const FEATURE_KEYWORDS = [
  'build', 'create', 'implement', 'develop', 'add', 'integrate',
  'improve', 'optimize', 'enhance', 'upgrade', 'fix', 'system',
  'functionality', 'feature', 'capability', 'module'
];

const EXPERIMENT_KEYWORDS = [
  'test', 'try', 'experiment', 'measure', 'validate', 'hypothesis',
  'campaign', 'ad', 'marketing', 'copy', 'landing page', 'price',
  'messaging', 'audience', 'target'
];

export const processTelegramMessage = (message) => {
  const words = message.toLowerCase().split(' ');
  
  // Count feature vs experiment keywords
  const featureCount = words.filter(word => 
    FEATURE_KEYWORDS.some(keyword => word.includes(keyword))
  ).length;
  
  const experimentCount = words.filter(word => 
    EXPERIMENT_KEYWORDS.some(keyword => word.includes(keyword))
  ).length;

  const type = featureCount > experimentCount ? 'feature' : 'experiment';

  // Determine category based on content
  let category = '';
  if (type === 'feature') {
    if (message.toLowerCase().includes('performance')) category = 'Performance';
    else if (message.toLowerCase().includes('secur')) category = 'Security';
    else if (message.toLowerCase().includes('integrat')) category = 'Integration';
    else if (message.toLowerCase().includes('enhance')) category = 'Enhancement';
    else category = 'Core Feature';
  } else {
    if (message.toLowerCase().includes('landing')) category = 'Landing Page';
    else if (message.toLowerCase().includes('ad')) category = 'Ad Campaign';
    else if (message.toLowerCase().includes('copy')) category = 'Marketing Copy';
    else if (message.toLowerCase().includes('price')) category = 'Price Test';
    else category = 'A/B Test';
  }

  // Calculate base metrics
  const complexity = Math.ceil((message.length / 100) * 3); // 1-10 scale
  const impact = Math.ceil((featureCount + experimentCount) * 2); // 1-10 scale
  const confidence = type === 'feature' ? 7 : 6; // Features slightly more predictable
  const ease = Math.max(1, 10 - complexity);

  return {
    type,
    category,
    metrics: {
      impact: Math.min(10, impact),
      confidence: Math.min(10, confidence),
      ease: Math.min(10, ease),
      complexity: Math.min(10, complexity)
    }
  };
};

export const createFeatureFromMessage = (message) => {
  const analysis = processTelegramMessage(message);
  if (analysis.type !== 'feature') return null;

  return {
    id: Date.now(),
    title: message.split('.')[0] || message.slice(0, 50),
    description: message,
    type: analysis.category,
    ice_score: {
      impact: analysis.metrics.impact,
      confidence: analysis.metrics.confidence,
      ease: analysis.metrics.ease,
      total: (analysis.metrics.impact + analysis.metrics.confidence + analysis.metrics.ease) / 3
    },
    complexity: analysis.metrics.complexity,
    status: 'new',
    progress: 0,
    token_cost: calculateFeatureTokenCost(analysis),
    created_at: new Date().toISOString()
  };
};

export const createExperimentFromMessage = (message) => {
  const analysis = processTelegramMessage(message);
  if (analysis.type !== 'experiment') return null;

  return {
    id: Date.now(),
    title: message.split('.')[0] || message.slice(0, 50),
    hypothesis: message,
    type: analysis.category,
    ice_score: {
      impact: analysis.metrics.impact,
      confidence: analysis.metrics.confidence,
      ease: analysis.metrics.ease,
      total: (analysis.metrics.impact + analysis.metrics.confidence + analysis.metrics.ease) / 3
    },
    status: 'draft',
    token_cost: calculateExperimentTokenCost(analysis),
    created_at: new Date().toISOString(),
    duration_days: 7 // Default duration
  };
};

const calculateFeatureTokenCost = (analysis) => {
  const baseTokens = {
    'Core Feature': 10000,
    'Enhancement': 5000,
    'Integration': 7500,
    'Performance': 6000,
    'Security': 8000
  };

  return Math.round(baseTokens[analysis.category] * (analysis.metrics.complexity / 5));
};

const calculateExperimentTokenCost = (analysis) => {
  const baseTokens = {
    'A/B Test': 3000,
    'Marketing Copy': 2000,
    'Landing Page': 5000,
    'Ad Campaign': 4000,
    'Price Test': 1500
  };

  return Math.round(baseTokens[analysis.category] * (analysis.metrics.complexity / 5));