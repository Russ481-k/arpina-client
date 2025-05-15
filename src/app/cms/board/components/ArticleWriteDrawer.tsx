"use client";
import { Drawer, CloseButton, Portal, Box, Text } from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
import { ArticleEditor } from "@/components/article/ArticleEditor";
import { useBoardSettings } from "@/hooks/useBoardSettings";
import type { Article } from "@/lib/api/article";

interface ArticleWriteDrawerProps {
  onOpenChange: (open: boolean) => void;
  bbsId?: number;
  menuId?: number;
  initialData?: Article | null;
}

export const ArticleWriteDrawer = ({
  onOpenChange,
  bbsId,
  menuId,
  initialData,
}: ArticleWriteDrawerProps) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);

  // Use the custom hook for board settings, explicitly CMS context
  const {
    isLoading: isBoardSettingsLoading,
    error: boardSettingsError,
    editorAttachmentProps,
  } = useBoardSettings(bbsId ?? null, false); // Explicitly set isPublicContext to false

  // This function is called by internal components (e.g., ArticleEditor's onSubmit/onCancel)
  // It should start the closing process by calling the parent's handler via onOpenChange.
  const handleClose = () => {
    console.log(
      "[ArticleWriteDrawer] handleClose triggered, calling parent onOpenChange(false)."
    );
    onOpenChange(false); // This will call handleCloseDrawer in the parent
    // Setting local state might be redundant if parent unmounts quickly, but good practice
    setIsDrawerOpen(false);
  };

  // This handles the Drawer.Root's own state change request (e.g., clicking backdrop/esc)
  const handleDrawerOpenChange = (e: { open: boolean }) => {
    console.log(
      "[ArticleWriteDrawer] Drawer.Root onOpenChange triggered with:",
      e.open
    );
    if (!e.open) {
      // If the drawer requests to be closed, update local state AND notify parent
      setIsDrawerOpen(false);
      onOpenChange(false); // Call parent's handler (handleCloseDrawer)
    }
    // No need to handle e.open === true, as opening is controlled by parent mounting
  };

  // Log before rendering ArticleEditor
  console.log("[ArticleWriteDrawer] Passing menuId to ArticleEditor:", menuId);

  return (
    <Drawer.Root
      open={isDrawerOpen} // Bind to local state
      onOpenChange={handleDrawerOpenChange} // Use the new handler
      size="xl"
    >
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content>
            <Drawer.Header px={8} pt={8} pb={2} borderBottomWidth={1}>
              <Text fontWeight="bold" fontSize="2xl">
                {initialData ? "글 수정" : "글쓰기"}
              </Text>
            </Drawer.Header>
            <Drawer.Body px={8} py={6}>
              {isBoardSettingsLoading ? (
                <Box display="flex" justifyContent="center" py={10}>
                  <Box
                    width="40px"
                    height="40px"
                    border="4px solid"
                    borderColor="blue.500"
                    borderTopColor="transparent"
                    borderRadius="full"
                    animation="spin 1s linear infinite"
                  />{" "}
                </Box>
              ) : boardSettingsError ? (
                <Box textAlign="center" py={10} color="red.500">
                  {boardSettingsError}
                </Box>
              ) : (
                <ArticleEditor
                  bbsId={bbsId}
                  menuId={menuId}
                  initialData={initialData ?? undefined}
                  onSubmit={handleClose}
                  onCancel={handleClose}
                  {...editorAttachmentProps}
                />
              )}
            </Drawer.Body>
            <Drawer.Footer>
              <Drawer.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Drawer.CloseTrigger>
            </Drawer.Footer>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
};
