"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Dialog,
  Portal,
  CloseButton,
  Button,
  Input,
  Box,
  Text,
  Image,
  VStack,
  Icon,
} from "@chakra-ui/react";
import { useDropzone } from "react-dropzone";
import { FiUpload } from "react-icons/fi";
import { ContentBlock } from "@/types/api/content";

interface ImageEditDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (file: File | null, caption: string) => void;
  block: ContentBlock | null;
}

export function ImageEditDialog({
  open,
  onClose,
  onSave,
  block,
}: ImageEditDialogProps) {
  const [caption, setCaption] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (open && block) {
      setCaption(block.content || "");
      // block.fileUrl을 사용하지 않고, 항상 null로 초기화하여
      // 새 파일 업로드 시에만 preview를 사용하도록 보장
      setPreview(null);
      setImageFile(null);
    }
  }, [open, block]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".gif"] },
    multiple: false,
  });

  const handleSave = () => {
    onSave(imageFile, caption);
  };

  const imageUrlFromId = block?.fileId
    ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/cms/file/public/download/${block.fileId}`
    : null;

  // 새로 생성된 로컬 미리보기(preview)가 있으면 최우선으로 사용
  const currentImageSrc = preview || imageUrlFromId;

  console.log(preview);
  console.log(imageUrlFromId);

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(details) => !details.open && onClose()}
      size="xl"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>이미지 블록 수정</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <VStack gap={4}>
                {currentImageSrc && (
                  <Image
                    src={currentImageSrc}
                    alt="이미지 미리보기"
                    maxH="300px"
                    objectFit="contain"
                  />
                )}
                <Box
                  {...getRootProps()}
                  w="full"
                  p={8}
                  border="2px dashed"
                  borderColor={isDragActive ? "blue.500" : "gray.200"}
                  borderRadius="lg"
                  textAlign="center"
                  cursor="pointer"
                  _hover={{ borderColor: "blue.500" }}
                >
                  <input {...getInputProps()} />
                  <Icon as={FiUpload} w={8} h={8} color="gray.400" mb={2} />
                  <Text>
                    {isDragActive
                      ? "이미지를 여기에 놓으세요"
                      : "새 이미지를 드래그하거나 클릭하여 업로드하세요"}
                  </Text>
                </Box>
                <Input
                  placeholder="캡션(대체 텍스트) 입력"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                />
              </VStack>
            </Dialog.Body>
            <Dialog.Footer>
              <Button variant="ghost" onClick={onClose}>
                취소
              </Button>
              <Button colorScheme="blue" onClick={handleSave}>
                저장
              </Button>
            </Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
