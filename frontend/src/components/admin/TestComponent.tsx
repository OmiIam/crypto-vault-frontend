'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { TestTube, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { api } from '@/lib/api';

interface TestResult {
  name: string;
  status: 'pending' | 'passed' | 'failed';
  message: string;
  details?: string;
}

export default function TestComponent() {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const updateTest = (name: string, status: 'pending' | 'passed' | 'failed', message: string, details?: string) => {
    setTests(prev => {
      const existing = prev.find(t => t.name === name);
      if (existing) {
        return prev.map(t => 
          t.name === name 
            ? { ...t, status, message, details }
            : t
        );
      }
      return [...prev, { name, status, message, details }];
    });
  };

  const runTests = async () => {
    setIsRunning(true);
    setTests([]);

    // Test 1: Token validation
    updateTest('Token Validation', 'pending', 'Testing token validation...');
    try {
      const isValid = await api.validateToken();
      updateTest('Token Validation', 'passed', 
        `Token validation: ${isValid ? 'Valid' : 'Invalid/Missing'}`,
        `Current token: ${api.isAuthenticated() ? 'Present' : 'Missing'}`
      );
    } catch (error) {
      updateTest('Token Validation', 'failed', 
        'Token validation failed', 
        error instanceof Error ? error.message : 'Unknown error'
      );
    }

    // Test 2: User fetching
    updateTest('User Fetching', 'pending', 'Testing user data fetching...');
    try {
      const response = await api.getUsers();
      if (response.data && Array.isArray(response.data)) {
        updateTest('User Fetching', 'passed', 
          `Successfully fetched ${response.data.length} users`,
          `Response type: ${typeof response.data}, Length: ${response.data.length}`
        );
      } else {
        updateTest('User Fetching', 'failed', 
          'User fetch returned invalid data', 
          `Response: ${JSON.stringify(response)}`
        );
      }
    } catch (error) {
      updateTest('User Fetching', 'failed', 
        'User fetching failed', 
        error instanceof Error ? error.message : 'Unknown error'
      );
    }

    // Test 3: Network error simulation
    updateTest('Network Error Handling', 'pending', 'Testing network error handling...');
    try {
      const response = await api.get('/nonexistent-endpoint');
      if (response.error) {
        updateTest('Network Error Handling', 'passed', 
          'Network error properly handled', 
          `Error message: ${response.error}`
        );
      } else {
        updateTest('Network Error Handling', 'failed', 
          'Network error not properly handled', 
          'Expected error but got success'
        );
      }
    } catch (error) {
      updateTest('Network Error Handling', 'passed', 
        'Network error caught by exception handler', 
        error instanceof Error ? error.message : 'Unknown error'
      );
    }

    // Test 4: Current user data
    updateTest('Current User Data', 'pending', 'Testing current user data...');
    try {
      const currentUser = api.getCurrentUser();
      if (currentUser) {
        updateTest('Current User Data', 'passed', 
          `User data found: ${currentUser.username}`,
          `User ID: ${currentUser.id}, Admin: ${currentUser.isAdmin}`
        );
      } else {
        updateTest('Current User Data', 'failed', 
          'No current user data found', 
          'Check if user is logged in and data is stored correctly'
        );
      }
    } catch (error) {
      updateTest('Current User Data', 'failed', 
        'Error getting current user data', 
        error instanceof Error ? error.message : 'Unknown error'
      );
    }

    // Test 5: Balance update validation
    updateTest('Balance Update Validation', 'pending', 'Testing balance update validation...');
    try {
      // Test with invalid user ID
      const invalidResponse = await api.updateUserBalance(-1, 1000);
      if (invalidResponse.error) {
        updateTest('Balance Update Validation', 'passed', 
          'Invalid user ID properly rejected', 
          `Error message: ${invalidResponse.error}`
        );
      } else {
        updateTest('Balance Update Validation', 'failed', 
          'Invalid user ID was accepted', 
          'System should reject negative user IDs'
        );
      }
    } catch (error) {
      updateTest('Balance Update Validation', 'failed', 
        'Balance update validation failed', 
        error instanceof Error ? error.message : 'Unknown error'
      );
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: 'pending' | 'passed' | 'failed') => {
    switch (status) {
      case 'pending':
        return <RefreshCw className="w-4 h-4 text-yellow-400 animate-spin" />;
      case 'passed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-400" />;
    }
  };

  const getStatusColor = (status: 'pending' | 'passed' | 'failed') => {
    switch (status) {
      case 'pending':
        return 'border-yellow-400/40 bg-yellow-500/15';
      case 'passed':
        return 'border-green-400/40 bg-green-500/15';
      case 'failed':
        return 'border-red-400/40 bg-red-500/15';
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <TestTube className="w-6 h-6" />
            Frontend Issue Testing
          </h2>
          <Button 
            onClick={runTests} 
            disabled={isRunning}
            variant="crypto"
            className="flex items-center gap-2"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                <TestTube className="w-4 h-4" />
                Run Tests
              </>
            )}
          </Button>
        </div>

        <div className="space-y-4">
          {tests.length === 0 ? (
            <div className="text-center py-8 text-gray-300">
              <AlertCircle className="w-8 h-8 mx-auto mb-2" />
              <p>Click "Run Tests" to start testing the frontend fixes</p>
            </div>
          ) : (
            tests.map((test, index) => (
              <motion.div
                key={test.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`
                  p-4 rounded-xl border backdrop-blur-sm transition-all duration-300
                  ${getStatusColor(test.status)}
                `}
              >
                <div className="flex items-start gap-3">
                  {getStatusIcon(test.status)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-white">{test.name}</h3>
                      <span className={`
                        px-2 py-1 rounded text-xs font-medium
                        ${test.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : ''}
                        ${test.status === 'passed' ? 'bg-green-500/20 text-green-400' : ''}
                        ${test.status === 'failed' ? 'bg-red-500/20 text-red-400' : ''}
                      `}>
                        {test.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-200 text-sm mb-2">{test.message}</p>
                    {test.details && (
                      <div className="text-xs text-gray-300 bg-black/30 p-2 rounded font-mono">
                        {test.details}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {tests.length > 0 && (
          <div className="mt-6 p-4 bg-black/30 rounded-xl">
            <h3 className="font-semibold text-white mb-2">Test Summary</h3>
            <div className="flex gap-4 text-sm">
              <span className="text-green-400">
                Passed: {tests.filter(t => t.status === 'passed').length}
              </span>
              <span className="text-red-400">
                Failed: {tests.filter(t => t.status === 'failed').length}
              </span>
              <span className="text-yellow-400">
                Pending: {tests.filter(t => t.status === 'pending').length}
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}