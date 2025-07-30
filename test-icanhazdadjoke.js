#!/usr/bin/env node

// Test suite for icanhazdadjoke API
const BASE_URL = 'https://icanhazdadjoke.com';

// Helper function to make requests with proper headers
async function makeRequest(url, headers = {}) {
  const defaultHeaders = {
    'Accept': 'application/json',
    'User-Agent': 'My Library (https://github.com/apowers313/ai-sdlc-demo)'
  };
  
  try {
    const response = await fetch(url, {
      headers: { ...defaultHeaders, ...headers }
    });
    
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    
    return {
      status: response.status,
      headers: response.headers,
      data: data
    };
  } catch (error) {
    throw new Error(`Request failed: ${error.message}`);
  }
}

// Test 1: Get a random joke
async function testRandomJoke() {
  console.log('\n=== Test 1: Random Joke ===');
  console.log('Endpoint: GET /');
  
  try {
    const result = await makeRequest(BASE_URL);
    console.log(`Status: ${result.status}`);
    console.log(`Joke ID: ${result.data.id}`);
    console.log(`Joke: ${result.data.joke}`);
    console.log(`Status field: ${result.data.status}`);
    console.log('✓ Test passed');
    return { passed: true, jokeId: result.data.id };
  } catch (error) {
    console.error('✗ Test failed:', error.message);
    return { passed: false };
  }
}

// Test 2: Get a specific joke by ID
async function testSpecificJoke(jokeId) {
  console.log('\n=== Test 2: Specific Joke by ID ===');
  console.log(`Endpoint: GET /j/${jokeId}`);
  
  try {
    const result = await makeRequest(`${BASE_URL}/j/${jokeId}`);
    console.log(`Status: ${result.status}`);
    console.log(`Retrieved Joke ID: ${result.data.id}`);
    console.log(`Joke: ${result.data.joke}`);
    console.log(`ID matches requested: ${result.data.id === jokeId}`);
    console.log('✓ Test passed');
    return { passed: true };
  } catch (error) {
    console.error('✗ Test failed:', error.message);
    return { passed: false };
  }
}

// Test 3: Search for jokes
async function testSearch() {
  console.log('\n=== Test 3: Search Functionality ===');
  console.log('Endpoint: GET /search?term=computer');
  
  try {
    const result = await makeRequest(`${BASE_URL}/search?term=computer`);
    console.log(`Status: ${result.status}`);
    console.log(`Current page: ${result.data.current_page}`);
    console.log(`Total jokes found: ${result.data.total_jokes}`);
    console.log(`Total pages: ${result.data.total_pages}`);
    console.log(`Results on this page: ${result.data.results.length}`);
    
    if (result.data.results.length > 0) {
      console.log(`First joke: ${result.data.results[0].joke.substring(0, 50)}...`);
    }
    
    console.log('✓ Test passed');
    return { passed: true };
  } catch (error) {
    console.error('✗ Test failed:', error.message);
    return { passed: false };
  }
}

// Test 4: Test pagination
async function testPagination() {
  console.log('\n=== Test 4: Search with Pagination ===');
  console.log('Endpoint: GET /search?term=dad&page=2&limit=5');
  
  try {
    const result = await makeRequest(`${BASE_URL}/search?term=dad&page=2&limit=5`);
    console.log(`Status: ${result.status}`);
    console.log(`Current page: ${result.data.current_page}`);
    console.log(`Limit per page: ${result.data.limit}`);
    console.log(`Results returned: ${result.data.results.length}`);
    console.log(`Has next page: ${result.data.next_page !== null}`);
    console.log(`Has previous page: ${result.data.previous_page !== null}`);
    console.log('✓ Test passed');
    return { passed: true };
  } catch (error) {
    console.error('✗ Test failed:', error.message);
    return { passed: false };
  }
}

// Test 5: Different response formats
async function testResponseFormats() {
  console.log('\n=== Test 5: Different Response Formats ===');
  
  const formats = [
    { accept: 'text/plain', description: 'Plain text' },
    { accept: 'text/html', description: 'HTML' },
    { accept: 'application/json', description: 'JSON (default)' }
  ];
  
  let allPassed = true;
  
  for (const format of formats) {
    console.log(`\nTesting ${format.description} format...`);
    
    try {
      const result = await makeRequest(BASE_URL, { 'Accept': format.accept });
      console.log(`Status: ${result.status}`);
      console.log(`Content-Type: ${result.headers.get('content-type')}`);
      
      if (format.accept === 'application/json') {
        console.log(`Response has joke field: ${result.data.joke !== undefined}`);
      } else {
        console.log(`Response length: ${result.data.length} characters`);
        console.log(`Sample: ${result.data.substring(0, 50)}...`);
      }
      
      console.log('✓ Format test passed');
    } catch (error) {
      console.error('✗ Format test failed:', error.message);
      allPassed = false;
    }
  }
  
  return { passed: allPassed };
}

// Test 6: Error handling
async function testErrorHandling() {
  console.log('\n=== Test 6: Error Handling ===');
  
  console.log('\nTesting invalid joke ID...');
  try {
    const result = await makeRequest(`${BASE_URL}/j/invalid-id-12345`);
    console.log(`Status: ${result.status}`);
    if (result.status === 404) {
      console.log('✓ Correctly returns 404 for invalid ID');
    } else {
      console.log('✗ Expected 404 status');
    }
  } catch (error) {
    console.error('✗ Test failed:', error.message);
  }
  
  console.log('\nTesting empty search...');
  try {
    const result = await makeRequest(`${BASE_URL}/search?term=`);
    console.log(`Status: ${result.status}`);
    console.log(`Response: ${JSON.stringify(result.data)}`);
    console.log('✓ Handles empty search term');
  } catch (error) {
    console.error('✗ Test failed:', error.message);
  }
  
  return { passed: true };
}

// Test 7: Rate limiting check
async function testRateLimiting() {
  console.log('\n=== Test 7: Rate Limiting Check ===');
  console.log('Making 10 rapid requests...');
  
  const requests = [];
  for (let i = 0; i < 10; i++) {
    requests.push(makeRequest(BASE_URL));
  }
  
  try {
    const start = Date.now();
    const results = await Promise.all(requests);
    const end = Date.now();
    
    const allSuccessful = results.every(r => r.status === 200);
    console.log(`All requests successful: ${allSuccessful}`);
    console.log(`Time taken: ${end - start}ms`);
    console.log(`Average time per request: ${(end - start) / 10}ms`);
    
    if (allSuccessful) {
      console.log('✓ No rate limiting detected for 10 requests');
    }
    
    return { passed: allSuccessful };
  } catch (error) {
    console.error('✗ Test failed:', error.message);
    return { passed: false };
  }
}

// Main test runner
async function runTests() {
  console.log('icanhazdadjoke API Test Suite');
  console.log('=============================');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Time: ${new Date().toISOString()}`);
  
  const results = [];
  
  // Run tests
  const randomResult = await testRandomJoke();
  results.push(randomResult);
  
  if (randomResult.passed && randomResult.jokeId) {
    results.push(await testSpecificJoke(randomResult.jokeId));
  }
  
  results.push(await testSearch());
  results.push(await testPagination());
  results.push(await testResponseFormats());
  results.push(await testErrorHandling());
  results.push(await testRateLimiting());
  
  // Summary
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  console.log('\n=============================');
  console.log('Test Summary:');
  console.log(`Total tests: ${total}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${total - passed}`);
  console.log(`Success rate: ${(passed / total * 100).toFixed(1)}%`);
  
  return { passed, failed: total - passed, total };
}

// Execute tests
runTests().then(results => {
  process.exit(results.failed > 0 ? 1 : 0);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});