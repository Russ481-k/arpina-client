"use client";

import { useState } from "react";
import {
  Box,
  Flex,
  Button,
  VStack,
  Text,
  Input,
  Select,
  IconButton,
  HStack,
  Separator,
  useDisclosure,
  Portal,
  createListCollection,
  Checkbox,
} from "@chakra-ui/react";

import { LuPlus, LuTrash2, LuPencil, LuCheck } from "react-icons/lu";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Content, VisionSection } from "../types";
import dynamic from "next/dynamic";
import { SectionEditDialog } from "./editor/SectionEditDialog";

const LexicalEditor = dynamic(() => import("./editor/LexicalEditor"), {
  ssr: false,
});

const contentSchema = z.object({
  name: z.string().min(1, "제목을 입력해주세요"),
  description: z.string(),
  type: z.enum(["page", "vision", "news", "notice"]),
  content: z.string(),
  visible: z.boolean(),
  sections: z
    .array(
      z.object({
        title: z.string(),
        content: z.string(),
        type: z.enum(["text", "quote", "list"]),
        items: z.array(z.string()).optional(),
      })
    )
    .optional(),
  settings: z.object({
    layout: z.enum(["default", "wide", "full"]),
    showThumbnail: z.boolean(),
    showTags: z.boolean(),
    showDate: z.boolean(),
    showAuthor: z.boolean(),
    showRelatedContent: z.boolean(),
    showTableOfContents: z.boolean(),
  }),
  metadata: z
    .object({
      author: z.string().optional(),
      position: z.string().optional(),
      department: z.string().optional(),
      contact: z.string().optional(),
    })
    .optional(),
});

type ContentFormData = z.infer<typeof contentSchema> & {
  visible: boolean;
};

interface ContentEditorProps {
  content?: Content | null;
  onClose: () => void;
  onDelete?: (contentId: number) => void;
  onSubmit: (content: Omit<Content, "id" | "createdAt" | "updatedAt">) => void;
}

export function ContentEditor({
  content,
  onClose,
  onDelete,
  onSubmit,
}: ContentEditorProps) {
  const { open, onOpen, onClose: onCloseModal } = useDisclosure();
  const [selectedSection, setSelectedSection] = useState<VisionSection | null>(
    null
  );

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<ContentFormData>({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      name: content?.name || "",
      description: content?.description || "",
      type: content?.type || "page",
      content: content?.content || "",
      visible: content?.visible ?? true,
      sections: content?.sections || [],
      settings: content?.settings || {
        layout: "default",
        showThumbnail: true,
        showTags: true,
        showDate: true,
        showAuthor: true,
        showRelatedContent: true,
        showTableOfContents: true,
      },
      metadata: content?.metadata || {
        author: "",
        position: "",
        department: "",
        contact: "",
      },
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "sections",
  });

  const handleAddSection = () => {
    append({
      title: "",
      content: "",
      type: "text",
      items: [],
    });
  };

  const handleEditSection = (section: VisionSection) => {
    setSelectedSection(section);
    onOpen();
  };

  const handleSaveSection = (section: VisionSection) => {
    if (selectedSection) {
      const index = fields.findIndex((f) => f.id === selectedSection.id);
      if (index !== -1) {
        fields[index] = { ...section, id: fields[index].id };
      }
    } else {
      append(section);
    }
    onCloseModal();
  };

  const handleFormSubmit = (data: ContentFormData) => {
    onSubmit({
      ...data,
      title: data.name,
      status: data.visible ? "PUBLISHED" : "DRAFT",
      displayPosition: content?.displayPosition || "0",
      visible: data.visible,
      sortOrder: content?.sortOrder || 0,
    });
  };

  return (
    <Box p={4}>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <VStack gap={4} align="stretch">
          <Box>
            <Text mb={2}>제목</Text>
            <Input {...register("name")} />
            {errors.name && (
              <Text color="red.500" fontSize="sm">
                {errors.name.message}
              </Text>
            )}
          </Box>

          <Box>
            <Text mb={2}>설명</Text>
            <Input {...register("description")} />
          </Box>

          <Box>
            <Select.Root
              variant="outline"
              collection={createListCollection({
                items: [
                  { value: "page", label: "일반 페이지" },
                  { value: "vision", label: "비전 및 목표" },
                  { value: "news", label: "뉴스" },
                  { value: "notice", label: "공지사항" },
                ],
              })}
            >
              <Select.HiddenSelect />
              <Select.Label>컨텐츠 유형</Select.Label>
              <Select.Control>
                <Select.Trigger>
                  <Select.ValueText placeholder="Select type" />
                </Select.Trigger>
                <Select.IndicatorGroup>
                  <Select.Indicator />
                </Select.IndicatorGroup>
              </Select.Control>
              <Portal>
                <Select.Positioner>
                  <Select.Content>
                    {[
                      { value: "page", label: "일반 페이지" },
                      { value: "vision", label: "비전 및 목표" },
                      { value: "news", label: "뉴스" },
                      { value: "notice", label: "공지사항" },
                    ].map((type) => (
                      <Select.Item item={type} key={type.value}>
                        {type.label}
                        <Select.ItemIndicator />
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Positioner>
              </Portal>
            </Select.Root>
          </Box>

          {watch("type") === "vision" && (
            <Box>
              <Flex justify="space-between" align="center" mb={2}>
                <Text>섹션</Text>
                <IconButton
                  aria-label="섹션 추가"
                  size="sm"
                  onClick={handleAddSection}
                >
                  <LuPlus />
                </IconButton>
              </Flex>
              <VStack gap={2} align="stretch">
                {fields.map((field, index) => (
                  <Box key={field.id} p={4} borderWidth={1} borderRadius="md">
                    <Flex justify="space-between" align="center" mb={2}>
                      <Text fontWeight="bold">
                        {field.title || "제목 없음"}
                      </Text>
                      <HStack>
                        <IconButton
                          aria-label="섹션 수정"
                          size="sm"
                          onClick={() => handleEditSection(field)}
                        >
                          <LuPencil />
                        </IconButton>
                        <IconButton
                          aria-label="섹션 삭제"
                          size="sm"
                          onClick={() => remove(index)}
                        >
                          <LuTrash2 />
                        </IconButton>
                      </HStack>
                    </Flex>
                    <Text>{field.content}</Text>
                  </Box>
                ))}
              </VStack>
            </Box>
          )}

          <Box>
            <Controller
              name="content"
              control={control}
              render={({ field }) => (
                <LexicalEditor value={field.value} onChange={field.onChange} />
              )}
            />
          </Box>

          <Separator />

          <Box>
            <VStack gap={2} align="stretch">
              <Controller
                name="settings.layout"
                control={control}
                render={({ field }) => (
                  <Select.Root
                    key={field.value}
                    variant="outline"
                    value={[field.value]}
                    onValueChange={({ value }) => field.onChange(value[0])}
                    collection={createListCollection({
                      items: [
                        { value: "default", label: "기본" },
                        { value: "wide", label: "와이드" },
                        { value: "full", label: "전체" },
                      ],
                    })}
                  >
                    <Select.HiddenSelect />
                    <Select.Label>설정</Select.Label>
                    <Select.Control>
                      <Select.Trigger>
                        <Select.ValueText placeholder="Select layout" />
                      </Select.Trigger>
                      <Select.IndicatorGroup>
                        <Select.Indicator />
                      </Select.IndicatorGroup>
                    </Select.Control>
                    <Portal>
                      <Select.Positioner>
                        <Select.Content>
                          {[
                            { value: "default", label: "기본" },
                            { value: "wide", label: "와이드" },
                            { value: "full", label: "전체" },
                          ].map((layout) => (
                            <Select.Item item={layout} key={layout.value}>
                              {layout.label}
                              <Select.ItemIndicator />
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Positioner>
                    </Portal>
                  </Select.Root>
                )}
              />
              <Controller
                name="settings.showThumbnail"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <Checkbox.Root
                    checked={value}
                    onCheckedChange={(e) => onChange(!!e.checked)}
                    colorPalette="blue"
                    size="sm"
                  >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control>
                      <Checkbox.Indicator>
                        <LuCheck />
                      </Checkbox.Indicator>
                    </Checkbox.Control>
                    <Checkbox.Label>썸네일 표시</Checkbox.Label>
                  </Checkbox.Root>
                )}
              />
              <Controller
                name="settings.showTags"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <Checkbox.Root
                    checked={value}
                    onCheckedChange={(e) => onChange(!!e.checked)}
                    colorPalette="blue"
                    size="sm"
                  >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control>
                      <Checkbox.Indicator>
                        <LuCheck />
                      </Checkbox.Indicator>
                    </Checkbox.Control>
                    <Checkbox.Label>태그 표시</Checkbox.Label>
                  </Checkbox.Root>
                )}
              />
              <Controller
                name="settings.showDate"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <Checkbox.Root
                    checked={value}
                    onCheckedChange={(e) => onChange(!!e.checked)}
                    colorPalette="blue"
                    size="sm"
                  >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control>
                      <Checkbox.Indicator>
                        <LuCheck />
                      </Checkbox.Indicator>
                    </Checkbox.Control>
                    <Checkbox.Label>날짜 표시</Checkbox.Label>
                  </Checkbox.Root>
                )}
              />
              <Controller
                name="settings.showAuthor"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <Checkbox.Root
                    checked={value}
                    onCheckedChange={(e) => onChange(!!e.checked)}
                    colorPalette="blue"
                    size="sm"
                  >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control>
                      <Checkbox.Indicator>
                        <LuCheck />
                      </Checkbox.Indicator>
                    </Checkbox.Control>
                    <Checkbox.Label>작성자 표시</Checkbox.Label>
                  </Checkbox.Root>
                )}
              />
              <Controller
                name="settings.showRelatedContent"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <Checkbox.Root
                    checked={value}
                    onCheckedChange={(e) => onChange(!!e.checked)}
                    colorPalette="blue"
                    size="sm"
                  >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control>
                      <Checkbox.Indicator>
                        <LuCheck />
                      </Checkbox.Indicator>
                    </Checkbox.Control>
                    <Checkbox.Label>관련 컨텐츠 표시</Checkbox.Label>
                  </Checkbox.Root>
                )}
              />
              <Controller
                name="settings.showTableOfContents"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <Checkbox.Root
                    checked={value}
                    onCheckedChange={(e) => onChange(!!e.checked)}
                    colorPalette="blue"
                    size="sm"
                  >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control>
                      <Checkbox.Indicator>
                        <LuCheck />
                      </Checkbox.Indicator>
                    </Checkbox.Control>
                    <Checkbox.Label>목차 표시</Checkbox.Label>
                  </Checkbox.Root>
                )}
              />
            </VStack>
          </Box>

          <Separator />

          <Box>
            <Text mb={2}>메타데이터</Text>
            <VStack gap={2} align="stretch">
              <Input placeholder="작성자" {...register("metadata.author")} />
              <Input placeholder="직위" {...register("metadata.position")} />
              <Input placeholder="부서" {...register("metadata.department")} />
              <Input placeholder="연락처" {...register("metadata.contact")} />
            </VStack>
          </Box>

          <Flex justify="flex-end" gap={2}>
            {content && onDelete && (
              <Button
                colorScheme="red"
                variant="outline"
                onClick={() => onDelete(content.id)}
              >
                삭제
              </Button>
            )}
            <Button type="button" variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button type="submit" colorScheme="blue">
              저장
            </Button>
          </Flex>
        </VStack>
      </form>

      <SectionEditDialog
        isOpen={open}
        onClose={onCloseModal}
        section={selectedSection}
        onSave={handleSaveSection}
      />
    </Box>
  );
}
