"use client";

import React, { useMemo, useState } from "react";
import { Box, VStack, Text, Flex, Badge, Button } from "@chakra-ui/react";
import { useColors } from "@/styles/theme";
import { useColorModeValue } from "@/components/ui/color-mode";
import { Enterprise } from "../types";
import { LuBuilding2, LuTrash2 } from "react-icons/lu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface EnterpriseListProps {
  enterprises: Enterprise[];
  onAddEnterprise: () => void;
  onEditEnterprise: (enterprise: Enterprise) => void;
  onDeleteEnterprise: (enterpriseId: string) => void;
  isLoading: boolean;
  selectedEnterpriseMenuId?: string;
  loadingEnterpriseId: string | null;
}

const EnterpriseList = React.memo(function EnterpriseList({
  enterprises,
  onAddEnterprise,
  onEditEnterprise,
  onDeleteEnterprise,
  isLoading,
  selectedEnterpriseMenuId,
  loadingEnterpriseId,
}: EnterpriseListProps) {
  const colors = useColors();
  const hoverBg = useColorModeValue(colors.bg, colors.darkBg);
  const selectedBorderColor = colors.primary.default;
  const textColor = colors.text.primary;
  const secondaryTextColor = colors.text.secondary;

  // Deletion confirmation dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [enterpriseToDelete, setEnterpriseToDelete] = useState<string | null>(
    null
  );

  const handleDelete = () => {
    if (enterpriseToDelete) {
      // Close the dialog first to prevent double confirmation
      setIsDeleteDialogOpen(false);
      // Then trigger the delete operation
      onDeleteEnterprise(enterpriseToDelete);
      setEnterpriseToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setEnterpriseToDelete(null);
  };

  // Group enterprises by year
  const enterprisesByYear = useMemo(() => {
    const grouped = enterprises.reduce((acc, enterprise) => {
      const year = enterprise.year;
      if (!acc[year]) {
        acc[year] = [];
      }
      acc[year].push(enterprise);
      return acc;
    }, {} as Record<number, Enterprise[]>);

    // Sort years in descending order
    return Object.entries(grouped)
      .sort(([yearA], [yearB]) => Number(yearB) - Number(yearA))
      .reduce((acc, [year, enterprises]) => {
        acc[year] = enterprises;
        return acc;
      }, {} as Record<string, Enterprise[]>);
  }, [enterprises]);

  const [expandedYears, setExpandedYears] = React.useState<
    Record<string, boolean>
  >({
    [new Date().getFullYear().toString()]: true,
  });

  const toggleYear = (year: string) => {
    setExpandedYears((prev) => ({
      ...prev,
      [year]: !prev[year],
    }));
  };

  if (isLoading) {
    return (
      <Box p={4} textAlign="center">
        <Box
          width="40px"
          height="40px"
          border="4px solid"
          borderColor="blue.500"
          borderTopColor="transparent"
          borderRadius="full"
          animation="spin 1s linear infinite"
        />
      </Box>
    );
  }

  return (
    <>
      <VStack gap={1} align="stretch">
        {Object.keys(enterprisesByYear).length === 0 ? (
          <Text color={secondaryTextColor} textAlign="center" py={4}>
            등록된 기업이 없습니다.
          </Text>
        ) : (
          Object.entries(enterprisesByYear).map(([year, yearEnterprises]) => (
            <Box key={year}>
              <Flex
                key={year}
                h="50px"
                alignItems="center"
                p={2}
                cursor="pointer"
                onClick={() => toggleYear(year)}
                borderRadius="md"
                justifyContent="space-between"
                pl={2}
                py={1.5}
                px={2}
                bg={expandedYears[year] ? colors.bg : "transparent"}
                borderLeft={expandedYears[year] ? "3px solid" : "none"}
                borderColor={
                  expandedYears[year] ? selectedBorderColor : "transparent"
                }
                _hover={{
                  bg: hoverBg,
                  transform: "translateX(2px)",
                  boxShadow: "sm",
                  backdropFilter: "blur(4px)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "& .enterprise-icon": {
                    opacity: 1,
                    transform: "scale(1.1)",
                  },
                }}
                transition="all 0.2s ease-out"
                position="relative"
                role="group"
                mb={1}
                mr={1}
              >
                <Flex alignItems="center">
                  <Text fontWeight="bold" color={textColor}>
                    {year}년
                  </Text>
                  <Badge ml={2} colorScheme="blue" fontSize="xs">
                    {yearEnterprises.length}개
                  </Badge>
                </Flex>
              </Flex>
              {expandedYears[year] && (
                <VStack gap={1} align="stretch" pl={6}>
                  {yearEnterprises.map((enterprise) => (
                    <Flex
                      key={enterprise.id}
                      pl={2}
                      py={1.5}
                      px={2}
                      alignItems="center"
                      cursor="pointer"
                      bg={
                        selectedEnterpriseMenuId === enterprise.id
                          ? colors.bg
                          : "transparent"
                      }
                      borderLeft={
                        selectedEnterpriseMenuId === enterprise.id
                          ? "3px solid"
                          : "none"
                      }
                      borderColor={
                        selectedEnterpriseMenuId === enterprise.id
                          ? selectedBorderColor
                          : "transparent"
                      }
                      _hover={{
                        bg: hoverBg,
                        transform: "translateX(2px)",
                        boxShadow: "sm",
                        backdropFilter: "blur(4px)",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        "& .enterprise-icon": {
                          opacity: 1,
                          transform: "scale(1.1)",
                        },
                      }}
                      transition="all 0.2s ease-out"
                      borderRadius="md"
                      position="relative"
                      role="group"
                      mb={1}
                      mr={1}
                      onClick={() => onEditEnterprise(enterprise)}
                    >
                      <Box
                        width="24px"
                        mr={2}
                        textAlign="center"
                        className="enterprise-icon"
                        style={{ cursor: "pointer" }}
                      >
                        <Flex
                          width="24px"
                          height="24px"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <LuBuilding2
                            size={18}
                            style={{
                              color: colors.primary.default,
                              opacity: 0.7,
                            }}
                          />
                        </Flex>
                      </Box>
                      <Flex
                        flex="1"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Text fontWeight="medium" color={textColor}>
                          {enterprise.name}
                        </Text>
                        <Flex gap={2} alignItems="center">
                          {enterprise.businessType && (
                            <Badge colorScheme="blue" fontSize="xs">
                              {enterprise.businessType}
                            </Badge>
                          )}

                          <Button
                            size="xs"
                            colorScheme="red"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEnterpriseToDelete(enterprise.id);
                              setIsDeleteDialogOpen(true);
                            }}
                            loading={loadingEnterpriseId === enterprise.id}
                          >
                            <LuTrash2 size={14} />
                          </Button>
                        </Flex>
                      </Flex>
                    </Flex>
                  ))}
                </VStack>
              )}
            </Box>
          ))
        )}
      </VStack>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDelete}
        title="기업 삭제"
        description="정말로 이 기업을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        confirmText="삭제"
        cancelText="취소"
        backdrop="rgba(0, 0, 0, 0.5)"
      />
    </>
  );
});

export { EnterpriseList };
