'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, DollarSign, CheckSquare, Square, Database } from 'lucide-react';
import Layout from '@/components/Layout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import UserDashboardModal from '@/components/admin/UserDashboardModal';
import Leaderboard from '@/components/admin/Leaderboard';
import TestComponent from '@/components/admin/TestComponent';
import { api } from '@/lib/api';

interface User {
  id: number;
  username: string;
  email: string;
  balance: number;
  isAdmin: boolean;
  createdAt: string;
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({});
  const [editingBalance, setEditingBalance] = useState<{ [key: number]: string }>({});
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [viewingUser, setViewingUser] = useState<{ id: number; username: string } | null>(null);
  const [bulkValue, setBulkValue] = useState('');
  const [leaderboardRefresh, setLeaderboardRefresh] = useState<(() => void) | null>(null);

  useEffect(() => {
    fetchUsers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUsers = async () => {
    try {
      console.log('Fetching users...');
      const response = await api.getUsers();
      
      if (response.data && Array.isArray(response.data)) {
        console.log('Users fetched successfully:', response.data.length);
        const fetchedUsers = response.data as User[];
        
        // Check if backend has no users but we have cached data
        if (fetchedUsers.length === 0 && users.length > 0) {
          console.log('Backend database appears to be cleared, clearing local cache...');
          api.clearUserCache();
          // Also refresh the leaderboard to clear it
          if (leaderboardRefresh) {
            leaderboardRefresh();
          }
          showMessage('Backend database was cleared. Local cache has been cleared as well.', 'success');
        }
        
        setUsers(fetchedUsers);
        setMessage(''); // Clear any previous error messages
      } else if (response.error) {
        console.error('Error fetching users:', response.error);
        setMessage(response.error);
        setMessageType('error');
      }
    } catch (error) {
      console.error('Exception while fetching users:', error);
      setMessage('Error fetching users. Please check your connection and try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleUpdateBalance = async (userId: number) => {
    const newBalance = editingBalance[userId];
    if (!newBalance || isNaN(parseFloat(newBalance))) {
      showMessage('Please enter a valid balance amount', 'error');
      return;
    }

    // Validate user ID
    if (!userId || userId <= 0) {
      showMessage('Invalid user ID', 'error');
      return;
    }

    const balanceValue = parseFloat(newBalance);
    if (balanceValue < 0) {
      showMessage('Balance cannot be negative', 'error');
      return;
    }

    setActionLoading(prev => ({ ...prev, [`balance-${userId}`]: true }));

    try {
      console.log(`Updating balance for user ${userId} to ${balanceValue}`);
      const response = await api.updateUserBalance(userId, balanceValue);
      
      if (response.error) {
        console.error('Balance update failed:', response.error);
        showMessage(response.error, 'error');
      } else {
        console.log('Balance updated successfully');
        showMessage(`Balance updated to $${balanceValue.toLocaleString()}`);
        setEditingBalance(prev => ({ ...prev, [userId]: '' }));
        // Refresh user data
        await fetchUsers();
        // Also refresh leaderboard
        if (leaderboardRefresh) {
          leaderboardRefresh();
        }
      }
    } catch (error) {
      console.error('Exception while updating balance:', error);
      showMessage('Error updating balance. Please try again.', 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [`balance-${userId}`]: false }));
    }
  };

  const handleResetUser = async (userId: number) => {
    // Validate user ID
    if (!userId || userId <= 0) {
      showMessage('Invalid user ID', 'error');
      return;
    }

    // Find user to get their name for confirmation
    const user = users.find(u => u.id === userId);
    const userName = user ? user.username : `User ${userId}`;
    
    if (!confirm(`Are you sure you want to reset ${userName}'s portfolio? This will delete all their trades and reset their balance to $0.`)) {
      return;
    }

    setActionLoading(prev => ({ ...prev, [`reset-${userId}`]: true }));

    try {
      console.log(`Resetting portfolio for user ${userId} (${userName})`);
      const response = await api.resetUserPortfolio(userId);
      
      if (response.error) {
        console.error('Portfolio reset failed:', response.error);
        showMessage(response.error, 'error');
      } else {
        console.log('Portfolio reset successfully');
        showMessage(`${userName}'s portfolio reset successfully`);
        // Refresh user data
        await fetchUsers();
        // Also refresh leaderboard
        if (leaderboardRefresh) {
          leaderboardRefresh();
        }
      }
    } catch (error) {
      console.error('Exception while resetting portfolio:', error);
      showMessage('Error resetting user portfolio. Please try again.', 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [`reset-${userId}`]: false }));
    }
  };

  const handleResetAll = async () => {
    if (!confirm('Are you sure you want to reset ALL user portfolios? This action cannot be undone.')) {
      return;
    }

    setActionLoading(prev => ({ ...prev, 'reset-all': true }));

    try {
      const response = await api.resetAllPortfolios();
      if (response.error) {
        showMessage(response.error, 'error');
      } else {
        showMessage('All portfolios reset successfully');
        fetchUsers();
        // Also refresh leaderboard
        if (leaderboardRefresh) {
          leaderboardRefresh();
        }
      }
    } catch (error) {
      showMessage('Error resetting portfolios', 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, 'reset-all': false }));
    }
  };

  const handleAddBonus = async (userId: number, amount: number) => {
    setActionLoading(prev => ({ ...prev, [`bonus-${userId}`]: true }));

    try {
      const response = await api.addBonus(userId, amount);
      if (response.error) {
        showMessage(response.error, 'error');
      } else {
        showMessage(`$${amount} bonus added successfully`);
        fetchUsers();
        // Also refresh leaderboard
        if (leaderboardRefresh) {
          leaderboardRefresh();
        }
      }
    } catch (error) {
      showMessage('Error adding bonus', 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [`bonus-${userId}`]: false }));
    }
  };

  const toggleUserSelection = (userId: number) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    const nonAdminUsers = users.filter(user => !user.isAdmin).map(user => user.id);
    setSelectedUsers(prev => 
      prev.length === nonAdminUsers.length ? [] : nonAdminUsers
    );
  };

  const handleBulkOperation = async (action: string) => {
    if (selectedUsers.length === 0) {
      showMessage('Please select users first', 'error');
      return;
    }

    setActionLoading(prev => ({ ...prev, [`bulk-${action}`]: true }));

    try {
      let value: number | undefined;
      if (action === 'setBalance' || action === 'addBonus') {
        value = parseFloat(bulkValue);
        if (isNaN(value) || value < 0) {
          showMessage('Please enter a valid amount', 'error');
          return;
        }
      }

      const response = await api.bulkUpdateUsers(selectedUsers, action, value);
      if (response.error) {
        showMessage(response.error, 'error');
      } else {
        showMessage(`${action} completed for ${selectedUsers.length} users`);
        setSelectedUsers([]);
        setBulkValue('');
        fetchUsers();
        // Also refresh leaderboard
        if (leaderboardRefresh) {
          leaderboardRefresh();
        }
      }
    } catch (error) {
      showMessage(`Error performing ${action}`, 'error');
    } finally {
      setActionLoading(prev => ({ ...prev, [`bulk-${action}`]: false }));
    }
  };

  const handleViewUser = (userId: number, username: string) => {
    setViewingUser({ id: userId, username });
  };

  const handleClearCache = () => {
    api.clearUserCache();
    setUsers([]);
    // Also refresh the leaderboard to clear it
    if (leaderboardRefresh) {
      leaderboardRefresh();
    }
    showMessage('Cache cleared successfully. Click refresh to reload data from server.', 'success');
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-gray-300">Manage users and monitor performance</p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={fetchUsers}
              variant="secondary"
              size="lg"
              className="px-6 py-3 rounded-xl font-bold shadow-md hover:shadow-xl transition-all duration-200 text-base text-center justify-center"
            >
              Refresh
            </Button>
            <Button
              onClick={handleClearCache}
              variant="ghost"
              size="lg"
              className="px-6 py-3 rounded-xl font-bold shadow-md hover:shadow-xl transition-all duration-200 text-base text-center justify-center text-yellow-400 hover:text-yellow-300"
            >
              <Database className="h-4 w-4 mr-2" />
              Clear Cache
            </Button>
            <Button
              onClick={handleResetAll}
              loading={actionLoading['reset-all']}
              variant="danger"
              size="lg"
              className="px-6 py-3 rounded-xl font-bold shadow-md hover:shadow-xl transition-all duration-200 text-base text-center justify-center"
            >
              Reset All
            </Button>
          </div>
        </motion.div>

        {/* Leaderboard Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Leaderboard 
            onViewUser={handleViewUser} 
            onRefresh={setLeaderboardRefresh}
          />
        </motion.div>

        {/* Bulk Operations */}
        {selectedUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-500/15 border border-blue-500/30 rounded-xl p-4"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-blue-400" />
                <span className="text-white font-medium">
                  {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
                </span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Input
                  placeholder="Amount"
                  value={bulkValue}
                  onChange={(e) => setBulkValue(e.target.value)}
                  className="w-24 py-1 text-sm"
                />
                <Button
                  onClick={() => handleBulkOperation('setBalance')}
                  loading={actionLoading['bulk-setBalance']}
                  size="sm"
                  variant="secondary"
                >
                  Set Balance
                </Button>
                <Button
                  onClick={() => handleBulkOperation('addBonus')}
                  loading={actionLoading['bulk-addBonus']}
                  size="sm"
                  variant="secondary"
                >
                  Add Bonus
                </Button>
                <Button
                  onClick={() => handleBulkOperation('resetPortfolio')}
                  loading={actionLoading['bulk-resetPortfolio']}
                  size="sm"
                  variant="danger"
                >
                  Reset All
                </Button>
                <Button
                  onClick={() => setSelectedUsers([])}
                  size="sm"
                  variant="ghost"
                >
                  Clear
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {message && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-4 rounded-lg ${
              messageType === 'success' 
                ? 'bg-green-500/25 border border-green-500/40 text-green-100'
                : 'bg-red-500/25 border border-red-500/40 text-red-100'
            }`}
          >
            {message}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-0 overflow-hidden">
            <div className="p-6 bg-white/15 border-b border-white/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-blue-400 mr-2" />
                  <h2 className="text-xl font-bold text-white">User Management</h2>
                  <span className="ml-3 text-sm text-gray-400">({users.length} total users)</span>
                </div>
                <Button
                  onClick={fetchUsers}
                  variant="secondary"
                  size="sm"
                  className="px-6 py-3 rounded-xl font-bold shadow-md hover:shadow-xl transition-all duration-200 text-base text-center justify-center"
                  disabled={loading}
                >
                  Refresh
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <div className="flex flex-col gap-4">
                {users.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group bg-gradient-to-r from-white/10 to-white/5 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border border-white/10 hover:border-blue-400/60 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-center gap-3 w-full sm:w-1/3">
                      {!user.isAdmin && (
                        <motion.button
                          onClick={() => toggleUserSelection(user.id)}
                          className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <motion.div
                            animate={selectedUsers.includes(user.id) ? { scale: [1, 1.2, 1] } : {}}
                            transition={{ duration: 0.3 }}
                          >
                            {selectedUsers.includes(user.id) ? (
                              <CheckSquare className="h-4 w-4 text-blue-400" />
                            ) : (
                              <Square className="h-4 w-4" />
                            )}
                          </motion.div>
                        </motion.button>
                      )}
                      <div>
                        <div className="flex items-center flex-wrap">
                          <motion.span 
                            className="font-medium text-white group-hover:text-blue-300 transition-colors"
                            whileHover={{ x: 2 }}
                          >
                            {user.username}
                          </motion.span>
                          {user.isAdmin && (
                            <motion.span 
                              className="ml-2 px-2 py-1 text-xs bg-purple-500/20 text-purple-300 rounded-full"
                              whileHover={{ scale: 1.1 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              Admin
                            </motion.span>
                          )}
                        </div>
                        <div className="text-sm text-gray-300 group-hover:text-gray-200 transition-colors break-all">{user.email}</div>
                        <div className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">
                          Joined {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-1/3">
                      <motion.div 
                        className="font-bold text-xl text-white group-hover:text-green-300 transition-colors flex items-center gap-2"
                        whileHover={{ scale: 1.05 }}
                      >
                        <span className="text-green-400 text-sm">$</span>
                        {user.balance.toLocaleString()}
                      </motion.div>
                      <div className="flex items-center gap-2 w-full">
                        <Input
                          placeholder="New balance"
                          value={editingBalance[user.id] || ''}
                          onChange={(e) => setEditingBalance(prev => ({ 
                            ...prev, 
                            [user.id]: e.target.value 
                          }))}
                          className="text-sm py-2 px-3 w-full sm:w-28 bg-white/15"
                          variant="minimal"
                        />
                        <Button
                          onClick={() => handleUpdateBalance(user.id)}
                          loading={actionLoading[`balance-${user.id}`]}
                          size="sm"
                          disabled={!editingBalance[user.id]}
                          variant="secondary"
                          className="w-full sm:w-auto"
                        >
                          Update
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-1/3 justify-end">
                      <Button
                        onClick={() => handleViewUser(user.id, user.username)}
                        size="sm"
                        variant="ghost"
                        className="text-blue-400 hover:text-blue-300 w-full sm:w-auto"
                      >
                        View
                      </Button>
                      <Button
                        onClick={() => handleAddBonus(user.id, 1000)}
                        loading={actionLoading[`bonus-${user.id}`]}
                        size="sm"
                        variant="secondary"
                        className="w-full sm:w-auto"
                      >
                        $1K
                      </Button>
                      <Button
                        onClick={() => handleResetUser(user.id)}
                        loading={actionLoading[`reset-${user.id}`]}
                        size="sm"
                        variant="danger"
                        disabled={user.isAdmin}
                        className="w-full sm:w-auto"
                      >
                        Reset
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <Card>
            <div className="text-center">
              <Users className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-white">Total Users</h3>
              <p className="text-2xl font-bold text-blue-400">{users.length}</p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <DollarSign className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-white">Total Balance</h3>
              <p className="text-2xl font-bold text-green-400">
                ${users.reduce((sum, user) => sum + user.balance, 0).toLocaleString()}
              </p>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <Users className="h-8 w-8 text-purple-400 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-white">Active Traders</h3>
              <p className="text-2xl font-bold text-purple-400">
                {users.filter(user => !user.isAdmin).length}
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Frontend Testing Component */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <TestComponent />
        </motion.div>

        {/* User Dashboard Modal */}
        {viewingUser && (
          <UserDashboardModal
            userId={viewingUser.id}
            username={viewingUser.username}
            isOpen={!!viewingUser}
            onClose={() => setViewingUser(null)}
          />
        )}
      </div>
    </Layout>
  );
}