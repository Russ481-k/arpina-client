"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  VStack,
  Input,
  Textarea,
  Flex,
  Text,
  Spinner,
  Heading,
} from "@chakra-ui/react";
import { useColorModeValue } from "@/components/ui/color-mode";
import { useColors } from "@/styles/theme";
import { Enterprise } from "../types";
import { CheckIcon, PlusIcon, Trash2Icon } from "lucide-react";
import Image from "next/image";

interface EnterpriseEditorProps {
  enterprise: Enterprise | null;
  onSubmit: (enterpriseData: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isLoading: boolean;
  onAddNew?: () => void; // For add new enterprise functionality
}

export const EnterpriseEditor: React.FC<EnterpriseEditorProps> = ({
  enterprise,
  onSubmit,
  onDelete,
  isLoading,
  onAddNew,
}) => {
  const colors = useColors();
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    name: "",
    description: "",
    representative: "",
    established: "",
    businessType: "",
    detail: "",
    showButton: false,
    image: "",
  });

  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const textColor = useColorModeValue("gray.700", "white");
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const errorColor = useColorModeValue("red.500", "red.300");
  const buttonBg = useColorModeValue(
    colors.primary.default,
    colors.primary.default
  );

  // Reset the form when a new enterprise is selected or set to null for new enterprise
  useEffect(() => {
    if (enterprise) {
      setFormData({
        year: enterprise.year,
        name: enterprise.name,
        description: enterprise.description,
        representative: enterprise.representative || "",
        established: enterprise.established || "",
        businessType: enterprise.businessType || "",
        detail: enterprise.detail || "",
        showButton: enterprise.showButton,
        image: enterprise.image || "",
      });

      // Handle image URL - always use the absolute URL as is
      setCurrentImage(enterprise.image || null);
      setSelectedFile(null);
    } else {
      // Reset form for new enterprise
      setFormData({
        year: new Date().getFullYear(),
        name: "",
        description: "",
        representative: "",
        established: "",
        businessType: "",
        detail: "",
        showButton: false,
        image: "",
      });
      setCurrentImage(null);
      setSelectedFile(null);
    }
    setError(null);
    setIsSubmitting(false);
  }, [enterprise]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "number") {
      setFormData({
        ...formData,
        [name]: parseInt(value, 10) || 0,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.checked,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    // Validate file type and size
    if (file) {
      if (!file.type.includes("image/")) {
        setError("이미지 파일만 업로드할 수 있습니다.");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        setError("이미지 크기는 5MB 이하여야 합니다.");
        return;
      }

      setError(null);

      // Clear previous image data completely
      setFormData({
        ...formData,
        image: "", // Clear the existing image path
      });

      // Set the new file for upload
      setSelectedFile(file);

      // Create preview from the new file
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setCurrentImage(result); // Set the preview image
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    try {
      // Validate form
      if (!formData.name.trim()) {
        setError("기업 이름은 필수 입력 항목입니다.");
        return;
      }

      if (!formData.description.trim()) {
        setError("기업 설명은 필수 입력 항목입니다.");
        return;
      }

      // Clear any previous errors
      setError(null);
      setIsSubmitting(true);

      // Submit data with file
      const submittedData = {
        ...formData,
        imageFile: selectedFile, // Pass the File object directly
      };

      await onSubmit(submittedData);
      setIsSubmitting(false);
    } catch (error) {
      console.error("Error submitting enterprise data:", error);
      setError("기업 정보 저장 중 오류가 발생했습니다.");
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!enterprise?.id) return;
    try {
      await onDelete(enterprise.id);
    } catch (error) {
      console.error("Error deleting enterprise:", error);
      setError("기업 삭제 중 오류가 발생했습니다.");
    }
  };

  const handleNewEnterprise = () => {
    // Call parent handler if provided, otherwise handle locally
    if (onAddNew) {
      onAddNew();
    } else {
      // Reset form for new enterprise
      setFormData({
        year: new Date().getFullYear(),
        name: "",
        description: "",
        representative: "",
        established: "",
        businessType: "",
        detail: "",
        showButton: false,
        image: "",
      });
      setCurrentImage(null);
      setSelectedFile(null);
      setError(null);
    }
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <Box bg={bgColor} borderRadius="md" boxShadow="sm" p={4}>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="md" color={textColor}>
          {enterprise ? "입주기업 수정" : "새 입주기업 추가"}
        </Heading>
        {enterprise ? (
          <Button
            colorScheme="blue"
            size="sm"
            variant="outline"
            onClick={handleNewEnterprise}
          >
            <PlusIcon size={12} style={{ marginRight: "4px" }} />
            입주기업 추가
          </Button>
        ) : (
          <Box />
        )}
      </Flex>

      {error && (
        <Box mb={4} p={3} bg="red.50" color="red.500" borderRadius="md">
          {error}
        </Box>
      )}

      <VStack gap={4} align="stretch">
        <Box>
          <Flex mb={1}>
            <Text fontSize="sm" fontWeight="medium" color={textColor}>
              연도
            </Text>
            <Text fontSize="sm" color={errorColor} ml={1}>
              *
            </Text>
          </Flex>
          <Input
            type="number"
            name="year"
            value={formData.year}
            onChange={handleInputChange}
            placeholder="2023"
            borderColor={error && !formData.year ? errorColor : borderColor}
          />
        </Box>

        <Box>
          <Flex mb={1}>
            <Text fontSize="sm" fontWeight="medium" color={textColor}>
              기업명
            </Text>
            <Text fontSize="sm" color={errorColor} ml={1}>
              *
            </Text>
          </Flex>
          <Input
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="기업명을 입력하세요"
            borderColor={error && !formData.name ? errorColor : borderColor}
          />
        </Box>

        <Box>
          <Flex mb={1}>
            <Text fontSize="sm" fontWeight="medium" color={textColor}>
              간략한 설명
            </Text>
            <Text fontSize="sm" color={errorColor} ml={1}>
              *
            </Text>
          </Flex>
          <Textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="기업에 대한 간략한 설명을 입력하세요"
            resize="vertical"
            borderColor={
              error && !formData.description ? errorColor : borderColor
            }
          />
        </Box>

        <Box>
          <Text fontSize="sm" fontWeight="medium" color={textColor} mb={1}>
            대표자
          </Text>
          <Input
            name="representative"
            value={formData.representative}
            onChange={handleInputChange}
            placeholder="기업 대표자 이름"
          />
        </Box>

        <Box>
          <Text fontSize="sm" fontWeight="medium" color={textColor} mb={1}>
            설립일
          </Text>
          <Input
            type="date"
            name="established"
            value={formData.established}
            onChange={handleInputChange}
          />
        </Box>

        <Box>
          <Text fontSize="sm" fontWeight="medium" color={textColor} mb={1}>
            사업 유형
          </Text>
          <Input
            name="businessType"
            value={formData.businessType}
            onChange={handleInputChange}
            placeholder="사업 유형을 입력하세요"
          />
        </Box>

        <Box>
          <Text fontSize="sm" fontWeight="medium" color={textColor} mb={1}>
            상세 설명
          </Text>
          <Textarea
            name="detail"
            value={formData.detail}
            onChange={handleInputChange}
            placeholder="기업에 대한 상세 설명을 입력하세요"
            resize="vertical"
            minH="100px"
          />
        </Box>

        <Box>
          <Text fontSize="sm" fontWeight="medium" color={textColor} mb={1}>
            기업 이미지
          </Text>
          <Flex mb={2} gap={2}>
            <Button
              onClick={() => fileInputRef.current?.click()}
              colorScheme="blue"
              size="sm"
            >
              이미지 선택
            </Button>
            {currentImage && (
              <Button
                onClick={() => {
                  setCurrentImage(null);
                  setSelectedFile(null);
                  setFormData({
                    ...formData,
                    image: "",
                  });
                }}
                colorScheme="red"
                size="sm"
                variant="outline"
              >
                이미지 제거
              </Button>
            )}
          </Flex>
          <Input
            type="file"
            accept="image/*"
            hidden
            ref={fileInputRef}
            onChange={handleFileChange}
          />

          {currentImage && (
            <Box
              mt={3}
              position="relative"
              maxH="200px"
              overflow="hidden"
              borderRadius="md"
            >
              <Image
                loader={() => currentImage}
                src={currentImage}
                alt="Enterprise preview"
                style={{ maxHeight: "200px", objectFit: "contain" }}
                width={75}
                height={75}
              />
            </Box>
          )}

          <Text fontSize="xs" color="gray.500" mt={1}>
            최대 5MB 크기의 이미지 파일(.jpg, .png, .gif)
          </Text>
        </Box>

        <Box borderTop="1px solid" borderColor={borderColor} pt={4} mt={2} />

        <Flex justify="space-between" gap={2} mt={4}>
          {enterprise ? (
            <Button
              borderColor={colors.accent?.delete?.default || "red.500"}
              color={colors.accent?.delete?.default || "red.500"}
              onClick={handleDelete}
              variant="outline"
              _hover={{
                bg: colors.accent?.delete?.bg || "red.50",
                borderColor: colors.accent?.delete?.hover || "red.600",
                color: colors.accent?.delete?.hover || "red.600",
                transform: "translateY(-1px)",
              }}
              _active={{ transform: "translateY(0)" }}
              transition="all 0.2s ease"
              disabled={isLoading || isSubmitting}
            >
              <Box display="flex" alignItems="center" gap={2} w={4}>
                {isLoading ? <Spinner size="sm" /> : <Trash2Icon size={16} />}
              </Box>
              <Text>삭제</Text>
            </Button>
          ) : (
            <Box />
          )}

          <Flex gap={2}>
            <Button
              bg={buttonBg}
              color="white"
              onClick={handleSubmit}
              _hover={{ bg: colors.primary.hover }}
              _active={{ transform: "translateY(0)" }}
              transition="all 0.2s ease"
              disabled={isLoading || isSubmitting}
            >
              <Box display="flex" alignItems="center" gap={2} w={4}>
                {isSubmitting ? <Spinner size="sm" /> : <CheckIcon size={16} />}
              </Box>
              <Text>{enterprise ? "저장" : "추가하기"}</Text>
            </Button>
          </Flex>
        </Flex>
      </VStack>
    </Box>
  );
};
