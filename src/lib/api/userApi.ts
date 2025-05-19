import { publicApi } from "./client";

// Define a type for the signup payload
// This should match what the backend expects
export interface UserSignupPayload {
  username: string;
  password?: string; // Optional if using social login or if password set later
  name: string;
  birthDate: string; // YYYYMMDD
  gender: string; // "0" for female, "1" for male (adjust if different)
  phone: string; // Changed from phoneNumber
  email?: string;
  carNo?: string; // Changed from carNumber
  address: string; // Added for combined address
  // postcode?: string; // Removed
  // address_main?: string; // Removed
  // address_detail?: string; // Removed
  // marketingConsent?: boolean;
  // privacyConsent?: boolean;
  // termsConsent?: boolean;
  niceResultKey: string; // Changed from niceAuthKey
}

// Define a type for the signup response (if specific structure is expected)
export interface UserSignupResponse {
  // Define based on actual API response for signup
  // Example:
  userId: string;
  message: string;
  success: boolean;
}

export interface CheckUsernameResponseData {
  available: boolean;
  message?: string;
}

export interface CheckUsernameResponse {
  success: boolean;
  message?: string;
  data?: CheckUsernameResponseData;
  errorCode?: string | null;
  stackTrace?: string | null;
}

const USER_API_BASE_URL = "/auth"; // Or your actual user API base path

export const userApi = {
  /**
   * Registers a new user.
   * @param payload The user signup data.
   */
  signup: async (payload: UserSignupPayload): Promise<UserSignupResponse> => {
    const response = await publicApi.post<UserSignupResponse>(
      `${USER_API_BASE_URL}/signup`,
      payload
    );
    return response.data;
  },

  checkUsername: async (username: string): Promise<CheckUsernameResponse> => {
    const response = await publicApi.get<CheckUsernameResponse>(
      `${USER_API_BASE_URL}/check-username/${encodeURIComponent(username)}`
    );
    return response.data;
  },

  // TODO: Add other user-related API functions here if needed
  // For example:
  // login: async (credentials: LoginCredentials) => { ... },
  // getUserProfile: async () => { ... },
  // updateUserProfile: async (profileData: UserProfileUpdatePayload) => { ... },

  // Example of another user-related API call (can be expanded)
  // checkUsername: async (username: string): Promise<{ isAvailable: boolean }> => {
  //   const response = await publicApi.get(`/users/check-username/${username}`);
  //   return response.data;
  // },
};

// Note: If your `publicApi.post` (or other methods from client.ts)
// already unwraps the response to `response.data`, then the return type
// of `signup` function can directly be `UserSignupResponse` if `UserSignupResponse`
// matches the structure of `response.data`.
// If `publicApi.post` returns the full AxiosResponse, then you'd do `return response.data;`
// and adjust the Promise return type accordingly if UserSignupResponse is meant to be the data part.
// Assuming the current `publicApi` setup returns the data directly as established in `niceApi.ts`.
