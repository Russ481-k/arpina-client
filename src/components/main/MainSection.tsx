import { Box, Heading } from "@chakra-ui/react";
import { HeroSection } from "./component/HeroSection";
import { ApplySection } from "./component/ApplySection";
import { NoticeSection } from "./component/NoticeSection";
import { MarqueeSection } from "./component/MarqueeSection";
import { EstimateSection } from "./component/EstimateSection";

const MainSection = () => {
  return (
    <Box
      as="main"
      id="mainContent"
      pt={100}
      fontFamily="'Paperlogy', sans-serif"
      lineHeight="1"
    >
      <Heading
        as="h3"
        mb={6}
        fontSize="40px"
        fontWeight="bold"
        color={"#444445"}
        lineHeight={"1"}
        fontFamily="'Paperlogy', sans-serif"
        w={"100%"}
        maxW={"1600px"}
        mx="auto"
        my={0}
      >
        당신의 새로운 여정이 시작 되는곳
      </Heading>
      <HeroSection />
      <MarqueeSection />
      <NoticeSection />
      <ApplySection />
      <EstimateSection />
    </Box>
  );
};

export default MainSection;
