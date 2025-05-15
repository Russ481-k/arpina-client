import React, { ReactNode } from "react";
import { Container, Box } from "@chakra-ui/react";

interface PageContainerProps {
  children: ReactNode;
}

export const PageContainer: React.FC<PageContainerProps> = ({ children }) => {
  return (
    <Container
      maxW="1600px"
      padding={{ base: "0 10px", sm: "0 15px", md: "0 20px", xl: "0 30px" }}
    >
      <Box mb={10}>{children}</Box>
    </Container>
  );
};
