"use client";

import { HeroSection } from "@/components/sections/HeroSection";
import { Box } from "@chakra-ui/react";
import { useHeroSectionData } from "@/lib/hooks/useHeroSectionData";
import { AuthProvider } from "@/lib/AuthContext";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const heroData = useHeroSectionData();
  return (
    <AuthProvider>
      <Box>
        <HeroSection slideContents={[heroData]} />
        {children}
      </Box>
    </AuthProvider>
  );
};

export default Layout;
