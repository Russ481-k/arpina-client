"use client";

import { Box, Text, VStack, HStack, Checkbox } from "@chakra-ui/react";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import { useEffect, useState, useCallback } from "react";
import { useColors } from "@/styles/theme";
import { toaster } from "@/components/ui/toaster";
import { useColorModeValue } from "@/components/ui/color-mode";
import { LuCheck } from "react-icons/lu";

interface Permission {
  id: number;
  name: string;
  description: string;
  isGranted: boolean;
}

interface UserPermissionsProps {
  user?: {
    id: number;
    username: string;
    role: string;
  };
}

export function UserPermissions({ user }: UserPermissionsProps) {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const colors = useColors();
  const textColor = useColorModeValue(colors.text.primary, colors.text.primary);
  const borderColor = useColorModeValue(colors.border, colors.border);

  const fetchPermissions = useCallback(async () => {
    try {
      const response = await fetch(`/api/users/${user?.id}/permissions`);
      if (!response.ok) {
        throw new Error("Failed to fetch permissions");
      }
      const data = await response.json();
      setPermissions(data);
      setSelectedPermissions(
        data.filter((p: Permission) => p.isGranted).map((p: Permission) => p.id)
      );
    } catch (error) {
      console.error("Error fetching permissions:", error);
      toaster.error({
        title: "권한 목록을 불러오는데 실패했습니다.",
        duration: 3000,
      });
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchPermissions();
    }
  }, [user?.id, fetchPermissions]);

  const handlePermissionChange = useCallback(
    async (permissionId: number) => {
      try {
        const response = await fetch(
          `/api/users/${user?.id}/permissions/${permissionId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              isGranted: !selectedPermissions.includes(permissionId),
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update permission");
        }

        setSelectedPermissions((prev) =>
          prev.includes(permissionId)
            ? prev.filter((id) => id !== permissionId)
            : [...prev, permissionId]
        );

        toaster.success({
          title: "권한이 업데이트되었습니다.",
          duration: 3000,
        });
      } catch (error) {
        console.error("Error updating permission:", error);
        toaster.error({
          title: "권한 업데이트에 실패했습니다.",
          duration: 3000,
        });
      }
    },
    [user?.id, selectedPermissions]
  );

  const columnDefs: ColDef[] = [
    {
      field: "name",
      headerName: "권한",
      flex: 1,
      cellStyle: { color: textColor },
      headerStyle: { color: textColor },
    },
    {
      field: "description",
      headerName: "설명",
      flex: 2,
      cellStyle: { color: textColor },
      headerStyle: { color: textColor },
    },
    {
      field: "isGranted",
      headerName: "권한 부여",
      flex: 1,
      cellRenderer: (params: { data: Permission }) => (
        <Checkbox.Root
          checked={selectedPermissions.includes(params.data.id)}
          onCheckedChange={() => handlePermissionChange(params.data.id)}
          colorPalette="blue"
          size="sm"
        >
          <Checkbox.HiddenInput />
          <Checkbox.Control
            borderColor={borderColor}
            bg="transparent"
            _checked={{
              borderColor: "transparent",
              bgGradient: colors.gradient.primary,
              color: "white",
              _hover: {
                opacity: 0.8,
              },
            }}
          >
            <Checkbox.Indicator>
              <LuCheck />
            </Checkbox.Indicator>
          </Checkbox.Control>
        </Checkbox.Root>
      ),
      cellStyle: { display: "flex", alignItems: "center" },
      headerStyle: { color: textColor },
    },
  ];

  return (
    <Box
      p={6}
      borderWidth="1px"
      borderRadius="lg"
      borderColor={borderColor}
      bg="transparent"
    >
      <VStack align="stretch" gap={4}>
        <HStack justify="space-between">
          <Text fontSize="xl" fontWeight="bold" color={textColor}>
            권한 관리
          </Text>
          <Text fontSize="sm" color={textColor}>
            사용자: {user?.username} ({user?.role})
          </Text>
        </HStack>
        <Box
          className="ag-theme-alpine"
          style={
            {
              height: "400px",
              width: "100%",
              "--ag-header-height": "50px",
              "--ag-header-foreground-color": textColor,
              "--ag-header-background-color": "transparent",
              "--ag-odd-row-background-color": "transparent",
              "--ag-even-row-background-color": "transparent",
              "--ag-foreground-color": textColor,
              "--ag-background-color": "transparent",
              "--ag-border-color": borderColor,
            } as React.CSSProperties
          }
        >
          <AgGridReact
            rowData={permissions}
            columnDefs={columnDefs}
            defaultColDef={{
              sortable: true,
              filter: true,
              resizable: true,
            }}
            animateRows={true}
            rowSelection="multiple"
            suppressRowClickSelection={true}
          />
        </Box>
      </VStack>
    </Box>
  );
}
