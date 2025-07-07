"use client"; // 클라이언트 컴포넌트로 전환

import { useRouter, useSearchParams } from "next/navigation";
import { menuApi } from "@/lib/api/menu";
import { articleApi } from "@/lib/api/article";
import { PageDetailsDto } from "@/types/menu";
import { BoardArticleCommon, Post, FileDto } from "@/types/api"; // FileDto 임포트 추가
import { PaginationData } from "@/types/common";
import { findMenuByPath } from "@/lib/menu-utils"; // Import findMenuByPath
import { Box, Flex, Heading, Text, Button } from "@chakra-ui/react"; // Chakra UI 컴포넌트 임포트
import React, { useState, useEffect, useCallback } from "react"; // React 훅 임포트
import NextLink from "next/link"; // NextLink import 경로 수정

// 스킨 컴포넌트 임포트
import BasicBoardSkin from "@/components/bbsSkins/BasicBoardSkin";
import FaqBoardSkin from "@/components/bbsSkins/FaqBoardSkin";
import QnaBoardSkin from "@/components/bbsSkins/QnaBoardSkin";
import PressBoardSkin from "@/components/bbsSkins/PressBoardSkin";
import FormBoardSkin from "@/components/bbsSkins/FormBoardSkin";
import CustomPagination from "@/components/common/CustomPagination"; // Import CustomPagination
import BoardControls from "@/components/bbsCommon/BoardControls"; // Import BoardControls
import { PageContainer } from "@/components/layout/PageContainer";

interface BoardPageProps {
  params: Promise<{ id: string }>; // params is a Promise again
  // searchParams는 props로 받지 않고, useSearchParams() 훅을 사용하므로 제거 가능
}

interface BoardPageData {
  pageDetails: PageDetailsDto;
  posts: Post[]; // Skins expect Post[]
  pagination: PaginationData;
}

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_SORT_ORDER = "createdAt,desc"; // Default sort for articles

// Helper to map Article to Post
function mapArticleToPost(article: BoardArticleCommon): Post {
  // Explicitly type attachments to satisfy Post.attachments?: FileDto[] | null
  const mappedAttachments: FileDto[] | null = article.attachments
    ? article.attachments.map((att): FileDto => {
        // Use the imported FileDto type for the return type of the map callback
        const savedNameDerived =
          att.downloadUrl.substring(att.downloadUrl.lastIndexOf("/") + 1) ||
          att.originName;
        return {
          // Fields from AttachmentInfoDto
          fileId: att.fileId,
          originName: att.originName,
          mimeType: att.mimeType,
          size: att.size,
          ext: att.ext,
          downloadUrl: att.downloadUrl, // downloadUrl 추가

          // Fields from File interface requiring mapping/defaults (이제 FileDto에 맞게 조정)
          // menu: "BBS", // FileDto에는 없음
          // menuId: article.menuId, // FileDto에는 없음
          // savedName: savedNameDerived, // FileDto에는 없음
          // version: 1, // FileDto에는 없음
          // publicYn: "Y", // FileDto에는 없음
          // fileOrder: 0, // FileDto에는 없음

          // Audit fields (FileDto에는 없음)
          // createdBy: null,
          // createdDate: null,
          // createdIp: null,
          // updatedBy: null,
          // updatedDate: null,
          // updatedIp: null,
        };
      })
    : null;

  return {
    no: article.no,
    nttId: article.nttId,
    bbsId: article.bbsId,
    parentNttId: article.parentNttId,
    threadDepth: article.threadDepth,
    writer: article.writer,
    title: article.title,
    content: article.content,
    hasImageInContent: article.hasImageInContent,
    hasAttachment: article.hasAttachment,
    noticeState: article.noticeState as "Y" | "N" | "P",
    noticeStartDt: article.noticeStartDt,
    noticeEndDt: article.noticeEndDt,
    publishState: article.publishState as "Y" | "N" | "P",
    publishStartDt: article.publishStartDt,
    publishEndDt: article.publishEndDt,
    externalLink: article.externalLink,
    hits: article.hits,
    displayWriter: article.displayWriter || "",
    postedAt: article.postedAt || "",
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
    thumbnailUrl: article.thumbnailUrl,
    status: article.status,
    attachments: mappedAttachments, // Use the correctly typed variable
    categories: [],
  };
}

async function getBoardPageData(
  menuId: number,
  currentPage: number,
  requestedPageSize?: number,
  keyword?: string // Add keyword parameter
): Promise<BoardPageData | null> {
  const pageSizeToUse = requestedPageSize || DEFAULT_PAGE_SIZE;
  try {
    const pageDetails = await menuApi.getPageDetails(menuId);

    if (
      !pageDetails ||
      pageDetails.menuType !== "BOARD" ||
      typeof pageDetails.boardId !== "number" // Ensure boardId is a number
    ) {
      console.warn(
        `Invalid pageDetails or boardId for menuId ${menuId}:`,
        pageDetails
      );
      return null;
    }

    // Use articleApi.getArticles
    const apiResponse = await articleApi.getArticles({
      bbsId: pageDetails.boardId,
      menuId: menuId, // Pass menuId as well
      page: currentPage - 1, // API is 0-indexed
      size: pageSizeToUse,
      keyword: keyword, // Pass keyword
      sort: DEFAULT_SORT_ORDER, // Add sort order
    });

    // Assuming privateApi in articleApi returns ApiResponse<ArticleListResponse>
    // and we need to access its .data property
    if (!apiResponse.success || !apiResponse.data) {
      console.error(
        `Failed to fetch articles for menuId ${menuId}, bbsId ${pageDetails.boardId}:`,
        apiResponse.message || "No data in response"
      );
      return null;
    }

    const articlesData = apiResponse.data; // This is ArticleListResponse

    const articles = articlesData.content || [];
    // Map Article[] to Post[]
    const posts: Post[] = articles.map(mapArticleToPost);

    // Correctly access pageable properties and totalElements
    const { pageNumber, pageSize } = articlesData.pageable || {
      pageNumber: 0,
      pageSize: pageSizeToUse,
    };
    const totalElements = articlesData.totalElements || 0;

    const totalPages = Math.ceil(totalElements / pageSize) || 1;

    const pagination: PaginationData = {
      currentPage: pageNumber + 1, // UI is 1-indexed
      totalPages,
      pageSize,
      totalElements,
    };

    return { pageDetails, posts, pagination };
  } catch (error) {
    console.error(
      `Error fetching data for board page (menuId: ${menuId}, page: ${currentPage}, size: ${pageSizeToUse}, keyword: ${keyword}):`,
      error
    );
    return null;
  }
}

export default function BoardPage({
  params, // params is a Promise again
}: BoardPageProps) {
  const router = useRouter();
  const searchParamsHook = useSearchParams(); // hook 사용

  const [awaitedParams, setAwaitedParams] = useState<{ id: string } | null>(
    null
  );
  const [keywordInput, setKeywordInput] = useState("");
  const [currentMenuPath, setCurrentMenuPath] = useState<string | null>(null);
  const [boardData, setBoardData] = useState<BoardPageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "card">("list");

  // 컴포넌트 마운트 및 params 변경 시 awaitedParams 설정, currentMenuPath 설정 및 keyword 초기화
  useEffect(() => {
    async function resolveAndSetParams() {
      const resolvedParams = await params;
      setAwaitedParams(resolvedParams);
      if (resolvedParams && resolvedParams.id) {
        setCurrentMenuPath(`/bbs/${resolvedParams.id}`);
        // URL에서 keyword 가져와 검색창 초기화
        setKeywordInput(searchParamsHook.get("keyword") || "");
      }
    }
    resolveAndSetParams();
  }, [params, searchParamsHook]);

  // 검색 실행 함수
  const handleSearch = useCallback(() => {
    if (currentMenuPath) {
      const query = new URLSearchParams();
      query.set("page", "1");
      if (keywordInput.trim()) {
        query.set("keyword", keywordInput.trim());
      }
      const currentSize =
        searchParamsHook.get("size") || String(DEFAULT_PAGE_SIZE);
      query.set("size", currentSize);
      router.push(`${currentMenuPath}?${query.toString()}`);
    }
  }, [router, currentMenuPath, keywordInput, searchParamsHook]);

  // 검색 초기화 함수
  const handleClearSearch = useCallback(() => {
    if (currentMenuPath) {
      setKeywordInput("");
      const query = new URLSearchParams();
      query.set("page", "1");
      const currentSize =
        searchParamsHook.get("size") || String(DEFAULT_PAGE_SIZE);
      query.set("size", currentSize);
      router.push(`${currentMenuPath}?${query.toString()}`);
    }
  }, [router, currentMenuPath, searchParamsHook]);

  const currentPathId = awaitedParams?.id; // Use awaitedParams
  const currentPageFromUrl = parseInt(searchParamsHook.get("page") || "1", 10);
  const requestedPageSizeFromUrl = parseInt(
    searchParamsHook.get("size") || String(DEFAULT_PAGE_SIZE),
    10
  );
  const currentKeyword = searchParamsHook.get("keyword") || undefined;

  useEffect(() => {
    async function fetchData() {
      if (!awaitedParams || !currentPathId || !currentMenuPath) {
        // Check awaitedParams
        setBoardData(null);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      const menu = await findMenuByPath(currentMenuPath); // currentMenuPath is checked above
      if (!menu || !menu.id) {
        console.warn(`[BoardPage] Menu not found for path: ${currentMenuPath}`);
        setBoardData(null); // No menu found
        setIsLoading(false); // Stop loading
        return;
      }
      const menuIdToUse = menu.id;
      const data = await getBoardPageData(
        menuIdToUse,
        currentPageFromUrl, // Use value from URL for fetching
        requestedPageSizeFromUrl, // Use value from URL for fetching
        currentKeyword
      );
      if (!data) {
        console.warn(
          `[BoardPage] No board data found for menuId: ${menuIdToUse} at path ${currentMenuPath}`
        );
        setBoardData(null);
      } else {
        setBoardData(data);
      }
      setIsLoading(false);
    }
    fetchData();
  }, [
    awaitedParams, // Add awaitedParams to dependency array
    currentPathId,
    currentPageFromUrl,
    requestedPageSizeFromUrl,
    currentKeyword,
    currentMenuPath,
  ]);

  // Pagination Handlers
  const handlePageChange = useCallback(
    (page: number) => {
      // page is 0-indexed from CustomPagination
      if (currentMenuPath) {
        const query = new URLSearchParams(searchParamsHook.toString());
        query.set("page", String(page + 1)); // URL is 1-indexed
        router.push(`${currentMenuPath}?${query.toString()}`);
      }
    },
    [router, currentMenuPath, searchParamsHook]
  );

  const handlePageSizeChange = useCallback(
    (newPageSize: number) => {
      if (currentMenuPath) {
        const query = new URLSearchParams(searchParamsHook.toString());
        query.set("page", "1"); // Reset to first page
        query.set("size", String(newPageSize));
        router.push(`${currentMenuPath}?${query.toString()}`);
      }
    },
    [router, currentMenuPath, searchParamsHook]
  );

  // awaitedParams가 설정될 때까지 로딩 상태 등을 표시할 수 있음
  if (!awaitedParams || !currentMenuPath || isLoading) {
    // Restore check for awaitedParams
    return (
      <Flex justify="center" align="center" h="100vh">
        <Box
          width="40px"
          height="40px"
          border="4px solid"
          borderColor="blue.500"
          borderTopColor="transparent"
          borderRadius="full"
          animation="spin 1s linear infinite"
        />
      </Flex>
    );
  }

  if (!boardData) {
    // 데이터가 없거나 로드 실패 시 (FOLDER 타입 메뉴 등 포함)
    // 혹은 findMenuByPath에서 menu를 못찾은 경우도 여기에 포함될 수 있도록 notFound() 호출
    // findMenuByPath에서 못찾으면 이미 useEffect에서 notFound() 호출됨
    return (
      <Flex direction="column" justify="center" align="center" h="80vh">
        <Heading mb={4}>게시판 정보를 찾을 수 없습니다.</Heading>
        <Text>
          선택하신 경로에 해당하는 게시판이 없거나 데이터를 불러올 수 없습니다.
        </Text>
        <Text>주소가 올바른지 확인하거나 잠시 후 다시 시도해 주세요.</Text>
        <NextLink href="/" passHref>
          <Button mt={6} colorPalette="teal" size="xs">
            홈으로 가기
          </Button>
        </NextLink>
      </Flex>
    );
  }

  const { pageDetails, posts, pagination } = boardData;
  return (
    <PageContainer>
      {/* Use BoardControls component */}
      <BoardControls
        pageDetails={pageDetails}
        pagination={pagination}
        currentPathId={currentPathId!}
        keywordInput={keywordInput}
        onKeywordChange={setKeywordInput}
        onSearch={handleSearch}
        onClearSearch={handleClearSearch} // Pass the new handler
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        currentKeyword={currentKeyword} // Pass currentKeyword for clear button logic
        requestedPageSize={requestedPageSizeFromUrl} // Pass for clear button
        defaultPageSize={DEFAULT_PAGE_SIZE} // Pass for clear button
      />

      {/* 스킨 렌더링 ... */}
      {(() => {
        switch (pageDetails.boardSkinType) {
          case "BASIC":
            return (
              <BasicBoardSkin
                pageDetails={pageDetails}
                posts={posts}
                currentPathId={currentPathId!}
                viewMode={viewMode}
              />
            );
          case "FAQ":
            return (
              <FaqBoardSkin
                pageDetails={pageDetails}
                posts={posts}
                pagination={pagination}
                currentPathId={currentPathId!}
              />
            );
          case "QNA":
            return (
              <QnaBoardSkin
                pageDetails={pageDetails}
                posts={posts}
                pagination={pagination}
                currentPathId={currentPathId!}
              />
            );
          case "PRESS":
            return (
              <PressBoardSkin
                pageDetails={pageDetails}
                posts={posts}
                pagination={pagination}
                currentPathId={currentPathId!}
                viewMode={viewMode}
              />
            );
          case "FORM":
            return (
              <FormBoardSkin
                pageDetails={pageDetails}
                posts={posts}
                pagination={pagination}
                currentPathId={currentPathId!}
              />
            );
          default:
            console.warn(
              `[BoardPage] Unknown or unsupported boardSkinType: "${pageDetails.boardSkinType}" for menuId: ${pageDetails.menuId}. Falling back to BasicBoardSkin.`
            );
            return (
              <BasicBoardSkin
                pageDetails={pageDetails}
                posts={posts}
                currentPathId={currentPathId!}
                viewMode={viewMode}
              />
            );
        }
      })()}
      {/* Render CustomPagination if boardData and pagination data exist */}
      {boardData &&
        boardData.pagination &&
        boardData.pagination.totalPages > 0 && (
          <Flex justify="center">
            {/* Added mt for spacing */}
            <CustomPagination
              currentPage={boardData.pagination.currentPage - 1} // CustomPagination is 0-indexed
              totalPages={boardData.pagination.totalPages}
              onPageChange={handlePageChange}
              pageSize={boardData.pagination.pageSize}
              onPageSizeChange={handlePageSizeChange}
            />
          </Flex>
        )}
    </PageContainer>
  );
}
