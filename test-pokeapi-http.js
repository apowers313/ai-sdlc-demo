#!/usr/bin/env node

// Test PokeAPI with HTTP instead of HTTPS
async function testPokeAPIHttp() {
  console.log('Testing PokeAPI with HTTP (no TLS)...\n');
  
  const tests = [
    {
      name: 'HTTP - Basic Pokemon endpoint',
      url: 'http://pokeapi.co/api/v2/pokemon/pikachu'
    },
    {
      name: 'HTTP - Pokemon by ID',
      url: 'http://pokeapi.co/api/v2/pokemon/1'
    },
    {
      name: 'HTTP - List Pokemon',
      url: 'http://pokeapi.co/api/v2/pokemon?limit=5'
    },
    {
      name: 'HTTP - Ability endpoint',
      url: 'http://pokeapi.co/api/v2/ability/static'
    }
  ];
  
  for (const test of tests) {
    console.log(`Testing: ${test.name}`);
    console.log(`URL: ${test.url}`);
    
    try {
      const response = await fetch(test.url);
      const data = await response.json();
      
      console.log(`✓ Status: ${response.status}`);
      
      // Show relevant data based on endpoint
      if (data.name) {
        console.log(`✓ Name: ${data.name}`);
      }
      if (data.results) {
        console.log(`✓ Results count: ${data.results.length}`);
        console.log(`✓ First few: ${data.results.slice(0, 3).map(r => r.name).join(', ')}`);
      }
      if (data.id) {
        console.log(`✓ ID: ${data.id}`);
      }
      
      console.log('✓ Success!\n');
      return true;
    } catch (error) {
      console.error(`✗ Failed: ${error.message}\n`);
    }
  }
}

// Also test with curl to verify
console.log('First, testing with curl...\n');
testPokeAPIHttp();