import React from "react";
import {
  Flex,
  HStack,
  Button,
  IconButton,
  Text,
  Select as ChakraSelect,
  Box,
  Portal,
  createListCollection,
} from "@chakra-ui/react";
import { useColorMode } from "@/components/ui/color-mode";
import {
  LuChevronLeft,
  LuChevronRight,
  LuChevronsLeft,
  LuChevronsRight,
} from "react-icons/lu";

interface CustomPaginationProps {
  currentPage: number; // 0-indexed
  totalPages: number;
  onPageChange: (page: number) => void; // Expects 0-indexed page
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  availablePageSizes?: number[];
}

export const CustomPagination: React.FC<CustomPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  onPageSizeChange,
  availablePageSizes,
}) => {
  const { colorMode } = useColorMode();

  // Consistent colors with BoardPreview.tsx
  const textColor = colorMode === "dark" ? "white" : "#222";
  const borderColor = colorMode === "dark" ? "#222" : "#e2e8f0"; // Used for icon button bg and outline button border
  const primaryColor = "#2a7fc1"; // Used for active page bg
  const defaultPageSizes = [10, 20, 30, 50, 100];
  const effectivePageSizes = availablePageSizes ?? defaultPageSizes;

  const pageSizeCollection = React.useMemo(
    () =>
      createListCollection({
        items: effectivePageSizes.map((s) => ({
          label: String(s),
          value: String(s),
        })),
      }),
    [effectivePageSizes]
  );

  if (
    totalPages <= 1 &&
    (!effectivePageSizes || effectivePageSizes.length === 0)
  ) {
    return null; // Don't render if no pagination controls are needed
  }

  // --- Generate Page Number Buttons (Simple version: show all for now) ---
  // Consider adding more sophisticated logic here for large numbers of pages
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i);

  // Hover background for inactive/icon buttons
  const hoverBg = colorMode === "dark" ? "whiteAlpha.100" : "blackAlpha.100";
  // Slightly darker border color for hover on icon buttons
  const iconButtonHoverBg = colorMode === "dark" ? "gray.700" : "gray.300";

  return (
    <Flex justify="space-between" alignItems="center" p={4} w="100%">
      {totalPages > 1 ? (
        <HStack gap={2}>
          {/* First Page Button */}
          <IconButton
            aria-label="First page"
            size="xs"
            disabled={currentPage === 0}
            onClick={() => onPageChange(0)}
            bg={borderColor}
            color={textColor}
            _hover={{ bg: iconButtonHoverBg }}
          >
            <LuChevronsLeft />
          </IconButton>
          {/* Previous Page Button */}
          <IconButton
            aria-label="Previous page"
            size="xs"
            disabled={currentPage === 0}
            onClick={() => onPageChange(currentPage - 1)}
            bg={borderColor}
            color={textColor}
            _hover={{ bg: iconButtonHoverBg }}
          >
            <LuChevronLeft />
          </IconButton>

          {/* Page Number Buttons */}
          {pageNumbers.map((pageIndex) => {
            const isActive = currentPage === pageIndex;
            return (
              <Button
                key={pageIndex}
                size="xs"
                onClick={() => onPageChange(pageIndex)}
                disabled={isActive}
                bg={isActive ? primaryColor : undefined}
                color={isActive ? "white" : textColor}
                variant={isActive ? "solid" : "outline"}
                borderColor={!isActive ? borderColor : undefined}
                _hover={!isActive ? { bg: hoverBg } : undefined}
                _disabled={
                  isActive
                    ? { bg: primaryColor, color: "white", opacity: 1 }
                    : undefined
                }
              >
                <Text as="span">{pageIndex + 1}</Text>
              </Button>
            );
          })}

          {/* Next Page Button */}
          <IconButton
            aria-label="Next page"
            size="xs"
            disabled={currentPage >= totalPages - 1}
            onClick={() => onPageChange(currentPage + 1)}
            bg={borderColor}
            color={textColor}
            _hover={{ bg: iconButtonHoverBg }}
          >
            <LuChevronRight />
          </IconButton>
          {/* Last Page Button */}
          <IconButton
            aria-label="Last page"
            size="xs"
            disabled={currentPage >= totalPages - 1}
            onClick={() => onPageChange(totalPages - 1)}
            bg={borderColor}
            color={textColor}
            _hover={{ bg: iconButtonHoverBg }}
          >
            <LuChevronsRight />
          </IconButton>
        </HStack>
      ) : (
        <Box /> // Empty Box to maintain space-between if no page buttons
      )}
      {totalPages > 1 &&
        effectivePageSizes &&
        effectivePageSizes.length > 0 && (
          <HStack gap={2} alignItems="center">
            <ChakraSelect.Root
              collection={pageSizeCollection}
              value={[String(pageSize)]}
              onValueChange={(details) => {
                if (details.value && details.value.length > 0) {
                  onPageSizeChange(Number(details.value[0]));
                }
              }}
              size="xs"
              minW="60px"
            >
              <ChakraSelect.Control
                bg={colorMode === "dark" ? "gray.700" : "white"}
                borderColor={borderColor}
                color={textColor}
                _hover={{ borderColor: primaryColor }}
                _focus={{
                  borderColor: primaryColor,
                  boxShadow: `0 0 0 1px ${primaryColor}`,
                }}
              >
                <ChakraSelect.Trigger>
                  <ChakraSelect.ValueText />
                </ChakraSelect.Trigger>
                <ChakraSelect.IndicatorGroup>
                  <ChakraSelect.Indicator />
                </ChakraSelect.IndicatorGroup>
              </ChakraSelect.Control>
              <Portal>
                <ChakraSelect.Positioner>
                  <ChakraSelect.Content>
                    {pageSizeCollection.items.map((item) => (
                      <ChakraSelect.Item item={item} key={item.value}>
                        {item.label}
                        <ChakraSelect.ItemIndicator />
                      </ChakraSelect.Item>
                    ))}
                  </ChakraSelect.Content>
                </ChakraSelect.Positioner>
              </Portal>
            </ChakraSelect.Root>
          </HStack>
        )}
    </Flex>
  );
};

export default CustomPagination;
