const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Schema = mongoose.Schema;

// User model
const user_model = new Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    salary: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
    date: { type: Date, default: Date.now }
});

// Hash password before saving
user_model.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare password - attach to schema before compiling
user_model.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        console.error('Password comparison error:', error);
        return false;
    }
};

// categories => field => ['type', 'color']
const categories_model = new Schema({
    type: { type: String, default: 'Investment'},
    color: { type: String, default: '#FCBE44' }
})

// transactions => field => ['name', 'type', 'amount', 'date', 'user']
const transaction_model = new Schema({
    name: { type: String, default: 'Anonymous'},
    type: { type: String, default: 'Investment'},
    amount: { type: Number },
    date: { type: Date, default: Date.now},
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
})

const User = mongoose.model('user', user_model);
const Categories = mongoose.model('categories', categories_model);
const Transaction = mongoose.model('transaction', transaction_model);

exports.default = Transaction;
module.exports = {
    User,
    Categories,
    Transaction
}
