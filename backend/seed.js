import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Property from './models/Property.js';
import Booking from './models/Booking.js';
import connectDB from './config/db.js';

dotenv.config();

// Connect to MongoDB
connectDB();

const seedData = async () => {
  try {
    // Clean database
    await User.deleteMany();
    await Property.deleteMany();
    await Booking.deleteMany();

    console.log('Database cleaned. Seeding starting...');

    // Hash passwords
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password', salt);

    // Create Users
    const tenantUser = await User.create({
      name: 'Tom Tenant',
      email: 'tenant@example.com',
      password: hashedPassword,
      role: 'tenant',
      phone: '+1 (555) 123-4567',
    });

    const landlordUser = await User.create({
      name: 'Lisa Landlord',
      email: 'landlord@example.com',
      password: hashedPassword,
      role: 'landlord',
      phone: '+1 (555) 987-6543',
    });

    const adminUser = await User.create({
      name: 'Andy Admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
      phone: '+1 (555) 000-1111',
    });

    console.log('Users seeded successfully.');

    // Sample Properties owned by landlord
    const properties = [
      {
        title: 'Modern Luxury Penthouse',
        description: 'Exquisite penthouse apartment featuring floor-to-ceiling windows, wrap-around balcony, state-of-the-art kitchen appliances, and direct elevator access. Located in the heart of downtown with breathtaking views of the skyline.',
        price: 3200,
        location: 'San Francisco, CA',
        type: 'apartment',
        bedrooms: 2,
        bathrooms: 2,
        size: 1200,
        images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1000&auto=format&fit=crop&q=80'],
        amenities: ['Wifi', 'AC', 'Parking', 'Kitchen', 'Gym', 'Laundry', 'Furnished'],
        owner: landlordUser._id,
        availability: true,
        isApproved: true,
      },
      {
        title: 'Charming Craftsman Suburban House',
        description: 'Spacious craftsman style home with a fully fenced landscaped backyard, perfect for families and pets. Features include oak hardwood floors, cozy wood-burning fireplace, and a updated country kitchen. Quiet neighborhood near schools.',
        price: 2600,
        location: 'Seattle, WA',
        type: 'house',
        bedrooms: 3,
        bathrooms: 2,
        size: 1750,
        images: ['https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1000&auto=format&fit=crop&q=80'],
        amenities: ['Wifi', 'Parking', 'Kitchen', 'Laundry', 'Pet Friendly'],
        owner: landlordUser._id,
        availability: true,
        isApproved: true,
      },
      {
        title: 'Urban Industrial Loft Space',
        description: 'True industrial loft living with exposed brick walls, original heavy timber beams, and polished concrete floors. Open concept floor plan allows customized configurations. Excellent transit links, walk to local breweries.',
        price: 1850,
        location: 'Brooklyn, NY',
        type: 'studio',
        bedrooms: 1,
        bathrooms: 1,
        size: 780,
        images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1000&auto=format&fit=crop&q=80'],
        amenities: ['Wifi', 'AC', 'Kitchen', 'Laundry'],
        owner: landlordUser._id,
        availability: true,
        isApproved: true,
      },
      {
        title: 'Quiet Private Room in Shared Villa',
        description: 'Cozy private room in a sprawling Spanish-style villa in a highly desirable residential pocket. Access to shared living room, massive chef kitchen, outdoor heated pool, and laundry suite. All utilities included in rent.',
        price: 950,
        location: 'Austin, TX',
        type: 'room',
        bedrooms: 1,
        bathrooms: 1,
        size: 250,
        images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000&auto=format&fit=crop&q=80'],
        amenities: ['Wifi', 'AC', 'Parking', 'Kitchen', 'Furnished'],
        owner: landlordUser._id,
        availability: true,
        isApproved: true,
      },
    ];

    await Property.create(properties);
    console.log('Sample properties seeded successfully.');

    console.log('Database Seeding Completed Successfully.');
    process.exit(0);
  } catch (error) {
    console.error(`Seeding database failed: ${error.message}`);
    process.exit(1);
  }
};

seedData();
