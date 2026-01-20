// Test script to check categories and transactions
const mongoose = require('mongoose');
const model = require('./models/model');

async function testDatabase() {
    try {
        // Connect to database (adjust connection string as needed)
        await mongoose.connect('mongodb://localhost:27017/expense-tracker', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('Connected to database');

        // Check existing categories
        const categories = await model.Categories.find({});
        console.log('Categories:', categories);

        // Check existing transactions
        const transactions = await model.Transaction.find({});
        console.log('Transactions:', transactions);

        // Create categories if they don't exist
        const defaultCategories = [
            { type: "Expense", color: "#FF6B6B" },
            { type: "Savings", color: "#4ECDC4" }, 
            { type: "Investment", color: "#FCBE44" }
        ];

        for (const category of defaultCategories) {
            const exists = await model.Categories.findOne({ type: category.type });
            if (!exists) {
                const newCategory = new model.Categories(category);
                await newCategory.save();
                console.log('Created category:', category.type);
            }
        }

        // Check categories after creation
        const updatedCategories = await model.Categories.find({});
        console.log('Updated Categories:', updatedCategories);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

testDatabase();
