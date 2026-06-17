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
      phone: '+91 98765 43210',
    });

    const landlordUser = await User.create({
      name: 'Lisa Landlord',
      email: 'landlord@example.com',
      password: hashedPassword,
      role: 'landlord',
      phone: '+91 87654 32109',
    });

    const adminUser = await User.create({
      name: 'Andy Admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
      phone: '+91 76543 21098',
    });

    console.log('Users seeded successfully.');

    // Sample Properties owned by landlord
    const properties = [
      {
        title: 'Modern Luxury Penthouse',
        description: 'Exquisite penthouse apartment featuring floor-to-ceiling windows, wrap-around balcony, state-of-the-art kitchen appliances, and direct elevator access. Located in the heart of Worli with breathtaking views of the Sea Link.',
        price: 95000,
        location: 'Worli, Mumbai',
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
        title: 'Charming Craftsman Villa House',
        description: 'Spacious craftsman style villa with a fully landscaped garden, perfect for families. Features include teak wood flooring, custom fireplace, and a modular kitchen. Located in a quiet gated street near tech parks.',
        price: 55000,
        location: 'Indiranagar, Bangalore',
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
        description: 'True industrial loft living with exposed brick walls, timber beams, and high ceilings. Open concept floor plan allows customized workspace configurations. Steps away from metro, cafes, and markets.',
        price: 38000,
        location: 'Hauz Khas, Delhi',
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
        description: 'Cozy private room in a sprawling luxury villa in a prime tech hub. Access to shared living room, large kitchen, pool table, and washing area. All maintenance and high-speed fiber internet bills included in rent.',
        price: 15000,
        location: 'Gachibowli, Hyderabad',
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
