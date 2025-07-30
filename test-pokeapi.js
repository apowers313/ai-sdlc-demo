#!/usr/bin/env node

// Helper function to make HTTP GET requests using native fetch
async function makeRequest(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    throw new Error(`Request failed: ${error.message}`);
  }
}

// Test configuration
const BASE_URL = 'https://pokeapi.co/api/v2';
const tests = [];

// Test 1: Basic Pokemon endpoint
tests.push(async () => {
  console.log('\n=== Test 1: Basic Pokemon Endpoint ===');
  console.log('Testing: GET /pokemon/pikachu');
  
  try {
    const result = await makeRequest(`${BASE_URL}/pokemon/pikachu`);
    console.log(`Status: ${result.status}`);
    console.log(`Pokemon Name: ${result.data.name}`);
    console.log(`Pokemon ID: ${result.data.id}`);
    console.log(`Height: ${result.data.height}`);
    console.log(`Weight: ${result.data.weight}`);
    console.log(`Number of abilities: ${result.data.abilities.length}`);
    console.log('✓ Test passed');
    return true;
  } catch (error) {
    console.error('✗ Test failed:', error.message);
    return false;
  }
});

// Test 2: Pokemon by ID
tests.push(async () => {
  console.log('\n=== Test 2: Pokemon by ID ===');
  console.log('Testing: GET /pokemon/1');
  
  try {
    const result = await makeRequest(`${BASE_URL}/pokemon/1`);
    console.log(`Status: ${result.status}`);
    console.log(`Pokemon Name: ${result.data.name} (should be bulbasaur)`);
    console.log('✓ Test passed');
    return true;
  } catch (error) {
    console.error('✗ Test failed:', error.message);
    return false;
  }
});

// Test 3: Ability endpoint
tests.push(async () => {
  console.log('\n=== Test 3: Ability Endpoint ===');
  console.log('Testing: GET /ability/static');
  
  try {
    const result = await makeRequest(`${BASE_URL}/ability/static`);
    console.log(`Status: ${result.status}`);
    console.log(`Ability Name: ${result.data.name}`);
    console.log(`Effect: ${result.data.effect_entries[0]?.short_effect || 'No effect found'}`);
    console.log(`Number of Pokemon with this ability: ${result.data.pokemon.length}`);
    console.log('✓ Test passed');
    return true;
  } catch (error) {
    console.error('✗ Test failed:', error.message);
    return false;
  }
});

// Test 4: Move endpoint
tests.push(async () => {
  console.log('\n=== Test 4: Move Endpoint ===');
  console.log('Testing: GET /move/thunderbolt');
  
  try {
    const result = await makeRequest(`${BASE_URL}/move/thunderbolt`);
    console.log(`Status: ${result.status}`);
    console.log(`Move Name: ${result.data.name}`);
    console.log(`Power: ${result.data.power}`);
    console.log(`Accuracy: ${result.data.accuracy}`);
    console.log(`PP: ${result.data.pp}`);
    console.log(`Type: ${result.data.type.name}`);
    console.log('✓ Test passed');
    return true;
  } catch (error) {
    console.error('✗ Test failed:', error.message);
    return false;
  }
});

// Test 5: Type endpoint
tests.push(async () => {
  console.log('\n=== Test 5: Type Endpoint ===');
  console.log('Testing: GET /type/electric');
  
  try {
    const result = await makeRequest(`${BASE_URL}/type/electric`);
    console.log(`Status: ${result.status}`);
    console.log(`Type Name: ${result.data.name}`);
    console.log(`Number of Pokemon with this type: ${result.data.pokemon.length}`);
    console.log(`Double damage to: ${result.data.damage_relations.double_damage_to.map(t => t.name).join(', ')}`);
    console.log('✓ Test passed');
    return true;
  } catch (error) {
    console.error('✗ Test failed:', error.message);
    return false;
  }
});

// Test 6: Generation endpoint
tests.push(async () => {
  console.log('\n=== Test 6: Generation Endpoint ===');
  console.log('Testing: GET /generation/1');
  
  try {
    const result = await makeRequest(`${BASE_URL}/generation/1`);
    console.log(`Status: ${result.status}`);
    console.log(`Generation Name: ${result.data.name}`);
    console.log(`Main Region: ${result.data.main_region.name}`);
    console.log(`Number of Pokemon species: ${result.data.pokemon_species.length}`);
    console.log('✓ Test passed');
    return true;
  } catch (error) {
    console.error('✗ Test failed:', error.message);
    return false;
  }
});

// Test 7: Error handling - Invalid Pokemon
tests.push(async () => {
  console.log('\n=== Test 7: Error Handling - Invalid Pokemon ===');
  console.log('Testing: GET /pokemon/invalidpokemon');
  
  try {
    const result = await makeRequest(`${BASE_URL}/pokemon/invalidpokemon`);
    console.log(`Status: ${result.status}`);
    if (result.status === 404) {
      console.log('✓ Test passed - Correctly returned 404 for invalid Pokemon');
      return true;
    } else {
      console.log('✗ Test failed - Expected 404 status');
      return false;
    }
  } catch (error) {
    console.error('✗ Test failed:', error.message);
    return false;
  }
});

// Test 8: List endpoint with pagination
tests.push(async () => {
  console.log('\n=== Test 8: List Endpoint with Pagination ===');
  console.log('Testing: GET /pokemon?limit=5&offset=0');
  
  try {
    const result = await makeRequest(`${BASE_URL}/pokemon?limit=5&offset=0`);
    console.log(`Status: ${result.status}`);
    console.log(`Total Pokemon count: ${result.data.count}`);
    console.log(`Results returned: ${result.data.results.length}`);
    console.log(`First 5 Pokemon: ${result.data.results.map(p => p.name).join(', ')}`);
    console.log(`Has next page: ${result.data.next !== null}`);
    console.log('✓ Test passed');
    return true;
  } catch (error) {
    console.error('✗ Test failed:', error.message);
    return false;
  }
});

// Test 9: Multiple rapid requests (rate limiting check)
tests.push(async () => {
  console.log('\n=== Test 9: Multiple Rapid Requests ===');
  console.log('Testing: 5 rapid requests to different endpoints');
  
  try {
    const requests = [
      makeRequest(`${BASE_URL}/pokemon/1`),
      makeRequest(`${BASE_URL}/pokemon/2`),
      makeRequest(`${BASE_URL}/pokemon/3`),
      makeRequest(`${BASE_URL}/pokemon/4`),
      makeRequest(`${BASE_URL}/pokemon/5`)
    ];
    
    const results = await Promise.all(requests);
    const allSuccessful = results.every(r => r.status === 200);
    
    if (allSuccessful) {
      console.log('✓ Test passed - All 5 requests completed successfully');
      console.log('Pokemon retrieved:', results.map(r => r.data.name).join(', '));
      return true;
    } else {
      console.log('✗ Test failed - Some requests did not return 200');
      return false;
    }
  } catch (error) {
    console.error('✗ Test failed:', error.message);
    return false;
  }
});

// Run all tests
async function runTests() {
  console.log('Starting PokeAPI Test Suite...');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Number of tests: ${tests.length}`);
  console.log('=' .repeat(50));
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    const result = await test();
    if (result) {
      passed++;
    } else {
      failed++;
    }
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('Test Summary:');
  console.log(`Total tests: ${tests.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Success rate: ${((passed / tests.length) * 100).toFixed(1)}%`);
  
  return { passed, failed, total: tests.length };
}

// Execute tests
runTests().then(results => {
  process.exit(results.failed > 0 ? 1 : 0);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});