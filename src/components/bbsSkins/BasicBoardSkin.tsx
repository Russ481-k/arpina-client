"use client";

import React, { useMemo, useRef, useCallback } from "react";
import {
  Box,
  Text,
  Flex,
  Badge,
  HStack,
  Icon,
  SimpleGrid,
} from "@chakra-ui/react";
import { useColorMode } from "@/components/ui/color-mode";
import { useColors } from "@/styles/theme";
import { useRouter } from "next/navigation";
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
import "ag-grid-community/styles/ag-theme-quartz.css";
import { themeDarkMode, themeLightMode } from "@/lib/ag-grid-config";

import { PageDetailsDto } from "@/types/menu";
import { Post } from "@/types/api";
import { LuImage, LuPaperclip, LuEye } from "react-icons/lu";

// Import GenericArticleCard and the mapping function
import GenericArticleCard from "@/components/common/cards/GenericArticleCard";
import { mapPostToCommonCardData } from "@/lib/card-utils";

ModuleRegistry.registerModules([AllCommunityModule]);

interface BasicBoardSkinProps {
  pageDetails: PageDetailsDto;
  posts: Post[];
  currentPathId: string;
  viewMode: "list" | "card";
}

const NoticeNumberRenderer = (params: ICellRendererParams<Post>) => {
  const content =
    params.data && params.data.no === 0 ? (
      <Badge colorScheme="orange" variant="subtle">
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
  return new Date(params.value).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const BasicBoardSkin: React.FC<BasicBoardSkinProps> = ({
  pageDetails,
  posts,
  currentPathId,
  viewMode,
}) => {
  const router = useRouter();
  const gridRef = useRef<AgGridReact<Post>>(null);
  const { colorMode } = useColorMode();
  const colors = useColors();

  const agGridThemeClass =
    colorMode === "dark" ? "ag-theme-quartz-dark" : "ag-theme-quartz";
  const selectedAgGridThemeStyles =
    colorMode === "dark" ? themeDarkMode : themeLightMode;

  const rowBackgroundColor = colors.bg;
  const rowTextColor = colors.text.primary;

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

  const defaultColDef = useMemo<ColDef<Post>>(() => {
    return {
      filter: true,
      resizable: true,
      sortable: true,
      cellStyle: {
        display: "flex",
        alignItems: "center",
      },
    };
  }, []);

  const handleRowClick = useCallback(
    (event: RowClickedEvent<Post>) => {
      if (event.data && event.data.nttId) {
        router.push(`/bbs/${currentPathId}/read/${event.data.nttId}`);
      }
    },
    [router, currentPathId]
  );

  if (viewMode === "card") {
    return (
      <Box maxW="1600px" mx="auto">
        {posts && posts.length > 0 ? (
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap={4}>
            {posts.map((post) => {
              const cardData = mapPostToCommonCardData(post, currentPathId);
              return (
                <GenericArticleCard key={cardData.id} cardData={cardData} />
              );
            })}
          </SimpleGrid>
        ) : (
          <Flex justify="center" align="center" h="30vh">
            <Text>표시할 게시물이 없습니다.</Text>
          </Flex>
        )}
      </Box>
    );
  }

  return (
    <Box maxW="1600px" mx="auto">
      {posts && posts.length > 0 ? (
        <Box
          className={agGridThemeClass}
          style={{
            width: "100%",
            ...selectedAgGridThemeStyles,
          }}
        >
          <AgGridReact<Post>
            suppressCellFocus
            ref={gridRef}
            rowData={posts}
            columnDefs={colDefs}
            defaultColDef={defaultColDef}
            domLayout="autoHeight"
            headerHeight={40}
            rowHeight={50}
            rowSelection="single"
            onRowClicked={handleRowClick}
            getRowStyle={() => ({
              background: rowBackgroundColor,
              color: rowTextColor,
            })}
            theme="legacy"
          />
        </Box>
      ) : (
        <Flex
          justify="center"
          align="center"
          h="30vh"
          borderWidth="1px"
          borderRadius="md"
          p={10}
        >
          <Text>표시할 게시물이 없습니다.</Text>
        </Flex>
      )}
    </Box>
  );
};

export default BasicBoardSkin;
