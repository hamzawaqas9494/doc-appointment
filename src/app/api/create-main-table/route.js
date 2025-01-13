import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function appointmentsTable() {
  try {
    // await sql.query(`
    //   DROP TABLE IF EXISTS appointments;
    // `);
    // Create the appointments table if it doesn't exist
    await sql.query(`
      CREATE TABLE IF NOT EXISTS appointments (
       
        appointment_date DATE NOT NULL,
        appointment_time VARCHAR(50) NOT NULL,
        token_number INTEGER NOT NULL,
        patient_name VARCHAR(255) NOT NULL,
        patient_age INTEGER NOT NULL,
        patient_gender VARCHAR(50) NOT NULL
      );
    `);
    console.log("Table 'appointments' created or already exists.");
  } catch (error) {
    console.error("Error creating appointments table:", error);
  }
}

export async function GET(request) {
  try {
    // Ensure the appointments table is created
    await appointmentsTable();

    // Fetch table column information
    const columns = await sql.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'appointments';
    `);

    return NextResponse.json(
      {
        message: "Fetched table columns successfully",
        columns: columns.rows,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching table columns:", error);
    return NextResponse.json(
      {
        error: `Failed to fetch table columns: ${error.message}`,
      },
      { status: 500 }
    );
  }
}
