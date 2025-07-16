// Test file to verify pull sync integration
// This can be used to test the pull functionality

import { performBulkPullSync, performEntityPullSync } from './services/sync/pullSyncManager';

// Test function to verify pull sync works
export const testPullSync = async (userId: string) => {
  console.log('🧪 Testing pull sync functionality...');
  
  try {
    // Test bulk pull
    console.log('📥 Testing bulk pull...');
    const bulkResult = await performBulkPullSync(userId);
    console.log('Bulk pull result:', bulkResult);
    
    // Test individual entity pull
    console.log('📥 Testing individual entity pull...');
    const locationResult = await performEntityPullSync(userId, 'locations');
    console.log('Location pull result:', locationResult);
    
    console.log('✅ Pull sync tests completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Pull sync test failed:', error);
    return false;
  }
};

// Usage example:
// testPullSync('test-user-123');
