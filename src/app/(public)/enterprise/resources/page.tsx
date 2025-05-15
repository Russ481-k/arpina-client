"use client";

import { Box, Container, Heading, Text } from "@chakra-ui/react";
import { useColors } from "@/styles/theme";

// const resources = [
//   {
//     id: 1,
//     title: "창업가꿈 프로그램 소개서",
//     description:
//       "창업가꿈 프로그램의 상세 내용과 참여 기업 혜택을 소개하는 자료입니다.",
//     category: "프로그램 소개",
//     type: "PDF",
//     date: "2024-03-15",
//     downloadUrl: "/files/program-introduction.pdf",
//   },
//   {
//     id: 2,
//     title: "스타트업 성장 전략 가이드",
//     description:
//       "초기 스타트업의 성장을 위한 전략과 실행 방안을 담은 가이드북입니다.",
//     category: "창업 가이드",
//     type: "PDF",
//     date: "2024-03-10",
//     downloadUrl: "/files/startup-growth-guide.pdf",
//   },
//   {
//     id: 3,
//     title: "투자 유치 성공사례 분석",
//     description:
//       "창업가꿈 참여기업들의 투자 유치 성공 사례와 노하우를 분석한 자료입니다.",
//     category: "투자 유치",
//     type: "PDF",
//     date: "2024-03-05",
//     downloadUrl: "/files/investment-cases.pdf",
//   },
//   {
//     id: 4,
//     title: "2023년 데모데이 발표자료",
//     description: "2023년 창업가꿈 데모데이 참가기업들의 발표자료 모음입니다.",
//     category: "데모데이",
//     type: "PPT",
//     date: "2023-12-20",
//     downloadUrl: "/files/demo-day-2023.pptx",
//   },
// ];

export default function ResourcesPage() {
  // const [searchTerm, setSearchTerm] = useState("");
  // const [selectedCategory, setSelectedCategory] = useState("전체");

  // const filteredResources = resources.filter((resource) => {
  //   const matchesSearch =
  //     resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     resource.description.toLowerCase().includes(searchTerm.toLowerCase());
  //   const matchesCategory =
  //     selectedCategory === "전체" || resource.category === selectedCategory;
  //   return matchesSearch && matchesCategory;
  // });

  const colors = useColors();

  return (
    <Container maxW="1600px">
      <Box mb={10}>
        <Heading as="h1" size="2xl" mb={4}>
          참고자료실
        </Heading>
        <Text color="gray.600" fontSize="lg">
          창업가꿈 프로그램과 관련된 다양한 자료들을 제공합니다.
        </Text>
      </Box>

      <Heading as="h2" size="lg" mb={4} color={colors.text.primary}>
        준비중입니다...
      </Heading>
      {/* <Box mb={8}>
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
          <Input
            placeholder="자료 검색..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchTerm(e.target.value)
            }
          />
          <Box>
            <NativeSelect.Root size="md">
              <NativeSelect.Field
                value={selectedCategory}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setSelectedCategory(e.target.value)
                }
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
          </Box>
        </SimpleGrid>
      </Box>

      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
        {filteredResources.map((resource) => (
          <Box
            key={resource.id}
            p={6}
            borderWidth={1}
            borderRadius="lg"
            transition="all 0.3s"
            _hover={{ shadow: "md" }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="flex-start"
              mb={3}
            >
              <Heading as="h3" size="md" mb={2}>
                {resource.title}
              </Heading>
              <Badge colorScheme="blue">{resource.type}</Badge>
            </Box>
            <Text color="gray.600" mb={4}>
              {resource.description}
            </Text>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box>
                <Badge colorScheme="green" mb={2} display="inline-block">
                  {resource.category}
                </Badge>
                <Text fontSize="sm" color="gray.500">
                  등록일: {resource.date}
                </Text>
              </Box>
              <NextLink href={resource.downloadUrl} passHref>
                <Button colorScheme="blue" size="sm">
                  다운로드
                </Button>
              </NextLink>
            </Box>
          </Box>
        ))}
      </SimpleGrid>

      {filteredResources.length === 0 && (
        <Box textAlign="center" py={10}>
          <Text fontSize="lg" color="gray.600">
            검색 결과가 없습니다.
          </Text>
        </Box>
      )} */}
    </Container>
  );
}
