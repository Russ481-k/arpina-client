"use client";

import { Heading } from "@chakra-ui/react";

interface HeadingH401Props {
  children: React.ReactNode;
  color?: string;
  fontSize?: string | object;
  fontWeight?: string;
  mb?: number | object;
  p?: number | object;
  textAlign?: string;
  border?: string;
  borderRadius?: string | object;
  lineHeight?: string;
}

export default function HeadingH401({
  children,
  color = "#2E3192",
  fontSize = "3xl",
  fontWeight = "bold",
  mb = 5,
  p = 5,
  textAlign = "center",
  border = "1px solid #2E3192",
  borderRadius = "100px",
  lineHeight = "1",
}: HeadingH401Props) {
  return (
    <Heading
      as="h4"
      border={border}
      borderRadius={borderRadius}
      mb={mb}
      p={p}
      color={color}
      fontSize={fontSize}
      fontWeight={fontWeight}
      lineHeight={lineHeight}
      textAlign={textAlign}
    >
      {children}
    </Heading>
  );
}
