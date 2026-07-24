import { parseFoodOrder } from '../src/parser.js';

function runTests() {
  console.log('🧪 Running Order Parser Tests...\n');

  const testCases = [
    {
      input: 'FOOD Rice to Hostel D',
      expected: { isValid: true, item: 'Rice', location: 'Hostel D' },
    },
    {
      input: 'food fried rice & chicken to Block C, Room 204',
      expected: { isValid: true, item: 'fried rice & chicken', location: 'Block C, Room 204' },
    },
    {
      input: '  FOOD Jollof to Hall 1   ',
      expected: { isValid: true, item: 'Jollof', location: 'Hall 1' },
    },
    {
      input: 'Order me rice please',
      expected: { isValid: false },
    },
    {
      input: 'FOOD Rice',
      expected: { isValid: false },
    },
  ];

  let passed = 0;
  testCases.forEach((tc, index) => {
    const res = parseFoodOrder(tc.input);
    const isSuccess = res.isValid === tc.expected.isValid &&
      (!tc.expected.item || res.item === tc.expected.item) &&
      (!tc.expected.location || res.location === tc.expected.location);

    if (isSuccess) {
      console.log(`✅ Test ${index + 1} PASSED: "${tc.input}"`);
      passed++;
    } else {
      console.error(`❌ Test ${index + 1} FAILED: "${tc.input}"`);
      console.error('   Expected:', tc.expected);
      console.error('   Got:', res);
    }
  });

  console.log(`\nResults: ${passed}/${testCases.length} tests passed.`);
  if (passed !== testCases.length) {
    process.exit(1);
  }
}

runTests();
