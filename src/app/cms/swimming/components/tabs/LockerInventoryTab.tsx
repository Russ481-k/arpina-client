"use client";

import React, { useState } from "react";
import {
  Box,
  Heading,
  Text,
  Button,
  Field,
  Fieldset,
  Input,
  Stack,
  SimpleGrid,
  Card,
  Badge,
  Flex,
  IconButton,
} from "@chakra-ui/react";
import { EditIcon, SaveIcon, XIcon } from "lucide-react";
import { useColors } from "@/styles/theme";

interface LockerInventoryData {
  gender: "MALE" | "FEMALE";
  totalQuantity: number;
  usedQuantity: number;
  availableQuantity: number;
}

export const LockerInventoryTab: React.FC = () => {
  const colors = useColors();

  // Mock data - 실제로는 API에서 가져와야 함
  const [lockerData, setLockerData] = useState<LockerInventoryData[]>([
    {
      gender: "MALE",
      totalQuantity: 100,
      usedQuantity: 65,
      availableQuantity: 35,
    },
    {
      gender: "FEMALE",
      totalQuantity: 80,
      usedQuantity: 45,
      availableQuantity: 35,
    },
  ]);

  const [editingGender, setEditingGender] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);

  const handleEdit = (gender: string, currentTotal: number) => {
    setEditingGender(gender);
    setEditValue(currentTotal);
  };

  const handleSave = (gender: string) => {
    setLockerData((prev) =>
      prev.map((item) =>
        item.gender === gender
          ? {
              ...item,
              totalQuantity: editValue,
              availableQuantity: editValue - item.usedQuantity,
            }
          : item
      )
    );
    setEditingGender(null);
    // TODO: API 호출하여 서버에 저장
  };

  const handleCancel = () => {
    setEditingGender(null);
    setEditValue(0);
  };

  return (
    <Box h="full" overflow="auto">
      <Stack gap={2}>
        {lockerData.map((data) => (
          <Card.Root key={data.gender} p={3} size="sm">
            <Card.Body p={0}>
              <Stack gap={1}>
                {/* 헤더 */}
                <Flex justify="space-between" align="center">
                  <Text
                    fontSize="sm"
                    fontWeight="bold"
                    color={colors.text.primary}
                  >
                    {data.gender === "MALE" ? "남성" : "여성"}
                  </Text>
                  <Badge
                    colorScheme={data.availableQuantity > 10 ? "green" : "red"}
                    variant="solid"
                    size="sm"
                  >
                    {data.availableQuantity > 10 ? "여유" : "부족"}
                  </Badge>
                </Flex>

                {/* 수량 정보 */}
                <Flex align="center" justify="space-between">
                  {/* 사용량/가능량 */}
                  <Flex gap={2} fontSize="xs">
                    <Flex gap={1}>
                      <Text color={colors.text.secondary}>사용:</Text>
                      <Text fontWeight="medium">{data.usedQuantity}</Text>
                    </Flex>
                    <Flex gap={1}>
                      <Text color={colors.text.secondary}>가능:</Text>
                      <Text fontWeight="medium">{data.availableQuantity}</Text>
                    </Flex>
                  </Flex>
                  <Flex gap={2} align="center" h="36px">
                    <Text
                      fontSize="xs"
                      color={colors.text.secondary}
                      minW="40px"
                    >
                      총수량
                    </Text>
                    {editingGender === data.gender ? (
                      <Flex gap={1} align="center">
                        <Input
                          size="2xs"
                          w="60px"
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(Number(e.target.value))}
                          min={data.usedQuantity}
                        />
                        <IconButton
                          size="2xs"
                          variant="solid"
                          colorScheme="blue"
                          onClick={() => handleSave(data.gender)}
                        >
                          <SaveIcon size={12} />
                        </IconButton>
                        <IconButton
                          size="2xs"
                          variant="ghost"
                          onClick={handleCancel}
                        >
                          <XIcon size={12} />
                        </IconButton>
                      </Flex>
                    ) : (
                      <Flex gap={1} align="center" flex="1">
                        <Text fontSize="xs" fontWeight="medium" flex="1">
                          {data.totalQuantity}
                        </Text>
                        <IconButton
                          size="xs"
                          variant="ghost"
                          onClick={() =>
                            handleEdit(data.gender, data.totalQuantity)
                          }
                        >
                          <EditIcon size={12} />
                        </IconButton>
                      </Flex>
                    )}
                  </Flex>
                </Flex>
                {/* 사용률 바 */}
                <Box>
                  <Flex justify="space-between" align="center" mb={1}>
                    <Text fontSize="xs" color={colors.text.secondary}>
                      사용률
                    </Text>
                    <Text fontSize="xs" fontWeight="medium">
                      {((data.usedQuantity / data.totalQuantity) * 100).toFixed(
                        1
                      )}
                      %
                    </Text>
                  </Flex>
                  <Box
                    w="full"
                    h="4px"
                    bg="gray.200"
                    borderRadius="full"
                    overflow="hidden"
                  >
                    <Box
                      w={`${(data.usedQuantity / data.totalQuantity) * 100}%`}
                      h="full"
                      bg={
                        data.usedQuantity / data.totalQuantity > 0.8
                          ? "red.500"
                          : "blue.500"
                      }
                      transition="width 0.3s"
                    />
                  </Box>
                </Box>
              </Stack>
            </Card.Body>
          </Card.Root>
        ))}
      </Stack>
    </Box>
  );
};
