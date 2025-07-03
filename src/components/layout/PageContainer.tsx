import React, { ReactNode } from "react";
import { Container, Box } from "@chakra-ui/react";

interface PageContainerProps {
  children: ReactNode;
}

export const PageContainer: React.FC<PageContainerProps> = ({ children }) => {
  return (
    <Container
      maxW="1600px"
      padding={{ base: "50px 10px", sm: "80px 10px", md: "100px 10px", xl: "120px 10px" }}
    >
      <Box mb={10}>{children}</Box>
    </Container>
  );
};
