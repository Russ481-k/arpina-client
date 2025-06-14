import { useState, useCallback } from "react";
import { GroupReservationInquiryData, RoomReservationRequest } from "@/lib/api/reservation";
import { toaster } from "@/components/ui/toaster";
import { reservationApi } from "@/lib/api/reservation";
import {
  validateEmail,
  validatePhoneNumber,
} from "@/lib/utils/validationUtils";
import {
  formatPhoneNumberWithHyphen,
  isValidKoreanPhoneNumber,
} from "@/lib/utils/phoneUtils";

export type RoomValidationErrors = {
  [K in keyof RoomReservationRequest]?: string;
};

type ValidationErrors = {
  [K in keyof Omit<GroupReservationInquiryData, "roomReservations">]?: string;
} & {
  roomReservations?: string | RoomValidationErrors[];
};

type TouchedFields = {
  [K in keyof Omit<
    GroupReservationInquiryData,
    "roomReservations"
  >]?: boolean;
} & {
  roomReservations?: { [index: number]: { [K in keyof RoomReservationRequest]?: boolean } };
};

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const today = new Date();
const sevenDaysLater = new Date();
sevenDaysLater.setDate(today.getDate() + 7);

const initialRoomRequest: RoomReservationRequest = {
  roomSizeDesc: "",
  roomTypeDesc: "",
  startDate: formatDate(today),
  endDate: formatDate(sevenDaysLater),
  usageTimeDesc: "",
};

const initialFormData: GroupReservationInquiryData = {
  eventType: "",
  eventName: "",
  seatingArrangement: "강의식",
  adultAttendees: 0,
  childAttendees: 0,
  diningServiceUsage: false,
  otherRequests: "",
  customerGroupName: "",
  customerRegion: "",
  contactPersonName: "",
  contactPersonDpt: "",
  contactPersonPhone: "",
  contactPersonEmail: "",
  privacyAgreed: false,
  marketingAgreed: false,
  roomReservations: [initialRoomRequest],
};

const validateRoom = (room: RoomReservationRequest): RoomValidationErrors => {
  const newRoomErrors: RoomValidationErrors = {};
  if (!room.roomSizeDesc) newRoomErrors.roomSizeDesc = "필수";
  if (!room.roomTypeDesc) newRoomErrors.roomTypeDesc = "필수";
  if (!room.usageTimeDesc) newRoomErrors.usageTimeDesc = "필수";
  return newRoomErrors;
};

export function useGroupReservationForm() {
  const [formData, setFormData] = useState<GroupReservationInquiryData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<TouchedFields>({});

  const updateField = useCallback(
    <K extends keyof GroupReservationInquiryData>(
      field: K,
      value: GroupReservationInquiryData[K]
    ) => {
      if (field === "contactPersonPhone" && typeof value === "string") {
        const cleaned = value.replace(/\D/g, "");
        if (cleaned.length > 11) {
          return;
        }
        const formattedPhone = formatPhoneNumberWithHyphen(cleaned);
        setFormData((prev) => ({ ...prev, [field]: formattedPhone }));
      } else {
        setFormData((prev) => ({ ...prev, [field]: value }));
      }
      if (errors[field as keyof ValidationErrors]) {
        setErrors((prev) => ({ ...prev, [field as keyof ValidationErrors]: undefined }));
      }
    },
    [errors]
  );

  const updateRoomField = useCallback(
    (index: number, field: keyof RoomReservationRequest, value: any) => {
      setFormData((prevFormData) => {
        const newFormData = { ...prevFormData };
        const newRooms = [...newFormData.roomReservations];
        const originalRoom = newRooms[index];
        const updatedRoom = { ...originalRoom, [field]: value };

        if (
          field === "roomSizeDesc" &&
          value !== originalRoom.roomSizeDesc
        ) {
          updatedRoom.roomTypeDesc = "";
        }

        newRooms[index] = updatedRoom;
        newFormData.roomReservations = newRooms;

        const newRoomErrors = validateRoom(updatedRoom);
        setErrors((prevErrors) => {
          const newErrorsState = { ...prevErrors };
          const currentRoomErrors = Array.isArray(prevErrors.roomReservations)
            ? [...prevErrors.roomReservations]
            : [];
          currentRoomErrors[index] = newRoomErrors;
          newErrorsState.roomReservations = currentRoomErrors;
          return newErrorsState;
        });

        return newFormData;
      });

      setTouched((prev) => ({
        ...prev,
        roomReservations: {
          ...prev.roomReservations,
          [index]: {
            ...prev.roomReservations?.[index],
            [field]: true,
          },
        },
      }));
    },
    [] 
  );

  const updateAndValidate = useCallback(
    (field: keyof GroupReservationInquiryData, value: any) => {
      setFormData((prevData) => {
        const newData = { ...prevData, [field]: value };

        setErrors((prevErrors) => {
          const newErrors = { ...prevErrors };
          switch (field) {
            case "eventType":
              if (!value) newErrors.eventType = "행사구분을 선택해주세요.";
              else delete newErrors.eventType;
              break;
            case "seatingArrangement":
              if (!value)
                newErrors.seatingArrangement = "좌석배치방식을 선택해주세요.";
              else delete newErrors.seatingArrangement;
              break;
          }
          return newErrors;
        });

        return newData;
      });

      setTouched((prev) => ({ ...prev, [field]: true }));
    },
    []
  );

  const addRoomRequest = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      roomReservations: [...prev.roomReservations, initialRoomRequest],
    }));
    setErrors((prev) => {
      const newErrors = { ...prev };
      if (Array.isArray(newErrors.roomReservations)) {
        newErrors.roomReservations = [...newErrors.roomReservations, {}];
      }
      return newErrors;
    });
  }, []);

  const removeRoomRequest = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      roomReservations: prev.roomReservations.filter((_, i) => i !== index),
    }));
  }, []);

  const validateForm = (
    fieldName?: keyof GroupReservationInquiryData,
    roomIndex?: number,
    roomFieldName?: keyof RoomReservationRequest
  ) => {
    const newErrors: ValidationErrors = JSON.parse(JSON.stringify(errors));

    const validateField = (name: keyof GroupReservationInquiryData) => {
      switch (name) {
        case "eventType":
          if (!formData.eventType) newErrors.eventType = "행사구분을 선택해주세요.";
          else delete newErrors.eventType;
          break;
        case "eventName":
          if (!formData.eventName?.trim()) newErrors.eventName = "행사명을 입력해주세요.";
          else delete newErrors.eventName;
          break;
        case "seatingArrangement":
          if (!formData.seatingArrangement) newErrors.seatingArrangement = "좌석배치방식을 선택해주세요.";
          else delete newErrors.seatingArrangement;
          break;
        case "adultAttendees":
          if (formData.adultAttendees === undefined || formData.adultAttendees <= 0) newErrors.adultAttendees = "성인 참석자는 1명 이상이어야 합니다.";
          else delete newErrors.adultAttendees;
          break;
        case "customerGroupName":
          if (!formData.customerGroupName?.trim()) newErrors.customerGroupName = "단체명을 입력해주세요.";
          else delete newErrors.customerGroupName;
          break;
        case "contactPersonName":
          if (!formData.contactPersonName?.trim()) newErrors.contactPersonName = "담당자명을 입력해주세요.";
          else delete newErrors.contactPersonName;
          break;
        case "contactPersonPhone":
          if (!formData.contactPersonPhone?.trim()) newErrors.contactPersonPhone = "담당자 연락처를 입력해주세요.";
          else if (!isValidKoreanPhoneNumber(formData.contactPersonPhone)) newErrors.contactPersonPhone = "올바른 형식의 연락처를 입력해주세요. (예: 010-1234-5678)";
          else delete newErrors.contactPersonPhone;
          break;
        case "contactPersonEmail":
          {
            const emailError = validateEmail(formData.contactPersonEmail);
            if (emailError) {
              newErrors.contactPersonEmail = emailError;
            } else {
              delete newErrors.contactPersonEmail;
            }
          }
          break;
        case "privacyAgreed":
          if (!formData.privacyAgreed) newErrors.privacyAgreed = "개인정보 수집 및 이용 동의는 필수입니다.";
          else delete newErrors.privacyAgreed;
          break;
        default:
          break;
      }
    };

    const validateRoomField = (index: number, name: keyof RoomReservationRequest) => {
      if (!newErrors.roomReservations || !Array.isArray(newErrors.roomReservations)) {
        newErrors.roomReservations = [];
      }
      const roomErrors = (newErrors.roomReservations as RoomValidationErrors[])[index] || {};
      
      const room = formData.roomReservations[index];
      if (!room[name]) {
        switch (name) {
          case "roomSizeDesc": roomErrors.roomSizeDesc = "필수"; break;
          case "roomTypeDesc": roomErrors.roomTypeDesc = "필수"; break;
          case "usageTimeDesc": roomErrors.usageTimeDesc = "필수"; break;
        }
      } else {
        delete roomErrors[name];
      }
      (newErrors.roomReservations as RoomValidationErrors[])[index] = roomErrors;
    };
    
    if (fieldName) {
      validateField(fieldName);
    } else if (roomIndex !== undefined && roomFieldName) {
      validateRoomField(roomIndex, roomFieldName);
    } else {
      (Object.keys(formData) as Array<keyof GroupReservationInquiryData>).forEach(validateField);

      if (formData.roomReservations.length === 0) {
        newErrors.roomReservations = "세미나실을 최소 하나 이상 추가해주세요.";
      } else {
        delete newErrors.roomReservations;
        const roomErrorsList: RoomValidationErrors[] = [];
        formData.roomReservations.forEach((room, index) => {
          const roomErrors = validateRoom(room);
          roomErrorsList[index] = roomErrors;
        });
        if (roomErrorsList.some(errors => Object.keys(errors).length > 0)) {
            newErrors.roomReservations = roomErrorsList;
        }
      }
    }
    
    console.log("Validation Errors:", newErrors);
    setErrors(newErrors);
    
    let hasErrors = Object.values(newErrors).some(error => error !== undefined);
    if (Array.isArray(newErrors.roomReservations)) {
      const roomErrorsExist = newErrors.roomReservations.some(roomError => Object.keys(roomError).length > 0);
      hasErrors = hasErrors || roomErrorsExist;
    }
    
    return !hasErrors;
  };

  const handleBlur = (fieldName: keyof GroupReservationInquiryData) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
    validateForm(fieldName);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    console.log("Submitting formData:", formData);

    if (!validateForm()) {
      toaster.error({
        title: "입력 오류",
        description: "입력 내용을 다시 확인해주세요.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response =
        await reservationApi.createGroupReservationInquiry(formData);
      if (response.success) {
        toaster.success({
          title: "성공",
          description: "단체 예약 문의가 성공적으로 접수되었습니다.",
        });
        setFormData(initialFormData); 
        setErrors({}); 
        setTouched({}); 
      } else {
        toaster.error({
          title: "오류",
          description: response.message || "문의 등록에 실패했습니다.",
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "알 수 없는 오류가 발생했습니다.";
      toaster.error({ title: "오류", description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    isLoading,
    errors,
    touched,
    updateField,
    updateRoomField,
    updateAndValidate,
    addRoomRequest,
    removeRoomRequest,
    handleSubmit,
    handleBlur,
  };
} 