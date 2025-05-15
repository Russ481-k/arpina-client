"use client";

import { useColors } from "@/styles/theme";
import { Box, Container, AspectRatio } from "@chakra-ui/react";

export function MovieSection() {
  return (
    <Box as="section" id="movieSection">
      <Container maxW="none" p={0}>
        <AspectRatio
          className="youtube-wr"
          position="relative"
          width="100%"
          ratio={16 / 9}
          overflow="hidden"
        >
          <iframe
            width="100%"
            height="100%"
            src="https://www.youtube.com/embed/cAJ2OoIWhiQ?autoplay=1&mute=1&loop=1&playlist=cAJ2OoIWhiQ&controls=0&modestbranding=1&rel=0&disablekb=1&fs=0"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen={false}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              pointerEvents: "none",
            }}
          />
        </AspectRatio>
      </Container>
    </Box>
  );
}
