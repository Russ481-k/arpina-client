"use client";

import React from "react";
import {
  Text,
  HStack,
  // Heading, // Not used, Text with fontWeight is used
  AspectRatio,
  LinkBox,
  Link as ChakraLink,
  Icon,
  Flex,
  Box,
} from "@chakra-ui/react";
import { CommonCardData } from "@/types/common"; // Import CommonCardData
import { LuEye, LuImageOff, LuExternalLink } from "react-icons/lu";
import { useColors } from "@/styles/theme";
import Image from "next/image";
import { useColorMode as useColorModeComponent } from "@/components/ui/color-mode"; // Correct alias usage
import PostTitleDisplay from "@/components/common/PostTitleDisplay"; // PostTitleDisplay 임포트
import { ArticleDisplayData } from "@/components/common/PostTitleDisplay"; // ArticleDisplayData 임포트

interface GenericArticleCardProps {
  cardData: CommonCardData;
}

const GenericArticleCard: React.FC<GenericArticleCardProps> = ({
  cardData,
}) => {
  const colors = useColors();
  const { colorMode } = useColorModeComponent(); // Use the aliased import

  // Assuming cardData.createdAt is a string parsable by new Date()
  // If it's already formatted, this logic can be removed or adapted.
  const formattedDate = cardData.postedAt
    ? new Date(cardData.postedAt).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
    : "N/A";

  // Logic for external link (icon only)
  let externalLinkHref: string | undefined = undefined;
  if (cardData.externalLink) {
    const trimmedExternalLink = cardData.externalLink.trim();
    if (trimmedExternalLink) {
      if (
        trimmedExternalLink.startsWith("http://") ||
        trimmedExternalLink.startsWith("https://")
      ) {
        externalLinkHref = trimmedExternalLink;
      } else {
        externalLinkHref = `http://${trimmedExternalLink}`;
      }
    }
  }

  // Title always links to internal detail URL
  const internalDetailUrl = cardData.detailUrl;
  // Define title color based on theme (not dependent on whether link is external anymore)
  const titleColor =
    colorMode === "dark"
      ? colors.text?.primary || "#E2E8F0"
      : colors.text?.primary || "#2D3748";
  const iconHoverColor = colorMode === "dark" ? "#75E6DA" : "blue.500";
  const iconColor =
    colorMode === "dark"
      ? colors.text?.secondary || "gray.500"
      : colors.text?.secondary || "gray.600";

  return (
    <LinkBox
      as="article"
      h="100%"
      display="flex"
      flexDirection="column"
      bg={colors.cardBg}
      borderWidth="1px"
      borderColor={colors.border}
      borderRadius="lg"
      overflow="hidden"
      transition="all 0.2s ease-in-out"
      _hover={{
        transform: "translateY(-2px)",
        boxShadow: "md",
        borderColor: colors.primary.default,
      }}
    >
      {cardData.thumbnailUrl ? (
        <AspectRatio ratio={16 / 9} w="100%">
          <Image
            src={cardData.thumbnailUrl}
            loader={() => cardData.thumbnailUrl || ""}
            alt={cardData.title}
            objectFit="cover"
            width={100}
            height={100}
          />
        </AspectRatio>
      ) : (
        <AspectRatio ratio={16 / 9} w="100%">
          <Flex
            w="100%"
            h="100%"
            bg="gray.100"
            alignItems="center"
            justifyContent="center"
            color="gray.400"
          >
            <Icon as={LuImageOff} boxSize={10} />
          </Flex>
        </AspectRatio>
      )}

      <Box p={2} gap={2} alignItems="center" flex={1}>
        <Flex
          gap={2}
          flex={1}
          alignItems="center"
          overflow="hidden"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
        >
          {/* Title always links internally */}
          <Flex flex={1} minW={0}>
            <ChakraLink
              href={internalDetailUrl}
              flex={1}
              minW={0}
              title={cardData.title}
              _hover={{ textDecoration: "underline" }}
              display="flex"
              alignItems="center"
            >
              <PostTitleDisplay
                title={cardData.title}
                postData={cardData as ArticleDisplayData}
              />
            </ChakraLink>

            {/* External link icon, only if externalLinkHref exists */}
            {externalLinkHref && (
              <ChakraLink
                href={externalLinkHref}
                target="_blank"
                rel="noopener noreferrer"
                display="inline-flex"
                aria-label={`Open external link: ${externalLinkHref}`}
                onClick={(e) => e.stopPropagation()}
              >
                <Icon
                  as={LuExternalLink}
                  color={iconColor}
                  _hover={{ color: iconHoverColor }}
                  cursor="pointer"
                  boxSize={4}
                />
              </ChakraLink>
            )}
          </Flex>
        </Flex>
        <Text fontSize="xs" color={colors.text.tertiary} textAlign="right">
          {formattedDate}
        </Text>
      </Box>

      <HStack
        justify="space-between"
        p={2}
        borderTopWidth="1px"
        borderColor={colors.border}
        mt="auto"
      >
        {cardData.displayWriter && (
          <Text fontSize="xs" color={colors.text.tertiary}>
            {cardData.displayWriter}
          </Text>
        )}
        <HStack gap={2} alignItems="center">
          {typeof cardData.hits === "number" && (
            <>
              <Icon as={LuEye} boxSize="1em" color={colors.text.tertiary} />
              <Text fontSize="xs" color={colors.text.tertiary}>
                {cardData.hits}
              </Text>
            </>
          )}
        </HStack>
      </HStack>
    </LinkBox>
  );
};

export default GenericArticleCard;
