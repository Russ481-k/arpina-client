"use client";

import { Box, IconButton } from "@chakra-ui/react";
import { User } from "@/types/api";
import { ICellRendererParams } from "ag-grid-community";
import { EditIcon, DeleteIcon } from "lucide-react";

interface UserActionsCellRendererProps extends ICellRendererParams<User> {
  onEditUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
}

export const UserActionsCellRenderer = (
  props: UserActionsCellRendererProps
) => {
  const { data, onEditUser, onDeleteUser } = props;

  if (!data) {
    return null;
  }

  const handleEdit = () => {
    onEditUser(data);
  };

  const handleDelete = () => {
    onDeleteUser(data.uuid);
  };

  return (
    <Box>
      <IconButton
        aria-label="Edit user"
        size="sm"
        variant="ghost"
        onClick={handleEdit}
      >
        <EditIcon size="16" />
      </IconButton>
      <IconButton
        aria-label="Delete user"
        size="sm"
        variant="ghost"
        colorScheme="red"
        onClick={handleDelete}
      >
        <DeleteIcon size="16" />
      </IconButton>
    </Box>
  );
};
