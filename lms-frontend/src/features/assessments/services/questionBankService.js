/**
 * Question Bank Service
 * 
 * Provides curated, industry-standard questions (Algorithms, Data Structures,
 * Web Dev, System Design, OOP) and allows instructors to save, search, filter,
 * and import questions across assessments.
 */

const STORAGE_KEY = 'lms_custom_question_bank';

export const QUESTION_CATEGORIES = [
  { id: 'all', label: 'All Topics' },
  { id: 'algorithms', label: 'Algorithms & Logic' },
  { id: 'data-structures', label: 'Data Structures' },
  { id: 'web-dev', label: 'Full-Stack & Web Dev' },
  { id: 'oop', label: 'OOP & Architecture' },
  { id: 'math', label: 'Math & Numbers' },
];

const DEFAULT_QUESTION_BANK = [
  {
    id: 'qb-1',
    title: 'Two Sum Target Finder',
    category: 'algorithms',
    difficulty: 'EASY',
    questionType: 'CODING',
    compiler: 'ALL',
    marks: 10,
    timeLimitMs: 2000,
    memoryLimitMb: 256,
    tags: ['Arrays', 'Hash Table', 'Algorithms'],
    description: `Given an array of integers \`nums\` and an integer \`target\`, return the indices of the two numbers such that they add up to \`target\`.

Assume each input has exactly one solution, and you may not use the same element twice. Output indices space-separated.`,
    inputFormat: 'First line: space-separated integers for nums. Second line: integer target.',
    outputFormat: 'Space-separated pair of indices (e.g. "0 1").',
    constraints: '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9',
    testCases: [
      { inputData: '2 7 11 15\n9', expectedOutput: '0 1', sample: true, hidden: false, weight: 1 },
      { inputData: '3 2 4\n6', expectedOutput: '1 2', sample: true, hidden: false, weight: 1 },
      { inputData: '3 3\n6', expectedOutput: '0 1', sample: false, hidden: true, weight: 2 },
      { inputData: '1 5 8 12 19 25\n27', expectedOutput: '2 4', sample: false, hidden: true, weight: 2 },
    ],
    options: [],
  },
  {
    id: 'qb-2',
    title: 'Valid Palindrome String Checker',
    category: 'algorithms',
    difficulty: 'EASY',
    questionType: 'CODING',
    compiler: 'ALL',
    marks: 10,
    timeLimitMs: 2000,
    memoryLimitMb: 256,
    tags: ['Strings', 'Two Pointers'],
    description: `A phrase is a **palindrome** if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.

Write a program that reads a line of text and prints \`true\` if it is a palindrome, or \`false\` otherwise.`,
    inputFormat: 'Single line containing the candidate string.',
    outputFormat: 'Print "true" or "false".',
    constraints: '1 <= s.length <= 2 * 10^5\ns consists only of printable ASCII characters.',
    testCases: [
      { inputData: 'A man, a plan, a canal: Panama', expectedOutput: 'true', sample: true, hidden: false, weight: 1 },
      { inputData: 'race a car', expectedOutput: 'false', sample: true, hidden: false, weight: 1 },
      { inputData: ' ', expectedOutput: 'true', sample: false, hidden: true, weight: 1 },
      { inputData: '0P', expectedOutput: 'false', sample: false, hidden: true, weight: 2 },
    ],
    options: [],
  },
  {
    id: 'qb-3',
    title: 'Reverse Linked List Order',
    category: 'data-structures',
    difficulty: 'MEDIUM',
    questionType: 'CODING',
    compiler: 'ALL',
    marks: 15,
    timeLimitMs: 2000,
    memoryLimitMb: 256,
    tags: ['Linked List', 'Recursion', 'Pointers'],
    description: `Given a sequence of integers representing the nodes of a singly-linked list, reverse the list and print the reversed elements space-separated.`,
    inputFormat: 'Space-separated integers representing node values.',
    outputFormat: 'Space-separated integers in reversed order.',
    constraints: 'The number of nodes in the list is in the range [0, 5000].\n-5000 <= Node.val <= 5000',
    testCases: [
      { inputData: '1 2 3 4 5', expectedOutput: '5 4 3 2 1', sample: true, hidden: false, weight: 1 },
      { inputData: '1 2', expectedOutput: '2 1', sample: true, hidden: false, weight: 1 },
      { inputData: '42', expectedOutput: '42', sample: false, hidden: true, weight: 1 },
      { inputData: '10 20 30 40 50 60', expectedOutput: '60 50 40 30 20 10', sample: false, hidden: true, weight: 2 },
    ],
    options: [],
  },
  {
    id: 'qb-4',
    title: 'Valid Parentheses & Bracket Matching',
    category: 'data-structures',
    difficulty: 'MEDIUM',
    questionType: 'CODING',
    compiler: 'ALL',
    marks: 15,
    timeLimitMs: 2000,
    memoryLimitMb: 256,
    tags: ['Stack', 'Strings'],
    description: `Given a string \`s\` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

Print \`true\` or \`false\`.`,
    inputFormat: 'Single string s.',
    outputFormat: 'true or false.',
    constraints: '1 <= s.length <= 10^4\ns consists of parentheses only "()[]{}".',
    testCases: [
      { inputData: '()[]{}', expectedOutput: 'true', sample: true, hidden: false, weight: 1 },
      { inputData: '(]', expectedOutput: 'false', sample: true, hidden: false, weight: 1 },
      { inputData: '([{}])', expectedOutput: 'true', sample: false, hidden: true, weight: 2 },
      { inputData: '(((())))', expectedOutput: 'true', sample: false, hidden: true, weight: 1 },
    ],
    options: [],
  },
  {
    id: 'qb-5',
    title: 'Time Complexity of Binary Search',
    category: 'algorithms',
    difficulty: 'EASY',
    questionType: 'MULTIPLE_CHOICE',
    compiler: 'ALL',
    marks: 5,
    timeLimitMs: 1000,
    memoryLimitMb: 64,
    tags: ['Algorithms', 'Complexity', 'MCQ'],
    description: `What is the worst-case and average-case time complexity of Binary Search on a sorted array of size \`n\`?`,
    inputFormat: '',
    outputFormat: '',
    constraints: '',
    testCases: [],
    options: [
      { optionText: 'O(n)', isCorrect: false, explanation: 'Linear search is O(n), binary search halves search space each iteration.' },
      { optionText: 'O(log n)', isCorrect: true, explanation: 'Binary search repeatedly divides the search space in half, resulting in logarithmic O(log n) time.' },
      { optionText: 'O(n log n)', isCorrect: false, explanation: 'O(n log n) is typical for optimal comparison sorts like Merge Sort.' },
      { optionText: 'O(1)', isCorrect: false, explanation: 'Hash table lookups can be O(1), but binary search is O(log n).' },
    ],
  },
  {
    id: 'qb-6',
    title: 'HTTP Status Codes: Idempotent PUT vs POST',
    category: 'web-dev',
    difficulty: 'MEDIUM',
    questionType: 'MULTIPLE_CHOICE',
    compiler: 'ALL',
    marks: 5,
    timeLimitMs: 1000,
    memoryLimitMb: 64,
    tags: ['REST API', 'HTTP', 'Web Architecture'],
    description: `According to the RFC 7231 HTTP/1.1 specification, what is the key architectural difference regarding idempotency between the HTTP \`PUT\` and \`POST\` methods?`,
    inputFormat: '',
    outputFormat: '',
    constraints: '',
    testCases: [],
    options: [
      { optionText: 'PUT is idempotent while POST is not idempotent.', isCorrect: true, explanation: 'Calling PUT multiple times with the same payload results in the exact same server state, whereas POST creates new side effects.' },
      { optionText: 'POST is idempotent while PUT is not.', isCorrect: false, explanation: 'POST is non-idempotent by definition.' },
      { optionText: 'Both PUT and POST are strictly idempotent.', isCorrect: false, explanation: 'POST is explicitly not idempotent.' },
      { optionText: 'Neither PUT nor POST is idempotent.', isCorrect: false, explanation: 'PUT is guaranteed to be idempotent.' },
    ],
  },
  {
    id: 'qb-7',
    title: 'SOLID Principles: Liskov Substitution Principle',
    category: 'oop',
    difficulty: 'HARD',
    questionType: 'MULTIPLE_CHOICE',
    compiler: 'ALL',
    marks: 5,
    timeLimitMs: 1000,
    memoryLimitMb: 64,
    tags: ['OOP', 'Design Patterns', 'Architecture'],
    description: `Which of the following scenarios constitutes a direct violation of the **Liskov Substitution Principle (LSP)**?`,
    inputFormat: '',
    outputFormat: '',
    constraints: '',
    testCases: [],
    options: [
      { optionText: 'A subclass Square extending Rectangle throws an UnsupportedOperationException when setHeight is called separately from setWidth.', isCorrect: true, explanation: 'If a client expecting a Rectangle cannot safely substitute a Square without altering correctness, LSP is violated.' },
      { optionText: 'A subclass overrides a parent method and returns a subtype of the parent return type (covariance).', isCorrect: false, explanation: 'Return type covariance is fully allowed and adheres to LSP.' },
      { optionText: 'A class implements multiple interfaces with single responsibilities.', isCorrect: false, explanation: 'This describes the Interface Segregation Principle.' },
      { optionText: 'A class depends upon abstractions rather than concrete classes.', isCorrect: false, explanation: 'This describes Dependency Inversion Principle.' },
    ],
  },
  {
    id: 'qb-8',
    title: 'Fibonacci Sequence Generator',
    category: 'math',
    difficulty: 'EASY',
    questionType: 'CODING',
    compiler: 'ALL',
    marks: 10,
    timeLimitMs: 2000,
    memoryLimitMb: 256,
    tags: ['Recursion', 'Math', 'Dynamic Programming'],
    description: `Given an integer \`n\`, calculate the \`n\`-th Fibonacci number, where F(0) = 0, F(1) = 1, and F(n) = F(n-1) + F(n-2) for n > 1.`,
    inputFormat: 'Single integer n.',
    outputFormat: 'Value of F(n).',
    constraints: '0 <= n <= 30',
    testCases: [
      { inputData: '2', expectedOutput: '1', sample: true, hidden: false, weight: 1 },
      { inputData: '3', expectedOutput: '2', sample: true, hidden: false, weight: 1 },
      { inputData: '4', expectedOutput: '3', sample: true, hidden: false, weight: 1 },
      { inputData: '10', expectedOutput: '55', sample: false, hidden: true, weight: 2 },
    ],
    options: [],
  },
];

function getStoredCustomQuestions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCustomQuestions(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

export const questionBankService = {
  /**
   * List all questions with optional filters
   */
  getQuestions: async ({ category = 'all', difficulty, type, search } = {}) => {
    // Artificial small delay to simulate network async
    await new Promise((r) => setTimeout(r, 80));

    const custom = getStoredCustomQuestions();
    let all = [...custom, ...DEFAULT_QUESTION_BANK];

    if (category && category !== 'all') {
      all = all.filter((q) => q.category === category);
    }
    if (difficulty && difficulty !== 'ALL') {
      all = all.filter((q) => q.difficulty === difficulty);
    }
    if (type && type !== 'ALL') {
      all = all.filter((q) => q.questionType === type);
    }
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      all = all.filter((item) =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        (item.tags && item.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }

    return all;
  },

  /**
   * Get question by ID
   */
  getQuestionById: async (id) => {
    const custom = getStoredCustomQuestions();
    const all = [...custom, ...DEFAULT_QUESTION_BANK];
    return all.find((q) => q.id === id) || null;
  },

  /**
   * Add a custom question template to user's question bank
   */
  saveToBank: async (question) => {
    const custom = getStoredCustomQuestions();
    const newEntry = {
      ...question,
      id: `custom-qb-${Date.now()}`,
      isCustom: true,
      createdAt: new Date().toISOString(),
    };
    custom.unshift(newEntry);
    saveCustomQuestions(custom);
    return newEntry;
  },

  /**
   * Delete a custom question template
   */
  deleteFromBank: async (id) => {
    const custom = getStoredCustomQuestions();
    const filtered = custom.filter((q) => q.id !== id);
    saveCustomQuestions(filtered);
    return true;
  },
};

export default questionBankService;
