import { sql } from '@vercel/postgres';
export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const time = searchParams.get("time") || "morning";
  const date = searchParams.get("date");

  console.log("Received time shift from frontend:", time);
  console.log("Received date from frontend:", date);

  try {
    const query = `
      SELECT token_number
      FROM appointments
      WHERE appointment_time = $1 AND appointment_date = $2
    `;
    const values = [time, date];

    const { rows } = await sql.query(query, values);

    console.log("Query result:", rows);

    if (rows && rows.length > 0) {
      const tokens = rows.map((row) => row.token_number);
      return new Response(
        JSON.stringify({ bookedTokens: tokens }),
        { status: 200 }
      );
    } else {
      return new Response(
        JSON.stringify({ bookedTokens: [] }),
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error fetching tokens:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch tokens." }),
      { status: 500 }
    );
  }
}
