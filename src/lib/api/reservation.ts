import { publicApi } from "./client";
import { ApiResponse } from "@/types/api";

export interface RoomReservationRequest {
  room_size_desc: string;
  room_type_desc: string;
  start_date: string;
  end_date: string;
  usage_time_desc: string;
}

export interface GroupReservationInquiryData {
  event_type?: string;
  event_name?: string;
  seating_arrangement?: string;
  adult_attendees?: number;
  child_attendees?: number;
  dining_service_usage?: boolean;
  other_requests?: string;
  customer_group_name: string;
  customer_region?: string;
  contact_person_name: string;
  contact_person_dpt?: string;
  contact_person_phone: string;
  contact_person_email: string;
  privacy_agreed: boolean;
  marketing_agreed: boolean;
  room_reservations: RoomReservationRequest[];
}


export const reservationApi = {
  createGroupReservationInquiry: async (
    data: GroupReservationInquiryData
  ): Promise<ApiResponse<{ id: number }>> => {
    const response = await publicApi.post<ApiResponse<{ id: number }>>(
      "/group-reservation",
      data
    );
    return response.data;
  },
}; 