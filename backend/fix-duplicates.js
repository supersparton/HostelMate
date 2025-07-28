const mongoose = require('mongoose');
require('dotenv').config();

async function fixDuplicateApplicationIds() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        
        const Application = mongoose.model('Application', new mongoose.Schema({
            applicationId: String,
            name: String,
            email: String,
            createdAt: Date
        }, { strict: false }));
        
        // Find duplicate applicationIds
        const duplicates = await Application.aggregate([
            { $group: { 
                _id: '$applicationId', 
                count: { $sum: 1 }, 
                docs: { $push: { id: '$_id', name: '$name', createdAt: '$createdAt' } }
            }},
            { $match: { count: { $gt: 1 } } }
        ]);
        
        console.log('🔍 Found duplicate applicationIds:', duplicates.length);
        
        if (duplicates.length > 0) {
            for (const dup of duplicates) {
                console.log(`📋 Duplicate applicationId: ${dup._id} (${dup.count} copies)`);
                
                // Sort by creation date and keep the oldest one
                dup.docs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                const docsToDelete = dup.docs.slice(1); // Keep first (oldest), delete rest
                
                for (const doc of docsToDelete) {
                    await Application.deleteOne({ _id: doc.id });
                    console.log(`   🗑️ Deleted: ${doc.name} (${doc.id})`);
                }
            }
            console.log('✅ Cleanup complete!');
        } else {
            console.log('✅ No duplicates found');
        }
        
        // Show current application count
        const totalApps = await Application.countDocuments();
        console.log(`📊 Total applications remaining: ${totalApps}`);
        
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

fixDuplicateApplicationIds();
