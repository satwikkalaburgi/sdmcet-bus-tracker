import User from '../models/User.js';
import Bus from '../models/Bus.js';
import Route from '../models/Route.js';
import bcrypt from 'bcrypt';

export const seedData = async () => {
  try {
    console.log('Clearing old collections for clean development credentials...');
    await User.deleteMany({});
    await Bus.deleteMany({});
    await Route.deleteMany({});

    console.log('Seeding REAL college data...');
      
      // Admin and Student
      await User.create({ name: 'Admin User', email: 'admin@sdmcet.ac.in', password: 'password', role: 'admin' });
      await User.create({ name: 'Student One', email: 'student1@sdmcet.ac.in', password: 'password', role: 'student' });

      // Create EXACT Drivers from Official Sheet
      const driversData = [
        { name: 'Shankraya Virakthamath', email: 'shankraya@sdmcet.ac.in', phone: '7829643880' },
        { name: 'Shankar Lakkundi', email: 'shankar@sdmcet.ac.in', phone: '8971498734' },
        { name: 'Mahesh Hadapad', email: 'mahesh@sdmcet.ac.in', phone: '7975506864' },
        { name: 'Umesh Muddi', email: 'umesh@sdmcet.ac.in', phone: '9886927434' },
        { name: 'Ashok Hadpad', email: 'ashok@sdmcet.ac.in', phone: '8147929600' },
        { name: 'Sudheer Harani', email: 'sudheer@sdmcet.ac.in', phone: '8073936291' },
        { name: 'Sangappa Revannavar', email: 'sangappa@sdmcet.ac.in', phone: '8095893174' },
        { name: 'Ravi Jadhav', email: 'ravi@sdmcet.ac.in', phone: '9902713452' },
        { name: 'Imam Hawaldar', email: 'imam@sdmcet.ac.in', phone: '8147826075' }
      ];

      const driverDocs = [];
      for (const d of driversData) {
        const doc = await User.create({ name: d.name, email: d.email, password: 'password', role: 'driver' });
        driverDocs.push(doc);
      }

      // Seed a permanent Student account so the user never loses it on server reboot
      await User.create({
        name: 'Satwik Kalaburgi',
        email: 'student2@sdmcet.ac.in',
        password: 'password',
        role: 'student',
        usn: '2SD21CS000',
        phone: '9876543210'
      });
      await User.create({
        name: 'Test Student',
        email: 'student@sdmcet.ac.in',
        password: 'password',
        role: 'student',
        usn: '2SD21CS999',
        phone: '9876543211'
      });

      // Create Routes with EXACT checkpoints from official circular
      const route1 = await Route.create({ 
        name: 'Siddharoodha Math Route', 
        stops: ['Sidharoodha matha', 'Murdershwar factory', 'Heamreaddy mallamma', 'Green field', 'Manjunath Nagar', 'Nehru Nagar Water Tank', 'Arjun Vihar', 'KEC', 'Basaveshwaranagar', 'Akshay Park', 'Ravi Nagar', 'Tolanakere', 'Chetana College', 'Siddheshwar Park', 'Shirur park- Harsha Fast Food', 'Vidyanagar', 'BVBCET College', 'Unkal Cross', 'Srinagar', 'Unkal Lake', 'Bairidevarakoppa', 'Sana College', 'APMC', 'Navanagar', 'Income Tax', 'RTO', 'Rayapur', 'NGEF', 'SDM Medical College', 'Sattur', 'SDM Dental', 'SDM Dental Cross', 'Navalur', 'Ozone', 'Lakamanhalli BRTS Stop', 'Y.S. Colony', 'Gandhinagar', 'Vidyagiri', 'Suvarna Petrol Pump', 'Toll Naka', 'Dharwad- SDMCET'].map(s => ({name: s})),
        optimizedPath: [{lat: 15.3340, lng: 75.1460}, {lat: 15.3520, lng: 75.1400}, {lat: 15.3712, lng: 75.1221}, {lat: 15.3850, lng: 75.1050}, {lat: 15.3990, lng: 75.0800}, {lat: 15.4180, lng: 75.0350}, {lat: 15.4293, lng: 75.0063}]
      });
      const route2 = await Route.create({ 
        name: 'Keshwapur Route', 
        stops: ['Gangubai Hangal Music Academy', 'Sub-Jail', 'Miskin Stop', 'Lion School', 'Devangapet', 'Bengeri', 'Shanti Nagar Stop', 'Badami Nagar', 'Madhura Colony', 'Aditya Fast Food', 'SBI Bank', 'Keshwapur', 'Railway-Station', 'Corporation', 'Old Bus Stand', 'IT Park', 'Hosur', 'KMC', 'Gurudat Bhavan', 'Vidyanagar', 'BVBCET College', 'Unkal Cross', 'Srinagar', 'Unkal Lake', 'Bairidevarakoppa', 'Sana College', 'APMC', 'Navanagar', 'Income Tax', 'RTO', 'Rayapur', 'NGEF', 'SDM Medical College', 'Sattur', 'SDM Dental', 'SDM Dental Cross', 'Navalur', 'Ozone', 'Lakamanhalli BRTS Stop', 'Y.S. Colony', 'Gandhinagar', 'Vidyagiri', 'Suvarna Petrol Pump', 'Toll Naka', 'Dharwad- SDMCET'].map(s => ({name: s})),
        optimizedPath: [{lat: 15.3580, lng: 75.1520}, {lat: 15.3520, lng: 75.1400}, {lat: 15.3712, lng: 75.1221}, {lat: 15.3850, lng: 75.1050}, {lat: 15.4180, lng: 75.0350}, {lat: 15.4293, lng: 75.0063}]
      });
      const route3 = await Route.create({ 
        name: 'Srinagar Route & Bharthi nagar route', 
        stops: ['SDMCET College', 'Court Circle', 'KCD', 'Dasankoppa Cross', 'Vaidhyamath Complex', 'Sai Nagar', 'Bharati Nagar', 'Saptapur Bhavi', 'Jayanagar', 'Srinagar', 'CB Nagar', 'Shivagiri', 'Nirmal Nagar', 'Pavan school', 'Kariamma temple', 'Uday Hostel', 'Keshav Nagar', 'Rly-station', 'Malamaddi', 'Yemmkeri', 'Bagalkot Petrol Pump', 'Toll Naka', 'SDMCET College'].map(s => ({name: s})),
        optimizedPath: [{lat: 15.4500, lng: 74.9800}, {lat: 15.4550, lng: 74.9950}, {lat: 15.4450, lng: 75.0050}, {lat: 15.4510, lng: 75.0100}, {lat: 15.4260, lng: 75.0150}, {lat: 15.4293, lng: 75.0063}]
      });
      const route4 = await Route.create({ 
        name: 'CBT Route & MG Bank route', 
        stops: ['SDMCET', 'Court', 'Bagalkot Petrol Pump', 'NTTF', 'Jubli Circle', 'CBT', 'Shivaji circle', 'Murugamath', 'Depot Circle', 'Maratha Colony', 'VRL', 'Duragadevi Temple Cross', 'Old SP office', 'KC Park', 'New Bus Stand', 'MG bank', 'Police Head Quarters', 'BGS school', 'Shantineketan cross', 'German Hospital', 'Narayanpur Canara Bank', 'Dasanakoppa Circle', 'KCD', 'Toll Naka', 'SDMCET College'].map(s => ({name: s})),
        optimizedPath: [{lat: 15.4600, lng: 75.0080}, {lat: 15.4580, lng: 75.0050}, {lat: 15.4520, lng: 75.0200}, {lat: 15.4293, lng: 75.0063}]
      });
      const route5 = await Route.create({ 
        name: 'Navanagar Route', 
        stops: ['Cancer hospital', 'Navanagar', 'Income Tax', 'RTO', 'Rayapur', 'NGEF', 'SDM Medical College', 'Sattur', 'SDM Dental', 'SDM Dental Cross', 'Navalur', 'Ozone', 'Lakamanhalli BRTS Stop', 'Y.S. Colony', 'Gandhinagar', 'Vidyagiri', 'Suvarna Petrol Pump', 'Toll Naka', 'Dharwad- SDMCET'].map(s => ({name: s})),
        optimizedPath: [{lat: 15.3950, lng: 75.0850}, {lat: 15.4050, lng: 75.0600}, {lat: 15.4180, lng: 75.0350}, {lat: 15.4293, lng: 75.0063}]
      });

      // Create EXACT Buses from Official Sheet and link to routes
      const busesData = [
        { reg: 'KA25 AB4519', driverId: driverDocs[0]._id, routeId: route1._id }, // Shankraya Virakthamath -> Siddharoodha
        { reg: 'KA25 AB4520', driverId: driverDocs[1]._id, routeId: route2._id }, // Shankar Lakkundi -> Keshwapur
        { reg: 'KA25 AB0084', driverId: driverDocs[2]._id, routeId: route1._id }, // Mahesh Hadapad -> Siddharoodha
        { reg: 'KA25 AB0090', driverId: driverDocs[3]._id, routeId: route2._id }, // Umesh Muddi -> Keshwapur
        { reg: 'KA25 AB7329', driverId: driverDocs[4]._id, routeId: route5._id }, // Ashok Hadpad -> Navanagar
        { reg: 'KA25 AB2897', driverId: driverDocs[5]._id, routeId: route3._id }, // Sudheer Harani -> Srinagar
        { reg: 'KA25 AB9818', driverId: driverDocs[6]._id, routeId: route3._id }, // Sangappa Revannavar -> Srinagar
        { reg: 'KA25 AB1104', driverId: driverDocs[7]._id, routeId: route4._id }, // Ravi Jadhav -> CBT
        { reg: 'KA25 AB9819', driverId: driverDocs[8]._id, routeId: route4._id }, // Imam Hawaldar -> CBT
      ];

      for (const b of busesData) {
        await Bus.create({ registrationNumber: b.reg, driver: b.driverId, route: b.routeId, status: 'idle' });
      }

      console.log('Real college seed data created successfully.');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
};
