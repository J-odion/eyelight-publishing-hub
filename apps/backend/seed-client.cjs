require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const seedClient = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/eyelight-publishing-hub';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const db = mongoose.connection;
    const usersCollection = db.collection('users');
    const projectsCollection = db.collection('projects');

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email: 'client@eyelight.com' });
    if (existingUser) {
      console.log('Client already exists! Email: client@eyelight.com / Password: Password123');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('Password123', 10);
    const userId = new mongoose.Types.ObjectId();

    await usersCollection.insertOne({
      _id: userId,
      email: 'client@eyelight.com',
      password: hashedPassword,
      name: 'Test Client',
      role: 'author',
      phone: '+2349012345678',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await projectsCollection.insertOne({
      author: userId,
      title: 'The Great Test Book',
      genre: 'Non-fiction',
      wordCount: 50000,
      description: 'A book to test the author portal.',
      status: 'Reviewing',
      progress: 25,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('Client seeded successfully!');
    console.log('Email: client@eyelight.com');
    console.log('Password: Password123');

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedClient();
