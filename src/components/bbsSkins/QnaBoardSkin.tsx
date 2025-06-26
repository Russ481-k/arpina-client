"use client";

import React, { useMemo, useRef, useCallback } from "react";
import {
  Box,
  Button,
  Heading,
  Text,
  Flex,
  Link as ChakraLink,
  Badge,
  HStack,
  Icon,
} from "@chakra-ui/react";
import { PageDetailsDto } from "@/types/menu";
import { Post } from "@/types/api";
import { PaginationData } from "@/types/common";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { CustomPagination } from "@/components/common/CustomPagination";
import dayjs from "dayjs";

// AG Grid imports
import { AgGridReact } from "ag-grid-react";
import {
  type ColDef,
  ModuleRegistry,
  AllCommunityModule,
  type ICellRendererParams,
  type ValueFormatterParams,
  type RowClickedEvent,
} from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css"; // Basic theme
import { useColorMode } from "@/components/ui/color-mode"; // For theme switching
import { useColors } from "@/styles/theme"; // For custom theme colors
import { themeDarkMode, themeLightMode } from "@/lib/ag-grid-config"; // Theme styles
import { LuImage, LuPaperclip, LuEye } from "react-icons/lu"; // Icons

ModuleRegistry.registerModules([AllCommunityModule]); // Register AG Grid modules

const AVAILABLE_PAGE_SIZES_QNA = [10, 20, 50];

// --- Cell Renderers and Formatters (copied/adapted from BasicBoardSkin) ---
const NoticeNumberRenderer = (params: ICellRendererParams<Post>) => {
  const content =
    params.data && params.data.no === 0 ? (
      <Badge colorPalette="orange" variant="subtle">
        공지
      </Badge>
    ) : (
      <span>{params.value}</span>
    );
  return (
    <Flex w="100%" h="100%" alignItems="center" justifyContent="center">
      {content}
    </Flex>
  );
};

const TitleRenderer = (params: ICellRendererParams<Post>) => {
  const postData = params.data;
  if (!postData) {
    return (
      <Flex w="100%" h="100%" alignItems="center" justifyContent="center">
        <span>{params.value}</span>
      </Flex>
    );
  }
  return (
    <HStack
      gap={0.5}
      alignItems="center"
      justifyContent="flex-start"
      h="100%"
      w="100%"
      cursor="pointer"
      title={params.value}
      flex="1"
    >
      <Text truncate fontSize="16px">
        {params.value}
      </Text>
      {postData.hasImageInContent && (
        <Icon as={LuImage} boxSize="1em" aria-label="Image in content" ml={1} />
      )}
      {postData.hasAttachment && (
        <Icon
          as={LuPaperclip}
          boxSize="0.9em"
          aria-label="Has attachments"
          ml={1}
        />
      )}
    </HStack>
  );
};

const ViewsRenderer = (params: ICellRendererParams<Post>) => (
  <Flex w="100%" h="100%" alignItems="center" justifyContent="center">
    <Icon as={LuEye} mr="4px" />
    {params.value}
  </Flex>
);

const dateFormatter = (params: ValueFormatterParams<Post>) => {
  if (!params.value) return "";
  return dayjs(params.value).format("YYYY.MM.DD");
};

// New StatusRenderer for Q&A
const StatusRenderer = (params: ICellRendererParams<Post>) => {
  const status = params.data?.status;
  let badgecolorPalette = "gray";
  let statusText = status || "정보 없음";

  if (status === "답변완료" || status?.toUpperCase() === "ANSWERED") {
    // Handle variations
    badgecolorPalette = "green";
    statusText = "답변완료";
  } else if (status === "답변대기" || status?.toUpperCase() === "PENDING") {
    // Handle variations
    badgecolorPalette = "orange";
    statusText = "답변대기";
  }
  // Add more specific status checks if needed, e.g., based on post.parentNttId for replies

  return (
    <Flex w="100%" h="100%" alignItems="center" justifyContent="center">
      <Badge
        colorPalette={badgecolorPalette}
        variant="subtle"
        px={2}
        py={0.5}
        borderRadius="md"
      >
        {statusText}
      </Badge>
    </Flex>
  );
};

// --- End of Cell Renderers ---

interface QnaBoardSkinProps {
  pageDetails: PageDetailsDto;
  posts: Post[];
  pagination: PaginationData;
  currentPathId: string;
}

const QnaBoardSkin: React.FC<QnaBoardSkinProps> = ({
  pageDetails,
  posts,
  pagination,
  currentPathId,
}) => {
  const router = useRouter();
  const gridRef = useRef<AgGridReact<Post>>(null); // AG Grid ref
  const { colorMode } = useColorMode(); // For theme
  const colors = useColors(); // For theme

  const canWrite =
    pageDetails.boardWriteAuth &&
    pageDetails.boardWriteAuth !== "NONE_OR_SIMILAR_RESTRICTIVE_VALUE";

  const handlePageChange = (page: number) => {
    router.push(
      `/bbs/${currentPathId}?page=${page + 1}&size=${pagination.pageSize}`
    );
  };

  const handlePageSizeChange = (newSize: number) => {
    router.push(`/bbs/${currentPathId}?page=1&size=${newSize}`);
  };

  // AG Grid Theme Logic
  const agGridThemeClass =
    colorMode === "dark" ? "ag-theme-quartz-dark" : "ag-theme-quartz";
  const selectedAgGridThemeStyles =
    colorMode === "dark" ? themeDarkMode : themeLightMode;
  const rowBackgroundColor = colors.bg;
  const rowTextColor = colors.text.primary;

  // Column Definitions
  const colDefs = useMemo<ColDef<Post>[]>(
    () => [
      {
        headerName: "번호",
        field: "no",
        width: 80,
        sortable: true,
        cellRenderer: NoticeNumberRenderer,
      },
      {
        headerName: "상태",
        field: "status",
        width: 100,
        sortable: true,
        cellRenderer: StatusRenderer,
      },
      {
        headerName: "제목",
        field: "title",
        flex: 1,
        sortable: true,
        cellRenderer: TitleRenderer,
      },
      {
        headerName: "작성자",
        field: "writer",
        width: 120,
        sortable: true,
        cellStyle: { justifyContent: "center" },
      },
      {
        headerName: "등록일",
        field: "createdAt",
        width: 120,
        valueFormatter: dateFormatter,
        sortable: true,
        cellStyle: { justifyContent: "center" },
      },
      {
        headerName: "조회",
        field: "hits",
        width: 80,
        cellRenderer: ViewsRenderer,
        sortable: true,
      },
    ],
    []
  );

  const defaultColDef = useMemo<ColDef<Post>>(
    () => ({
      filter: true,
      resizable: true,
      sortable: true,
      cellStyle: { display: "flex", alignItems: "center" },
    }),
    []
  );

  const handleRowClick = useCallback(
    (event: RowClickedEvent<Post>) => {
      if (event.data && event.data.nttId) {
        router.push(`/bbs/${currentPathId}/read/${event.data.nttId}`);
      }
    },
    [router, currentPathId]
  );

  return (
    <Box p={4} maxW="1600px" mx="auto">
      {/* AG Grid replaces the HTML table */}
      <Box
        className={agGridThemeClass}
        style={{
          width: "100%",
          // Applying direct styles from selectedAgGridThemeStyles might not be standard
          // It's usually enough to set the className and let AG Grid handle internal theming.
          // However, if themeDarkMode/themeLightMode contain essential overrides, they can be spread.
          // For simplicity, let's rely on the class and AG Grid's own theme CSS.
        }}
        mb={8} // Added margin bottom similar to old table
      >
        {posts.length > 0 ? (
          <AgGridReact<Post>
            suppressCellFocus
            ref={gridRef}
            rowData={posts}
            columnDefs={colDefs}
            defaultColDef={defaultColDef}
            enableCellTextSelection={true}
            domLayout="autoHeight"
            headerHeight={40}
            rowHeight={50} // Adjust as needed
            rowSelection="single"
            onRowClicked={handleRowClick}
            getRowStyle={() => ({
              background: rowBackgroundColor,
              color: rowTextColor,
            })}
            theme="legacy"
          />
        ) : (
          <Flex
            justify="center"
            align="center"
            p={10}
            borderWidth="1px"
            borderRadius="md"
          >
            <Text>등록된 질문이 없습니다.</Text>
          </Flex>
        )}
      </Box>

      {posts.length > 0 && pagination.totalPages > 1 && (
        <Flex justify="center">
          {" "}
          {/* Center pagination */}
          <CustomPagination
            currentPage={pagination.currentPage - 1}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            pageSize={pagination.pageSize}
            onPageSizeChange={handlePageSizeChange}
            availablePageSizes={AVAILABLE_PAGE_SIZES_QNA}
          />
        </Flex>
      )}
    </Box>
  );
};

export default QnaBoardSkin;
