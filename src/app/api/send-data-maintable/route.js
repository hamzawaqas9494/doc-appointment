import { sql } from "@vercel/postgres";
export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const formData = await request.formData();

    const appointmentDate = formData.get("appointment_date");
    const appointmentTime = formData.get("appointment_time");
    const tokenNumber = formData.get("token_number");
    const patientName = formData.get("patient_name");
    const patientAge = formData.get("patient_age");
    const patientGender = formData.get("patient_gender");
    console.log(appointmentDate,"appointmentDate")

    // Insert the new appointment directly into the database, even if fields are missing
    await sql.query(
      `
      INSERT INTO appointments (
        appointment_date, 
        appointment_time, 
        token_number, 
        patient_name, 
        patient_age, 
        patient_gender
      ) VALUES ($1, $2, $3, $4, $5, $6)
    `,
      [appointmentDate, appointmentTime, tokenNumber, patientName, patientAge, patientGender]
    );

    return new Response(
      JSON.stringify({ message: "Data sent successfully." }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error booking appointment:", error);
    return new Response(
      JSON.stringify({ error: "Failed to send the data." }),
      { status: 500 }
    );
  }
}

// If you want to handle GET request to show a message when the route is accessed directly
export async function GET() {
  return new Response(
    JSON.stringify({ message: "Please send a POST request with the necessary data." }),
    { status: 200 }
  );
}
