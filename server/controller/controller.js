const model = require('../models/model');
const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const app = express();

app.use(
    express.urlencoded({
        extended: true,
    })
);

app.use(express.json());

// Register user
async function register(req, res) {
    try {
        const body = req.body;
        if (!body) return res.status(400).json({ message: 'Request body required' });
        const { username, password, salary } = body;
        if (!username || !password) return res.status(400).json({ message: 'Username and password required' });

        const existingUser = await model.User.findOne({ username });
        if (existingUser) return res.status(400).json({ message: 'Username already exists' });

        const user = new model.User({ username, password, salary, balance: salary });
        await user.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.log('Register error:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
}

// Login user
async function login(req, res) {
    try {
        const body = req.body;
        if (!body) return res.status(400).json({ message: 'Request body required' });
        const { username, password } = body;
        if (!username || !password) return res.status(400).json({ message: 'Username and password required' });

        const user = await model.User.findOne({ username });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '1h' });

        res.json({ token, user: { id: user._id, username: user.username, salary: user.salary, balance: user.balance } });
    } catch (error) {
        console.log('Login error:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
}

// Get user profile
async function getProfile(req, res) {
    try {
        const userId = req.user.id;
        const user = await model.User.findById(userId).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        // Get current transactions to calculate real-time balance
        const transactions = await model.Transaction.find({ user: userId });
        let totalExpense = transactions.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0);
        let totalInvestment = transactions.filter(t => t.type === 'Investment').reduce((sum, t) => sum + t.amount, 0);
        let currentBalance = (user.salary || 0) - totalExpense - totalInvestment;
        
        // Update user balance if different
        if (user.balance !== currentBalance) {
            user.balance = currentBalance;
            await user.save();
        }
        
        console.log(`Profile retrieved for user ${userId}: Balance = ${currentBalance}`);
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
}

//  post: http://localhost:8080/api/categories
async function create_categories(req, res) {
    try {
        // Create all three categories if they don't exist
        const categories = [
            { type: "Expense", color: "#FF6B6B" },
            { type: "Savings", color: "#4ECDC4" }, 
            { type: "Investment", color: "#FCBE44" }
        ];

        for (const category of categories) {
            const exists = await model.Categories.findOne({ type: category.type });
            if (!exists) {
                const newCategory = new model.Categories(category);
                await newCategory.save();
            }
        }

        const allCategories = await model.Categories.find({});
        return res.json(allCategories);
    } catch (error) {
        return res.status(400).json({ message: `Error while creating categories ${error}` });
    }
}

//  get: http://localhost:8080/api/categories
async function get_categories(req, res) {
    let data = await model.Categories.find({})

    let filter = await data.map(v => Object.assign({}, { type: v.type, color: v.color }));
    return res.json(filter);
}

//  post: http://localhost:8080/api/transaction
async function create_transaction(req, res) {
    if (!req.body) return res.status(400).json("Post HTTP Data not Provided");
    let { name, type, amount } = req.body;
    const userId = req.user.id;

    try {
        const user = await model.User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Get current transactions to calculate current balance
        const transactions = await model.Transaction.find({ user: userId });
        let currentExpense = transactions.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0);
        let currentInvestment = transactions.filter(t => t.type === 'Investment').reduce((sum, t) => sum + t.amount, 0);
        let currentBalance = (user.salary || 0) - currentExpense - currentInvestment;

        if (type === 'Expense' || type === 'Investment') {
            if (currentBalance < amount) {
                return res.status(400).json({ message: 'Insufficient balance for this transaction' });
            }
            // Balance will be updated dynamically in get_summary
        } else if (type === 'Savings') {
            // Savings should not affect current balance - they are separate
        }

        await user.save();

        const create = await new model.Transaction({
            name,
            type,
            amount,
            date: new Date(),
            user: userId
        });

        await create.save();
        console.log(`Transaction created successfully: ${create._id} - ${name} (${type}) - ${amount} for user ${userId}`);
        res.json(create);
    } catch (error) {
        console.error('Create transaction error:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
}

//  get: http://localhost:8080/api/transaction
async function get_transaction(req, res) {
    const userId = req.user.id;
    console.log(`get_transaction called for user: ${userId}`);
    
    let data = await model.Transaction.find({ user: userId }).sort({ date: -1 });
    console.log(`Found ${data.length} transactions for user ${userId}:`, data.map(t => ({ id: t._id, name: t.name, type: t.type, user: t.user })));
    
    return res.json(data);
}

//  delete: http://localhost:8080/api/transaction
async function delete_transaction(req, res) {
    if (!req.body) return res.status(400).json({ message: "Request body not found" });
    const { _id } = req.body;
    const userId = req.user.id;

    try {
        // Find the transaction first to get its details
        const transaction = await model.Transaction.findOne({ _id, user: userId });
        if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

        // Delete the transaction - balance will be recalculated dynamically in get_summary
        await model.Transaction.deleteOne({ _id, user: userId });
        console.log(`Transaction deleted successfully: ${_id} for user ${userId}`);

        res.json("Record Deleted...!");
    } catch (error) {
        console.error('Delete transaction error:', error);
        res.status(500).json({ message: "Error while deleting Transaction record" });
    }
}

//  put: http://localhost:8080/api/transaction
async function update_transaction(req, res) {
    if (!req.body) return res.status(400).json({ message: "Request body not found" });
    const { _id, name, type, amount } = req.body;
    const userId = req.user.id;

    try {
        const transaction = await model.Transaction.findOne({ _id, user: userId });
        if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

        // Get all transactions except the one being updated to check balance
        const otherTransactions = await model.Transaction.find({ user: userId, _id: { $ne: _id } });
        let otherExpense = otherTransactions.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0);
        let otherInvestment = otherTransactions.filter(t => t.type === 'Investment').reduce((sum, t) => sum + t.amount, 0);
        
        const user = await model.User.findById(userId);
        let projectedBalance = (user.salary || 0) - otherExpense - otherInvestment;
        
        // Check if the new transaction would exceed balance
        if (type === 'Expense' || type === 'Investment') {
            if (projectedBalance < amount) {
                return res.status(400).json({ message: 'Insufficient balance for this transaction' });
            }
        }

        // Update the transaction - balance will be recalculated dynamically in get_summary
        transaction.name = name || transaction.name;
        transaction.type = type || transaction.type;
        transaction.amount = amount || transaction.amount;

        await transaction.save();
        console.log(`Transaction updated successfully: ${transaction._id} - ${transaction.name} (${transaction.type}) - ${transaction.amount} for user ${userId}`);
        res.json("Record Updated...!");
    } catch (error) {
        console.error('Update transaction error:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

//  get: http://localhost:8080/api/labels
async function get_labels(req, res) {
    const userId = req.user.id;
    console.log(`get_labels called for user: ${userId}`);

    try {
        const result = await model.Transaction.aggregate([
            {
                $match: { user: new mongoose.Types.ObjectId(userId) }
            },
            {
                $lookup: {
                    from: "categories",
                    localField: 'type',
                    foreignField: "type",
                    as: "categories_info"
                }
            },
            {
                $unwind: "$categories_info"
            }
        ]);
        
        let data = result.map(v => Object.assign({}, { _id: v._id, name: v.name, type: v.type, amount: v.amount, color: v.categories_info['color'] }));
        console.log(`get_labels returning ${data.length} items for user ${userId}:`, data);
        res.json(data);
    } catch (error) {
        console.error('Get labels error:', error);
        res.status(400).json("Lookup Collection Error");
    }
}

//  get: http://localhost:8080/api/summary
async function get_summary(req, res) {
    const userId = req.user.id;

    try {
        // Get user and all their transactions
        const user = await model.User.findById(userId);
        const transactions = await model.Transaction.find({ user: userId }).sort({ date: -1 });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Dynamic transaction category analysis
        let totalExpense = 0;
        let totalSavings = 0;
        let totalInvestment = 0;

        // Calculate totals dynamically from transaction history
        transactions.forEach(t => {
            if (t.type === 'Savings') {
                totalSavings += t.amount;
            } else if (t.type === 'Expense') {
                totalExpense += t.amount;
            } else if (t.type === 'Investment') {
                totalInvestment += t.amount;
            }
        });

        // Calculate correct balance dynamically (salary - expenses - investments)
        let calculatedBalance = (user.salary || 0) - totalExpense - totalInvestment;
        
        // Ensure balance never exceeds salary (shouldn't happen with correct logic, but add safety check)
        if (calculatedBalance > (user.salary || 0)) {
            calculatedBalance = user.salary || 0;
            console.error('Warning: Calculated balance exceeded salary, corrected to:', calculatedBalance);
        }
        
        // Ensure balance is never negative
        if (calculatedBalance < 0) {
            calculatedBalance = 0;
            console.error('Warning: Calculated balance was negative, corrected to:', calculatedBalance);
        }
        
        // Update user's balance if it's different from calculated balance
        if (user.balance !== calculatedBalance) {
            user.balance = calculatedBalance;
            await user.save();
        }

        // Log transaction analysis for debugging
        console.log(`Transaction Analysis for User ${userId}:`);
        console.log(`- Salary: ${user.salary || 0}`);
        console.log(`- Total Transactions: ${transactions.length}`);
        console.log(`- Total Expense: ${totalExpense} (from ${transactions.filter(t => t.type === 'Expense').length} Expense transactions)`);
        console.log(`- Total Savings: ${totalSavings} (from ${transactions.filter(t => t.type === 'Savings').length} Savings transactions)`);
        console.log(`- Total Investment: ${totalInvestment} (from ${transactions.filter(t => t.type === 'Investment').length} Investment transactions)`);
        console.log(`- Calculated Balance: ${calculatedBalance} (Salary - Expenses - Investments)`);

        res.json({
            // Core financial data - dynamically calculated from transactions
            totalIncome: user.salary || 0,
            totalExpense,      // Dynamically calculated from Expense transactions
            totalSavings,     // Dynamically calculated from Savings transactions
            totalInvestment,   // Dynamically calculated from Investment transactions
            balance: calculatedBalance,  // Correct balance excluding savings
            
            // Timestamp
            lastUpdated: new Date().toISOString()
        });
    } catch (error) {
        console.log('Summary error:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
}


module.exports = {
    register,
    login,
    getProfile,
    create_categories,
    get_categories,
    create_transaction,
    get_transaction,
    delete_transaction,
    update_transaction,
    get_labels,
    get_summary
}
