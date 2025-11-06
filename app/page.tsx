'use client';

import { useState, useEffect } from 'react';
import { Wallet, TrendingUp, TrendingDown, ArrowLeftRight, Plus, X } from 'lucide-react';

interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  category: string;
  subcategory?: string;
  description: string;
  date: string;
  fromAccount?: string;
  toAccount?: string;
}

interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  subcategories: string[];
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<'income' | 'expense' | 'transfer'>('expense');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  // Form states
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    subcategory: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    fromAccount: '',
    toAccount: ''
  });

  const [newCategory, setNewCategory] = useState({
    name: '',
    type: 'expense' as 'income' | 'expense'
  });

  const [newSubcategory, setNewSubcategory] = useState('');

  // Load data from localStorage
  useEffect(() => {
    const savedTransactions = localStorage.getItem('transactions');
    const savedCategories = localStorage.getItem('categories');

    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }

    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    } else {
      // Default categories
      const defaultCategories: Category[] = [
        { id: '1', name: 'Salary', type: 'income', subcategories: ['Monthly', 'Bonus', 'Freelance'] },
        { id: '2', name: 'Business', type: 'income', subcategories: ['Sales', 'Investment'] },
        { id: '3', name: 'Food', type: 'expense', subcategories: ['Groceries', 'Restaurant', 'Snacks'] },
        { id: '4', name: 'Transport', type: 'expense', subcategories: ['Fuel', 'Public Transport', 'Maintenance'] },
        { id: '5', name: 'Shopping', type: 'expense', subcategories: ['Clothes', 'Electronics', 'Others'] },
        { id: '6', name: 'Bills', type: 'expense', subcategories: ['Electricity', 'Water', 'Internet', 'Phone'] },
        { id: '7', name: 'Entertainment', type: 'expense', subcategories: ['Movies', 'Games', 'Subscriptions'] },
      ];
      setCategories(defaultCategories);
      localStorage.setItem('categories', JSON.stringify(defaultCategories));
    }
  }, []);

  // Save transactions to localStorage
  useEffect(() => {
    if (transactions.length > 0) {
      localStorage.setItem('transactions', JSON.stringify(transactions));
    }
  }, [transactions]);

  // Save categories to localStorage
  useEffect(() => {
    if (categories.length > 0) {
      localStorage.setItem('categories', JSON.stringify(categories));
    }
  }, [categories]);

  const calculateBalance = () => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return { income, expense, balance: income - expense };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: activeTab,
      amount: parseFloat(formData.amount),
      category: formData.category,
      subcategory: formData.subcategory,
      description: formData.description,
      date: formData.date,
      ...(activeTab === 'transfer' && {
        fromAccount: formData.fromAccount,
        toAccount: formData.toAccount
      })
    };

    setTransactions([newTransaction, ...transactions]);

    // Reset form
    setFormData({
      amount: '',
      category: '',
      subcategory: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      fromAccount: '',
      toAccount: ''
    });
  };

  const handleAddCategory = () => {
    if (!newCategory.name.trim()) return;

    const category: Category = {
      id: Date.now().toString(),
      name: newCategory.name,
      type: newCategory.type,
      subcategories: []
    };

    setCategories([...categories, category]);
    setNewCategory({ name: '', type: 'expense' });
    setShowCategoryModal(false);
  };

  const handleAddSubcategory = () => {
    if (!newSubcategory.trim() || !selectedCategory) return;

    const updatedCategories = categories.map(cat => {
      if (cat.id === selectedCategory.id) {
        return {
          ...cat,
          subcategories: [...cat.subcategories, newSubcategory]
        };
      }
      return cat;
    });

    setCategories(updatedCategories);
    setNewSubcategory('');
    setShowSubcategoryModal(false);
    setSelectedCategory(null);
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter(cat => cat.id !== id));
  };

  const handleDeleteSubcategory = (categoryId: string, subcategory: string) => {
    const updatedCategories = categories.map(cat => {
      if (cat.id === categoryId) {
        return {
          ...cat,
          subcategories: cat.subcategories.filter(sub => sub !== subcategory)
        };
      }
      return cat;
    });
    setCategories(updatedCategories);
  };

  const filteredCategories = categories.filter(cat =>
    activeTab === 'transfer' ? true : cat.type === activeTab
  );

  const selectedCategoryData = categories.find(cat => cat.name === formData.category);

  const { income, expense, balance } = calculateBalance();

  const filteredTransactions = transactions.filter(t => {
    if (filterType !== 'all' && t.type !== filterType) return false;
    if (filterCategory !== 'all' && t.category !== filterCategory) return false;
    return true;
  });

  return (
    <div className="container">
      <div className="header">
        <h1>💰 Money Manager</h1>

        <div className="balance-cards">
          <div className="balance-card">
            <h3>Total Balance</h3>
            <div className="amount">₹{balance.toLocaleString()}</div>
          </div>

          <div className="balance-card income">
            <h3>Total Income</h3>
            <div className="amount">₹{income.toLocaleString()}</div>
          </div>

          <div className="balance-card expense">
            <h3>Total Expense</h3>
            <div className="amount">₹{expense.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <div className="main-content">
        <div className="card">
          <h2>Add Transaction</h2>

          <div className="tabs">
            <button
              className={`tab ${activeTab === 'income' ? 'active' : ''}`}
              onClick={() => setActiveTab('income')}
            >
              <TrendingUp size={16} style={{ display: 'inline', marginRight: 4 }} />
              Income
            </button>
            <button
              className={`tab ${activeTab === 'expense' ? 'active' : ''}`}
              onClick={() => setActiveTab('expense')}
            >
              <TrendingDown size={16} style={{ display: 'inline', marginRight: 4 }} />
              Expense
            </button>
            <button
              className={`tab ${activeTab === 'transfer' ? 'active' : ''}`}
              onClick={() => setActiveTab('transfer')}
            >
              <ArrowLeftRight size={16} style={{ display: 'inline', marginRight: 4 }} />
              Transfer
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Amount</label>
              <input
                type="number"
                step="0.01"
                placeholder="Enter amount"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>

            {activeTab === 'transfer' ? (
              <>
                <div className="form-group">
                  <label>From Account</label>
                  <input
                    type="text"
                    placeholder="Source account"
                    value={formData.fromAccount}
                    onChange={(e) => setFormData({ ...formData, fromAccount: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>To Account</label>
                  <input
                    type="text"
                    placeholder="Destination account"
                    value={formData.toAccount}
                    onChange={(e) => setFormData({ ...formData, toAccount: e.target.value })}
                    required
                  />
                </div>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value, subcategory: '' })}
                    required
                  >
                    <option value="">Select category</option>
                    {filteredCategories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {selectedCategoryData && selectedCategoryData.subcategories.length > 0 && (
                  <div className="form-group">
                    <label>Subcategory</label>
                    <select
                      value={formData.subcategory}
                      onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                    >
                      <option value="">Select subcategory</option>
                      {selectedCategoryData.subcategories.map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            )}

            <div className="form-group">
              <label>Description</label>
              <input
                type="text"
                placeholder="Enter description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <button type="submit" className="btn">
              Add {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </button>
          </form>
        </div>

        <div className="card">
          <h2>Transactions</h2>

          <div className="filter-section">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
              <option value="transfer">Transfer</option>
            </select>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="transaction-list">
            {filteredTransactions.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#6b7280', padding: '40px 0' }}>
                No transactions yet
              </p>
            ) : (
              filteredTransactions.map(transaction => (
                <div key={transaction.id} className="transaction-item">
                  <div className="transaction-info">
                    <h4>{transaction.description}</h4>
                    <p>
                      {transaction.type === 'transfer'
                        ? `${transaction.fromAccount} → ${transaction.toAccount}`
                        : `${transaction.category}${transaction.subcategory ? ` • ${transaction.subcategory}` : ''}`
                      } • {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={`transaction-amount ${transaction.type}`}>
                    {transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : ''}
                    ₹{transaction.amount.toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <h2>Manage Categories</h2>

        <div className="tabs">
          <button className="tab active">Categories & Subcategories</button>
        </div>

        <div className="category-grid">
          {categories.map(category => (
            <div key={category.id} className="category-item">
              <h4>{category.name}</h4>
              <div className="subcategories">
                {category.type === 'income' ? '💰' : '💸'} {category.type}
                <br />
                {category.subcategories.length} subcategories
              </div>
              <button
                className="btn"
                style={{ marginTop: 8, padding: '6px 12px', fontSize: 12 }}
                onClick={() => {
                  setSelectedCategory(category);
                  setShowSubcategoryModal(true);
                }}
              >
                Manage
              </button>
              <button
                className="delete-btn"
                onClick={() => handleDeleteCategory(category.id)}
              >
                Delete
              </button>
            </div>
          ))}

          <div
            className="add-category-btn"
            onClick={() => setShowCategoryModal(true)}
          >
            <Plus size={24} style={{ marginBottom: 8 }} />
            <div>Add Category</div>
          </div>
        </div>
      </div>

      {/* Add Category Modal */}
      {showCategoryModal && (
        <div className="modal-overlay" onClick={() => setShowCategoryModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add New Category</h3>

            <div className="form-group">
              <label>Category Name</label>
              <input
                type="text"
                placeholder="Enter category name"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Type</label>
              <select
                value={newCategory.type}
                onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value as 'income' | 'expense' })}
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowCategoryModal(false)}>
                Cancel
              </button>
              <button className="btn" onClick={handleAddCategory}>
                Add Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Subcategories Modal */}
      {showSubcategoryModal && selectedCategory && (
        <div className="modal-overlay" onClick={() => setShowSubcategoryModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Manage Subcategories: {selectedCategory.name}</h3>

            <div className="subcategory-list">
              {selectedCategory.subcategories.map(sub => (
                <div key={sub} className="subcategory-item">
                  <span>{sub}</span>
                  <button
                    style={{
                      background: '#fee',
                      color: '#ef4444',
                      border: 'none',
                      padding: '4px 8px',
                      borderRadius: 4,
                      cursor: 'pointer',
                      fontSize: 12
                    }}
                    onClick={() => handleDeleteSubcategory(selectedCategory.id, sub)}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>

            <div className="form-group" style={{ marginTop: 16 }}>
              <label>Add Subcategory</label>
              <input
                type="text"
                placeholder="Enter subcategory name"
                value={newSubcategory}
                onChange={(e) => setNewSubcategory(e.target.value)}
              />
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowSubcategoryModal(false);
                  setSelectedCategory(null);
                  setNewSubcategory('');
                }}
              >
                Close
              </button>
              <button className="btn" onClick={handleAddSubcategory}>
                Add Subcategory
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
