"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Box, Flex, Heading, Badge, Button, Text } from "@chakra-ui/react";
import { EnterpriseEditor } from "./components/EnterpriseEditor";
import { GridSection } from "@/components/ui/grid-section";
import { useColorModeValue } from "@/components/ui/color-mode";
import { useColors } from "@/styles/theme";
import { toaster, Toaster } from "@/components/ui/toaster";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { boardApi, boardKeys } from "@/lib/api/board";
import { Menu, BoardMasterApiResponse, BoardMaster } from "@/types/api";
import { menuApi, menuKeys, sortMenus } from "@/lib/api/menu";
import { enterpriseApi } from "@/lib/api/enterpriseApi";
import { EnterpriseList } from "./components/EnterpriseList";
import {
  Enterprise,
  EnterpriseCreateData,
  EnterpriseUpdateData,
  GetEnterprisesParams,
} from "./types"; // Assuming types.ts is in the same directory
import EnterpriseView from "@/components/layout/view/Enterprise";
import { fileApi } from "@/lib/api/file";
import { HeroSection } from "@/components/sections/HeroSection";
import Layout from "@/components/layout/view/Layout";

// Define query keys for enterprises
const enterpriseKeys = {
  all: ["enterprises"] as const,
  lists: () => [...enterpriseKeys.all, "list"] as const,
  list: (params: GetEnterprisesParams) =>
    [...enterpriseKeys.lists(), params] as const,
  details: () => [...enterpriseKeys.all, "detail"] as const,
  detail: (id: string) => [...enterpriseKeys.details(), id] as const,
};

// TODO: Create these components
const EnterpriseEditorPlaceholder = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}: any) => (
  <Box p={5} borderWidth="1px" borderRadius="md" mt={4}>
    <Heading size="md" mb={4}>
      {initialData ? "Edit Enterprise" : "Create Enterprise"} (Placeholder)
    </Heading>
    <p>Form fields will go here...</p>
    {/* Changed to isPending for mutation status */}
    <Button mt={4} onClick={() => onSubmit({})} loading={isLoading}>
      Submit
    </Button>
    <Button mt={4} ml={2} onClick={onCancel}>
      Cancel
    </Button>
  </Box>
);

export default function EnterpriseManagementPage() {
  const colors = useColors();
  // Old board-related state for top section
  const [selectedEnterpriseMenu, setSelectedEnterpriseMenu] =
    useState<Menu | null>(null);
  const [tempEnterprise, setTempEnterprise] = useState<BoardMaster | null>(
    null
  );
  const [loadingEnterpriseId, setLoadingEnterpriseId] = useState<number | null>(
    null
  );
  const [selectedEnterpriseData, setSelectedEnterpriseData] =
    useState<BoardMaster | null>(null);
  const [drawerMenuId, setDrawerMenuId] = useState<number | null>(null);

  // API enterprise management state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedEnterprise, setSelectedEnterprise] =
    useState<Enterprise | null>(null);
  const [currentYearFilter, setCurrentYearFilter] = useState<
    number | undefined
  >(undefined);

  const bg = useColorModeValue(colors.bg, colors.darkBg);
  const headingColor = useColorModeValue(
    colors.text.primary,
    colors.text.primary
  );

  const queryClient = useQueryClient();

  // 메뉴 목록 가져오기
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

      // API 응답이 배열인 경우
      if (Array.isArray(responseData)) {
        return sortMenus(responseData);
      }

      // API 응답이 객체인 경우 data 필드를 확인
      const menuData = responseData;
      if (!menuData) return [];

      // menuData가 배열인지 확인
      return Array.isArray(menuData) ? sortMenus(menuData) : [menuData];
    } catch (error) {
      console.error("Error processing menu data:", error);
      return [];
    }
  }, [menuResponse]);
  // For the top section - enterprise master data (formerly board data)
  const {
    data: enterpriseMastersResponse,
    isLoading: isEnterpriseMastersLoading,
  } = useQuery<BoardMasterApiResponse>({
    queryKey: boardKeys.all,
    queryFn: async () => {
      const response = await boardApi.getBoardMasters();
      return response.data;
    },
  });

  const enterpriseData: BoardMaster[] = useMemo(() => {
    return enterpriseMastersResponse?.data?.content
      ? enterpriseMastersResponse.data.content.map((master: BoardMaster) => {
          return {
            menuId: master.menuId,
            bbsId: master.bbsId,
            bbsName: master.bbsName,
            skinType: master.skinType,
            readAuth: master.readAuth,
            writeAuth: master.writeAuth,
            adminAuth: master.adminAuth,
            displayYn: master.displayYn,
            sortOrder: master.sortOrder,
            noticeYn: master.noticeYn,
            publishYn: master.publishYn,
            attachmentYn: master.attachmentYn,
            attachmentLimit: master.attachmentLimit,
            attachmentSize: master.attachmentSize,
            createdAt: master.createdAt,
            updatedAt: master.updatedAt,
          };
        })
      : [];
  }, [enterpriseMastersResponse?.data?.content]);

  // Top section mutations (using boardApi)
  const saveEnterpriseMutation = useMutation({
    mutationFn: boardApi.saveBoard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.all });
      toaster.success({
        title: "입주기업이 저장되었습니다.",
      });
      setTempEnterprise(null);
    },
    onError: () => {
      toaster.error({
        title: "입주기업 저장에 실패했습니다.",
      });
    },
  });

  const deleteBoardEnterpriseMutation = useMutation({
    mutationFn: boardApi.deleteBoard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardKeys.all });
      toaster.success({
        title: "입주기업이 삭제되었습니다.",
      });
      setSelectedEnterpriseMenu(null);
    },
    onError: () => {
      toaster.error({
        title: "입주기업 삭제에 실패했습니다.",
      });
    },
  });

  // 입주기업 메뉴 조회
  const { data: enterpriseMenusResponse, isLoading: isEnterpriseMenusLoading } =
    useQuery<Menu[]>({
      queryKey: ["boardMenus"],
      queryFn: async () => {
        const response = await menuApi.getMenusByType("BOARD");
        return response.data.content;
      },
    });

  // 최초 진입 시 첫 번째 입주기업 자동 선택
  useEffect(() => {
    if (
      enterpriseMenusResponse &&
      enterpriseMenusResponse.length > 0 &&
      !selectedEnterpriseMenu
    ) {
      setSelectedEnterpriseMenu(enterpriseMenusResponse[0]);
      // 필요하다면 setSelectedEnterpriseData도 같이 설정
      const enterprise = enterpriseData.find(
        (e) => e.bbsId === enterpriseMenusResponse[0].targetId
      );
      setSelectedEnterpriseData(enterprise || null);
    }
  }, [enterpriseMenusResponse, selectedEnterpriseMenu, enterpriseData]);

  // Top section handlers
  const handleAddEnterpriseData = useCallback(() => {
    setSelectedEnterpriseMenu(null);
    setIsEditorOpen(true);
  }, []);

  const handleEditEnterpriseData = useCallback(
    (enterpriseMenu: Menu, enterprise: BoardMaster | null) => {
      setSelectedEnterpriseMenu(enterpriseMenu);
      setIsEditorOpen(true);
      setSelectedEnterpriseData(enterprise);
    },
    []
  );

  const handleDeleteEnterpriseData = useCallback(
    async (enterpriseId: number) => {
      try {
        setLoadingEnterpriseId(enterpriseId);
        if (tempEnterprise && tempEnterprise.bbsId === enterpriseId) {
          setTempEnterprise(null);
          setSelectedEnterpriseMenu(null);
        } else {
          await deleteBoardEnterpriseMutation.mutateAsync(enterpriseId);
        }
      } finally {
        setLoadingEnterpriseId(null);
      }
    },
    [tempEnterprise, deleteBoardEnterpriseMutation]
  );

  const handleSubmitEnterpriseData = useCallback(
    async (enterpriseData: BoardMaster) => {
      try {
        const enterpriseId = tempEnterprise ? undefined : enterpriseData.bbsId;
        if (enterpriseId !== undefined) {
          setLoadingEnterpriseId(enterpriseId);
        }
        await saveEnterpriseMutation.mutateAsync({
          id: enterpriseId,
          boardData: enterpriseData,
        });
      } finally {
        setLoadingEnterpriseId(null);
      }
    },
    [tempEnterprise, saveEnterpriseMutation]
  );

  // Calculate selectedEnterprisePreview
  const selectedEnterprisePreview = useMemo(() => {
    const foundEnterprise =
      selectedEnterpriseMenu && selectedEnterpriseMenu.targetId
        ? enterpriseData.find(
            (e) => e.bbsId === selectedEnterpriseMenu.targetId
          )
        : null;
    return foundEnterprise;
  }, [selectedEnterpriseMenu, enterpriseData]);

  // Function to invalidate article list query for the selected enterprise
  const refetchArticles = useCallback(() => {
    if (selectedEnterprisePreview?.bbsId && selectedEnterpriseMenu?.id) {
      const keyToInvalidate: (string | number | undefined)[] = [
        "articles",
        selectedEnterprisePreview.bbsId,
        selectedEnterpriseMenu.id,
      ];
      queryClient.invalidateQueries({ queryKey: keyToInvalidate });
    } else {
      // No warning needed if just closing drawer
    }
  }, [queryClient, selectedEnterprisePreview, selectedEnterpriseMenu]);

  // Handler to open the drawer by setting the drawerMenuId
  const handleOpenDrawer = useCallback(() => {
    // Log the state right before checking the id
    if (selectedEnterpriseMenu?.id) {
      setDrawerMenuId(selectedEnterpriseMenu.id);
    } else {
      console.error(
        "[handleOpenDrawer] FAILED. selectedEnterpriseMenu or id is missing:",
        selectedEnterpriseMenu
      );
      toaster.error({
        title: "오류",
        description: "드로워를 열기 위한 메뉴 정보가 없습니다.",
      });
    }
  }, [selectedEnterpriseMenu]);

  // Handler to close the drawer by resetting the drawerMenuId
  const handleCloseDrawer = useCallback(
    (isOpen?: boolean) => {
      const isClosing = isOpen === false || isOpen === undefined;
      if (isClosing) {
        setDrawerMenuId(null);
        refetchArticles();
      }
    },
    [refetchArticles]
  );

  const enterpriseLayout = [
    {
      id: "header",
      x: 0,
      y: 0,
      w: 12,
      h: 1,
      isStatic: true,
      isHeader: true,
    },
    {
      id: "enterpriseList",
      x: 0,
      y: 1,
      w: 3,
      h: 5,
      title: "입주기업 목록",
      subtitle: "등록된 입주기업 목록입니다.",
    },
    {
      id: "enterpriseEditor",
      x: 0,
      y: 6,
      w: 3,
      h: 6,
      title: "입주기업 편집",
      subtitle: "입주기업의 상세 정보를 수정할 수 있습니다.",
    },
    {
      id: "enterprisePreview",
      x: 3,
      y: 1,
      w: 9,
      h: 11,
      title: "입주기업 미리보기",
      subtitle: "입주기업의 미리보기를 확인할 수 있습니다.",
    },
  ];

  // 기업 데이터 조회 - API 기반 기업 목록 (fetch all, no pagination)
  const {
    data: enterprisesResponse,
    isLoading: isEnterprisesLoading,
    isError: isEnterprisesError,
  } = useQuery<any, Error>({
    queryKey: enterpriseKeys.list({
      year: currentYearFilter,
    }),
    queryFn: () =>
      enterpriseApi.getEnterprises({
        year: currentYearFilter,
      }),
    retry: false,
    gcTime: 0,
  });
  const enterprises = enterprisesResponse?.data?.content || [];

  // 모든 데이터 로딩이 완료되었는지 확인
  const isLoading = isEnterpriseMastersLoading || isEnterpriseMenusLoading;

  // API 기반 기업 관리 mutations
  const createEnterpriseMutation = useMutation({
    mutationFn: enterpriseApi.createEnterprise,
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: enterpriseKeys.lists() });
        toaster.success({ title: "기업 정보가 생성되었습니다." });
        setIsEditorOpen(false);
        setSelectedEnterprise(null);
      } else {
        toaster.error({
          title: "생성 실패",
          description:
            response.message || "기업 정보 생성 중 오류가 발생했습니다.",
        });
      }
    },
    onError: (error: any) => {
      toaster.error({
        title: "생성 오류",
        description:
          error.message || "네트워크 오류 또는 서버에서 응답이 없습니다.",
      });
    },
  });

  const updateEnterpriseMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: EnterpriseUpdateData }) =>
      enterpriseApi.updateEnterprise(id, data),
    onSuccess: (response) => {
      if (response.success && response.data) {
        queryClient.invalidateQueries({ queryKey: enterpriseKeys.lists() });
        queryClient.invalidateQueries({
          queryKey: enterpriseKeys.detail(response.data.id),
        });
        toaster.success({ title: "기업 정보가 수정되었습니다." });
        setIsEditorOpen(false);
        setSelectedEnterprise(null);
      } else {
        toaster.error({
          title: "수정 실패",
          description:
            response.message || "기업 정보 수정 중 오류가 발생했습니다.",
        });
      }
    },
    onError: (error: any) => {
      toaster.error({
        title: "수정 오류",
        description:
          error.message || "네트워크 오류 또는 서버에서 응답이 없습니다.",
      });
    },
  });

  const deleteEnterpriseMutation = useMutation({
    mutationFn: enterpriseApi.deleteEnterprise,
    onSuccess: (response, deletedId) => {
      if (response.success) {
        // Immediately refresh all enterprise data
        queryClient.refetchQueries({ queryKey: enterpriseKeys.lists() });
        queryClient.removeQueries({
          queryKey: enterpriseKeys.detail(deletedId),
        });

        // Refresh the data used by the enterprise view component
        queryClient.refetchQueries({ queryKey: ["enterprises"] });
        const currentYear = new Date().getFullYear();
        queryClient.refetchQueries({ queryKey: ["enterprises", currentYear] });

        toaster.success({ title: "기업 정보가 삭제되었습니다." });
        if (selectedEnterprise?.id === deletedId) {
          setSelectedEnterprise(null);
          setIsEditorOpen(false);
        }
      } else {
        toaster.error({
          title: "삭제 실패",
          description:
            response.message || "기업 정보 삭제 중 오류가 발생했습니다.",
        });
      }
    },
    onError: (error: any) => {
      toaster.error({
        title: "삭제 오류",
        description:
          error.message || "네트워크 오류 또는 서버에서 응답이 없습니다.",
      });
    },
  });

  // API 기반 기업 관리 handlers
  const handleAddEnterprise = useCallback(() => {
    setSelectedEnterprise(null);
    setIsEditorOpen(true);
  }, []);

  const handleEditEnterprise = useCallback((enterprise: Enterprise) => {
    setSelectedEnterprise(enterprise);
    setIsEditorOpen(true);
  }, []);

  const handleDeleteEnterprise = useCallback(
    async (id: string) => {
      try {
        await deleteEnterpriseMutation.mutateAsync(id);

        // Force immediate refetch of all enterprise data
        queryClient.refetchQueries({ queryKey: enterpriseKeys.lists() });

        // Also refetch the queries used by the preview component
        queryClient.refetchQueries({ queryKey: ["enterprises"] });
        const currentYear = new Date().getFullYear();
        queryClient.refetchQueries({ queryKey: ["enterprises", currentYear] });

        // If the deleted enterprise was selected, reset the editor
        if (selectedEnterprise?.id === id) {
          setSelectedEnterprise(null);
        }
      } catch (error) {
        console.error("Error deleting enterprise from list:", error);
      }
    },
    [deleteEnterpriseMutation, queryClient, selectedEnterprise]
  );

  const handleSubmitEnterprise = useCallback(
    async (data: EnterpriseCreateData | EnterpriseUpdateData) => {
      if (selectedEnterprise) {
        await updateEnterpriseMutation.mutateAsync({
          id: selectedEnterprise.id,
          data: data as EnterpriseUpdateData,
        });
      } else {
        await createEnterpriseMutation.mutateAsync(
          data as EnterpriseCreateData
        );
      }
    },
    [selectedEnterprise, createEnterpriseMutation, updateEnterpriseMutation]
  );

  const handleCancelEdit = useCallback(() => {
    setIsEditorOpen(false);
    setSelectedEnterprise(null);
  }, []);

  const handleYearFilterChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const year = event.target.value ? parseInt(event.target.value) : undefined;
    setCurrentYearFilter(year);
  };

  // Mock years for filter
  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - i);
  }, []);

  // 기업 저장 핸들러 수정
  const handleSaveEnterprise = useCallback(
    async (
      enterpriseData: Omit<
        Enterprise,
        "id" | "createdAt" | "updatedAt" | "createdBy" | "updatedBy"
      > & {
        imageFile?: File | null; // 추가: 이미지 파일 객체
      }
    ) => {
      try {
        // 이미지 파일이 있으면 먼저 업로드
        let finalEnterpriseData = { ...enterpriseData };

        // imageFile 속성 제거 (API에 전송하지 않기 위해)
        const { imageFile, ...dataWithoutImageFile } = finalEnterpriseData;
        finalEnterpriseData = dataWithoutImageFile;

        if (imageFile) {
          // 모듈 ID 설정 (기존 기업의 경우 ID, 새 기업의 경우 0)
          const moduleId = selectedEnterprise?.id
            ? parseInt(selectedEnterprise.id)
            : 0;

          try {
            // 파일 업로드 API 호출
            const response = await fileApi.upload(
              imageFile,
              "ENTERPRISE",
              moduleId
            );

            if (response.data && response.data.length > 0) {
              // 업로드 성공 시 이미지 URL 설정
              const fileData = response.data[0];
              // Use consistent format for the image URL
              finalEnterpriseData.image = `${
                process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
              }/api/v1/cms/file/public/view/${fileData.fileId}`;
            }
          } catch (error) {
            console.error("File upload error:", error);
            toaster.error({
              title: "이미지 업로드 실패",
              description: "이미지 업로드 중 오류가 발생했습니다.",
            });
            return; // 파일 업로드 실패 시 기업 데이터 저장하지 않음
          }
        }

        if (selectedEnterprise) {
          // 기존 기업 수정
          await updateEnterpriseMutation.mutateAsync({
            id: selectedEnterprise.id,
            data: finalEnterpriseData as EnterpriseUpdateData,
          });
          toaster.success({
            title: "수정 완료",
            description: `'${finalEnterpriseData.name}' 기업 정보가 수정되었습니다.`,
          });
        } else {
          // 새 기업 생성
          await createEnterpriseMutation.mutateAsync(
            finalEnterpriseData as EnterpriseCreateData
          );
          toaster.success({
            title: "등록 완료",
            description: `'${finalEnterpriseData.name}' 기업이 등록되었습니다.`,
          });
        }

        // Force immediate refetch of all enterprise data to update list, editor and preview
        queryClient.refetchQueries({ queryKey: enterpriseKeys.lists() });
        queryClient.refetchQueries({ queryKey: enterpriseKeys.all });
        queryClient.refetchQueries({ queryKey: ["boardMenus"] });

        // Explicitly refetch the enterprise queries used by the preview component
        queryClient.refetchQueries({ queryKey: ["enterprises"] });
        const currentYear = new Date().getFullYear();
        queryClient.refetchQueries({
          queryKey: ["enterprises", currentYear],
        });

        // 편집 상태 초기화
        setIsEditorOpen(false);
        setSelectedEnterprise(null);
      } catch (error) {
        console.error("Error saving enterprise:", error);
        toaster.error({
          title: "저장 실패",
          description: "기업 정보 저장 중 오류가 발생했습니다.",
        });
      }
    },
    [
      selectedEnterprise,
      updateEnterpriseMutation,
      createEnterpriseMutation,
      setIsEditorOpen,
      setSelectedEnterprise,
      queryClient,
    ]
  );

  // Handler for the delete button in the editor
  const handleRemoveEnterprise = useCallback(
    async (id: string) => {
      try {
        await deleteEnterpriseMutation.mutateAsync(id);

        // Force immediate refetch of all enterprise data
        queryClient.refetchQueries({ queryKey: enterpriseKeys.lists() });
        queryClient.refetchQueries({ queryKey: ["enterprises"] });

        // Force refetch the year-specific query used by the preview
        const currentYear = new Date().getFullYear();
        queryClient.refetchQueries({ queryKey: ["enterprises", currentYear] });

        toaster.success({
          title: "삭제 완료",
          description: "기업 정보가 삭제되었습니다.",
        });

        // Reset editor state
        setSelectedEnterprise(null);
        setIsEditorOpen(false);
      } catch (error) {
        console.error("Error deleting enterprise:", error);
        toaster.error({
          title: "삭제 실패",
          description: "기업 정보 삭제 중 오류가 발생했습니다.",
        });
      }
    },
    [
      deleteEnterpriseMutation,
      queryClient,
      setSelectedEnterprise,
      setIsEditorOpen,
    ]
  );

  const handleAddEnterpriseClick = useCallback(() => {
    setSelectedEnterprise(null);
    setIsEditorOpen(true);
  }, []);

  if (isLoading) {
    return (
      <Box
        p={4}
        display="flex"
        justifyContent="center"
        alignItems="center"
        minH="100vh"
      >
        <Box
          width="40px"
          height="40px"
          border="4px solid"
          borderColor="blue.500"
          borderTopColor="transparent"
          borderRadius="full"
          animation="spin 1s linear infinite"
        />{" "}
      </Box>
    );
  }

  if (isEnterprisesError) {
    return (
      <Box p={4}>
        <Heading size="lg" color={colors.text.secondary || "red.500"} mb={4}>
          오류 발생
        </Heading>
        <Text>
          데이터를 불러오는 중 문제가 발생했습니다. 나중에 다시 시도해주세요.
        </Text>
      </Box>
    );
  }

  return (
    <Box bg={bg} minH="100vh" w="full" position="relative">
      <Box w="full">
        <GridSection initialLayout={enterpriseLayout}>
          <Flex justify="space-between" align="center" h="36px">
            <Flex align="center" gap={2} px={2}>
              <Heading size="lg" color={headingColor} letterSpacing="tight">
                입주기업 관리
              </Heading>
              <Badge
                bg={colors.secondary.light}
                color={colors.secondary.default}
                px={2}
                py={1}
                borderRadius="md"
                fontSize="xs"
                fontWeight="bold"
              >
                관리자
              </Badge>
            </Flex>
          </Flex>

          <Box>
            <EnterpriseList
              enterprises={enterprises}
              onAddEnterprise={handleAddEnterprise}
              onEditEnterprise={handleEditEnterprise}
              onDeleteEnterprise={handleDeleteEnterprise}
              isLoading={isEnterprisesLoading}
              selectedEnterpriseMenuId={selectedEnterprise?.id}
              loadingEnterpriseId={
                deleteEnterpriseMutation.isPending
                  ? selectedEnterprise?.id ?? null
                  : null
              }
            />
          </Box>
          <Box id="enterpriseEditor" position="relative">
            <EnterpriseEditor
              enterprise={selectedEnterprise}
              onSubmit={handleSaveEnterprise}
              onDelete={handleRemoveEnterprise}
              onAddNew={handleAddEnterpriseClick}
              isLoading={
                createEnterpriseMutation.isPending ||
                updateEnterpriseMutation.isPending ||
                deleteEnterpriseMutation.isPending
              }
            />
          </Box>
          <Box id="enterprisePreview" position="relative">
            <Layout currentPage="입주현황" isPreview menus={menus}>
              <HeroSection
                slideContents={[
                  {
                    title: "입주현황",
                    header: "입주기업소개",
                    image: "/images/enterprise/sub_visual.png",
                    breadcrumbBorderColor: "#4CCEC6",
                    breadcrumb: [
                      { label: "홈", url: "/" },
                      { label: "자료실", url: "/enterprise/apply" },
                    ],
                  },
                ]}
              />
              <EnterpriseView />
            </Layout>
          </Box>
        </GridSection>
      </Box>

      <Toaster />
    </Box>
  );
}
