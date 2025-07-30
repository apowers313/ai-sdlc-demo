#!/usr/bin/env node

// Test other APIs mentioned in the report to see if they work
async function testAPIs() {
  console.log('Testing various free APIs without authentication...\n');
  
  const apis = [
    {
      name: 'Bored API',
      url: 'https://www.boredapi.com/api/activity',
      description: 'Get a random activity'
    },
    {
      name: 'icanhazdadjoke',
      url: 'https://icanhazdadjoke.com/',
      description: 'Get a random dad joke',
      headers: { 'Accept': 'application/json' }
    },
    {
      name: 'JokeAPI',
      url: 'https://v2.jokeapi.dev/joke/Any',
      description: 'Get a random joke'
    },
    {
      name: 'Open Trivia DB',
      url: 'https://opentdb.com/api.php?amount=1',
      description: 'Get a trivia question'
    },
    {
      name: 'PokeAPI',
      url: 'https://pokeapi.co/api/v2/pokemon/1',
      description: 'Get Bulbasaur data'
    }
  ];
  
  for (const api of apis) {
    console.log(`Testing ${api.name}...`);
    console.log(`URL: ${api.url}`);
    
    try {
      const options = api.headers ? { headers: api.headers } : {};
      const response = await fetch(api.url, options);
      const data = await response.json();
      
      console.log(`✓ Status: ${response.status}`);
      console.log(`✓ Response sample:`, JSON.stringify(data).substring(0, 100) + '...');
      console.log();
    } catch (error) {
      console.error(`✗ Failed: ${error.message}`);
      console.log();
    }
  }
}

testAPIs();