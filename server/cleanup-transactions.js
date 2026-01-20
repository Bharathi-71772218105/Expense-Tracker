// Script to clean up orphaned transactions (those without user field)
const mongoose = require('mongoose');
const model = require('./models/model');

async function cleanupOrphanedTransactions() {
    try {
        // Connect to database
        await mongoose.connect('mongodb://localhost:27017/expense-tracker', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('Connected to database for cleanup');

        // Find all transactions without user field
        const orphanedTransactions = await model.Transaction.find({ user: { $exists: false } });
        console.log(`Found ${orphanedTransactions.length} orphaned transactions`);

        if (orphanedTransactions.length > 0) {
            // Delete orphaned transactions
            const deleteResult = await model.Transaction.deleteMany({ user: { $exists: false } });
            console.log(`Deleted ${deleteResult.deletedCount} orphaned transactions`);
        }

        // Check remaining transactions
        const allTransactions = await model.Transaction.find({});
        const usersWithTransactions = await model.User.find({});
        
        console.log(`Total transactions remaining: ${allTransactions.length}`);
        console.log(`Total users: ${usersWithTransactions.length}`);

        // Show transactions per user
        for (const user of usersWithTransactions) {
            const userTransactions = await model.Transaction.find({ user: user._id });
            console.log(`User ${user.username} (${user._id}): ${userTransactions.length} transactions`);
        }

    } catch (error) {
        console.error('Cleanup error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

cleanupOrphanedTransactions();
