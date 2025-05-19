import { publicApi } from "./client"; // Assuming this is the correct path to your API client

export interface NiceInitiateResponse {
  encodeData: string;
  reqSeq: string;
  // Add any other fields your backend might return for this initiation call
}

// DTO for successful NICE verification data relevant for public/signup purposes
export interface NicePublicUserDataDto {
  name: string; // Or utf8Name, ensure it matches backend response
  birthDate: string; // e.g., YYYYMMDD
  gender: string; // e.g., "1" for male, "0" for female
  mobileNo: string; // Phone number
  ci?: string; // Optional: Client Identifier
  di?: string; // Optional: Duplicate Information
  // Add any other fields the backend provides for pre-filling signup
}

// DTO for structured error details from NICE or backend processing
export interface NiceErrorDataDto {
  errorCode?: string; // NICE specific error code or backend error code
  errorMessage?: string;
  // any other structured error details
}

export const niceApi = {
  /**
   * Initiates the NICE self-identification process.
   * Calls the backend to get encrypted data for the NICE popup.
   */
  initiateVerification: async (): Promise<NiceInitiateResponse> => {
    // The endpoint for initiating NICE verification, as per your Spring Boot guide
    const endpoint = "/nice/checkplus/initiate";

    // This API call does not send a body, as the backend generates necessary info.
    // The generic type for publicApi.post is <ResponseType, RequestBodyType>
    // Since there's no request body, we can use 'unknown' or 'void' if preferred,
    // but typically the second generic is for the data payload.
    // An empty object {} is fine for a POST with no specific body if the backend expects an empty JSON object.
    // If the backend expects no body at all, this might need adjustment based on how publicApi.post handles undefined 'data'.
    const response = await publicApi.post<NiceInitiateResponse, {}>(
      endpoint,
      {}
    );
    return response; // publicApi methods already return response.data
  },

  /**
   * Fetches the result of the NICE self-identification process.
   * @param key The key received from the NICE callback.
   */
  getNiceAuthResult: async (key: string): Promise<any> => {
    // You might want to define a specific type for the auth result
    // Endpoint updated as per the new specification.
    // The actual API prefix like `/api/v1` might vary based on backend routing rules.
    // The new spec explicitly mentions /api/v1/nice/checkplus/result/{key}
    const endpoint = `/nice/checkplus/result/${key}`;
    const response = await publicApi.get<any>(endpoint);
    return response; // publicApi methods already return response.data
  },
};
