"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Button,
  VStack,
  Text,
  Input,
  Select,
  Portal,
  createListCollection,
  Field,
} from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import { useColors } from "@/styles/theme";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { User } from "../page";
import { toaster } from "@/components/ui/toaster";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface UserEditorProps {
  user?: User | null;
  onClose: () => void;
  onDelete?: (userId: string) => void;
  onSubmit: (
    userData: Omit<User, "id" | "createdAt" | "updatedAt" | "lastLoginAt">
  ) => void;
}

const userSchema = z.object({
  username: z.string().min(1, "사용자명을 입력해주세요."),
  email: z.string().email("올바른 이메일 주소를 입력해주세요."),
  role: z.enum(["ADMIN", "USER"]),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

type UserFormData = z.infer<typeof userSchema>;

const roleOptions = createListCollection({
  items: [
    { label: "관리자", value: "ADMIN" },
    { label: "일반 사용자", value: "USER" },
  ],
});

const statusOptions = createListCollection({
  items: [
    { label: "활성", value: "ACTIVE" },
    { label: "비활성", value: "INACTIVE" },
  ],
});

export function UserEditor({
  user,
  onClose,
  onDelete,
  onSubmit,
}: UserEditorProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: user?.username || "",
      email: user?.email || "",
      role: user?.role || "USER",
      status: user?.status || "ACTIVE",
    },
  });

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (user) {
      reset({
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
      });
    } else {
      reset({
        username: "",
        email: "",
        role: "USER",
        status: "ACTIVE",
      });
    }
  }, [user, reset]);

  const colors = useColors();
  const borderColor = useColorModeValue(colors.border, colors.border);
  const textColor = useColorModeValue(colors.text.primary, colors.text.primary);
  const errorColor = useColorModeValue("red.500", "red.300");
  const buttonBg = useColorModeValue(
    colors.primary.default,
    colors.primary.default
  );

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (onDelete && user) {
      onDelete(user.id);
    }
    setIsDeleteDialogOpen(false);
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
  };

  const handleFormSubmit = async (data: UserFormData) => {
    try {
      onSubmit(data);
      onClose();
    } catch (error) {
      console.error("Error saving user:", error);
      toaster.error({
        title: "사용자 저장 중 오류가 발생했습니다.",
        duration: 3000,
      });
    }
  };

  if (!user && !onDelete) {
    return (
      <Flex
        direction="column"
        align="center"
        justify="center"
        h="full"
        gap={4}
        p={8}
        color={textColor}
      >
        <Text fontSize="lg" fontWeight="medium" textAlign="center">
          사용자를 선택하거나 새 사용자를 추가하세요.
        </Text>
      </Flex>
    );
  }

  return (
    <>
      <Box>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <VStack gap={3} align="stretch">
            <Box>
              <Flex mb={1}>
                <Text fontSize="sm" fontWeight="medium" color={textColor}>
                  사용자명
                </Text>
                <Text fontSize="sm" color={errorColor} ml={1}>
                  *
                </Text>
              </Flex>
              <Controller
                name="username"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    borderColor={errors.username ? errorColor : borderColor}
                    color={textColor}
                    bg="transparent"
                  />
                )}
              />
              {errors.username && (
                <Text color={errorColor} fontSize="sm" mt={1}>
                  {errors.username.message}
                </Text>
              )}
            </Box>

            <Box>
              <Flex mb={1}>
                <Text fontSize="sm" fontWeight="medium" color={textColor}>
                  이메일
                </Text>
                <Text fontSize="sm" color={errorColor} ml={1}>
                  *
                </Text>
              </Flex>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    borderColor={errors.email ? errorColor : borderColor}
                    color={textColor}
                    bg="transparent"
                  />
                )}
              />
              {errors.email && (
                <Text color={errorColor} fontSize="sm" mt={1}>
                  {errors.email.message}
                </Text>
              )}
            </Box>

            <Box>
              <Flex mb={1}>
                <Text fontSize="sm" fontWeight="medium" color={textColor}>
                  권한
                </Text>
                <Text fontSize="sm" color={errorColor} ml={1}>
                  *
                </Text>
              </Flex>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Field.Root invalid={!!errors.role}>
                    <Select.Root
                      name={field.name}
                      value={[field.value]}
                      onValueChange={({ value }) => field.onChange(value[0])}
                      onInteractOutside={() => field.onBlur()}
                      collection={roleOptions}
                    >
                      <Select.HiddenSelect />
                      <Select.Control>
                        <Select.Trigger
                          borderColor={errors.role ? errorColor : borderColor}
                          color={textColor}
                          bg="transparent"
                        >
                          <Select.ValueText />
                        </Select.Trigger>
                        <Select.IndicatorGroup>
                          <Select.Indicator />
                        </Select.IndicatorGroup>
                      </Select.Control>
                      <Portal>
                        <Select.Positioner>
                          <Select.Content>
                            {roleOptions.items.map((option) => (
                              <Select.Item key={option.value} item={option}>
                                {option.label}
                                <Select.ItemIndicator />
                              </Select.Item>
                            ))}
                          </Select.Content>
                        </Select.Positioner>
                      </Portal>
                    </Select.Root>
                    {errors.role && (
                      <Field.ErrorText>{errors.role.message}</Field.ErrorText>
                    )}
                  </Field.Root>
                )}
              />
            </Box>

            <Box>
              <Flex mb={1}>
                <Text fontSize="sm" fontWeight="medium" color={textColor}>
                  상태
                </Text>
                <Text fontSize="sm" color={errorColor} ml={1}>
                  *
                </Text>
              </Flex>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Field.Root invalid={!!errors.status}>
                    <Select.Root
                      name={field.name}
                      value={[field.value]}
                      onValueChange={({ value }) => field.onChange(value[0])}
                      onInteractOutside={() => field.onBlur()}
                      collection={statusOptions}
                    >
                      <Select.HiddenSelect />
                      <Select.Control>
                        <Select.Trigger
                          borderColor={errors.status ? errorColor : borderColor}
                          color={textColor}
                          bg="transparent"
                        >
                          <Select.ValueText />
                        </Select.Trigger>
                        <Select.IndicatorGroup>
                          <Select.Indicator />
                        </Select.IndicatorGroup>
                      </Select.Control>
                      <Portal>
                        <Select.Positioner>
                          <Select.Content>
                            {statusOptions.items.map((option) => (
                              <Select.Item key={option.value} item={option}>
                                {option.label}
                                <Select.ItemIndicator />
                              </Select.Item>
                            ))}
                          </Select.Content>
                        </Select.Positioner>
                      </Portal>
                    </Select.Root>
                    {errors.status && (
                      <Field.ErrorText>{errors.status.message}</Field.ErrorText>
                    )}
                  </Field.Root>
                )}
              />
            </Box>

            <Flex justify="space-between" mt={4}>
              {user ? (
                <Button
                  borderColor={colors.accent.delete.default}
                  color={colors.accent.delete.default}
                  onClick={handleDelete}
                  variant="outline"
                  _hover={{
                    bg: colors.accent.delete.bg,
                    borderColor: colors.accent.delete.hover,
                    color: colors.accent.delete.hover,
                    transform: "translateY(-1px)",
                  }}
                  _active={{ transform: "translateY(0)" }}
                  transition="all 0.2s ease"
                >
                  삭제
                </Button>
              ) : (
                <Box />
              )}
              <Flex gap={2}>
                <Button
                  borderColor={borderColor}
                  color={textColor}
                  onClick={onClose}
                  variant="outline"
                  _hover={{ bg: colors.secondary.hover }}
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  bg={buttonBg}
                  color="white"
                  _hover={{ bg: colors.primary.hover }}
                >
                  저장
                </Button>
              </Flex>
            </Flex>
          </VStack>
        </form>
      </Box>
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="사용자 삭제"
        description="정말로 이 사용자를 삭제하시겠습니까?"
        confirmText="삭제"
        cancelText="취소"
        backdrop="rgba(0, 0, 0, 0.5)"
      />
    </>
  );
}
