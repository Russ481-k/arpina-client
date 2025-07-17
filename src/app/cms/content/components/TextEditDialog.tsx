"use client";

import { Button, Dialog, Portal, CloseButton } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { ContentBlock } from "@/types/api/content";
import { LexicalEditor } from "@/components/common/LexicalEditor";

interface TextEditDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (content: string) => void;
  block: ContentBlock | null;
}

export function TextEditDialog({
  open,
  onClose,
  onSave,
  block,
}: TextEditDialogProps) {
  const [content, setContent] = useState("");

  useEffect(() => {
    if (block?.content) {
      setContent(block.content);
    } else {
      setContent("");
    }
  }, [block]);

  const handleSave = () => {
    onSave(content);
    onClose();
  };

  if (!block) return null;

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(details: any) => !details.open && onClose()}
      size="xl"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>텍스트 블록 수정</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <LexicalEditor
                initialContent={content}
                onChange={setContent}
                contextMenu="CONTENT"
              />
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.CloseTrigger asChild>
                <Button variant="ghost">취소</Button>
              </Dialog.CloseTrigger>
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
