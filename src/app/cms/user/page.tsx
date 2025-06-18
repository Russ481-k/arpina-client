"use client";

import { useState, useEffect, useCallback } from "react";
import { Box, Flex, Heading, Badge } from "@chakra-ui/react";
import { UserGrid } from "./components/UserGrid";
import { UserEditor } from "./components/UserEditor";
import { GridSection } from "@/components/ui/grid-section";
import { useColorModeValue } from "@/components/ui/color-mode";
import { useColors } from "@/styles/theme";
import { toaster } from "@/components/ui/toaster";
import { UserEnrollmentHistoryDto } from "@/types/api";
import { userCmsApi, UserListParams } from "@/lib/api/userCms";
import { AxiosError } from "axios";
import { CustomPagination } from "@/components/common/CustomPagination";
import { CommonGridFilterBar } from "@/components/common/CommonGridFilterBar";
import { UserDetailDialog } from "./components/UserDetailDialog";

const SEARCH_TYPE_OPTIONS = [
  { value: "ALL", label: "전체유형" },
  { value: "username", label: "로그인 ID" },
  { value: "name", label: "이름" },
  { value: "phone", label: "연락처" },
  { value: "lessonTime", label: "강습 시간" },
];

const PAY_STATUS_OPTIONS = [
  { value: "", label: "전체상태" },
  { value: "PAID", label: "결제완료" },
  { value: "REFUNDED", label: "환불" },
  { value: "PARTIALLY_REFUNDED", label: "부분환불" },
  { value: "UNPAID", label: "미결제" },
];

export default function UserManagementPage() {
  const [selectedUser, setSelectedUser] =
    useState<UserEnrollmentHistoryDto | null>(null);
  const [detailedUser, setDetailedUser] =
    useState<UserEnrollmentHistoryDto | null>(null);
  const [users, setUsers] = useState<UserEnrollmentHistoryDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageInfo, setPageInfo] = useState({ totalPages: 1 });

  const [filters, setFilters] = useState({
    searchType: "ALL",
    searchTerm: "",
    payStatus: "",
  });

  const [query, setQuery] = useState<UserListParams>({
    page: 0,
    size: 20,
  });

  const colors = useColors();
  const bg = useColorModeValue(colors.bg, colors.darkBg);
  const headingColor = useColorModeValue(
    colors.text.primary,
    colors.text.primary
  );

  const refreshUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const filteredParams = Object.entries(query).reduce(
        (acc, [key, value]) => {
          if (value !== "" && value !== null && value !== undefined) {
            acc[key as keyof UserListParams] = value;
          }
          return acc;
        },
        {} as Partial<UserListParams>
      );

      const response = await userCmsApi.getUsers(
        filteredParams as UserListParams
      );
      const pageData = response.data.data;
      setUsers(pageData.content);
      setPageInfo({ totalPages: pageData.totalPages });
    } catch (error) {
      console.error("Error fetching users:", error);
      const err = error as AxiosError<{ message?: string }>;
      toaster.create({
        title: "사용자 목록을 불러오는데 실패했습니다.",
        description: err.response?.data?.message,
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    refreshUsers();
  }, [refreshUsers]);

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    const { searchType, searchTerm, payStatus } = filters;
    const newQuery: UserListParams = {
      page: 0,
      size: query.size,
      payStatus,
    };
    if (searchType !== "ALL" && searchTerm) {
      newQuery[
        searchType as keyof Omit<UserListParams, "payStatus" | "page" | "size">
      ] = searchTerm;
    }
    setQuery(newQuery);
  };

  const handlePageChange = (page: number) => {
    setQuery((prev) => ({ ...prev, page }));
  };

  const handlePageSizeChange = (size: number) => {
    setQuery((prev) => ({ ...prev, page: 0, size }));
  };

  const handleAddUser = () => setSelectedUser(null);
  const handleEditUser = (user: UserEnrollmentHistoryDto) =>
    setSelectedUser(user);
  const handleShowDetails = (user: UserEnrollmentHistoryDto) => {
    setDetailedUser(user);
  };
  const handleCloseDetails = () => setDetailedUser(null);

  const handleCloseEditor = () => setSelectedUser(null);

  const handleSubmit = async (userData: Partial<UserEnrollmentHistoryDto>) => {
    try {
      if (selectedUser?.uuid) {
        const updatePayload = {
          name: userData.name,
          phone: userData.phone,
          status: userData.status,
        };
        await userCmsApi.updateUser(selectedUser.uuid, updatePayload);
      } else {
        const createPayload = {
          username: userData.username,
          name: userData.name,
          phone: userData.phone,
        };
        await userCmsApi.createUser(createPayload);
      }
      refreshUsers();
      setSelectedUser(null);
      toaster.create({
        title: selectedUser
          ? "사용자 정보가 수정되었습니다."
          : "사용자가 생성되었습니다.",
        type: "success",
      });
    } catch (error) {
      console.error("Error saving user:", error);
      const err = error as AxiosError<{ message?: string }>;
      toaster.create({
        title: "사용자 저장에 실패했습니다.",
        description: err.response?.data?.message,
        type: "error",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await userCmsApi.deleteUser(userId);
      refreshUsers();
      setSelectedUser(null);
      toaster.create({
        title: "사용자가 삭제되었습니다.",
        type: "success",
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      const err = error as AxiosError<{ message?: string }>;
      toaster.create({
        title: "사용자 삭제에 실패했습니다.",
        description: err.response?.data?.message,
        type: "error",
      });
    }
  };

  const userLayout = [
    { id: "header", x: 0, y: 0, w: 12, h: 1, isStatic: true, isHeader: true },
    {
      id: "userList",
      x: 0,
      y: 1,
      w: 8,
      h: 11,
      title: "사용자 목록",
      subtitle: "등록된 사용자 목록입니다.",
    },
    {
      id: "userEditor",
      x: 8,
      y: 1,
      w: 4,
      h: 11,
      title: "사용자 편집",
      subtitle: "사용자의 상세 정보를 수정할 수 있습니다.",
    },
  ];

  return (
    <Box bg={bg} minH="100vh" w="full" position="relative">
      <Box w="full">
        <GridSection initialLayout={userLayout}>
          <Flex justify="space-between" align="center" h="36px">
            <Flex align="center" gap={2} px={2}>
              <Heading size="lg" color={headingColor} letterSpacing="tight">
                회원 관리
              </Heading>
              <Badge
                bg={useColorModeValue(
                  colors.primary.light,
                  colors.primary.light
                )}
                color={useColorModeValue(
                  colors.primary.default,
                  colors.primary.default
                )}
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
            <CommonGridFilterBar
              searchTerm={filters.searchTerm}
              onSearchTermChange={(e) =>
                handleFilterChange({
                  target: { name: "searchTerm", value: e.target.value },
                } as React.ChangeEvent<HTMLInputElement>)
              }
              onSearchButtonClick={handleSearch}
              onExport={() => {
                /* 엑셀 다운로드 로직 */
              }}
              selectFilters={[
                {
                  id: "payStatus",
                  label: "결제 상태",
                  value: filters.payStatus,
                  onChange: handleFilterChange,
                  options: PAY_STATUS_OPTIONS,
                },
                {
                  id: "searchType",
                  label: "검색 유형",
                  value: filters.searchType,
                  onChange: handleFilterChange,
                  options: SEARCH_TYPE_OPTIONS,
                },
              ]}
            />
            <UserGrid
              users={users}
              onEditUser={handleEditUser}
              onDeleteUser={handleDeleteUser}
              isLoading={isLoading}
              selectedUserId={selectedUser?.uuid}
              onRowSelected={handleShowDetails}
            />
            <CustomPagination
              currentPage={query.page || 0}
              totalPages={pageInfo.totalPages}
              onPageChange={handlePageChange}
              pageSize={query.size || 20}
              onPageSizeChange={handlePageSizeChange}
            />
          </Box>

          <Box>
            <UserEditor
              user={selectedUser}
              onClose={handleCloseEditor}
              onDelete={handleDeleteUser}
              onSubmit={handleSubmit}
            />
          </Box>
        </GridSection>
        <UserDetailDialog
          isOpen={!!detailedUser}
          onClose={handleCloseDetails}
          user={detailedUser}
        />
      </Box>
    </Box>
  );
}
