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
  Spinner,
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
  LuExternalLink,
} from "react-icons/lu";
import "ag-grid-community/styles/ag-theme-quartz.css";
import "@/styles/ag-grid-custom.css";
import Layout from "@/components/layout/view/Layout";
import { menuKeys, menuApi, sortMenus } from "@/lib/api/menu";
import { useQuery } from "@tanstack/react-query";
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
import PostTitleDisplay from "@/components/common/PostTitleDisplay";
import { getVoiceComments } from "@/lib/api/voice-comment";
import GenericArticleCard from "@/components/common/cards/GenericArticleCard";
import { mapArticleToCommonCardData } from "@/lib/card-utils";

type ArticleWithAnswer = BoardArticleCommon & {
  answerContent?: string;
};

ModuleRegistry.registerModules([AllCommunityModule]);

const NoticeNumberRenderer = (
  params: ICellRendererParams<ArticleWithAnswer>
) => {
  const { data, node, context } = params;
  if (data && data.no === 0) {
    return (
      <Badge colorPalette="orange" variant="subtle">
        공지
      </Badge>
    );
  }
  if (context && context.pagination && node.rowIndex !== null) {
    const { totalElements, currentPage, pageSize } = context.pagination;
    const calculatedNumber =
      totalElements - currentPage * pageSize - node.rowIndex;
    return <span>{calculatedNumber}</span>;
  }
  return <span>{params.value}</span>;
};

const ViewsRenderer = (params: ICellRendererParams<ArticleWithAnswer>) => (
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

const dateFormatter = (params: ValueFormatterParams<BoardArticleCommon>) => {
  if (!params.value) return "";
  return dayjs(params.value).format("YYYY.MM.DD");
};

const PressTitleRenderer_Preview: React.FC<
  ICellRendererParams<ArticleWithAnswer>
> = (params) => {
  const { data: post } = params;
  const { colorMode } = useColorMode();
  const colors = useColors();
  if (!post) return null;

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
      <Box
        flex={1}
        minW={0}
        display="flex"
        alignItems="center"
        color={titleColor}
        _hover={{
          textDecoration: "underline",
          color: titleHoverColor,
        }}
      >
        <PostTitleDisplay title={post.title} postData={post} />
      </Box>

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

const pressDateFormatter = (
  params: ValueFormatterParams<BoardArticleCommon, string>
) => {
  if (!params.value) return "";
  return dayjs(params.value).format("YYYY.MM.DD");
};

const StatusRenderer = (params: ICellRendererParams<ArticleWithAnswer>) => {
  const hasAnswer =
    params.data?.answerContent && params.data.answerContent.trim() !== "";
  const badgeColor = hasAnswer ? "pink" : "gray";
  const statusText = hasAnswer ? "답변완료" : "답변대기";

  return (
    <Flex w="100%" h="100%" alignItems="center" justifyContent="center">
      <Badge colorPalette={badgeColor} variant="subtle" px={2} py={1}>
        {statusText}
      </Badge>
    </Flex>
  );
};

export interface BoardPreviewProps {
  menu: Menu | null;
  board: BoardMaster | null;
  menus?: Menu[];
  onAddArticleClick?: () => void;
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
}: BoardPreviewProps) {
  const gridRef = useRef<AgGridReact<ArticleWithAnswer>>(null);
  const { colorMode } = useColorMode();
  const colors = useColors();
  const [searchInputText, setSearchInputText] = useState("");
  const [activeFilterKeyword, setActiveFilterKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [refreshKey, setRefreshKey] = useState(0);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedArticleForDetail, setSelectedArticleForDetail] =
    useState<ArticleWithAnswer | null>(null);
  const { user, isAuthenticated } = useRecoilValue(authState);
  const [previousArticleInDrawer, setPreviousArticleInDrawer] =
    useState<ArticleWithAnswer | null>(null);
  const [nextArticleInDrawer, setNextArticleInDrawer] =
    useState<ArticleWithAnswer | null>(null);
  const [isWriteDrawerOpen, setIsWriteDrawerOpen] = useState(false);
  const [articleToEdit, setArticleToEdit] = useState<ArticleWithAnswer | null>(
    null
  );

  const handleRefresh = useCallback(() => {
    setRefreshKey((prevKey) => prevKey + 1);
  }, []);

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
      if (Array.isArray(responseData)) return sortMenus(responseData);
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
    isFetching: isArticlesFetching,
  } = useQuery<ApiResponse<ArticleListResponse>>({
    queryKey: [
      "articles",
      bbsId,
      menuId,
      currentPage,
      pageSize,
      activeFilterKeyword,
      refreshKey,
    ],
    queryFn: async () => {
      if (!bbsId || !menuId) {
        return {
          success: true,
          message: "",
          data: { content: [], totalElements: 0, totalPages: 0 } as any,
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

  const baseArticles = useMemo(
    () => articlesApiResponse?.data?.content || [],
    [articlesApiResponse]
  );

  const {
    data: articlesWithComments,
    isLoading: isCommentsLoading,
    isFetching: isCommentsFetching,
  } = useQuery<ArticleWithAnswer[]>({
    queryKey: [
      "articlesWithComments",
      baseArticles.map((a) => a.nttId),
      refreshKey,
    ],
    queryFn: async () => {
      if (menu?.url !== "/bbs/voice" || baseArticles.length === 0) {
        return baseArticles;
      }
      return Promise.all(
        baseArticles.map(async (article) => {
          try {
            const comments = await getVoiceComments(article.nttId);
            return {
              ...article,
              answerContent: comments.length > 0 ? comments[0].content : "",
            };
          } catch (error) {
            console.error(
              `Error fetching comments for article ${article.nttId}:`,
              error
            );
            return { ...article, answerContent: "" };
          }
        })
      );
    },
    enabled: baseArticles.length > 0,
  });

  const heroData = useHeroSectionData(menu?.url ?? "");

  useEffect(() => {
    const currentArticles = articlesWithComments || [];
    if (selectedArticleForDetail && currentArticles.length > 0) {
      const currentIndex = currentArticles.findIndex(
        (article) => article.nttId === selectedArticleForDetail.nttId
      );
      if (currentIndex !== -1) {
        setPreviousArticleInDrawer(
          currentIndex > 0 ? currentArticles[currentIndex - 1] : null
        );
        setNextArticleInDrawer(
          currentIndex < currentArticles.length - 1
            ? currentArticles[currentIndex + 1]
            : null
        );
      }
    } else {
      setPreviousArticleInDrawer(null);
      setNextArticleInDrawer(null);
    }
  }, [selectedArticleForDetail, articlesWithComments]);

  useEffect(() => {
    const skinType = board?.skinType;
    setViewMode(skinType === "BASIC" || skinType === "PRESS" ? "card" : "list");
  }, [board?.skinType]);

  const agGridContext = useMemo(
    () => ({
      menuUrl: menu?.url || "",
      pagination: {
        totalElements: articlesApiResponse?.data?.totalElements || 0,
        currentPage: currentPage,
        pageSize: pageSize,
      },
    }),
    [articlesApiResponse, currentPage, pageSize, menu?.url]
  );

  const bg = colorMode === "dark" ? "#1A202C" : "white";
  const textColor = colorMode === "dark" ? "#E2E8F0" : "#2D3748";
  const borderColor = colorMode === "dark" ? "#2D3748" : "#E2E8F0";
  const primaryColor = colors.primary?.default || "#2a7fc1";
  const agGridTheme =
    colorMode === "dark" ? "ag-theme-quartz-dark" : "ag-theme-quartz";

  const colDefs = useMemo<ColDef<ArticleWithAnswer>[]>(() => {
    const baseCellTextStyle: CellStyle = {
      fontWeight: "normal",
      color: textColor,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      display: "flex",
      alignItems: "center",
      height: "100%",
    };
    const centeredCellTextStyle: CellStyle = {
      ...baseCellTextStyle,
      justifyContent: "center",
      textAlign: "center",
    };
    const baseColDefs: ColDef<ArticleWithAnswer>[] = [
      {
        headerName: "번호",
        field: "no",
        width: 80,
        sortable: true,
        cellRenderer: NoticeNumberRenderer,
        cellStyle: centeredCellTextStyle,
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
          justifyContent: "flex-start",
        },
      },
      {
        headerName: "작성자",
        field: "displayWriter",
        width: 120,
        sortable: true,
        cellStyle: centeredCellTextStyle,
      },
      {
        headerName: "등록일",
        field: "postedAt",
        width: 120,
        valueFormatter: dateFormatter,
        sortable: true,
        cellStyle: centeredCellTextStyle,
      },
      {
        headerName: "조회",
        field: "hits",
        width: 80,
        cellRenderer: ViewsRenderer,
        sortable: true,
        cellStyle: centeredCellTextStyle,
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
          cellStyle: centeredCellTextStyle,
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
            justifyContent: "flex-start",
          },
          minWidth: 300,
        },
        {
          headerName: "작성자",
          field: "displayWriter",
          width: 120,
          sortable: true,
          cellStyle: centeredCellTextStyle,
        },
        {
          headerName: "등록일",
          field: "postedAt",
          width: 120,
          valueFormatter: pressDateFormatter,
          sortable: true,
          cellStyle: centeredCellTextStyle,
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
          cellStyle: centeredCellTextStyle,
        },
        {
          headerName: "상태",
          field: "answerContent",
          width: 100,
          sortable: true,
          cellRenderer: StatusRenderer,
          cellStyle: centeredCellTextStyle,
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
            justifyContent: "flex-start",
          },
          minWidth: 300,
        },
        {
          headerName: "작성자",
          field: "displayWriter",
          width: 120,
          sortable: true,
          cellStyle: centeredCellTextStyle,
        },
        {
          headerName: "등록일",
          field: "postedAt",
          width: 120,
          valueFormatter: pressDateFormatter,
          sortable: true,
          cellStyle: centeredCellTextStyle,
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
    (event: RowClickedEvent | { data: ArticleWithAnswer }) => {
      setSelectedArticleForDetail(event.data);
      setDetailDrawerOpen(true);
    },
    []
  );

  const handleDetailDrawerClose = useCallback(
    (open: boolean) => {
      setDetailDrawerOpen(open);
      if (!open) {
        handleRefresh();
      }
    },
    [handleRefresh]
  );

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(0);
  }, []);

  const handleWriteNewInPreview = useCallback(
    (currentBbsId?: number, currentMenuId?: number) => {
      const targetBbsId = currentBbsId ?? bbsId;
      const targetMenuId = currentMenuId ?? menuId;

      if (typeof targetBbsId !== "number" || typeof targetMenuId !== "number") {
        toaster.error({
          title: "오류",
          description:
            "게시판 정보를 확인할 수 없어 글쓰기를 시작할 수 없습니다.",
        });
        return;
      }
      setArticleToEdit(null);
      setIsWriteDrawerOpen(true);
      setDetailDrawerOpen(false);
    },
    [bbsId, menuId]
  );

  const handleEditArticleInPreview = useCallback(
    (article: ArticleWithAnswer) => {
      setArticleToEdit(article);
      setIsWriteDrawerOpen(true);
      setDetailDrawerOpen(false);
    },
    []
  );

  const handleDeleteArticleInPreview = useCallback(
    async (articleToDelete: ArticleWithAnswer) => {
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
        handleRefresh();
      } catch (error) {
        console.error("Error deleting article:", error);
        toaster.error({
          title: "삭제 실패",
          description: "게시글 삭제 중 오류가 발생했습니다.",
        });
      }
    },
    [handleRefresh]
  );

  const isLoadingCombined =
    isMenusLoading ||
    isArticlesLoading ||
    isArticlesFetching ||
    isCommentsLoading ||
    isCommentsFetching;

  if (!menu) {
    return (
      <Box p={4} textAlign="center">
        <Text color={colors.text?.secondary || textColor}>
          게시판을 선택하세요
        </Text>
      </Box>
    );
  }

  if (isLoadingCombined && !(articlesWithComments || []).length) {
    return (
      <Flex p={4} w="full" minH="800px" justify="center" align="center">
        <Spinner size="xl" />
      </Flex>
    );
  }

  const currentSkinType = board?.skinType;
  const articlesData = articlesApiResponse?.data;
  const finalArticles = articlesWithComments || [];

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
                onClick={handleRefresh}
                disabled={isLoadingCombined}
                aria-label="Refresh article list"
              >
                {isLoadingCombined ? <Spinner size="sm" /> : <LuRefreshCw />}
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
            <AgGridReact<ArticleWithAnswer>
              ref={gridRef}
              rowData={finalArticles}
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
              {finalArticles.map((article) => {
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
                      } as RowClickedEvent<ArticleWithAnswer>)
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
        isQna={currentSkinType === "QNA"}
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
              handleRefresh();
            }
          }}
        />
      )}
    </Layout>
  );
});

export { BoardPreview };
