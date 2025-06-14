import { publicApi } from "./client";
import { ApiResponse } from "@/types/api";

export interface RoomReservationRequest {
  roomSizeDesc: string;
  roomTypeDesc: string;
  startDate: string;
  endDate: string;
  usageTimeDesc: string;
}

export interface GroupReservationInquiryData {
  eventType?: string;
  eventName?: string;
  seatingArrangement?: string;
  adultAttendees?: number;
  childAttendees?: number;
  diningServiceUsage?: boolean;
  otherRequests?: string;
  customerGroupName: string;
  customerRegion?: string;
  contactPersonName: string;
  contactPersonDpt?: string;
  contactPersonPhone: string;
  contactPersonEmail: string;
  privacyAgreed: boolean;
  marketingAgreed: boolean;
  roomReservations: RoomReservationRequest[];
}


export const reservationApi = {
  createGroupReservationInquiry: async (
    data: GroupReservationInquiryData
  ): Promise<ApiResponse<{ id: number }>> => {
    const response = await publicApi.post<ApiResponse<{ id: number }>>(
      "/group-reservations",
      data
    );
    return response.data;
  },
}; 