"use client";
import {
  Box,
  Flex,
  useBreakpointValue,
  VStack,
  Image,
  Text,
  Heading,
  Badge,
  Link,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { membershipData } from "@/data/membershipData";

const PartnershipGrid = () => {
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Flex
      wrap="wrap"
      justifyContent={isMobile ? "center" : "flex-start"}
      gap={6}
    >
      {membershipData.map((card) => (
        <VStack
          key={card.id}
          w={{
            base: "100%",
            sm: "calc(50% - 12px)",
            lg: "calc(33.33% - 16px)",
            xl: "calc(25% - 18px)",
          }}
          h={{ base: "auto", sm: "full" }}
          minH={{ base: 0, sm: "500px" }}
          p={6}
          borderWidth="1px"
          borderColor="gray.200"
          borderRadius="md"
          align="flex-start"
          transition="all 0.2s ease-in-out"
          _hover={{
            transform: "scale(1.03)",
            shadow: "lg",
            borderColor: "blue.500",
          }}
          overflow="hidden"
          position="relative"
        >
          <Link
            as={NextLink}
            href={card.linkUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            position="absolute"
            w="full"
            h="full"
            top="0"
            left="0"
            zIndex="docked"
            aria-label={card.title}
          />
          <Image
            src={card.logoUrl}
            alt={`${card.title} logo`}
            objectFit="contain"
            alignSelf="center"
            mb={4}
          />
          <VStack align="flex-start" w="full" pt={4}>
            <Heading size="md" fontSize={{ base: "18px", md: "24px" }}>
              {card.title}
            </Heading>
            <Heading
              as="h3"
              size="sm"
              color="gray.500"
              fontSize={{ base: "14px", md: "18px" }}
              fontWeight="500"
            >
              {card.subtitle}
            </Heading>
            {card.text && (
              <Box pt={3} w="full">
                {card.text.split("\n").map((line, lineIndex) => {
                  if (line.trim().startsWith("※")) {
                    return (
                      <Text key={lineIndex} fontSize="14px" color="#FAB20B">
                        {line}
                      </Text>
                    );
                  }

                  if (line.trim() === "") {
                    return <Box key={lineIndex} h="1em" />;
                  }

                  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;

                  return (
                    <Text key={lineIndex} fontSize="14px" as="div">
                      {line.split(/(\*.*?\*)/g).map((part, partIndex) => {
                        if (part.startsWith("*") && part.endsWith("*")) {
                          return (
                            <Text
                              as="span"
                              key={partIndex}
                              fontWeight="semibold"
                            >
                              {part.slice(1, -1)}
                            </Text>
                          );
                        }

                        return part
                          .split(urlRegex)
                          .map((subPart, subPartIndex) => {
                            if (subPart.match(urlRegex)) {
                              const href = subPart.startsWith("http")
                                ? subPart
                                : `http://${subPart}`;
                              return (
                                <Link
                                  key={subPartIndex}
                                  href={href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  color="blue.500"
                                  textDecoration="underline"
                                  onClick={(e) => e.stopPropagation()}
                                  zIndex="1"
                                >
                                  {subPart}
                                </Link>
                              );
                            }
                            return (
                              <Text as="span" key={subPartIndex}>
                                {subPart}
                              </Text>
                            );
                          });
                      })}
                    </Text>
                  );
                })}
              </Box>
            )}
          </VStack>
          {card.tiers && (
            <VStack align="flex-start" w="full" pt={2}>
              {card.tiers.map((tier) => (
                <Flex key={tier.name} align="center" pt={1}>
                  <Badge
                    bg={tier.colorScheme}
                    color="white"
                    w="60px"
                    py={1}
                    borderRadius="md"
                    display="flex"
                    justifyContent="center"
                  >
                    {tier.name}
                  </Badge>
                  <Text ml={4}>{tier.discount}</Text>
                </Flex>
              ))}
            </VStack>
          )}
        </VStack>
      ))}
    </Flex>
  );
};

export default PartnershipGrid;
