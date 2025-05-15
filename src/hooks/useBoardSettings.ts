import { useState, useEffect } from "react";
import { boardApi } from "@/lib/api/board";
import { BoardMaster } from "@/types/api";

interface EditorAttachmentProps {
  maxFileAttachments?: number;
  maxFileSizeMB?: number;
  disableAttachments: boolean;
}

interface UseBoardSettingsReturn {
  boardSettings: BoardMaster | null;
  isLoading: boolean;
  error: string | null;
  editorAttachmentProps: EditorAttachmentProps;
}

const defaultAttachmentProps: EditorAttachmentProps = {
  disableAttachments: true, // Default to disabled if no settings or error
  maxFileAttachments: undefined,
  maxFileSizeMB: undefined,
};

export function useBoardSettings(
  bbsId: number | null,
  isPublicContext: boolean = false
): UseBoardSettingsReturn {
  const [boardSettings, setBoardSettings] = useState<BoardMaster | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editorAttachmentProps, setEditorAttachmentProps] =
    useState<EditorAttachmentProps>(defaultAttachmentProps);

  useEffect(() => {
    async function fetchSettings() {
      if (typeof bbsId !== "number" || bbsId <= 0) {
        setBoardSettings(null);
        setError(null);
        setIsLoading(false);
        setEditorAttachmentProps(defaultAttachmentProps);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        let settings: BoardMaster;
        if (isPublicContext) {
          // Type assertion might be needed if getPublicBoardInfo's return type isn't directly BoardMaster
          settings = (await boardApi.getPublicBoardInfo(bbsId)) as BoardMaster;
        } else {
          settings = (await boardApi.getBoard(bbsId)) as BoardMaster;
        }
        setBoardSettings(settings);

        // Gracefully handle settings possibly being null or properties missing
        setEditorAttachmentProps({
          maxFileAttachments: settings
            ? Number(settings.attachmentLimit) || undefined // Fallback to undefined if NaN
            : undefined,
          maxFileSizeMB: settings
            ? Number(settings.attachmentSize) || undefined // Fallback to undefined if NaN
            : undefined,
          disableAttachments: !settings || settings.attachmentYn !== "Y", // True if no settings or not 'Y'
        });
      } catch (err: any) {
        console.error(
          `Failed to fetch board settings for bbsId ${bbsId}:`,
          err
        );
        setError(
          err.message || "게시판 설정 정보를 불러오는 중 오류가 발생했습니다."
        );
        setBoardSettings(null); // Clear settings on error
        setEditorAttachmentProps(defaultAttachmentProps); // Reset to default on error
      } finally {
        setIsLoading(false);
      }
    }

    fetchSettings();
  }, [bbsId, isPublicContext]);

  return { boardSettings, isLoading, error, editorAttachmentProps };
}
