const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Property = require('../models/Property');

dotenv.config();

const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin'
  },
  {
    name: 'John Agent',
    email: 'john@example.com',
    password: 'password123',
    role: 'agent',
    phone: '9876543210',
    bio: 'Experienced real estate agent with 10 years of experience.'
  },
  {
    name: 'Sarah Broker',
    email: 'sarah@example.com',
    password: 'password123',
    role: 'agent',
    phone: '9888877777',
    bio: 'Specializing in luxury villas and apartments.'
  }
];

const properties = [
  {
    title: 'Modern Luxury Apartment',
    description: 'A beautiful modern luxury apartment in the heart of Mumbai with seaside views.',
    type: 'apartment',
    status: 'for-rent',
    price: 3500,
    priceType: 'month',
    area: 1200,
    bedrooms: 2,
    bathrooms: 2,
    latitude: 19.0596, longitude: 72.8295,
    address: { city: 'Mumbai', state: 'Maharashtra', street: 'Bandra West' },
    amenities: ['Gym', 'Pool', '24/7 Security'],
    agentName: 'Rajesh Kumar', agencyName: 'DreamHome Realty',
    phone: '9876543210', whatsapp: '9876543210', verified: true,
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267']
  },
  {
    title: 'Spacious Villa with Garden',
    description: 'Beautiful spacious villa with a private garden and pool in Pune.',
    type: 'villa',
    status: 'for-sale',
    price: 450000,
    priceType: 'total',
    area: 3500,
    bedrooms: 4,
    bathrooms: 4,
    latitude: 18.5204, longitude: 73.8567,
    address: { city: 'Pune', state: 'Maharashtra', street: 'Koregaon Park' },
    amenities: ['Garden', 'Pool', 'Home Theater'],
    agentName: 'Priya Sharma', agencyName: 'Elite Properties',
    phone: '9988776655', whatsapp: '9988776655', verified: true,
    images: ['https://images.unsplash.com/photo-1580587771525-78b9dba3b914']
  },
  {
    title: 'Noida Tech Hub Studio',
    description: 'Smart studio apartment near major IT parks in Noida.',
    type: 'apartment',
    status: 'for-rent',
    price: 1200,
    priceType: 'month',
    area: 600,
    bedrooms: 1,
    bathrooms: 1,
    latitude: 28.6139, longitude: 77.2090,
    address: { city: 'Noida', state: 'Uttar Pradesh', street: 'Sector 62' },
    amenities: ['Wifi', 'Power Backup'],
    agentName: 'Amit Singh', agencyName: 'City Nest Realty',
    phone: '9812345678', whatsapp: '9812345678', verified: false,
    images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688']
  },
  {
    title: 'Royal Heritage Villa',
    description: 'Experience royalty in this heritage-style villa in Jaipur.',
    type: 'villa',
    status: 'for-sale',
    price: 850000,
    priceType: 'total',
    area: 5000,
    bedrooms: 5,
    bathrooms: 5,
    latitude: 26.9124, longitude: 75.7873,
    address: { city: 'Jaipur', state: 'Rajasthan', street: 'Amber Road' },
    amenities: ['King Size Pool', 'Private Courtyard'],
    agentName: 'Kavita Mehta', agencyName: 'Royal Estates',
    phone: '9911223344', whatsapp: '9911223344', verified: true,
    images: ['https://images.unsplash.com/photo-1613977257363-b073f4dd48c9']
  },
  {
    title: 'Ocean View Retreat',
    description: 'Stunning 3BHK villa with a direct view of the Arabian Sea in Goa.',
    type: 'villa',
    status: 'for-rent',
    price: 75000,
    priceType: 'month',
    area: 2800,
    bedrooms: 3,
    bathrooms: 3,
    latitude: 15.5522, longitude: 73.7769,
    address: { city: 'Goa', state: 'Goa', street: 'Anjuna' },
    amenities: ['Beach Access', 'Barbecue Area'],
    agentName: 'Carlos Fernandes', agencyName: 'Goa Luxury Homes',
    phone: '9823456789', whatsapp: '9823456789', verified: true,
    images: ['https://images.unsplash.com/photo-1499793983690-e29da59ef1c2']
  },
  {
    title: 'DLF Luxury Suite',
    description: 'High-end suite for executives in the heart of Gurgaon.',
    type: 'apartment', status: 'for-rent', price: 5000, priceType: 'month',
    area: 2200, bedrooms: 3, bathrooms: 3,
    latitude: 28.4595, longitude: 77.0266,
    address: { city: 'Gurgaon', state: 'Haryana', street: 'DLF Phase 5' },
    amenities: ['Concierge', 'High-speed Elevators'],
    agentName: 'Neha Gupta', agencyName: 'UrbanNest Realty',
    phone: '9934567890', whatsapp: '9934567890', verified: true,
    images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750']
  },
  {
    title: 'Green View Home',
    description: 'Peaceful house surrounded by greenery in Chandigarh.',
    type: 'house', status: 'for-sale', price: 320000, priceType: 'total',
    area: 2400, bedrooms: 3, bathrooms: 2,
    latitude: 30.7333, longitude: 76.7794,
    address: { city: 'Chandigarh', state: 'Chandigarh', street: 'Sector 10' },
    amenities: ['Park View', 'Balcony'],
    agentName: 'Harpreet Singh', agencyName: 'Punjab Homes',
    phone: '9812300987', whatsapp: '9812300987', verified: false,
    images: ['https://images.unsplash.com/photo-1568605114967-8130f3a36994']
  },
  {
    title: 'Brigade Gateway Apt',
    description: 'Premium apartment in a top-tier gated community in Bangalore.',
    type: 'apartment', status: 'for-rent', price: 2800, priceType: 'month',
    area: 1800, bedrooms: 3, bathrooms: 2,
    latitude: 12.9716, longitude: 77.5946,
    address: { city: 'Bangalore', state: 'Karnataka', street: 'Malleshwaram' },
    amenities: ['Swimming Pool', 'Clubhouse'],
    agentName: 'Suresh Naidu', agencyName: 'South Homes Realty',
    phone: '9856789012', whatsapp: '9856789012', verified: false,
    images: ['https://images.unsplash.com/photo-1574362848149-11496d93a7c7']
  }
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await User.deleteMany();
    await Property.deleteMany();

    const createdUsers = await User.insertMany(users);
    const agent1Id = createdUsers[1]._id;
    const agent2Id = createdUsers[2]._id;

    const sampleProperties = properties.map((property, index) => {
      return { ...property, owner: index % 2 === 0 ? agent1Id : agent2Id };
    });

    await Property.insertMany(sampleProperties);

    console.log('Data Seeded Successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error with seeding data: ${error.message}`);
    process.exit(1);
  }
};

seedData();
