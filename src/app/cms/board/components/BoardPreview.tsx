"use client";

import {
  Box,
  Flex,
  Text,
  Input,
  Button,
  HStack,
  Badge,
  Icon,
  Stack,
  Link as ChakraLink,
} from "@chakra-ui/react";
import { useColorMode } from "@/components/ui/color-mode";
import { useColors } from "@/styles/theme";
import { BoardMaster, Menu, BoardArticleCommon } from "@/types/api";
import { AgGridReact } from "ag-grid-react";
import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import {
  type ColDef,
  ModuleRegistry,
  AllCommunityModule,
  type ICellRendererParams,
  type ValueFormatterParams,
  type RowClickedEvent,
  type CellStyle,
} from "ag-grid-community";
import {
  LuSearch,
  LuEye,
  LuList,
  LuGrip,
  LuRefreshCw,
  LuImage,
  LuPaperclip,
  LuExternalLink,
} from "react-icons/lu";
import "ag-grid-community/styles/ag-theme-quartz.css";
import "@/styles/ag-grid-custom.css";
import Layout from "@/components/layout/view/Layout";
import { menuKeys, menuApi, sortMenus } from "@/lib/api/menu";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useHeroSectionData } from "@/lib/hooks/useHeroSectionData";
import { HeroSection } from "@/components/sections/HeroSection";
import { articleApi, type ArticleListResponse } from "@/lib/api/article";
import React from "react";
import { ArticleDetailDrawer } from "./ArticleDetailDrawer";
import { ArticleWriteDrawer } from "./ArticleWriteDrawer";
import { useRecoilValue } from "recoil";
import { authState } from "@/stores/auth";
import { LucideEdit } from "lucide-react";
import CustomPagination from "@/components/common/CustomPagination";
import { toaster } from "@/components/ui/toaster";
import dayjs from "dayjs";
import TitleCellRenderer from "@/components/common/TitleCellRenderer";
import PostTitleDisplay from "@/components/common/PostTitleDisplay";

// Import GenericArticleCard and the mapping function
import GenericArticleCard from "@/components/common/cards/GenericArticleCard";
import { mapArticleToCommonCardData } from "@/lib/card-utils";

// Register required modules
ModuleRegistry.registerModules([AllCommunityModule]);

// NEW: Custom Cell Renderer for "번호" (Number) column
const NoticeNumberRenderer = (
  params: ICellRendererParams<BoardArticleCommon>
) => {
  if (params.data && params.data.no === 0) {
    return (
      <Badge colorPalette="orange" variant="subtle">
        공지
      </Badge>
    );
  }
  return <span>{params.value}</span>; // params.value will be data.no
};

const ViewsRenderer = (params: ICellRendererParams<BoardArticleCommon>) => (
  <span
    style={{
      display: "flex",
      height: "100%",
      width: "100%",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <LuEye style={{ marginRight: "4px" }} />
    {params.value}
  </span>
);

// Date formatter
const dateFormatter = (params: ValueFormatterParams<BoardArticleCommon>) => {
  if (!params.value) return "";
  return dayjs(params.value).format("YYYY.MM.DD");
};

// --- IMPORT/DEFINE PressTitleRenderer and its dateFormatter ---
// (This might be better if PressTitleRenderer is in a shared location, but for now, define/adapt here)

const PressTitleRenderer_Preview: React.FC<
  ICellRendererParams<BoardArticleCommon>
> = (params) => {
  const post = params.data;
  const { colorMode } = useColorMode();
  const colors = useColors();
  if (!post) return null;

  const internalDetailUrl = `${params.context.menuUrl}/read/${post.nttId}`;
  let externalLinkHref: string | undefined = undefined;
  if (post.externalLink) {
    const trimmedExternalLink = post.externalLink.trim();
    if (
      trimmedExternalLink.startsWith("http://") ||
      trimmedExternalLink.startsWith("https://")
    ) {
      externalLinkHref = trimmedExternalLink;
    } else if (trimmedExternalLink) {
      externalLinkHref = `http://${trimmedExternalLink}`;
    }
  }

  const titleColor =
    colorMode === "dark"
      ? colors.text?.primary || "#E2E8F0"
      : colors.text?.primary || "#2D3748";
  const titleHoverColor = colorMode === "dark" ? "#75E6DA" : "blue.500";
  const iconColor =
    colorMode === "dark"
      ? colors.text?.secondary || "gray.500"
      : colors.text?.secondary || "gray.600";

  return (
    <HStack
      gap={1}
      alignItems="center"
      w="100%"
      h="100%"
      overflow="hidden"
      title={post.title}
    >
      <ChakraLink
        href={externalLinkHref ?? internalDetailUrl}
        flex={1}
        minW={0}
        display="flex"
        alignItems="center"
        color={titleColor}
        _hover={{
          textDecoration: "underline",
          color: titleHoverColor,
        }}
        onClick={(e) => {
          if (externalLinkHref) {
            e.preventDefault();
          }
        }}
      >
        <PostTitleDisplay title={post.title} postData={post} />
      </ChakraLink>

      {externalLinkHref && (
        <ChakraLink
          href={externalLinkHref}
          target="_blank"
          rel="noopener noreferrer"
          display="inline-flex"
          onClick={(e) => e.stopPropagation()}
          aria-label={`Open external link: ${externalLinkHref}`}
        >
          <Icon
            as={LuExternalLink}
            color={iconColor}
            _hover={{ color: titleHoverColor }}
            cursor="pointer"
            boxSize={4}
          />
        </ChakraLink>
      )}
    </HStack>
  );
};

// Re-use existing dateFormatter or ensure one is available for Press columns
const pressDateFormatter = (
  params: ValueFormatterParams<BoardArticleCommon, string>
) => {
  if (!params.value) return "";
  return dayjs(params.value).format("YYYY.MM.DD");
};

export interface BoardPreviewProps {
  menu: Menu | null;
  board: BoardMaster | null;
  settings?: {
    showTitle: boolean;
    showSearch: boolean;
    showPagination: boolean;
    showWriteButton: boolean;
    layout: "list" | "grid" | "gallery";
  };
  menus?: Menu[];
  onAddArticleClick?: () => void;
  refetchArticles?: () => void;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errorCode: string | null;
  stackTrace: string | null;
}

const BoardPreview = React.memo(function BoardPreview({
  menu,
  board,
  onAddArticleClick,
  refetchArticles,
}: BoardPreviewProps) {
  // === ALL HOOKS AT THE TOP LEVEL OF THE COMPONENT ===
  const gridRef = useRef<AgGridReact<BoardArticleCommon>>(null);
  const { colorMode } = useColorMode();
  const colors = useColors();
  const [searchInputText, setSearchInputText] = useState("");
  const [activeFilterKeyword, setActiveFilterKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedArticleForDetail, setSelectedArticleForDetail] =
    useState<BoardArticleCommon | null>(null);
  const { user, isAuthenticated } = useRecoilValue(authState);
  const queryClient = useQueryClient();
  const [previousArticleInDrawer, setPreviousArticleInDrawer] =
    useState<BoardArticleCommon | null>(null);
  const [nextArticleInDrawer, setNextArticleInDrawer] =
    useState<BoardArticleCommon | null>(null);
  const [isWriteDrawerOpen, setIsWriteDrawerOpen] = useState(false);
  const [articleToEdit, setArticleToEdit] = useState<BoardArticleCommon | null>(
    null
  );

  const initialViewMode = useMemo(() => {
    const initialSkinType = board?.skinType;
    return initialSkinType === "BASIC" || initialSkinType === "PRESS"
      ? "card"
      : "list";
  }, [board?.skinType]);
  const [viewMode, setViewMode] = useState<"list" | "card">(initialViewMode);

  const { data: menuResponse, isLoading: isMenusLoading } = useQuery<Menu[]>({
    queryKey: menuKeys.list(""),
    queryFn: async () => {
      const response = await menuApi.getMenus();
      return response.data.data;
    },
  });

  const menus = useMemo(() => {
    try {
      const responseData = menuResponse;
      if (!responseData) return [];
      if (Array.isArray(responseData)) {
        return sortMenus(responseData);
      }
      const menuData = responseData;
      if (!menuData) return [];
      return Array.isArray(menuData) ? sortMenus(menuData) : [menuData];
    } catch (error) {
      console.error("Error processing menu data:", error);
      return [];
    }
  }, [menuResponse]);

  const menuId = menu?.id ?? 0;
  const bbsId = board?.bbsId;

  const handleSearch = useCallback(() => {
    setActiveFilterKeyword(searchInputText);
    setCurrentPage(0);
  }, [searchInputText]);

  const {
    data: articlesApiResponse,
    isLoading: isArticlesLoading,
    isError: isArticlesError,
  } = useQuery<ApiResponse<ArticleListResponse>>({
    queryKey: [
      "articles",
      bbsId,
      menuId,
      currentPage,
      pageSize,
      activeFilterKeyword,
    ],
    queryFn: async () => {
      if (!bbsId || !menuId) {
        return {
          success: true,
          message: "",
          data: {
            content: [],
            pageable: {
              sort: { empty: true, sorted: false, unsorted: true },
              offset: 0,
              pageNumber: 0,
              pageSize: 20,
              paged: true,
              unpaged: false,
            },
            last: true,
            totalElements: 0,
            totalPages: 0,
            first: true,
            size: 20,
            number: 0,
            sort: { empty: true, sorted: false, unsorted: true },
            numberOfElements: 0,
            empty: true,
          },
          errorCode: null,
          stackTrace: null,
        };
      }
      return await articleApi.getArticles({
        bbsId,
        menuId,
        page: currentPage,
        size: pageSize,
        keyword: activeFilterKeyword,
      });
    },
    enabled: !!bbsId && !!menuId,
  });

  const articles = useMemo(
    () => articlesApiResponse?.data?.content || [],
    [articlesApiResponse?.data?.content]
  ) as BoardArticleCommon[];
  const heroData = useHeroSectionData(menu?.url ?? "");
  useEffect(() => {
    if (selectedArticleForDetail && articles.length > 0) {
      const currentIndex = articles.findIndex(
        (article) => article.nttId === selectedArticleForDetail.nttId
      );
      if (currentIndex !== -1) {
        setPreviousArticleInDrawer(
          currentIndex > 0 ? articles[currentIndex - 1] : null
        );
        setNextArticleInDrawer(
          currentIndex < articles.length - 1 ? articles[currentIndex + 1] : null
        );
      }
    } else {
      setPreviousArticleInDrawer(null);
      setNextArticleInDrawer(null);
    }
  }, [selectedArticleForDetail, articles]);

  useEffect(() => {
    const skinType = board?.skinType;
    setViewMode(skinType === "BASIC" || skinType === "PRESS" ? "card" : "list");
  }, [board?.skinType]);

  const agGridContext = useMemo(
    () => ({ menuUrl: menu?.url || "" }),
    [menu?.url]
  );

  const bg = colorMode === "dark" ? "#1A202C" : "white";
  const textColor = colorMode === "dark" ? "#E2E8F0" : "#2D3748";
  const borderColor = colorMode === "dark" ? "#2D3748" : "#E2E8F0";
  const primaryColor = colors.primary?.default || "#2a7fc1";
  const agGridTheme =
    colorMode === "dark" ? "ag-theme-quartz-dark" : "ag-theme-quartz";

  const colDefs = useMemo<ColDef<BoardArticleCommon>[]>(() => {
    const baseCellTextStyle: CellStyle = {
      fontWeight: "normal",
      color: textColor,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      justifyContent: "flex-start",
    };
    const centeredCellTextStyle: CellStyle = {
      ...baseCellTextStyle,
      justifyContent: "center",
      textAlign: "center",
      color: colors.text?.secondary || textColor,
    };
    const baseColDefs: ColDef<BoardArticleCommon>[] = [
      {
        headerName: "번호",
        field: "no",
        width: 80,
        sortable: true,
        cellRenderer: NoticeNumberRenderer,
        cellStyle: {
          ...centeredCellTextStyle,
          overflow: "visible",
          textOverflow: "clip",
          whiteSpace: "normal",
        },
      },
      {
        headerName: "제목",
        field: "title",
        flex: 1,
        sortable: true,
        cellRenderer: PressTitleRenderer_Preview,

        cellStyle: {
          ...baseCellTextStyle,
          paddingLeft: "10px",
          paddingRight: "10px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        },
      },
      {
        headerName: "작성자",
        field: "displayWriter",
        width: 120,
        sortable: true,
        cellStyle: {
          ...centeredCellTextStyle,
          overflow: "visible",
          textOverflow: "clip",
          whiteSpace: "normal",
        },
      },
      {
        headerName: "등록일",
        field: "postedAt",
        width: 120,
        valueFormatter: dateFormatter,
        sortable: true,
        cellStyle: {
          ...centeredCellTextStyle,
          overflow: "visible",
          textOverflow: "clip",
          whiteSpace: "normal",
        },
      },
      {
        headerName: "조회",
        field: "hits",
        width: 80,
        cellRenderer: ViewsRenderer,
        sortable: true,
        cellStyle: {
          ...centeredCellTextStyle,
          overflow: "visible",
          textOverflow: "clip",
          whiteSpace: "normal",
        },
      },
    ];

    if (board?.skinType === "PRESS") {
      return [
        {
          headerName: "번호",
          field: "no",
          width: 80,
          sortable: true,
          cellRenderer: NoticeNumberRenderer,
          cellStyle: {
            ...centeredCellTextStyle,
            overflow: "visible",
            textOverflow: "clip",
            whiteSpace: "normal",
          },
        },
        {
          headerName: "제목",
          field: "title",
          flex: 1,
          sortable: true,
          cellRenderer: PressTitleRenderer_Preview,
          cellStyle: {
            ...baseCellTextStyle,
            paddingLeft: "10px",
            paddingRight: "10px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          },
          minWidth: 300,
        },
        {
          headerName: "작성자",
          field: "displayWriter",
          width: 120,
          sortable: true,
          cellStyle: {
            ...centeredCellTextStyle,
            overflow: "visible",
            textOverflow: "clip",
            whiteSpace: "normal",
          },
        },
        {
          headerName: "등록일",
          field: "postedAt",
          width: 120,
          valueFormatter: pressDateFormatter,
          sortable: true,
          cellStyle: {
            ...centeredCellTextStyle,
            overflow: "visible",
            textOverflow: "clip",
            whiteSpace: "normal",
          },
        },
      ];
    }
    if (board?.skinType === "QNA") {
      return [
        {
          headerName: "번호",
          field: "no",
          width: 80,
          sortable: true,
          cellRenderer: NoticeNumberRenderer,
          cellStyle: {
            ...centeredCellTextStyle,
            overflow: "visible",
            textOverflow: "clip",
            whiteSpace: "normal",
          },
        },
        {
          headerName: "제목",
          field: "title",
          flex: 1,
          sortable: true,
          cellRenderer: PressTitleRenderer_Preview,

          cellStyle: {
            ...baseCellTextStyle,
            paddingLeft: "10px",
            paddingRight: "10px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          },
          minWidth: 300,
        },
        {
          headerName: "작성자",
          field: "displayWriter",
          width: 120,
          sortable: true,
          cellStyle: {
            ...centeredCellTextStyle,
            overflow: "visible",
            textOverflow: "clip",
            whiteSpace: "normal",
          },
        },
        {
          headerName: "등록일",
          field: "postedAt",
          width: 120,
          valueFormatter: pressDateFormatter,
          sortable: true,
          cellStyle: {
            ...centeredCellTextStyle,
            overflow: "visible",
            textOverflow: "clip",
            whiteSpace: "normal",
          },
        },
      ];
    }
    return baseColDefs;
  }, [board?.skinType, colors.text, textColor]);

  const defaultColDef = useMemo(
    () => ({
      filter: true,
      resizable: true,
      sortable: true,
      cellStyle: { fontSize: "14px", lineHeight: "1.5" },
    }),
    []
  );
  const handleRowClick = useCallback(
    (event: RowClickedEvent | { data: BoardArticleCommon }) => {
      setSelectedArticleForDetail(event.data);
      setDetailDrawerOpen(true);
    },
    []
  );
  const handleDetailDrawerClose = useCallback(
    (open: boolean) => {
      setDetailDrawerOpen(open);
      if (!open && refetchArticles) {
        refetchArticles();
      }
    },
    [refetchArticles]
  );
  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(0);
  }, []);

  // Define the handlers for ArticleDetailDrawer actions
  const handleWriteNewInPreview = useCallback(
    (currentBbsId?: number, currentMenuId?: number) => {
      const targetBbsId = currentBbsId ?? bbsId; // bbsId is from props.board.bbsId
      const targetMenuId = currentMenuId ?? menuId; // menuId is from props.menu.id

      if (typeof targetBbsId !== "number" || typeof targetMenuId !== "number") {
        toaster.error({
          title: "오류",
          description:
            "게시판 정보를 확인할 수 없어 글쓰기를 시작할 수 없습니다.",
        });
        return;
      }
      setArticleToEdit(null); // Clear any existing article to edit
      setIsWriteDrawerOpen(true);
      setDetailDrawerOpen(false); // Close detail drawer if it was open
    },
    [bbsId, menuId]
  ); // Add bbsId, menuId to dependencies

  const handleEditArticleInPreview = useCallback(
    (article: BoardArticleCommon) => {
      setArticleToEdit(article);
      setIsWriteDrawerOpen(true);
      setDetailDrawerOpen(false); // Close detail drawer if it was open
    },
    []
  );

  const handleDeleteArticleInPreview = useCallback(
    async (articleToDelete: BoardArticleCommon) => {
      if (!articleToDelete || typeof articleToDelete.nttId !== "number") {
        toaster.error({
          title: "오류",
          description: "삭제할 게시글 정보가 올바르지 않습니다.",
        });
        return;
      }
      try {
        await articleApi.deleteArticle(articleToDelete.nttId);
        toaster.success({
          title: "삭제 완료",
          description: `'${articleToDelete.title}' 게시글이 삭제되었습니다.`,
        });
        setDetailDrawerOpen(false);
        setSelectedArticleForDetail(null);
        if (bbsId && typeof menuId === "number") {
          queryClient.invalidateQueries({
            queryKey: ["articles", bbsId, menuId],
          });
        }
      } catch (error) {
        console.error("Error deleting article:", error);
        toaster.error({
          title: "삭제 실패",
          description: "게시글 삭제 중 오류가 발생했습니다.",
        });
      }
    },
    [bbsId, menuId, queryClient]
  ); // Add dependencies

  // ALL CONDITIONAL RENDERING / EARLY RETURNS MUST BE AFTER ALL HOOKS
  if (!menu) {
    return (
      <Box p={4} textAlign="center">
        <Text color={colors.text?.secondary || textColor}>
          게시판을 선택하세요
        </Text>
      </Box>
    );
  }
  const isLoadingCombined = isMenusLoading || isArticlesLoading;
  if (isLoadingCombined) {
    return (
      <Box
        width="40px"
        height="40px"
        border="4px solid"
        borderColor="blue.500"
        borderTopColor="transparent"
        borderRadius="full"
        animation="spin 1s linear infinite"
      />
    );
  }

  const currentSkinType = board?.skinType;
  const articlesData = articlesApiResponse?.data;
  console.log(articles);
  return (
    <Layout currentPage="홈" isPreview={true} menus={menus}>
      <HeroSection slideContents={[heroData]} />
      <Box px={8} py={4} minH="800px">
        <Flex
          direction={{ base: "column", md: "row" }}
          flexWrap="wrap"
          gap={2}
          mb={2}
        >
          <Box
            flex={{ base: "unset", md: "1 1 0%" }}
            mb={{ base: 2, md: 0 }}
            width={{ base: "100%", md: "50%" }}
          >
            <HStack gap={1}>
              {articlesData?.totalElements !== undefined && (
                <Text
                  fontSize="sm"
                  color={colors.text.secondary}
                  whiteSpace="nowrap"
                  mr={2}
                >
                  총 {articlesData.totalElements}건
                </Text>
              )}
              <Input
                placeholder="검색어를 입력해주세요"
                size="sm"
                bg={bg}
                color={textColor}
                border={`1px solid ${borderColor}`}
                width="100%"
                value={searchInputText}
                onChange={(e) => setSearchInputText(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
              />
              <Button
                size="sm"
                bg={borderColor}
                color={textColor}
                minWidth="32px"
                px={2}
                onClick={handleSearch}
              >
                <LuSearch />
              </Button>
            </HStack>
          </Box>
          <Box
            flex={{ base: "unset", md: "1 1 0%" }}
            width={{ base: "100%", md: "50%" }}
          >
            <HStack justify="flex-end" gap={1}>
              <Button
                size="sm"
                bg={borderColor}
                color={textColor}
                minWidth="32px"
                px={2}
                onClick={refetchArticles}
                // disabled={!refetchArticles}
                aria-label="Refresh article list"
              >
                <LuRefreshCw />
              </Button>
              <Button
                size="sm"
                bg={borderColor}
                color={textColor}
                minWidth="32px"
                px={2}
                onClick={onAddArticleClick}
                disabled={!onAddArticleClick}
              >
                글쓰기
                <LucideEdit />
              </Button>
              {(currentSkinType === "BASIC" || currentSkinType === "PRESS") && (
                <>
                  <Button
                    size="sm"
                    bg={viewMode === "list" ? primaryColor : borderColor}
                    color={viewMode === "list" ? "white" : textColor}
                    minWidth="32px"
                    px={2}
                    onClick={() => setViewMode("list")}
                    aria-label="List view"
                  >
                    <LuList />
                  </Button>
                  <Button
                    size="sm"
                    bg={viewMode === "card" ? primaryColor : borderColor}
                    color={viewMode === "card" ? "white" : textColor}
                    minWidth="32px"
                    px={2}
                    onClick={() => setViewMode("card")}
                    aria-label="Card view"
                  >
                    <LuGrip />
                  </Button>
                </>
              )}
            </HStack>
          </Box>
        </Flex>
        {viewMode === "list" && (
          <Box
            className={agGridTheme}
            style={{ width: "100%", background: bg }}
          >
            <AgGridReact<BoardArticleCommon>
              ref={gridRef}
              rowData={articles}
              columnDefs={colDefs}
              defaultColDef={defaultColDef}
              domLayout="autoHeight"
              headerHeight={40}
              rowHeight={60}
              suppressCellFocus
              enableCellTextSelection={true}
              getRowStyle={() => ({
                color: textColor,
                background: bg,
                borderBottom: `1px solid ${borderColor}`,
                display: "flex",
                alignItems: "center",
              })}
              rowSelection="single"
              onRowClicked={handleRowClick}
              context={agGridContext}
            />
          </Box>
        )}
        {viewMode === "card" &&
          (currentSkinType === "BASIC" || currentSkinType === "PRESS") && (
            <Stack direction="row" wrap="wrap" gap={4} mt={4}>
              {articles.map((article) => {
                const cardData = mapArticleToCommonCardData(
                  article,
                  menu?.url || ""
                );
                return (
                  <Box
                    key={cardData.id}
                    width={{
                      base: "100%",
                      sm: "calc(50% - 0.5rem)",
                      md: "calc(33.33% - 0.67rem)",
                      lg: "calc(25% - 0.75rem)",
                    }}
                    onClick={() =>
                      handleRowClick({
                        data: article,
                      } as RowClickedEvent<BoardArticleCommon>)
                    }
                    cursor="pointer"
                    _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
                    transition="all 0.2s"
                  >
                    <GenericArticleCard cardData={cardData} />
                  </Box>
                );
              })}
            </Stack>
          )}
        <CustomPagination
          currentPage={currentPage}
          totalPages={articlesData?.totalPages || 0}
          onPageChange={setCurrentPage}
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
        />
      </Box>
      <ArticleDetailDrawer
        open={detailDrawerOpen}
        onOpenChange={handleDetailDrawerClose}
        article={selectedArticleForDetail}
        isFaq={currentSkinType === "FAQ"}
        previousArticle={previousArticleInDrawer}
        nextArticle={nextArticleInDrawer}
        onNavigateToPrevious={() => {
          if (previousArticleInDrawer) {
            setSelectedArticleForDetail(previousArticleInDrawer);
          }
        }}
        onNavigateToNext={() => {
          if (nextArticleInDrawer) {
            setSelectedArticleForDetail(nextArticleInDrawer);
          }
        }}
        onWriteNew={() =>
          handleWriteNewInPreview(
            selectedArticleForDetail?.bbsId,
            selectedArticleForDetail?.menuId
          )
        }
        onEditArticle={handleEditArticleInPreview}
        onDeleteArticle={handleDeleteArticleInPreview}
        canWrite={board?.writeAuth !== undefined}
        canEdit={
          !!(
            board?.writeAuth &&
            selectedArticleForDetail &&
            isAuthenticated &&
            (user?.username === selectedArticleForDetail.writer ||
              user?.role === "ADMIN")
          )
        }
        canDelete={
          !!(
            board?.writeAuth &&
            selectedArticleForDetail &&
            isAuthenticated &&
            (user?.username === selectedArticleForDetail.writer ||
              user?.role === "ADMIN")
          )
        }
      />
      {isWriteDrawerOpen && (
        <ArticleWriteDrawer
          bbsId={articleToEdit ? articleToEdit.bbsId : bbsId!}
          menuId={articleToEdit ? articleToEdit.menuId : menuId}
          initialData={articleToEdit ? articleToEdit : undefined}
          onOpenChange={(openState) => {
            if (!openState) {
              setIsWriteDrawerOpen(false);
              setArticleToEdit(null);
              if (bbsId && typeof menuId === "number") {
                queryClient.invalidateQueries({
                  queryKey: ["articles", bbsId, menuId],
                });
              }
            }
          }}
        />
      )}
    </Layout>
  );
});

export { BoardPreview };
