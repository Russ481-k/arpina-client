"use client";

import { Box, Flex, Text, Spinner } from "@chakra-ui/react";
import { ListItem } from "@/components/ui/list-item";
import { LuUser, LuUserCog } from "react-icons/lu";
import { useColors } from "@/styles/theme";
import { useColorModeValue } from "@/components/ui/color-mode";
import { User } from "../page";

export interface UserListProps {
  users: User[];
  onEditUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  isLoading: boolean;
  selectedUserId?: string;
}

export function UserList({
  users,
  onEditUser,
  onDeleteUser,
  isLoading,
  selectedUserId,
}: UserListProps) {
  const colors = useColors();
  const iconColor = useColorModeValue(
    colors.text.secondary,
    colors.text.secondary
  );
  const adminColor = useColorModeValue(
    colors.primary.default,
    colors.primary.default
  );

  const getUserIcon = (role: string) => {
    const color = role === "ADMIN" ? adminColor : iconColor;
    return (
      <Box color={color}>{role === "ADMIN" ? <LuUserCog /> : <LuUser />}</Box>
    );
  };

  if (isLoading) {
    return (
      <Flex justify="center" align="center" h="200px">
        <Spinner />
      </Flex>
    );
  }

  if (users.length === 0) {
    return (
      <Flex justify="center" align="center" h="200px">
        <Text color="gray.500">등록된 사용자가 없습니다.</Text>
      </Flex>
    );
  }

  return (
    <Box>
      {users.map((user) => (
        <ListItem
          key={user.id}
          id={parseInt(user.id)}
          name={user.username}
          icon={getUserIcon(user.role)}
          isSelected={user.id === selectedUserId}
          onDelete={() => onDeleteUser(user.id)}
          renderBadges={() => user.status === "INACTIVE" && "비활성"}
          renderDetails={() => (
            <Text fontSize="xs" color={colors.text.secondary}>
              {user.email}
            </Text>
          )}
          onClick={() => onEditUser(user)}
        />
      ))}
    </Box>
  );
}
