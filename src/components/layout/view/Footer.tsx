import {
  Box,
  Container,
  Flex,
  Text,
  Link,
  VStack,
  HStack,
  Select,
  Portal,
  createListCollection,
} from "@chakra-ui/react";
import { useColors } from "@/styles/theme";

const footerLinks = {
  top: [
    { label: "개인정보처리방침", href: "/privacy-policy", isHighlighted: true },
    { label: "이메일무단수집거부", href: "/reject-spam-email" },
    { label: "교내전화번호", href: "/campus-phone" },
    { label: "찾아오시는길", href: "/location" },
  ],
};

const relatedSitesCollection = createListCollection({
  items: [
    { label: "관련사이트", value: "#" },
    { label: "울산과학대학교", value: "https://www.uc.ac.kr" },
    { label: "U-Cyber", value: "https://cyber.uc.ac.kr" },
    { label: "도서관", value: "https://library.uc.ac.kr" },
    { label: "웹메일", value: "https://mail.uc.ac.kr" },
  ],
});

export function Footer() {
  const colors = useColors();

  const handleSiteChange = (details: { value: string[] }) => {
    const url = details.value[0];
    if (url && url !== "#") {
      window.open(url, "_blank");
    }
  };

  return (
    <Box
      as="footer"
      bg={colors.bg}
      color={colors.text.secondary}
      py={4}
      cursor="none"
    >
      <Container maxW="container.xl">
        <VStack align="stretch">
          <Flex
            justify="space-between"
            align="center"
            borderBottom="1px"
            borderColor={colors.border}
            wrap="wrap"
          >
            <HStack
              gap={2}
              wrap="wrap"
              justify={{ base: "center", md: "flex-start" }}
            >
              {footerLinks.top.map((item, index) => (
                <Flex key={item.label} align="center">
                  <Link
                    href={item.href}
                    fontSize="sm"
                    fontWeight={item.isHighlighted ? "bold" : "medium"}
                    color={
                      item.isHighlighted
                        ? colors.text.primary
                        : colors.text.secondary
                    }
                    _hover={{
                      textDecoration: "underline",
                      color: colors.primary.default,
                    }}
                  >
                    {item.label}
                  </Link>
                  {index < footerLinks.top.length - 1 && <Text mx={3}>|</Text>}
                </Flex>
              ))}
            </HStack>
            <Box w="200px" mt={{ base: 4, md: 0 }}>
              <Select.Root
                collection={relatedSitesCollection}
                onValueChange={handleSiteChange}
                defaultValue={["#"]}
              >
                <Select.Control bg={colors.cardBg} borderColor={colors.border}>
                  <Select.Trigger>
                    <Select.ValueText />
                  </Select.Trigger>
                </Select.Control>
                <Portal>
                  <Select.Positioner>
                    <Select.Content>
                      {relatedSitesCollection.items.map((site) => (
                        <Select.Item key={site.value} item={site}>
                          {site.label}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Positioner>
                </Portal>
              </Select.Root>
            </Box>
          </Flex>

          <Flex
            direction={{ base: "column", lg: "row" }}
            justify="space-between"
            align={{ base: "center", lg: "flex-start" }}
            textAlign={{ base: "center", lg: "left" }}
            gap={8}
          >
            <VStack align="stretch" gap={4}>
              <Text fontWeight="bold" fontSize="lg" color={colors.text.primary}>
                울산과학대학교 학생상담센터
              </Text>
              <HStack gap={8} align="flex-start">
                <Box>
                  <Text fontWeight="medium">동부캠퍼스</Text>
                  <Text fontSize="sm">
                    (우)(44022) 울산광역시 동구 봉수로 101
                  </Text>
                  <Text fontSize="sm">
                    TEL : 052-230-0500 / FAX : 052-234-9300
                  </Text>
                </Box>
                <Box h="full" borderLeft="1px" borderColor={colors.border} />
                <Box>
                  <Text fontWeight="medium">서부캠퍼스</Text>
                  <Text fontSize="sm">
                    (우)(44610) 울산광역시 남구 대학로 57
                  </Text>
                  <Text fontSize="sm">
                    TEL : 052-279-3300 / FAX : 052-277-1538
                  </Text>
                </Box>
              </HStack>
            </VStack>
            <Text
              fontSize="xs"
              color={colors.text.muted}
              mt={{ base: 6, lg: "auto" }}
            >
              COPYRIGHT 2025. ULSAN COLLEGE. All rights reserved.
            </Text>
          </Flex>
        </VStack>
      </Container>
    </Box>
  );
}
