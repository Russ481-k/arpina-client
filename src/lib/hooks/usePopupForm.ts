"use client";

import { useState, useEffect, useCallback } from "react";
import { popupApi } from "@/lib/api/popup";
import { Popup } from "@/types/api";
import { toaster } from "@/components/ui/toaster";

export interface MediaAttachment {
  file: File;
  localId: string;
}

export interface UsePopupFormProps {
  initialData?: Partial<Popup> | null;
}

export const usePopupForm = ({ initialData }: UsePopupFormProps) => {
  const [formData, setFormData] = useState<Partial<Popup>>({});
  const [content, setContent] = useState<string>("");
  const [pendingMedia, setPendingMedia] = useState<MediaAttachment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      const { content_value, ...rest } = initialData;
      setFormData(rest);
      setContent(content_value || "");
      setPendingMedia([]);
    } else {
      // Reset to default state for new popup
      setFormData({
        title: "",
        start_date: new Date().toISOString().substring(0, 16),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .substring(0, 16),
        is_visible: true,
      });
      setContent("");
      setPendingMedia([]);
    }
  }, [initialData]);

  const updateFormField = (field: keyof Popup, value: any) => {
    setFormData((prev: Partial<Popup>) => ({ ...prev, [field]: value }));
  };
  
  const handleMediaAdded = useCallback((localUrl: string, file: File) => {
    // The localUrl is a blob URL created by the editor, we just need the file and to create our own localId.
    const localId = `local-media-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newAttachment: MediaAttachment = { file, localId };
    setPendingMedia((prev) => [...prev, newAttachment]);
    // The editor already has the blob URL, we just need to return the localId we created
    // so it can be replaced with a permanent fileId later.
    return localId;
  }, []);

  const handleSubmit = async (): Promise<{ success: boolean; message?: string; }> => {
    setIsLoading(true);
    setError(null);

    const formDataToSend = new FormData();

    // 1. Append popup data (all fields except content_value)
    const { content_value, id, ...restOfFormData } = formData;
    formDataToSend.append(
      "popupData",
      new Blob([JSON.stringify(restOfFormData)], { type: "application/json" })
    );

    // 2. Append Lexical content
    formDataToSend.append("content", content);

    // 3. Append pending media files
    if (pendingMedia.length > 0) {
      const mediaLocalIds: string[] = [];
      pendingMedia.forEach((media) => {
        formDataToSend.append("mediaFiles", media.file);
        mediaLocalIds.push(media.localId);
      });
      // Append all localIds
      mediaLocalIds.forEach(localId => {
        formDataToSend.append("mediaLocalIds", localId);
      });
    }

    try {
      let result;
      if (formData.id) {
        result = await popupApi.updatePopup(formData.id, formDataToSend);
      } else {
        result = await popupApi.createPopup(formDataToSend);
      }

      if (result.success) {
        toaster.success({ title: "성공", description: result.message });
        return { success: true, message: result.message };
      } else {
        throw new Error(result.message);
      }
    } catch (err: any) {
      const errorMessage = err.message || err.response?.data?.message || "작업에 실패했습니다.";
      setError(errorMessage);
      toaster.error({ title: "오류", description: errorMessage });
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
      setPendingMedia([]);
    }
  };

  return {
    formData,
    updateFormField,
    content,
    setContent,
    isLoading,
    error,
    handleSubmit,
    handleMediaAdded,
  };
}; 