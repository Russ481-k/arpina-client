"use client";

import { HeroSection } from "@/components/sections/HeroSection";
import { Box } from "@chakra-ui/react";
import { useHeroSectionData } from "@/lib/hooks/useHeroSectionData";
import ProtectedConfirmClient from "./ProtectedConfirmClient";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const heroData = useHeroSectionData();
  return (
    <Box>
      <HeroSection slideContents={[heroData]} />
      <ProtectedConfirmClient>{children}</ProtectedConfirmClient>
    </Box>
  );
};

export default Layout;
