import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function toEmail(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/['']/g, "")
      .replace(/\s+/g, ".")
      .replace(/[^a-z.]/g, "") + "@sabullion.co.za"
  );
}

const staff = [
  "Abdul-Haadi Menacere",
  "Abdullah Aragoneses",
  "Abdullah Salie",
  "Angelique Render",
  "Aziz Dalmau",
  "Caitlin Dalwai",
  "Cameron Aberdeen",
  "Clint O'Brien",
  "Courtney O'Brien",
  "Danielle Nieuwenhuis",
  "Debra Thomson",
  "Faith Ntombomzi Nettie",
  "Francois Botma",
  "Grant Culhane",
  "Hanscaire Musangu",
  "Haroun Masoet",
  "Ifrah Salie",
  "Imran Obrien",
  "Isa Williams",
  "Isabella Rangasamy",
  "Jaan Bagus",
  "Jacinto Joao",
  "Janeen Raker",
  "Jaydene Wessels",
  "Justine Saayman",
  "Keegan Shaw",
  "Kulsum Salie",
  "Lea Langtry",
  "Mogamat Thakier Salie",
  "Nadia O'Brien",
  "Nande Tabata",
  "Nathan Cloete",
  "Noah Arendse",
  "Onika Sileku",
  "Raniya Hendricks",
  "Rashaad Carriem",
  "Rayhana Abass",
  "Sango Matyila",
  "Sinethemba Sibiya",
  "Selina Thompson",
  "Shahiema Arendse",
  "Shakeel Gafieldien",
  "Talieb Mohamed",
  "Zachary Sonday",
  "Zaid Salie",
  "Zakiyah Salie",
  "Zubayr Abdullatief",
];

async function main() {
  console.log("Seeding 47 staff members...");
  for (const fullName of staff) {
    const email = toEmail(fullName);
    await prisma.user.upsert({
      where: { email },
      update: {},
      create: { fullName, email },
    });
    console.log(`  ✓ ${fullName} <${email}>`);
  }
  console.log(`\nDone. ${staff.length} staff members seeded.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
