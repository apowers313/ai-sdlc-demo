#!/usr/bin/env node

// Test basic network connectivity
async function testConnectivity() {
  console.log('Testing network connectivity...\n');
  
  // Test HTTPS with a known good endpoint
  try {
    console.log('Testing HTTPS to example.com...');
    const response = await fetch('https://example.com');
    console.log(`Status: ${response.status}`);
    console.log('✓ HTTPS works\n');
  } catch (error) {
    console.error('✗ HTTPS failed:', error.message, '\n');
  }
  
  // Test HTTP
  try {
    console.log('Testing HTTP to example.com...');
    const response = await fetch('http://example.com');
    console.log(`Status: ${response.status}`);
    console.log('✓ HTTP works\n');
  } catch (error) {
    console.error('✗ HTTP failed:', error.message, '\n');
  }
  
  // Test PokeAPI
  try {
    console.log('Testing PokeAPI...');
    const response = await fetch('https://pokeapi.co/api/v2/pokemon/1');
    console.log(`Status: ${response.status}`);
    const data = await response.json();
    console.log(`Pokemon: ${data.name}`);
    console.log('✓ PokeAPI works\n');
  } catch (error) {
    console.error('✗ PokeAPI failed:', error.message, '\n');
  }
}

testConnectivity();