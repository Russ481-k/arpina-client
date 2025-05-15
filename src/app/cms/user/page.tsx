"use client";

import { useState, useEffect } from "react";
import { Box, Flex, Heading, Badge } from "@chakra-ui/react";
import { Button } from "@/components/ui/button";
import { UserList } from "./components/UserList";
import { UserEditor } from "./components/UserEditor";
import { GridSection } from "@/components/ui/grid-section";
import { useColorModeValue } from "@/components/ui/color-mode";
import { useColors } from "@/styles/theme";
import { getAuthHeader } from "@/lib/auth-utils";
import { toaster } from "@/components/ui/toaster";

export interface User {
  id: string;
  username: string;
  email: string;
  role: "ADMIN" | "USER";
  status: "ACTIVE" | "INACTIVE";
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export default function UserManagementPage() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const colors = useColors();
  const bg = useColorModeValue(colors.bg, colors.darkBg);

  // 테마 색상 적용
  const headingColor = useColorModeValue(
    colors.text.primary,
    colors.text.primary
  );
  const buttonBg = useColorModeValue(
    colors.primary.default,
    colors.primary.default
  );
  const buttonHoverBg = useColorModeValue(
    colors.primary.hover,
    colors.primary.hover
  );

  const badgeBg = useColorModeValue(colors.primary.light, colors.primary.light);
  const badgeColor = useColorModeValue(
    colors.primary.default,
    colors.primary.default
  );

  // 사용자 목록 새로고침 함수
  const refreshUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/cms/users", {
        headers: getAuthHeader(),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toaster.error({
        title: "사용자 목록을 불러오는데 실패했습니다.",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = () => {
    setSelectedUser(null);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
  };

  const handleCloseEditor = () => {
    setSelectedUser(null);
  };

  const handleSubmit = async (
    userData: Omit<User, "id" | "createdAt" | "updatedAt" | "lastLoginAt">
  ) => {
    try {
      const url = selectedUser
        ? `/api/cms/users/${selectedUser.id}`
        : "/api/cms/users";
      const method = selectedUser ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          ...getAuthHeader(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error("Failed to save user");
      }

      await refreshUsers();
      setSelectedUser(null);
      toaster.create({
        title: selectedUser
          ? "사용자 정보가 수정되었습니다."
          : "사용자가 생성되었습니다.",
        type: "success",
      });
    } catch (error) {
      console.error("Error saving user:", error);
      toaster.create({
        title: "사용자 저장에 실패했습니다.",
        type: "error",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/cms/users/${userId}`, {
        method: "DELETE",
        headers: getAuthHeader(),
      });

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      await refreshUsers();
      setSelectedUser(null);
      toaster.create({
        title: "사용자가 삭제되었습니다.",
        type: "success",
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      toaster.create({
        title: "사용자 삭제에 실패했습니다.",
        type: "error",
      });
    }
  };

  // 사용자 관리 페이지 레이아웃 정의
  const userLayout = [
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
      id: "userList",
      x: 0,
      y: 1,
      w: 6,
      h: 11,
      title: "사용자 목록",
      subtitle: "등록된 사용자 목록입니다.",
    },
    {
      id: "userEditor",
      x: 6,
      y: 1,
      w: 6,
      h: 11,
      title: "사용자 편집",
      subtitle: "사용자의 상세 정보를 수정할 수 있습니다.",
    },
  ];

  // 사용자 목록 불러오기
  useEffect(() => {
    refreshUsers();
  }, []);

  return (
    <Box bg={bg} minH="100vh" w="full" position="relative">
      <Box w="full">
        <GridSection initialLayout={userLayout}>
          <Flex justify="space-between" align="center" h="36px">
            <Flex align="center" gap={2} px={2}>
              <Heading size="lg" color={headingColor} letterSpacing="tight">
                사용자 관리
              </Heading>
              <Badge
                bg={badgeBg}
                color={badgeColor}
                px={2}
                py={1}
                borderRadius="md"
                fontSize="xs"
                fontWeight="bold"
              >
                관리자
              </Badge>
            </Flex>
            <Button
              onClick={handleAddUser}
              bg={buttonBg}
              color="white"
              _hover={{ bg: buttonHoverBg, transform: "translateY(-2px)" }}
              _active={{ transform: "translateY(0)" }}
              shadow={colors.shadow.sm}
              transition="all 0.3s ease"
              size="sm"
            >
              새 사용자 추가
            </Button>
          </Flex>

          <Box>
            <UserList
              users={users}
              onEditUser={handleEditUser}
              onDeleteUser={handleDeleteUser}
              isLoading={isLoading}
              selectedUserId={selectedUser?.id}
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
      </Box>
    </Box>
  );
}
