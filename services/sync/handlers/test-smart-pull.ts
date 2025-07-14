// Test script for smart pull handler
import { smartUpsertPulledData } from './smartPullHandler';

/**
 * Test the smart pull handler with sample data
 */
export const testSmartPullHandler = () => {
  console.log('🧪 Testing Smart Pull Handler...\n');

  // Test 1: Duplicate user detection
  console.log('Test 1: Duplicate User Detection');
  const testUsers = [
    { user_id: 'user1', name: 'John Doe', email: 'john@example.com', phone: '1234567890' },
    { user_id: 'user2', name: 'John Doe', email: 'john@example.com', phone: '1234567890' },
    { user_id: 'user3', name: 'Jane Smith', email: 'jane@example.com', phone: '0987654321' }
  ];

  const userResult = smartUpsertPulledData('users', testUsers, 'user_id', 'current_user_123');
  console.log('User Result:', userResult);
  console.log('');

  // Test 2: Supply fuzzy matching
  console.log('Test 2: Supply Fuzzy Matching');
  const testSupplies = [
    { supply_id: 'sup1', name: 'Aspirin Tablets', category: 'Medicine' },
    { supply_id: 'sup2', name: 'Aspirin Pills', category: 'Medicine' },
    { supply_id: 'sup3', name: 'Bandages', category: 'Medical Supplies' }
  ];

  const supplyResult = smartUpsertPulledData('supplies', testSupplies, 'supply_id', 'current_user_123');
  console.log('Supply Result:', supplyResult);
  console.log('');

  // Test 3: Task assignment conflicts
  console.log('Test 3: Task Assignment Conflicts');
  const testTasks = [
    { task_id: 'task1', title: 'Distribute supplies', status: 'pending', assigned_to: 'user1' },
    { task_id: 'task2', title: 'Medical checkup', status: 'completed', assigned_to: 'user2' }
  ];

  const taskResult = smartUpsertPulledData('tasks', testTasks, 'task_id', 'current_user_123');
  console.log('Task Result:', taskResult);
  console.log('');

  console.log('✅ Smart Pull Handler Test Completed');
};

// Uncomment to run the test
// testSmartPullHandler();
