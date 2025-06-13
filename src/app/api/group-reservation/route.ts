import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/lib/db";
import { GroupReservationInquiryData } from "@/lib/api/reservation";

function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  return realIp || "IP_NOT_FOUND";
}

export async function POST(request: NextRequest) {
  const data: GroupReservationInquiryData = await request.json();
  const ip = getClientIp(request);

  let connection;
  try {
    connection = await getConnection();
    await connection.beginTransaction();

    const mainInquiryQuery = `
      INSERT INTO group_reservation_inquiries (
        status, event_type, event_name, seating_arrangement, adult_attendees, 
        child_attendees, dining_service_usage, other_requests, customer_group_name, 
        customer_region, contact_person_name, contact_person_dpt, contact_person_phone, 
        contact_person_email, privacy_agreed, marketing_agreed, 
        created_by, created_ip, created_date, updated_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'GUEST', ?, NOW(), NOW())
    `;

    const [mainResult] = await connection.execute(mainInquiryQuery, [
      'PENDING',
      data.event_type,
      data.event_name,
      data.seating_arrangement,
      data.adult_attendees,
      data.child_attendees,
      data.dining_service_usage,
      data.other_requests,
      data.customer_group_name,
      data.customer_region,
      data.contact_person_name,
      data.contact_person_dpt,
      data.contact_person_phone,
      data.contact_person_email,
      data.privacy_agreed,
      data.marketing_agreed,
      ip,
    ]);
    
    const inquiryId = (mainResult as any).insertId;

    if (!inquiryId) {
      throw new Error("Failed to create main inquiry record.");
    }

    if (data.room_reservations && data.room_reservations.length > 0) {
        const roomReservationsQuery = `
        INSERT INTO inquiry_room_reservations (
            inquiry_id, room_size_desc, room_type_desc, start_date, end_date, 
            usage_time_desc, created_by, created_ip, created_date, updated_date
        ) VALUES ?
        `;

        const roomValues = data.room_reservations.map(room => [
        inquiryId,
        room.room_size_desc,
        room.room_type_desc,
        room.start_date,
        room.end_date,
        room.usage_time_desc,
        'GUEST',
        ip,
        new Date(),
        new Date(),
        ]);

        await connection.query(roomReservationsQuery, [roomValues]);
    }

    await connection.commit();

    return NextResponse.json({ success: true, message: "문의가 성공적으로 등록되었습니다.", data: { id: inquiryId } }, { status: 201 });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Group reservation inquiry failed:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ success: false, message: "문의 등록에 실패했습니다.", error: errorMessage }, { status: 500 });
  } finally {
    if (connection) connection.release();
  }
} 