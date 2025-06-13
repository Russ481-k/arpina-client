import { useState, useCallback } from "react";
import { GroupReservationInquiryData, RoomReservationRequest } from "@/lib/api/reservation";
import { toaster } from "@/components/ui/toaster";
import { reservationApi } from "@/lib/api/reservation";

const initialRoomRequest: RoomReservationRequest = {
  room_size_desc: "",
  room_type_desc: "",
  start_date: "",
  end_date: "",
  usage_time_desc: "",
};

const initialFormData: GroupReservationInquiryData = {
  event_type: "",
  event_name: "",
  seating_arrangement: "강의식",
  adult_attendees: 0,
  child_attendees: 0,
  dining_service_usage: false,
  other_requests: "",
  customer_group_name: "",
  customer_region: "",
  contact_person_name: "",
  contact_person_dpt: "",
  contact_person_phone: "",
  contact_person_email: "",
  privacy_agreed: false,
  marketing_agreed: false,
  room_reservations: [initialRoomRequest],
};

export function useGroupReservationForm() {
  const [formData, setFormData] = useState<GroupReservationInquiryData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);

  const updateField = useCallback(<K extends keyof GroupReservationInquiryData>(field: K, value: GroupReservationInquiryData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const updateRoomField = useCallback((index: number, field: keyof RoomReservationRequest, value: string) => {
    setFormData((prev) => {
      const newRooms = [...prev.room_reservations];
      newRooms[index] = { ...newRooms[index], [field]: value };
      return { ...prev, room_reservations: newRooms };
    });
  }, []);

  const addRoomRequest = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      room_reservations: [...prev.room_reservations, initialRoomRequest],
    }));
  }, []);

  const removeRoomRequest = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      room_reservations: prev.room_reservations.filter((_, i) => i !== index),
    }));
  }, []);

  const handleSubmit = async () => {
    if (!formData.privacy_agreed) {
        toaster.error({ title: "오류", description: "개인정보 수집 및 이용 동의는 필수입니다." });
        return;
    }
    // Add other validations as needed...

    setIsLoading(true);
    try {
      const response = await reservationApi.createGroupReservationInquiry(formData);
      if (response.success) {
        toaster.success({ title: "성공", description: "단체 예약 문의가 성공적으로 접수되었습니다." });
        setFormData(initialFormData); // Reset form
      } else {
        toaster.error({ title: "오류", description: response.message || "문의 등록에 실패했습니다." });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
      toaster.error({ title: "오류", description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    isLoading,
    updateField,
    updateRoomField,
    addRoomRequest,
    removeRoomRequest,
    handleSubmit,
  };
} 