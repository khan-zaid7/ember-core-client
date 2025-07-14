#!/usr/bin/env node
// Simple test runner for smart pull system
const { testSmartPullIntegration } = require('./services/sync/handlers/test-smart-pull-integration-fixed');

console.log('🚀 Starting Smart Pull System Test...\n');

// Run the integration test
testSmartPullIntegration()
  .then(result => {
    console.log('\n📊 Test Results:');
    console.log(`✅ Success: ${result.success}`);
    console.log(`📝 Message: ${result.message}`);
    
    if (result.success) {
      console.log('\n🎉 All tests passed! The smart pull system is working correctly.');
      process.exit(0);
    } else {
      console.log('\n❌ Tests failed. Please check the implementation.');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\n💥 Test execution failed:', error);
    process.exit(1);
  });
