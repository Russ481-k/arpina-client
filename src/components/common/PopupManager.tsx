"use client";

import React, { useEffect, useState } from "react";
import { Box, Button, Flex } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { popupApi, popupKeys } from "@/lib/api/popup";
import { Popup } from "@/types/api";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { baseInitialConfig } from "@/lib/lexicalConfig";
import { motion, AnimatePresence } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Icon } from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
import { XIcon } from "lucide-react";

const MotionBox = motion(Box);

interface PopupItemProps {
  popup: Popup;
  isActive?: boolean;
}

function PopupItem({ popup, isActive = false }: PopupItemProps) {
  const initialConfig = {
    ...baseInitialConfig,
    namespace: `Popup-${popup.id}`,
    editable: false,
    editorState: popup.content || null,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        scale: isActive ? 1 : 0.95,
      }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "800px",
        margin: "20px auto",
        backgroundColor: "white",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
        overflow: "hidden",
        transform: isActive ? "scale(1)" : "scale(0.95)",
        transition: "transform 0.3s ease",
        height: "520px",
      }}
    >
      <Box position="relative" p={6}>
        <Box
          className="popup-content"
          style={{
            margin: 0,
            padding: 0,
          }}
        >
          <LexicalComposer initialConfig={initialConfig}>
            <RichTextPlugin
              contentEditable={
                <ContentEditable
                  style={{
                    outline: "none",
                    minHeight: isActive ? "300px" : "150px",
                    padding: "1rem",
                    backgroundColor: "white",
                    borderRadius: "0.5rem",
                  }}
                />
              }
              placeholder={null}
              ErrorBoundary={LexicalErrorBoundary}
            />
            <ListPlugin />
            <LinkPlugin />
          </LexicalComposer>
        </Box>
      </Box>
    </motion.div>
  );
}

// Simple Error Boundary for Lexical
function LexicalErrorBoundary({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function PopupManager() {
  const [visiblePopups, setVisiblePopups] = useState<Popup[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  // 팝업 목록 조회
  const { data: popups, isLoading } = useQuery({
    queryKey: popupKeys.lists(),
    queryFn: () => popupApi.getActivePopups(),
    select: (response) => response.data,
  });

  useEffect(() => {
    console.log("=== Popup Filtering Start ===");
    console.log("Popup data:", popups);

    if (!popups) return;

    const now = new Date();
    console.log("Current time:", now.toISOString());

    const activePopups = popups.filter((popup) => {
      const hideUntil = localStorage.getItem(`popup_hide_${popup.id}`);
      console.log(`Filtering popup ${popup.id}:`, {
        visible: popup.visible,
        startDate: popup.startDate,
        endDate: popup.endDate,
        hideUntil,
        isHidden: hideUntil ? now < new Date(hideUntil) : false,
      });

      if (popup.visible === false) {
        console.log(`Popup ${popup.id} is not visible`);
        return false;
      }

      if (!popup.startDate || !popup.endDate) {
        console.log(`Popup ${popup.id} has no date restrictions`);
        return true;
      }

      const startDate = new Date(popup.startDate);
      const endDate = new Date(popup.endDate);

      if (hideUntil) {
        const hideUntilDate = new Date(hideUntil);
        if (now < hideUntilDate) {
          console.log(`Popup ${popup.id} is hidden until ${hideUntilDate}`);
          return false;
        }
      }

      const isInDateRange = now >= startDate && now <= endDate;
      console.log(`Popup ${popup.id} is in date range:`, isInDateRange);
      return isInDateRange;
    });

    console.log("Active popups:", activePopups);
    console.log("=== Popup Filtering End ===");
    setVisiblePopups(activePopups);
  }, [popups]);

  // 팝업이 열릴 때 스크롤 방지
  useEffect(() => {
    if (visiblePopups.length > 0) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [visiblePopups.length]);

  const handleCloseAll = () => {
    setVisiblePopups([]);
  };

  const handleHideAllForToday = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    console.log("=== Hide All For Today Start ===");
    console.log("Current time:", new Date().toISOString());
    console.log("Hide until:", tomorrow.toISOString());

    visiblePopups.forEach((popup) => {
      const hideUntil = tomorrow.toISOString();
      localStorage.setItem(`popup_hide_${popup.id}`, hideUntil);
      console.log(`Setting hide for popup ${popup.id} until ${hideUntil}`);
    });

    setVisiblePopups([]);

    const updatedPopups = popups?.filter((popup) => {
      const hideUntil = localStorage.getItem(`popup_hide_${popup.id}`);
      console.log(`Checking popup ${popup.id}:`, {
        hideUntil,
        currentTime: new Date().toISOString(),
        shouldShow: hideUntil ? new Date() >= new Date(hideUntil) : true,
      });

      if (hideUntil) {
        const hideUntilDate = new Date(hideUntil);
        return new Date() >= hideUntilDate;
      }
      return true;
    });

    console.log("Updated popups:", updatedPopups);
    console.log("=== Hide All For Today End ===");

    if (updatedPopups) {
      setVisiblePopups(updatedPopups);
    }
  };

  if (isLoading) {
    return null;
  }

  if (!popups || visiblePopups.length === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <MotionBox
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="rgba(0, 0, 0, 0.5)"
        zIndex={9999}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          w="100%"
          maxW="1200px"
        >
          <Button
            aria-label="Close all popups"
            position="absolute"
            top={-12}
            right={-12}
            zIndex={1000}
            onClick={handleCloseAll}
            bg="transparent"
            colorPalette="gray"
            p={2}
            minW="auto"
            h="auto"
          >
            <XIcon size={16} />
          </Button>

          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={50}
            slidesPerView={Math.min(visiblePopups.length, 3)}
            centeredSlides={visiblePopups.length <= 3}
            initialSlide={1}
            navigation={visiblePopups.length > 3}
            pagination={{
              clickable: true,
            }}
            style={{ padding: "40px 0" }}
            onSlideChange={(swiper) => {
              const currentPopup = visiblePopups[swiper.realIndex];
              console.log("Current popup:", currentPopup);
              setActiveIndex(swiper.realIndex);
            }}
            loop={visiblePopups.length > 3}
            speed={300}
            allowTouchMove={visiblePopups.length > 2}
            className="popup-swiper"
          >
            {visiblePopups.map((popup, index) => (
              <SwiperSlide key={popup.id}>
                <PopupItem popup={popup} isActive={index === activeIndex} />
              </SwiperSlide>
            ))}
          </Swiper>

          <Flex
            justify="center"
            gap={4}
            mt={4}
            position="absolute"
            bottom={-20}
            left="50%"
            transform="translateX(-50%)"
          >
            <Button
              variant="outline"
              onClick={handleHideAllForToday}
              colorPalette="gray"
              color="white"
              size="lg"
              opacity={0.7}
              _hover={{ opacity: 1, bg: "transparent" }}
            >
              오늘 하루 보지 않기
            </Button>
            <Button onClick={handleCloseAll} colorPalette="blue" size="lg">
              닫기
            </Button>
          </Flex>
        </Box>
      </MotionBox>
    </AnimatePresence>
  );
}
