import { Box, Flex, Text, Image } from "@chakra-ui/react";
import React from "react";
import { statusOptions } from "./filterConstants"; // Assuming filterConstants is in the same directory

interface StatusFilterGroupProps {
  // selectedValues will now be an array of currently selected status values (e.g., ["waiting", "open"])
  selectedValues: string[];
  // onFilterChange will be called with the specific value clicked, or "ALL_CLICKED"
  onFilterChange: (value: string | "ALL_CLICKED") => void;
}

// Helper to get all actual selectable status values (excluding the "all" meta-option)
const ALL_STATUS_VALUES = statusOptions
  .filter((opt) => opt.value !== "all")
  .map((opt) => opt.value as string);

export const StatusFilterGroup: React.FC<StatusFilterGroupProps> = React.memo(
  ({ selectedValues, onFilterChange }) => {
    console.log("StatusFilterGroup: Rendering. Props:", {
      selectedValues,
      onFilterChange: typeof onFilterChange,
    });

    const isAllSelected =
      ALL_STATUS_VALUES.length > 0 &&
      selectedValues.length === ALL_STATUS_VALUES.length &&
      ALL_STATUS_VALUES.every((val) => selectedValues.includes(val));

    console.log(
      "StatusFilterGroup: Calculated isAllSelected:",
      isAllSelected,
      "Selected values:",
      selectedValues
    );

    return (
      <Box
        width="100%"
        minHeight="auto"
        padding="20px"
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        alignItems="flex-start"
        gap="10px"
        bg="#EFEFEF"
        borderRadius="10px"
      >
        <Flex align="center" gap="10px" width="80px" height="28px">
          <Box width="28px" height="28px" position="relative">
            <Box
              position="absolute"
              left="1.17px"
              top="4.93px"
              width="25.67px"
              height="18.15px"
            >
              <Image
                src="/images/swimming/icon2.png"
                alt="상태 아이콘"
                width={25.67}
                height={18.15}
              />
            </Box>
          </Box>
          <Text
            fontFamily="'Paperlogy', sans-serif"
            fontWeight="600"
            fontSize="21px"
            lineHeight="25px"
            display="flex"
            alignItems="center"
            letterSpacing="-0.05em"
            color="#373636"
            width="42px"
            height="28px"
          >
            상태
          </Text>
        </Flex>

        <Flex
          align="center"
          maxW="500px"
          minHeight="31px"
          gap="10px"
          justifyContent="flex-start"
          flexWrap="wrap"
        >
          {/* "Select All" Button for Status */}
          {statusOptions.find((opt) => opt.value === "all") && (
            <Flex
              key="status-all"
              justify="center"
              align="center"
              padding="5px 12px"
              minW="70px"
              width={
                statusOptions
                  .find((opt) => opt.value === "all")
                  ?.label.includes("전체")
                  ? "118px"
                  : "auto"
              } // Adjust width as needed
              height="31px"
              bg={isAllSelected ? "#2E3192" : "white"}
              borderRadius="20px"
              onClick={() => {
                console.log(
                  "StatusFilterGroup: 'Select All' button clicked. Current isAllSelected:",
                  isAllSelected,
                  "Calling onFilterChange('ALL_CLICKED')"
                );
                onFilterChange("ALL_CLICKED");
              }}
              cursor="pointer"
              border={isAllSelected ? "none" : "1px solid #ddd"}
            >
              <Text
                fontFamily="'Paperlogy', sans-serif"
                fontWeight="600"
                fontSize="15px"
                color={isAllSelected ? "white" : "#838383"}
                textAlign="center"
              >
                {statusOptions.find((opt) => opt.value === "all")?.label}
              </Text>
            </Flex>
          )}

          {/* Individual Status Options */}
          {statusOptions
            .filter((option) => option.value !== "all") // Exclude the "all" meta-option here
            .map((option) => {
              const isSelected = selectedValues.includes(
                option.value as string
              );
              return (
                <Flex
                  key={option.value}
                  justify="center"
                  align="center"
                  padding="5px 12px"
                  minWidth="70px"
                  width={`${option.label.length * 24}px`}
                  height="31px"
                  bg={isSelected ? "#2E3192" : "white"}
                  borderRadius="20px"
                  onClick={() => {
                    console.log(
                      `StatusFilterGroup: Option '${option.label}' (value: ${option.value}) clicked. Current isSelected: ${isSelected}. Calling onFilterChange.`
                    );
                    onFilterChange(option.value as string);
                  }}
                  cursor="pointer"
                  border={isSelected ? "none" : "1px solid #ddd"}
                >
                  <Text
                    fontFamily="'Paperlogy', sans-serif"
                    fontWeight="600"
                    fontSize="15px"
                    color={isSelected ? "white" : "#838383"}
                    textAlign="center"
                  >
                    {option.label}
                  </Text>
                </Flex>
              );
            })}
        </Flex>
      </Box>
    );
  }
);

StatusFilterGroup.displayName = "StatusFilterGroup";
