import { HeroSection } from "@/components/sections/HeroSection";
import { Box } from "@chakra-ui/react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const slideContents = [
    {
      header: "센터안내",
      title: "인사말",
      image: "/images/about/sub_visual.png",
      breadcrumbBorderColor: "#9D86F9",
    },
  ];
  return (
    <Box>
      <HeroSection slideContents={slideContents} />
      {children}
    </Box>
  );
};

export default Layout;
