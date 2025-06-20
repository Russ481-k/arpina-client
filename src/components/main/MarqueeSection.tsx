"use client";

import { Box, Text, useBreakpointValue } from "@chakra-ui/react";
import { Global } from "@emotion/react";

export function MarqueeSection() {
  const marqueeFontSize = useBreakpointValue({
    base: "80px",
    md: "120px",
    lg: "180px",
  });

  return (
    <>
      <Global
        styles={{
          "@keyframes marquee": {
            "0%": {
              transform: "translateX(0)",
            },
            "100%": {
              transform: "translateX(-100%)",
            },
          },
          ".mflox-txt": {
            whiteSpace: "nowrap",
            width: "100%",
            marginTop: "20px",
            color: "rgba(46, 49, 146, 0.05)",
            fontSize: marqueeFontSize,
            fontWeight: "bold",
            fontFamily: "Tenada",
            lineHeight: "1",
            overflow: "hidden",
            position: "relative",
            "& span": {
              display: "inline-block",
              animation: "marquee 40s linear infinite",
              whiteSpace: "nowrap",
            },
          },
        }}
      />
      <Text className="mflox-txt">
        <span>Busan Youth Hostel Arpina Busan Youth Hostel Arpina</span>
      </Text>
    </>
  );
}
