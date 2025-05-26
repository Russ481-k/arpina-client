"use client";

import React from "react";
import { Box, Text, Button, SimpleGrid, Flex, Spinner } from "@chakra-ui/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/adminApi";
import { toaster } from "@/components/ui/toaster";
import {
  LockerCard,
  type LockerData as LockerCardDataType,
} from "./lockerInventory/LockerCard";

// Define local types that match the actual API response structure (camelCase)
// based on the provided runtime console log.
interface ActualLockerDto {
  gender: "MALE" | "FEMALE";
  totalQuantity: number;
  usedQuantity: number;
  availableQuantity?: number; // availableQuantity from log, make optional or ensure it's always there
}

interface FullApiResponse {
  data: ActualLockerDto[];
  success: boolean;
  message: string;
  errorCode?: string | null;
  stackTrace?: string | null;
}

// This is the structure we want to work with in the component (camelCase)
interface ProcessedLockerInventoryData {
  maleLockerTotalQuantity: number;
  maleLockerUsedQuantity: number;
  femaleLockerTotalQuantity: number;
  femaleLockerUsedQuantity: number;
}

const lockerInventoryQueryKeys = {
  all: ["adminLockerInventory"] as const,
};

export const LockerInventoryTab = () => {
  const queryClient = useQueryClient();

  const {
    data: processedInventoryData,
    isLoading: isLoadingInventory,
    error: inventoryError,
  } = useQuery<
    FullApiResponse, // Expect the full wrapper object from queryFn's actual runtime behavior
    Error,
    ProcessedLockerInventoryData // Transform to this camelCase structure
  >({
    queryKey: lockerInventoryQueryKeys.all,
    // adminApi.getLockerInventory() actually returns FullApiResponse at runtime.
    // This will likely cause a TypeScript error because adminApi.getLockerInventory is
    // typed to return Promise<ApiLockerInventoryDto[]> (snake_case array).
    queryFn: () => adminApi.getLockerInventory() as unknown as FullApiResponse,
    select: (response: FullApiResponse): ProcessedLockerInventoryData => {
      // response is the full object: {success: true, data: Array(2), ...}
      // The DTOs within response.data are camelCase as per runtime log.
      const lockerDtoArray = response.data || []; // Ensure data is an array

      const maleData = lockerDtoArray.find(
        (item) => item.gender === "MALE"
      ) || {
        gender: "MALE",
        totalQuantity: 0,
        usedQuantity: 0,
      };
      const femaleData = lockerDtoArray.find(
        (item) => item.gender === "FEMALE"
      ) || {
        gender: "FEMALE",
        totalQuantity: 0,
        usedQuantity: 0,
      };
      return {
        maleLockerTotalQuantity: maleData.totalQuantity,
        maleLockerUsedQuantity: maleData.usedQuantity,
        femaleLockerTotalQuantity: femaleData.totalQuantity,
        femaleLockerUsedQuantity: femaleData.usedQuantity,
      };
    },
  });

  const updateLockerMutation = useMutation<
    ActualLockerDto, // Mock API and actual API (if consistent) would return camelCase DTO
    Error,
    { gender: "MALE" | "FEMALE"; totalQuantity: number }
  >({
    mutationFn: async (updateDto: {
      gender: "MALE" | "FEMALE";
      totalQuantity: number;
    }): Promise<ActualLockerDto> => {
      console.warn(
        "Mocking API call to PUT /cms/lockers/inventory/{gender}",
        updateDto
      );
      await new Promise((resolve) => setTimeout(resolve, 500));

      // For mock, try to get current used quantity if query data exists
      const currentApiResponse = queryClient.getQueryData<FullApiResponse>(
        lockerInventoryQueryKeys.all
      );
      const currentInventoryForGender = currentApiResponse?.data?.find(
        (inv) => inv.gender === updateDto.gender
      );
      const usedQuantity = currentInventoryForGender?.usedQuantity ?? 0;

      const mockResponse: ActualLockerDto = {
        gender: updateDto.gender,
        totalQuantity: updateDto.totalQuantity,
        usedQuantity: usedQuantity,
        availableQuantity: updateDto.totalQuantity - usedQuantity,
      };
      return mockResponse;
    },
    onSuccess: (updatedItem, variables) => {
      queryClient.invalidateQueries({ queryKey: lockerInventoryQueryKeys.all });
      toaster.success({
        title: `사물함 수량이 업데이트되었습니다. (${variables.gender})`,
      });
    },
    onError: (error, variables) => {
      toaster.error({
        title: "업데이트 실패",
        description:
          error.message ||
          `사물함(${variables.gender}) 수량 업데이트 중 오류가 발생했습니다.`,
      });
    },
  });

  const handleSaveLockerQuantity = (
    gender: "MALE" | "FEMALE",
    newTotalQuantity: number
  ) => {
    if (processedInventoryData) {
      const currentUsed =
        gender === "MALE"
          ? processedInventoryData.maleLockerUsedQuantity
          : processedInventoryData.femaleLockerUsedQuantity;
      if (newTotalQuantity < currentUsed) {
        toaster.warning({
          title: "수량 오류",
          description: "총 수량은 사용 중인 수량보다 적을 수 없습니다.",
        });
        return;
      }
    }
    updateLockerMutation.mutate({ gender, totalQuantity: newTotalQuantity });
  };

  const maleLockerData: LockerCardDataType | null = processedInventoryData
    ? {
        gender: "MALE",
        totalQuantity: processedInventoryData.maleLockerTotalQuantity,
        usedQuantity: processedInventoryData.maleLockerUsedQuantity,
        availableQuantity:
          processedInventoryData.maleLockerTotalQuantity -
          processedInventoryData.maleLockerUsedQuantity,
      }
    : null;

  const femaleLockerData: LockerCardDataType | null = processedInventoryData
    ? {
        gender: "FEMALE",
        totalQuantity: processedInventoryData.femaleLockerTotalQuantity,
        usedQuantity: processedInventoryData.femaleLockerUsedQuantity,
        availableQuantity:
          processedInventoryData.femaleLockerTotalQuantity -
          processedInventoryData.femaleLockerUsedQuantity,
      }
    : null;

  if (isLoadingInventory) {
    return (
      <Flex justify="center" align="center" h="200px">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (
    inventoryError ||
    !processedInventoryData ||
    !maleLockerData ||
    !femaleLockerData
  ) {
    return (
      <Box p={4} textAlign="center">
        <Text color="red.500">
          사물함 재고 정보를 불러오는데 실패했습니다: {inventoryError?.message}
        </Text>
        <Button
          mt={4}
          onClick={() =>
            queryClient.invalidateQueries({
              queryKey: lockerInventoryQueryKeys.all,
            })
          }
        >
          다시 시도
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {updateLockerMutation.isPending && (
        <Flex justify="center" my={2}>
          <Spinner size="sm" />
          <Text ml={2} fontSize="sm">
            수량 업데이트 중...
          </Text>
        </Flex>
      )}

      <SimpleGrid columns={{ base: 1 }} gap={2}>
        <LockerCard data={maleLockerData} onSave={handleSaveLockerQuantity} />
        <LockerCard data={femaleLockerData} onSave={handleSaveLockerQuantity} />
      </SimpleGrid>
    </Box>
  );
};
