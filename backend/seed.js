/**
 * Seed script - creates sample donor users in the database
 * Run with: node seed.js
 */
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
dotenv.config();

const User = require("./models/User");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/lifelink";

// Pune-area coordinates for different areas
const puneLocations = [
  { lat: 18.5204, lng: 73.8567, city: "Pune", pincode: "411001" },
  { lat: 18.5562, lng: 73.8774, city: "Pune", pincode: "411006" },
  { lat: 18.5018, lng: 73.8636, city: "Pune", pincode: "411002" },
  { lat: 18.4655, lng: 73.8692, city: "Pune", pincode: "411037" },
  { lat: 18.5308, lng: 73.8474, city: "Pune", pincode: "411016" },
  { lat: 18.5195, lng: 73.8553, city: "Pune", pincode: "411011" },
  { lat: 18.5626, lng: 73.9116, city: "Pune", pincode: "411014" },
  { lat: 18.4534, lng: 73.8494, city: "Pune", pincode: "411043" },
  { lat: 18.5819, lng: 73.7409, city: "Pimpri-Chinchwad", pincode: "411018" },
  { lat: 18.6298, lng: 73.7997, city: "Pimpri-Chinchwad", pincode: "411044" },
  { lat: 18.5642, lng: 73.9703, city: "Hadapsar", pincode: "411028" },
  { lat: 18.5018, lng: 73.9341, city: "Wagholi", pincode: "412207" },
  { lat: 18.4523, lng: 73.9256, city: "Kharadi", pincode: "411014" },
  { lat: 18.5741, lng: 73.8060, city: "Shivajinagar", pincode: "411004" },
  { lat: 18.4912, lng: 73.8298, city: "Sinhagad Road", pincode: "411041" },
];

const donors = [
  // ─── BLOOD DONORS ────────────────────────────────────────────────────
  {
    email: "arjun.sharma@demo.com", phone: "9000000001", name: "Arjun Sharma",
    bloodGroup: "O+", age: 28, gender: "Male", weight: "72", smoker: false, alcoholic: false,
    illnesses: "", donateBlood: true, donateOrgan: false, organs: [],
    loc: puneLocations[0],
  },
  {
    email: "priya.patel@demo.com", phone: "9000000002", name: "Priya Patel",
    bloodGroup: "A+", age: 24, gender: "Female", weight: "58", smoker: false, alcoholic: false,
    illnesses: "", donateBlood: true, donateOrgan: false, organs: [],
    loc: puneLocations[1],
  },
  {
    email: "rahul.desai@demo.com", phone: "9000000003", name: "Rahul Desai",
    bloodGroup: "B+", age: 32, gender: "Male", weight: "80", smoker: false, alcoholic: true,
    illnesses: "", donateBlood: true, donateOrgan: false, organs: [],
    loc: puneLocations[2],
  },
  {
    email: "sneha.kulkarni@demo.com", phone: "9000000004", name: "Sneha Kulkarni",
    bloodGroup: "AB+", age: 26, gender: "Female", weight: "55", smoker: false, alcoholic: false,
    illnesses: "", donateBlood: true, donateOrgan: false, organs: [],
    loc: puneLocations[3],
  },
  {
    email: "vikram.nair@demo.com", phone: "9000000005", name: "Vikram Nair",
    bloodGroup: "O-", age: 35, gender: "Male", weight: "75", smoker: false, alcoholic: false,
    illnesses: "", donateBlood: true, donateOrgan: false, organs: [],
    loc: puneLocations[4],
  },
  {
    email: "kavita.joshi@demo.com", phone: "9000000006", name: "Kavita Joshi",
    bloodGroup: "A-", age: 29, gender: "Female", weight: "60", smoker: false, alcoholic: false,
    illnesses: "", donateBlood: true, donateOrgan: false, organs: [],
    loc: puneLocations[5],
  },
  {
    email: "rohit.mehta@demo.com", phone: "9000000007", name: "Rohit Mehta",
    bloodGroup: "B-", age: 31, gender: "Male", weight: "68", smoker: true, alcoholic: false,
    illnesses: "Mild asthma", donateBlood: true, donateOrgan: false, organs: [],
    loc: puneLocations[6],
  },
  {
    email: "anita.rao@demo.com", phone: "9000000008", name: "Anita Rao",
    bloodGroup: "AB-", age: 27, gender: "Female", weight: "52", smoker: false, alcoholic: false,
    illnesses: "", donateBlood: true, donateOrgan: false, organs: [],
    loc: puneLocations[7],
  },
  {
    email: "suresh.iyer@demo.com", phone: "9000000009", name: "Suresh Iyer",
    bloodGroup: "O+", age: 40, gender: "Male", weight: "85", smoker: false, alcoholic: false,
    illnesses: "", donateBlood: true, donateOrgan: false, organs: [],
    loc: puneLocations[8],
  },
  {
    email: "deepa.mishra@demo.com", phone: "9000000010", name: "Deepa Mishra",
    bloodGroup: "A+", age: 22, gender: "Female", weight: "50", smoker: false, alcoholic: false,
    illnesses: "", donateBlood: true, donateOrgan: false, organs: [],
    loc: puneLocations[9],
  },
  {
    email: "amit.verma@demo.com", phone: "9000000011", name: "Amit Verma",
    bloodGroup: "B+", age: 36, gender: "Male", weight: "78", smoker: false, alcoholic: false,
    illnesses: "", donateBlood: true, donateOrgan: false, organs: [],
    loc: puneLocations[10],
  },
  {
    email: "pooja.singh@demo.com", phone: "9000000012", name: "Pooja Singh",
    bloodGroup: "O-", age: 25, gender: "Female", weight: "56", smoker: false, alcoholic: false,
    illnesses: "", donateBlood: true, donateOrgan: false, organs: [],
    loc: puneLocations[11],
  },
  {
    email: "kiran.bhat@demo.com", phone: "9000000013", name: "Kiran Bhat",
    bloodGroup: "AB+", age: 33, gender: "Male", weight: "70", smoker: false, alcoholic: false,
    illnesses: "", donateBlood: true, donateOrgan: false, organs: [],
    loc: puneLocations[12],
  },
  {
    email: "meera.gupta@demo.com", phone: "9000000014", name: "Meera Gupta",
    bloodGroup: "A-", age: 28, gender: "Female", weight: "54", smoker: false, alcoholic: false,
    illnesses: "", donateBlood: true, donateOrgan: false, organs: [],
    loc: puneLocations[13],
  },

  // ─── ORGAN DONORS ─────────────────────────────────────────────────────
  {
    email: "naresh.patil@demo.com", phone: "9000000015", name: "Naresh Patil",
    bloodGroup: "O+", age: 38, gender: "Male", weight: "82", smoker: false, alcoholic: false,
    illnesses: "", donateBlood: false, donateOrgan: true, organs: ["Kidney"],
    loc: puneLocations[0],
  },
  {
    email: "shweta.deshpande@demo.com", phone: "9000000016", name: "Shweta Deshpande",
    bloodGroup: "A+", age: 30, gender: "Female", weight: "60", smoker: false, alcoholic: false,
    illnesses: "", donateBlood: false, donateOrgan: true, organs: ["Liver", "Kidney"],
    loc: puneLocations[1],
  },
  {
    email: "manoj.khanna@demo.com", phone: "9000000017", name: "Manoj Khanna",
    bloodGroup: "B+", age: 45, gender: "Male", weight: "90", smoker: false, alcoholic: false,
    illnesses: "", donateBlood: false, donateOrgan: true, organs: ["Heart"],
    loc: puneLocations[2],
  },
  {
    email: "lakshmi.venkat@demo.com", phone: "9000000018", name: "Lakshmi Venkat",
    bloodGroup: "AB+", age: 34, gender: "Female", weight: "58", smoker: false, alcoholic: false,
    illnesses: "", donateBlood: false, donateOrgan: true, organs: ["Lungs", "Kidney"],
    loc: puneLocations[3],
  },
  {
    email: "rajiv.awasthi@demo.com", phone: "9000000019", name: "Rajiv Awasthi",
    bloodGroup: "O-", age: 42, gender: "Male", weight: "77", smoker: false, alcoholic: false,
    illnesses: "", donateBlood: false, donateOrgan: true, organs: ["Kidney"],
    loc: puneLocations[4],
  },
  {
    email: "sunita.yadav@demo.com", phone: "9000000020", name: "Sunita Yadav",
    bloodGroup: "A+", age: 29, gender: "Female", weight: "55", smoker: false, alcoholic: false,
    illnesses: "", donateBlood: false, donateOrgan: true, organs: ["Liver"],
    loc: puneLocations[5],
  },
  {
    email: "dinesh.kumar@demo.com", phone: "9000000021", name: "Dinesh Kumar",
    bloodGroup: "B-", age: 37, gender: "Male", weight: "73", smoker: false, alcoholic: false,
    illnesses: "", donateBlood: false, donateOrgan: true, organs: ["Kidney", "Pancreas"],
    loc: puneLocations[6],
  },
  {
    email: "preethi.nair@demo.com", phone: "9000000022", name: "Preethi Nair",
    bloodGroup: "O+", age: 26, gender: "Female", weight: "52", smoker: false, alcoholic: false,
    illnesses: "", donateBlood: false, donateOrgan: true, organs: ["Cornea"],
    loc: puneLocations[7],
  },
  {
    email: "sandeep.chauhan@demo.com", phone: "9000000023", name: "Sandeep Chauhan",
    bloodGroup: "A-", age: 41, gender: "Male", weight: "86", smoker: false, alcoholic: false,
    illnesses: "", donateBlood: false, donateOrgan: true, organs: ["Kidney", "Liver"],
    loc: puneLocations[8],
  },
  {
    email: "nandita.subramanian@demo.com", phone: "9000000024", name: "Nandita Subramanian",
    bloodGroup: "AB-", age: 32, gender: "Female", weight: "57", smoker: false, alcoholic: false,
    illnesses: "", donateBlood: false, donateOrgan: true, organs: ["Lungs"],
    loc: puneLocations[9],
  },
  {
    email: "praveen.reddy@demo.com", phone: "9000000025", name: "Praveen Reddy",
    bloodGroup: "B+", age: 39, gender: "Male", weight: "79", smoker: false, alcoholic: false,
    illnesses: "", donateBlood: false, donateOrgan: true, organs: ["Heart", "Kidney"],
    loc: puneLocations[10],
  },

  // ─── BOTH BLOOD & ORGAN DONORS ────────────────────────────────────────
  {
    email: "aditya.kapoor@demo.com", phone: "9000000026", name: "Aditya Kapoor",
    bloodGroup: "O+", age: 30, gender: "Male", weight: "74", smoker: false, alcoholic: false,
    illnesses: "", donateBlood: true, donateOrgan: true, organs: ["Kidney"],
    loc: puneLocations[11],
  },
  {
    email: "divya.krishnan@demo.com", phone: "9000000027", name: "Divya Krishnan",
    bloodGroup: "A+", age: 27, gender: "Female", weight: "53", smoker: false, alcoholic: false,
    illnesses: "", donateBlood: true, donateOrgan: true, organs: ["Liver"],
    loc: puneLocations[12],
  },
  {
    email: "vikas.pandey@demo.com", phone: "9000000028", name: "Vikas Pandey",
    bloodGroup: "B+", age: 34, gender: "Male", weight: "81", smoker: false, alcoholic: false,
    illnesses: "", donateBlood: true, donateOrgan: true, organs: ["Kidney", "Cornea"],
    loc: puneLocations[13],
  },
  {
    email: "ritika.bansal@demo.com", phone: "9000000029", name: "Ritika Bansal",
    bloodGroup: "AB+", age: 23, gender: "Female", weight: "50", smoker: false, alcoholic: false,
    illnesses: "", donateBlood: true, donateOrgan: true, organs: ["Liver"],
    loc: puneLocations[14],
  },
  {
    email: "sanjay.thakur@demo.com", phone: "9000000030", name: "Sanjay Thakur",
    bloodGroup: "O-", age: 44, gender: "Male", weight: "88", smoker: false, alcoholic: false,
    illnesses: "", donateBlood: true, donateOrgan: true, organs: ["Kidney", "Pancreas"],
    loc: puneLocations[0],
  },
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("✅ MongoDB connected");

  const hashedPassword = await bcrypt.hash("Demo@1234", 10);
  let created = 0;
  let skipped = 0;

  for (const d of donors) {
    const existing = await User.findOne({ email: d.email });
    if (existing) {
      console.log(`⏭  Skipped (exists): ${d.email}`);
      skipped++;
      continue;
    }

    await User.create({
      email: d.email,
      phone: d.phone,
      password: hashedPassword,
      role: "donor",
      profileComplete: true,
      profile: {
        name: d.name,
        bloodGroup: d.bloodGroup,
        age: d.age,
        gender: d.gender,
        weight: d.weight,
        smoker: d.smoker,
        alcoholic: d.alcoholic,
        illnesses: d.illnesses,
        donateBlood: d.donateBlood,
        donateOrgan: d.donateOrgan,
        organs: d.organs,
        eligibilityStatus: "verified",
        lat: d.loc.lat,
        lng: d.loc.lng,
        city: d.loc.city,
        pincode: d.loc.pincode,
      },
    });
    console.log(`✅ Created: ${d.name} (${d.bloodGroup}) - ${d.donateBlood ? "Blood" : ""}${d.donateOrgan ? " Organ" : ""}`);
    created++;
  }

  console.log(`\n🎉 Done! Created: ${created}, Skipped: ${skipped}`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("❌ Seed error:", err);
  process.exit(1);
});
