"use client";

import {
  Badge,
  Image,
  Tabs,
  Link,
  Button,
  Collapsible,
  Box,
  Flex,
  Heading,
  Text,
} from "@chakra-ui/react";
import { SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { MenuList } from "./components/MenuList";
import { MenuEditor } from "./components/MenuEditor";
import { GridSection } from "@/components/ui/grid-section";
import { useColors } from "@/styles/theme";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { toaster, Toaster } from "@/components/ui/toaster";
import { Main } from "@/components/layout/view/Main";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { menuApi, menuKeys, UpdateMenuOrderRequest } from "@/lib/api/menu";

import { sortMenus } from "@/lib/api/menu";
import { Menu } from "@/types/api";
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";

import { Swiper } from "swiper/react";
import { MainMediaDialog } from "./components/MainMediaDialog";

export default function MenuManagementPage() {
  const renderCount = React.useRef(0);
  renderCount.current += 1;

  const queryClient = useQueryClient();
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [parentMenuId, setParentMenuId] = useState<number | null>(null);
  const [tempMenu, setTempMenu] = useState<Menu | null>(null);
  const [loadingMenuId, setLoadingMenuId] = useState<number | null>(null);
  const [forceExpandMenuId, setForceExpandMenuId] = useState<number | null>(
    null
  );

  const [activeSlide, setActiveSlide] = useState(0);
  const colors = useColors();
  const swiperRef = useRef<SwiperType | null>(null);

  const [isMediaDialogOpen, setIsMediaDialogOpen] = useState(false);

  const findParentMenu = useCallback(
    (menus: Menu[], targetId: number): Menu | null => {
      if (targetId === -1) {
        return {
          id: -1,
          name: "전체",
          type: "FOLDER",
          visible: true,
          sortOrder: 0,
          children: menus,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          displayPosition: "HEADER",
          parentId: null,
        };
      }
      for (const menu of menus) {
        if (menu.id === targetId) {
          return menu;
        }
        if (menu.children && menu.children.length > 0) {
          const found = findParentMenu(menu.children, targetId);
          if (found) {
            return found;
          }
        }
      }
      return null;
    },
    []
  );

  // 메뉴 목록 가져오기
  const { data: menuResponse, isLoading: isMenusLoading } = useQuery<Menu[]>({
    queryKey: menuKeys.list(""),
    queryFn: async () => {
      const response = await menuApi.getMenus();
      return response.data.data;
    },
  });

  const menus = React.useMemo(() => {
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

  // 메뉴 순서 업데이트 뮤테이션
  const updateOrderMutation = useMutation({
    mutationFn: menuApi.updateMenuOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menuKeys.lists() });
      toaster.create({
        title: "메뉴 순서가 변경되었습니다.",
        type: "success",
      });
    },
    onError: (error) => {
      console.error("Error updating menu order:", error);
      toaster.create({
        title: "메뉴 순서 변경에 실패했습니다.",
        type: "error",
      });
    },
  });

  // 메뉴 삭제 뮤테이션
  const deleteMutation = useMutation({
    mutationFn: menuApi.deleteMenu,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menuKeys.lists() });
      setSelectedMenu(null);
      toaster.create({
        title: "메뉴가 삭제되었습니다.",
        type: "success",
      });
    },
    onError: (error) => {
      console.error("Error deleting menu:", error);
      toaster.create({
        title: "메뉴 삭제에 실패했습니다.",
        type: "error",
      });
    },
  });

  // 메뉴 저장/업데이트 뮤테이션
  const saveMenuMutation = useMutation({
    mutationFn: (data: {
      id?: number;
      menuData: Omit<Menu, "id" | "createdAt" | "updatedAt">;
    }) => {
      return data.id
        ? menuApi.updateMenu(data.id, data.menuData)
        : menuApi.createMenu(data.menuData);
    },
    onSuccess: (savedMenu) => {
      queryClient.invalidateQueries({ queryKey: menuKeys.lists() });
      setSelectedMenu(savedMenu.data);
      setParentMenuId(savedMenu.data.parentId || null);
      setTempMenu(null);
      toaster.create({
        title: tempMenu ? "메뉴가 생성되었습니다." : "메뉴가 수정되었습니다.",
        type: "success",
      });
    },
    onError: (error) => {
      console.error("Error saving menu:", error);
      toaster.create({
        title: tempMenu
          ? "메뉴 생성에 실패했습니다."
          : "메뉴 수정에 실패했습니다.",
        type: "error",
      });
    },
  });

  const handleMoveMenu = useCallback(
    async (
      draggedId: number,
      targetId: number,
      position: "before" | "after" | "inside"
    ) => {
      try {
        setLoadingMenuId(draggedId);
        const request: UpdateMenuOrderRequest = {
          id: draggedId,
          targetId: targetId === -1 ? null : targetId,
          position: targetId === -1 ? "inside" : position,
        };
        await updateOrderMutation.mutateAsync([request]);
      } finally {
        setLoadingMenuId(null);
      }
    },
    [updateOrderMutation]
  );

  const handleDeleteMenu = useCallback(
    async (menuId: number) => {
      try {
        setLoadingMenuId(menuId);
        if (tempMenu && tempMenu.id === menuId) {
          setTempMenu(null);
        } else {
          await deleteMutation.mutateAsync(menuId);
        }
        const parentMenu = findParentMenu(menus, menuId);
        if (parentMenu) {
          setSelectedMenu(parentMenu);
          setParentMenuId(parentMenu.parentId || null);
          if (parentMenu.type === "FOLDER") {
            setForceExpandMenuId(parentMenu.id);
          }
        }
      } finally {
        setLoadingMenuId(null);
      }
    },
    [deleteMutation, menus, tempMenu, findParentMenu]
  );

  const handleSubmit = useCallback(
    async (menuData: Omit<Menu, "id" | "createdAt" | "updatedAt">) => {
      try {
        const menuId = tempMenu ? undefined : selectedMenu?.id;
        if (menuId !== undefined) {
          setLoadingMenuId(menuId);
        }
        const result = await saveMenuMutation.mutateAsync({
          id: menuId,
          menuData,
        });
        setSelectedMenu(null);
        setTempMenu(null);
      } catch (error) {
        console.error("Error saving menu:", error);
        throw error;
      } finally {
        setLoadingMenuId(null);
      }
    },
    [saveMenuMutation, selectedMenu, tempMenu]
  );

  // 메뉴 목록에 새 메뉴 추가하는 함수
  const addMenuToList = useCallback(
    (newMenu: Menu, targetMenu: Menu | null = null) => {
      if (!targetMenu) {
        return [...menus, newMenu];
      }

      const updateMenuTree = (menuList: Menu[]): Menu[] => {
        return menuList.map((menu) => {
          if (menu.id === targetMenu.id) {
            const updatedChildren = [...(menu.children || [])];
            updatedChildren.push(newMenu);
            return {
              ...menu,
              children: updatedChildren,
            };
          }
          if (menu.children && menu.children.length > 0) {
            return {
              ...menu,
              children: updateMenuTree(menu.children),
            };
          }
          return menu;
        });
      };

      return updateMenuTree(menus);
    },
    [menus]
  );

  // 임시 메뉴 생성 함수
  const handleAddMenu = useCallback(
    (parentMenu: Menu) => {
      const newTempMenu: Menu = {
        id: Date.now(), // 임시 ID
        name: "새 메뉴",
        type: "LINK",
        displayPosition: parentMenu.displayPosition,
        visible: true,
        sortOrder: 0,
        parentId: parentMenu.id,
        children: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setTempMenu(newTempMenu);
      setSelectedMenu(newTempMenu);
      setParentMenuId(parentMenu.id);

      // 임시 메뉴를 메뉴 목록에 추가
      const updatedMenus = [...(menus || [])];
      if (parentMenu.id === -1) {
        // 최상위 메뉴에 추가
        updatedMenus.push(newTempMenu);
      } else {
        // 부모 메뉴의 children에 추가
        const parentIndex = updatedMenus.findIndex(
          (m) => m.id === parentMenu.id
        );
        if (parentIndex !== -1) {
          const parent = updatedMenus[parentIndex];
          if (!parent.children) {
            parent.children = [];
          }
          parent.children.push(newTempMenu);
        }
      }

      // React Query 캐시 업데이트
      queryClient.setQueryData(menuKeys.lists(), updatedMenus);
    },
    [menus, queryClient]
  );

  const handleEditMenu = useCallback(
    (menu: Menu) => {
      if (tempMenu) {
        // 임시 메뉴 수정 중인 경우 경고 모달 표시
        if (window.confirm("새 메뉴 추가가 취소됩니다. 취소하시겠습니까?")) {
          // 임시 메뉴를 메뉴 목록에서 제거
          const updatedMenus =
            menus?.filter((m: Menu) => m.id !== tempMenu.id) || [];
          queryClient.setQueryData(menuKeys.lists(), updatedMenus);

          setTempMenu(null);
          setSelectedMenu(menu);
          setParentMenuId(menu.parentId || null);
        }
      } else {
        setSelectedMenu(menu);
        setParentMenuId(menu.parentId || null);
      }
    },
    [menus, queryClient, tempMenu]
  );

  const handleCloseEditor = useCallback(() => {
    if (tempMenu) {
      // 임시 메뉴인 경우 삭제
      const updatedMenus =
        menus?.filter((m: Menu) => m.id !== tempMenu.id) || [];
      queryClient.setQueryData(menuKeys.lists(), updatedMenus);

      setTempMenu(null);
      setSelectedMenu(menus?.[0] || null);
    } else {
      // 기존 메뉴 편집 중 취소
      setSelectedMenu(null);
    }
  }, [menus, queryClient, tempMenu]);

  const handleCancelConfirm = useCallback(() => {
    setTempMenu(null);
    setSelectedMenu(null);
    setParentMenuId(null);
  }, []);

  const handleCancelCancel = useCallback(() => {
    // Implementation of handleCancelCancel
  }, []);

  // 메인 관리 페이지 레이아웃 정의
  const menuLayout = [
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
      id: "menuList",
      x: 0,
      y: 1,
      w: 3,
      h: 5,
      title: "메뉴 목록",
      subtitle: "드래그 앤 드롭으로 메뉴 순서를 변경할 수 있습니다.",
    },
    {
      id: "menuEditor",
      x: 0,
      y: 6,
      w: 3,
      h: 6,
      title: "메뉴 편집",
      subtitle: "메뉴의 상세 정보를 수정할 수 있습니다.",
    },
    {
      id: "preview",
      x: 3,
      y: 1,
      w: 9,
      h: 11,
      title: "미리보기",
      subtitle: "메뉴 구조의 실시간 미리보기입니다.",
    },
  ];

  // 메뉴 목록이 업데이트될 때 선택된 메뉴를 동기화
  useEffect(() => {
    if (menus?.length > 0) {
      // 임시 메뉴가 없는 경우에만 초기 메뉴 선택
      if (!tempMenu && !selectedMenu) {
        setSelectedMenu(menus[0]);
      }
      // 임시 메뉴가 있는 경우, 해당 메뉴를 계속 선택 상태로 유지
      else if (tempMenu) {
        setSelectedMenu(tempMenu);
      }
    }
  }, [menus, tempMenu, selectedMenu]);

  return (
    <Box bg={colors.bg} minH="100vh" w="full" position="relative">
      <Box w="full">
        <GridSection initialLayout={menuLayout}>
          <Flex justify="space-between" align="center" h="36px">
            <Flex align="center" gap={2} px={2}>
              <Heading
                size="lg"
                color={colors.text.primary}
                letterSpacing="tight"
              >
                메뉴 관리
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
            {/* <Button
              variant="outline"
              colorPalette="purple"
              onClick={() => setIsMediaDialogOpen(true)}
            >
              메인 미디어 관리
            </Button> */}
          </Flex>

          <Box>
            <DndProvider backend={HTML5Backend}>
              <MenuList
                menus={menus}
                onAddMenu={handleAddMenu}
                onEditMenu={handleEditMenu}
                onDeleteMenu={handleDeleteMenu}
                onMoveMenu={handleMoveMenu}
                isLoading={isMenusLoading}
                selectedMenuId={selectedMenu?.id}
                loadingMenuId={loadingMenuId}
                forceExpandMenuId={forceExpandMenuId}
              />
            </DndProvider>
          </Box>

          <Box>
            <MenuEditor
              menu={selectedMenu}
              onClose={handleCloseEditor}
              onDelete={handleDeleteMenu}
              onSubmit={handleSubmit}
              parentId={parentMenuId}
              onAddMenu={() => {
                if (selectedMenu?.type === "FOLDER") {
                  handleAddMenu(selectedMenu);
                } else if (selectedMenu?.parentId) {
                  const parentMenu = findParentMenu(
                    menus,
                    selectedMenu.parentId
                  );
                  if (parentMenu) {
                    handleAddMenu(parentMenu);
                  }
                } else {
                  handleAddMenu({
                    id: -1,
                    name: "전체",
                    type: "FOLDER",
                    visible: true,
                    sortOrder: 0,
                    children: menus,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    displayPosition: "HEADER",
                    parentId: null,
                  });
                }
              }}
              existingMenus={menus}
              isTempMenu={!!tempMenu}
            />
          </Box>

          <Box>
            <Main menus={menus} isPreview={true} currentPage="preview">
              <Box
                as="main"
                id="mainContent"
                pt={100}
                fontFamily="'Paperlogy', sans-serif"
                lineHeight="1"
              >
                <Box className="msec01" mb={"45px"}>
                  <Box w={"100%"} maxW={"1600px"} mx="auto" my={0}>
                    <Heading
                      as="h3"
                      mb={6}
                      fontSize="40px"
                      fontWeight="bold"
                      color={"#444445"}
                      lineHeight={"1"}
                      fontFamily="'Paperlogy', sans-serif"
                    >
                      당신의 새로운 여정이 시작 되는곳
                    </Heading>
                    <Flex className="msec01-box" gap={5}>
                      <Box
                        flex="1 1 0"
                        position="relative"
                        overflow="hidden"
                        className="swiper-container"
                      >
                        <Swiper
                          modules={[
                            Navigation,
                            Pagination,
                            Autoplay,
                            EffectFade,
                          ]}
                          spaceBetween={0}
                          slidesPerView={1}
                          navigation
                          pagination={{ clickable: true }}
                          autoplay={{
                            delay: 3000,
                            disableOnInteraction: false,
                          }}
                          loop={true}
                          effect="fade"
                          fadeEffect={{ crossFade: true }}
                          onSwiper={(swiper) => {
                            swiperRef.current = swiper;
                          }}
                          onSlideChange={(swiper) => {
                            setActiveSlide(swiper.activeIndex);

                            // 모든 슬라이드 컨텐츠에서 active 클래스 제거
                            const allContents =
                              document.querySelectorAll(".slide-content");
                            allContents.forEach((content) => {
                              content.classList.remove("active");
                            });

                            // 현재 활성화된 슬라이드의 컨텐츠에 active 클래스 추가
                            setTimeout(() => {
                              const activeContents = document.querySelectorAll(
                                `.swiper-slide-active .slide-content`
                              );
                              activeContents.forEach((content) => {
                                content.classList.add("active");
                              });
                            }, 50);
                          }}
                        >
                          <SwiperSlide>
                            <Box position="relative" w="100%">
                              <Box
                                className={`slide-content ${
                                  activeSlide === 0 ? "active" : ""
                                }`}
                                position="absolute"
                                bottom="0"
                                left="0"
                              >
                                <Text
                                  py={6}
                                  fontSize="30px"
                                  fontWeight="semibold"
                                  color="#1F2732"
                                >
                                  기억에 남을 완벽한 하루, 아르피나
                                </Text>
                              </Box>
                              <Box position="relative" w="100%">
                                <Image
                                  src="/images/contents/msec01_sld_img01.png"
                                  alt="새로운 여정의 시작"
                                  w="100%"
                                  h="100%"
                                  objectFit="cover"
                                />
                              </Box>
                            </Box>
                          </SwiperSlide>
                        </Swiper>
                      </Box>
                      <Box
                        backgroundColor="#2E3192"
                        borderRadius="20px"
                        w="480px"
                        overflow="hidden"
                      >
                        <Box w="100%" h="100%">
                          <Image
                            src="/images/main/main_0.png"
                            alt="호텔 실시간 예약"
                            w="100%"
                            h="100%"
                            objectFit="cover"
                            cursor="pointer"
                            onClick={() => {
                              window.open(
                                "https://hub.hotelstory.com/aG90ZWxzdG9yeQ/rooms?v_Use=MTAwMTg5MA",
                                "_blank"
                              );
                            }}
                          />
                        </Box>
                      </Box>
                    </Flex>
                  </Box>
                </Box>
                <Text className="mflox-txt">
                  <span>
                    Busan Youth Hostel Arpina Busan Youth Hostel Arpina
                  </span>
                </Text>

                <Box className="msec02" mb={"80px"}>
                  <Box w={"100%"} maxW={"1600px"} mx="auto" my={0}>
                    <Flex gap={5}>
                      <Box flex="1" minW="0">
                        <Heading
                          as="h3"
                          fontSize="40px"
                          fontWeight="bold"
                          color={"#333333"}
                          lineHeight={"1"}
                          fontFamily="'Paperlogy', sans-serif"
                          mb={6}
                        >
                          공지사항
                        </Heading>
                        <Tabs.Root
                          defaultValue="all"
                          colorPalette="purple"
                          variant="subtle"
                        >
                          <Tabs.List
                            borderBottom="0"
                            style={{
                              display: "flex",
                              gap: "20px",
                              marginTop: "-65px",
                              paddingLeft: "160px",
                            }}
                          >
                            <Tabs.Trigger
                              value="all"
                              fontSize="lg"
                              fontWeight="semibold"
                              color="#5F5F5F"
                              transition="all 0.2s"
                              cursor="pointer"
                              _active={{
                                color: "#fff",
                                bg: "#2E3192",
                                borderRadius: "35px",
                              }}
                            >
                              전체
                            </Tabs.Trigger>
                            <Tabs.Trigger
                              value="notice"
                              fontSize="lg"
                              fontWeight="semibold"
                              color="#5F5F5F"
                              transition="all 0.2s"
                              cursor="pointer"
                              _active={{
                                color: "#2E3192",
                                bg: "rgba(46, 49, 146, 0.05)",
                                borderBottom: "2px solid #2E3192",
                              }}
                            >
                              공지
                            </Tabs.Trigger>
                            <Tabs.Trigger
                              value="promotion"
                              fontSize="lg"
                              fontWeight="semibold"
                              color="#5F5F5F"
                              transition="all 0.2s"
                              cursor="pointer"
                              _active={{
                                color: "#2E3192",
                                bg: "rgba(46, 49, 146, 0.05)",
                                borderBottom: "2px solid #2E3192",
                              }}
                            >
                              홍보
                            </Tabs.Trigger>
                            <Tabs.Trigger
                              value="related"
                              fontSize="lg"
                              fontWeight="semibold"
                              color="#5F5F5F"
                              transition="all 0.2s"
                              cursor="pointer"
                              _active={{
                                color: "#2E3192",
                                bg: "rgba(46, 49, 146, 0.05)",
                                borderBottom: "2px solid #2E3192",
                              }}
                            >
                              유관기관홍보
                            </Tabs.Trigger>
                          </Tabs.List>
                          <Tabs.Content value="all">
                            <Box>
                              <Flex
                                className="mnotice-list"
                                flexDirection={"column"}
                                gap={5}
                              >
                                <Link href="..." className="notice-item notice">
                                  <Box as="span" className="notice-cate">
                                    공지
                                  </Box>
                                  <Box as="span" className="notice-title">
                                    23년 및 24년 상,하반기 DBR 선착순 무료 배포
                                    (학생관 105호 취업지원센터)
                                  </Box>
                                  <Box as="span" className="notice-date">
                                    2025.05.29
                                  </Box>
                                </Link>
                                <Link
                                  href="..."
                                  className="notice-item related"
                                >
                                  <Box as="span" className="notice-cate">
                                    유관기관 홍보
                                  </Box>
                                  <Box as="span" className="notice-title">
                                    23년 및 24년 상,하반기 DBR 선착순 무료 배포
                                    (학생관 105호 취업지원센터)
                                  </Box>
                                  <Box as="span" className="notice-date">
                                    2025.05.29
                                  </Box>
                                </Link>
                                <Link
                                  href="..."
                                  className="notice-item promotion"
                                >
                                  <Box as="span" className="notice-cate">
                                    홍보
                                  </Box>
                                  <Box as="span" className="notice-title">
                                    23년 및 24년 상,하반기 DBR 선착순 무료 배포
                                    (학생관 105호 취업지원센터)
                                  </Box>
                                  <Box as="span" className="notice-date">
                                    2025.05.29
                                  </Box>
                                </Link>
                                <Link href="..." className="notice-item notice">
                                  <Box as="span" className="notice-cate">
                                    공지
                                  </Box>
                                  <Box as="span" className="notice-title">
                                    23년 및 24년 상,하반기 DBR 선착순 무료 배포
                                    (학생관 105호 취업지원센터)
                                  </Box>
                                  <Box as="span" className="notice-date">
                                    2025.05.29
                                  </Box>
                                </Link>
                                <Link
                                  href="..."
                                  className="notice-item related"
                                >
                                  <Box as="span" className="notice-cate">
                                    유관기관 홍보
                                  </Box>
                                  <Box as="span" className="notice-title">
                                    23년 및 24년 상,하반기 DBR 선착순 무료 배포
                                    (학생관 105호 취업지원센터)
                                  </Box>
                                  <Box as="span" className="notice-date">
                                    2025.05.29
                                  </Box>
                                </Link>
                              </Flex>
                            </Box>
                          </Tabs.Content>
                          <Tabs.Content value="notice">
                            <Box>
                              <Flex
                                className="mnotice-list"
                                flexDirection={"column"}
                                gap={5}
                              >
                                <Link href="..." className="notice-item notice">
                                  <Box as="span" className="notice-cate">
                                    공지
                                  </Box>
                                  <Box as="span" className="notice-title">
                                    23년 및 24년 상,하반기 DBR 선착순 무료 배포
                                    (학생관 105호 취업지원센터)
                                  </Box>
                                  <Box as="span" className="notice-date">
                                    2025.05.29
                                  </Box>
                                </Link>
                                <Link href="..." className="notice-item notice">
                                  <Box as="span" className="notice-cate">
                                    공지
                                  </Box>
                                  <Box as="span" className="notice-title">
                                    23년 및 24년 상,하반기 DBR 선착순 무료 배포
                                    (학생관 105호 취업지원센터)
                                  </Box>
                                  <Box as="span" className="notice-date">
                                    2025.05.29
                                  </Box>
                                </Link>
                                <Link href="..." className="notice-item notice">
                                  <Box as="span" className="notice-cate">
                                    공지
                                  </Box>
                                  <Box as="span" className="notice-title">
                                    23년 및 24년 상,하반기 DBR 선착순 무료 배포
                                    (학생관 105호 취업지원센터)
                                  </Box>
                                  <Box as="span" className="notice-date">
                                    2025.05.29
                                  </Box>
                                </Link>
                                <Link href="..." className="notice-item notice">
                                  <Box as="span" className="notice-cate">
                                    공지
                                  </Box>
                                  <Box as="span" className="notice-title">
                                    23년 및 24년 상,하반기 DBR 선착순 무료 배포
                                    (학생관 105호 취업지원센터)
                                  </Box>
                                  <Box as="span" className="notice-date">
                                    2025.05.29
                                  </Box>
                                </Link>
                                <Link href="..." className="notice-item notice">
                                  <Box as="span" className="notice-cate">
                                    공지
                                  </Box>
                                  <Box as="span" className="notice-title">
                                    23년 및 24년 상,하반기 DBR 선착순 무료 배포
                                    (학생관 105호 취업지원센터)
                                  </Box>
                                  <Box as="span" className="notice-date">
                                    2025.05.29
                                  </Box>
                                </Link>
                              </Flex>
                            </Box>
                          </Tabs.Content>
                          <Tabs.Content value="promotion">
                            <Box>
                              <Flex
                                className="mnotice-list"
                                flexDirection={"column"}
                                gap={5}
                              >
                                <Link
                                  href="..."
                                  className="notice-item promotion"
                                >
                                  <Box as="span" className="notice-cate">
                                    홍보
                                  </Box>
                                  <Box as="span" className="notice-title">
                                    23년 및 24년 상,하반기 DBR 선착순 무료 배포
                                    (학생관 105호 취업지원센터)
                                  </Box>
                                  <Box as="span" className="notice-date">
                                    2025.05.29
                                  </Box>
                                </Link>
                                <Link
                                  href="..."
                                  className="notice-item promotion"
                                >
                                  <Box as="span" className="notice-cate">
                                    홍보
                                  </Box>
                                  <Box as="span" className="notice-title">
                                    23년 및 24년 상,하반기 DBR 선착순 무료 배포
                                    (학생관 105호 취업지원센터)
                                  </Box>
                                  <Box as="span" className="notice-date">
                                    2025.05.29
                                  </Box>
                                </Link>
                                <Link
                                  href="..."
                                  className="notice-item promotion"
                                >
                                  <Box as="span" className="notice-cate">
                                    홍보
                                  </Box>
                                  <Box as="span" className="notice-title">
                                    23년 및 24년 상,하반기 DBR 선착순 무료 배포
                                    (학생관 105호 취업지원센터)
                                  </Box>
                                  <Box as="span" className="notice-date">
                                    2025.05.29
                                  </Box>
                                </Link>
                                <Link
                                  href="..."
                                  className="notice-item promotion"
                                >
                                  <Box as="span" className="notice-cate">
                                    홍보
                                  </Box>
                                  <Box as="span" className="notice-title">
                                    23년 및 24년 상,하반기 DBR 선착순 무료 배포
                                    (학생관 105호 취업지원센터)
                                  </Box>
                                  <Box as="span" className="notice-date">
                                    2025.05.29
                                  </Box>
                                </Link>
                                <Link
                                  href="..."
                                  className="notice-item promotion"
                                >
                                  <Box as="span" className="notice-cate">
                                    홍보
                                  </Box>
                                  <Box as="span" className="notice-title">
                                    23년 및 24년 상,하반기 DBR 선착순 무료 배포
                                    (학생관 105호 취업지원센터)
                                  </Box>
                                  <Box as="span" className="notice-date">
                                    2025.05.29
                                  </Box>
                                </Link>
                              </Flex>
                            </Box>
                          </Tabs.Content>
                          <Tabs.Content value="related">
                            <Box>
                              <Flex
                                className="mnotice-list"
                                flexDirection={"column"}
                                gap={5}
                              >
                                <Link
                                  href="..."
                                  className="notice-item related "
                                >
                                  <Box as="span" className="notice-cate">
                                    유관기관홍보
                                  </Box>
                                  <Box as="span" className="notice-title">
                                    23년 및 24년 상,하반기 DBR 선착순 무료 배포
                                    (학생관 105호 취업지원센터)
                                  </Box>
                                  <Box as="span" className="notice-date">
                                    2025.05.29
                                  </Box>
                                </Link>
                                <Link
                                  href="..."
                                  className="notice-item related "
                                >
                                  <Box as="span" className="notice-cate">
                                    유관기관홍보
                                  </Box>
                                  <Box as="span" className="notice-title">
                                    23년 및 24년 상,하반기 DBR 선착순 무료 배포
                                    (학생관 105호 취업지원센터)
                                  </Box>
                                  <Box as="span" className="notice-date">
                                    2025.05.29
                                  </Box>
                                </Link>
                                <Link
                                  href="..."
                                  className="notice-item related "
                                >
                                  <Box as="span" className="notice-cate">
                                    유관기관홍보
                                  </Box>
                                  <Box as="span" className="notice-title">
                                    23년 및 24년 상,하반기 DBR 선착순 무료 배포
                                    (학생관 105호 취업지원센터)
                                  </Box>
                                  <Box as="span" className="notice-date">
                                    2025.05.29
                                  </Box>
                                </Link>
                                <Link
                                  href="..."
                                  className="notice-item related "
                                >
                                  <Box as="span" className="notice-cate">
                                    유관기관홍보
                                  </Box>
                                  <Box as="span" className="notice-title">
                                    23년 및 24년 상,하반기 DBR 선착순 무료 배포
                                    (학생관 105호 취업지원센터)
                                  </Box>
                                  <Box as="span" className="notice-date">
                                    2025.05.29
                                  </Box>
                                </Link>
                                <Link
                                  href="..."
                                  className="notice-item related "
                                >
                                  <Box as="span" className="notice-cate">
                                    유관기관홍보
                                  </Box>
                                  <Box as="span" className="notice-title">
                                    23년 및 24년 상,하반기 DBR 선착순 무료 배포
                                    (학생관 105호 취업지원센터)
                                  </Box>
                                  <Box as="span" className="notice-date">
                                    2025.05.29
                                  </Box>
                                </Link>
                              </Flex>
                            </Box>
                          </Tabs.Content>
                        </Tabs.Root>
                      </Box>
                      <Box w="460px" flexShrink={0}>
                        <Heading
                          as="h3"
                          fontSize="40px"
                          fontWeight="bold"
                          color={"#333333"}
                          lineHeight={"1"}
                          fontFamily="'Paperlogy', sans-serif"
                          mb={6}
                        >
                          배너존
                        </Heading>
                        <Box borderRadius="20px" overflow="hidden">
                          <Link href="...">
                            <Image
                              src="/images/contents/msec02_bnr_img01.jpg"
                              alt="부산 유스호스텔 아르피나 배너"
                              w="100%"
                              h="100%"
                              objectFit="cover"
                            />
                          </Link>
                        </Box>
                      </Box>
                    </Flex>
                  </Box>
                </Box>

                <Box className="msec03" mb={"80px"}>
                  <Box w={"100%"} maxW={"1600px"} mx="auto" my={0}>
                    <Box className="mapply-box">
                      <Box position="relative">
                        <Swiper
                          modules={[Navigation, Pagination, Autoplay]}
                          slidesPerView={1}
                          navigation
                          pagination={{ clickable: true }}
                          autoplay={{
                            delay: 3000,
                            disableOnInteraction: false,
                          }}
                          loop={true}
                        >
                          <SwiperSlide>
                            <Box>
                              <Flex
                                alignItems={"center"}
                                justifyContent={"space-between"}
                                mb={4}
                              >
                                <Text
                                  color={"#444445"}
                                  fontSize="40px"
                                  fontWeight="800"
                                >
                                  수영
                                </Text>
                                <Link
                                  href="..."
                                  display={"flex"}
                                  alignItems={"center"}
                                  gap={2}
                                  bg={"#F1F2F3"}
                                  border={"1px solid #F1F2F3"}
                                  borderRadius={"40px"}
                                  px={8}
                                  py={4}
                                  color={"#333"}
                                  fontSize="30px"
                                  fontWeight="500"
                                  _hover={{
                                    backgroundColor: "#fff",
                                    borderColor: "#333",
                                    transition: "all 0.3s ease-in-out",
                                  }}
                                >
                                  수영장 신청 바로가기
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="35"
                                    height="35"
                                    viewBox="0 0 35 35"
                                    fill="none"
                                  >
                                    <path
                                      d="M17.4984 2.91748C25.5484 2.91748 32.0817 9.45081 32.0817 17.5008C32.0817 25.5508 25.5484 32.0841 17.4984 32.0841C9.44837 32.0841 2.91504 25.5508 2.91504 17.5008C2.91504 9.45081 9.44837 2.91748 17.4984 2.91748ZM17.4984 16.0425H11.665V18.9591H17.4984V23.3341L23.3317 17.5008L17.4984 11.6675V16.0425Z"
                                      fill="#333333"
                                    />
                                  </svg>
                                </Link>
                              </Flex>
                              <Box>
                                <Image
                                  borderRadius="50px"
                                  overflow="hidden"
                                  src="/images/contents/mapply_img01.jpg"
                                  alt="수영장이미지"
                                  w="100%"
                                  objectFit="cover"
                                />
                              </Box>
                            </Box>
                          </SwiperSlide>
                        </Swiper>
                      </Box>
                    </Box>
                  </Box>
                </Box>

                <Box className="msec04">
                  <Box w={"100%"} maxW={"1600px"} mx="auto" my={0}>
                    <Box className="mprice-box">
                      <Heading
                        as="h3"
                        fontSize="40px"
                        fontWeight="800"
                        color={"#444445"}
                        lineHeight={"1"}
                        fontFamily="'Paperlogy', sans-serif"
                        mb={6}
                      >
                        <Text as="span">아르피나 단체예약 가견적 산출</Text>
                      </Heading>
                      <Box className="mprice-wr">
                        <Text
                          color="#2E3192"
                          fontSize="xl"
                          fontWeight="500"
                          textAlign="right"
                          mb={4}
                        >
                          가견적과 실제금액은 차이가 있을 수 있습니다.
                        </Text>
                        <Flex
                          className="mprcie-box"
                          backgroundColor="#F7F7F8"
                          borderRadius={"20px"}
                          p={10}
                          flexDirection="column"
                          gap={6}
                        >
                          <Collapsible.Root>
                            <Collapsible.Trigger asChild>
                              <Button
                                variant="outline"
                                size="lg"
                                colorScheme="blue"
                                borderRadius={"20px"}
                                px={10}
                                py={4}
                                width="100%"
                                justifyContent="space-between"
                              >
                                필요한 세미나실을 선택해주세요
                                <Box as="span" ml={2}>
                                  ▼
                                </Box>
                              </Button>
                            </Collapsible.Trigger>
                            <Collapsible.Content>
                              <Box
                                mt={4}
                                p={4}
                                backgroundColor="white"
                                borderRadius="10px"
                              >
                                <Text>
                                  세미나실 선택 옵션들이 여기에 표시됩니다.
                                </Text>
                                {/* 세미나실 선택 옵션들을 여기에 추가 */}
                              </Box>
                            </Collapsible.Content>
                          </Collapsible.Root>

                          <Collapsible.Root>
                            <Collapsible.Trigger asChild>
                              <Button
                                variant="outline"
                                size="lg"
                                colorScheme="blue"
                                borderRadius={"20px"}
                                px={10}
                                py={4}
                                width="100%"
                                justifyContent="space-between"
                              >
                                체크인 날짜 - 체크아웃 날짜를 선택해주세요
                                <Box as="span" ml={2}>
                                  ▼
                                </Box>
                              </Button>
                            </Collapsible.Trigger>
                            <Collapsible.Content>
                              <Box
                                mt={4}
                                p={4}
                                backgroundColor="white"
                                borderRadius="10px"
                              >
                                <Text>
                                  날짜 선택 캘린더가 여기에 표시됩니다.
                                </Text>
                                {/* 날짜 선택 캘린더를 여기에 추가 */}
                              </Box>
                            </Collapsible.Content>
                          </Collapsible.Root>

                          <Collapsible.Root>
                            <Collapsible.Trigger asChild>
                              <Button
                                variant="outline"
                                size="lg"
                                colorScheme="blue"
                                borderRadius={"20px"}
                                px={10}
                                py={4}
                                width="100%"
                                justifyContent="space-between"
                              >
                                날짜 선택 후 필요한 객실을 선택해주세요
                                <Box as="span" ml={2}>
                                  ▼
                                </Box>
                              </Button>
                            </Collapsible.Trigger>
                            <Collapsible.Content>
                              <Box
                                mt={4}
                                p={4}
                                backgroundColor="white"
                                borderRadius="10px"
                              >
                                <Text>
                                  객실 선택 옵션들이 여기에 표시됩니다.
                                </Text>
                                {/* 객실 선택 옵션들을 여기에 추가 */}
                              </Box>
                            </Collapsible.Content>
                          </Collapsible.Root>
                        </Flex>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Main>
          </Box>
        </GridSection>
      </Box>
      <ConfirmDialog
        isOpen={false}
        onClose={handleCancelCancel}
        onConfirm={handleCancelConfirm}
        title="메뉴 추가 취소"
        description="새 메뉴 추가가 취소됩니다. 취소하시겠습니까?"
        confirmText="취소"
        cancelText="계속"
        backdrop="rgba(0, 0, 0, 0.5)"
      />
      <MainMediaDialog
        isOpen={isMediaDialogOpen}
        onClose={() => setIsMediaDialogOpen(false)}
      />
      <Toaster />
    </Box>
  );
}
