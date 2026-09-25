const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const res = await mongoose.connection.collection('emailcampaigns').updateMany(
    { status: 'Sending' },
    { $set: { status: 'Failed' } }
  );
  console.log('Updated:', res.modifiedCount);
  process.exit(0);
});
