"use client";

import { Heading } from "@chakra-ui/react";

interface HeadingH4Props {
  children: React.ReactNode;
}

export default function HeadingH4({ children }: HeadingH4Props) {
  return (
    <Heading
      as="h4"
      mb="60px"
      color="#393939"
      fontSize="60px"
      fontWeight="bold"
      lineHeight="1"
    >
      {children}
    </Heading>
  );
}
