"use client";

import { Box, Flex, Text } from "@chakra-ui/react";
import { PageContainer } from "@/components/layout/PageContainer";
import {
  MdDirectionsCar,
  MdDirectionsBus,
  MdLocalTaxi,
  MdSubway,
} from "react-icons/md";

export default function ParticipantsPage() {
  return (
    <PageContainer>
      <Flex>
        <Box>
          <Box className="location-box" w="100%" maxW="1200px" mx="auto" mt={8}>
            <Flex gap={8} align="flex-start">
              {/* 카드 4개 */}
              <Flex gap={6} flex="2">
                {/* 자가용 */}
                <Box
                  flex="1"
                  bg="#fff"
                  border="3px solid #2E3192"
                  borderRadius="20px"
                  p={7}
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  minW="180px"
                  color="#fff"
                  boxShadow="0 2px 8px rgba(0,0,0,0.08)"
                >
                  <Box
                    as={MdDirectionsCar}
                    fontSize="2.7rem"
                    color="#2E3192"
                    mb={3}
                  />
                  <Text
                    fontWeight="700"
                    fontSize="lg"
                    mb={1}
                    letterSpacing={-1}
                  >
                    자가용
                  </Text>
                  <Text fontSize="md" color="#BDBDBD" mb={7} lineHeight={1.3}>
                    현재위치
                    <br />
                    아르피나
                  </Text>
                  <Box
                    as="button"
                    w="100%"
                    h="40px"
                    borderRadius="lg"
                    bg="#2E3192"
                    color="#fff"
                    fontWeight="700"
                    fontSize="md"
                    _hover={{ bg: "#22246B" }}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    gap={2}
                  >
                    지도보기
                    <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
                      <path
                        d="M7.5 12.75L12 8.25L7.5 3.75"
                        stroke="#fff"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Box>
                </Box>
                {/* 버스 */}
                <Box
                  flex="1"
                  bg="#fff"
                  border="3px solid #00C2C2"
                  borderRadius="20px"
                  p={7}
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  minW="180px"
                  color="#fff"
                  boxShadow="0 2px 8px rgba(0,0,0,0.08)"
                >
                  <Box
                    as={MdDirectionsBus}
                    fontSize="2.7rem"
                    color="#00C2C2"
                    mb={3}
                  />
                  <Text
                    fontWeight="700"
                    fontSize="lg"
                    mb={1}
                    letterSpacing={-1}
                  >
                    버스
                  </Text>
                  <Text fontSize="md" color="#BDBDBD" mb={7} lineHeight={1.3}>
                    현재위치
                    <br />
                    아르피나
                  </Text>
                  <Box
                    as="button"
                    w="100%"
                    h="40px"
                    borderRadius="lg"
                    bg="#00C2C2"
                    color="#fff"
                    fontWeight="700"
                    fontSize="md"
                    _hover={{ bg: "#009999" }}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    gap={2}
                  >
                    지도보기
                    <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
                      <path
                        d="M7.5 12.75L12 8.25L7.5 3.75"
                        stroke="#fff"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Box>
                </Box>
                {/* 택시 */}
                <Box
                  flex="1"
                  bg="#fff"
                  border="3px solid #FAB20B"
                  borderRadius="20px"
                  p={7}
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  minW="180px"
                  color="#fff"
                  boxShadow="0 2px 8px rgba(0,0,0,0.08)"
                >
                  <Box
                    as={MdLocalTaxi}
                    fontSize="2.7rem"
                    color="#FAB20B"
                    mb={3}
                  />
                  <Text
                    fontWeight="700"
                    fontSize="lg"
                    mb={1}
                    letterSpacing={-1}
                  >
                    택시
                  </Text>
                  <Text fontSize="md" color="#BDBDBD" mb={7} lineHeight={1.3}>
                    현재위치
                    <br />
                    아르피나
                  </Text>
                  <Box
                    as="button"
                    w="100%"
                    h="40px"
                    borderRadius="lg"
                    bg="#FAB20B"
                    color="#181A20"
                    fontWeight="700"
                    fontSize="md"
                    _hover={{ bg: "#FFD666" }}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    gap={2}
                  >
                    지도보기
                    <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
                      <path
                        d="M7.5 12.75L12 8.25L7.5 3.75"
                        stroke="#181A20"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Box>
                </Box>
                {/* 지하철 */}
                <Box
                  flex="1"
                  bg="#fff"
                  border="3px solid #80D4CE"
                  borderRadius="20px"
                  p={7}
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  minW="180px"
                  color="#fff"
                  boxShadow="0 2px 8px rgba(0,0,0,0.08)"
                >
                  <Box as={MdSubway} fontSize="2.7rem" color="#80D4CE" mb={3} />
                  <Text
                    fontWeight="700"
                    fontSize="lg"
                    mb={1}
                    letterSpacing={-1}
                  >
                    지하철
                  </Text>
                  <Text fontSize="md" color="#BDBDBD" mb={7} lineHeight={1.3}>
                    현재위치
                    <br />
                    아르피나
                  </Text>
                  <Box
                    as="button"
                    w="100%"
                    h="40px"
                    borderRadius="lg"
                    bg="#80D4CE"
                    color="#181A20"
                    fontWeight="700"
                    fontSize="md"
                    _hover={{ bg: "#A6E6E0" }}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    gap={2}
                  >
                    지도보기
                    <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
                      <path
                        d="M7.5 12.75L12 8.25L7.5 3.75"
                        stroke="#181A20"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Box>
                </Box>
              </Flex>
              {/* 오른쪽 상세 안내 박스 */}
              <Box
                flex="3"
                bg="#F7F8FB"
                borderRadius="20px"
                p={7}
                color="#222"
                fontSize="md"
                minW="340px"
                boxShadow="0 2px 8px rgba(0,0,0,0.08)"
              >
                <Text fontWeight="700" fontSize="lg" mb={2} color="#222">
                  - 교통편 이용안내 (현재위치 기준)
                </Text>
                <Text mb={1} lineHeight={1.7}>
                  <b>자가용</b>: 현재위치 → 아르피나
                  <br />
                  네비게이션: 해운대해변로 35 (우동 1417번지)
                </Text>
                <Text mb={1} lineHeight={1.7}>
                  <b>버스</b>: 현재위치 → 아르피나
                  <br />
                  일반버스: 39, 100, 307 등<br />
                  급행: 1001, 1003
                  <br />
                  마을: 해운대구2, 송정2, 재송2, 우동1
                  <br />
                  인접지하철: 2호선 벡스코역 하차, 3번 출구 도보 300m
                </Text>
                <Text mb={1} lineHeight={1.7}>
                  <b>택시</b>: 현재위치 → 아르피나
                  <br />약 5~10분 소요 (교통상황에 따라 상이)
                </Text>
                <Text lineHeight={1.7}>
                  <b>지하철</b>: 현재위치 → 아르피나
                  <br />
                  2호선 벡스코역 하차, 3번 출구 도보 300m
                </Text>
              </Box>
            </Flex>
          </Box>
        </Box>
        <Box>
          <Text>아르피나 위치</Text>
        </Box>
      </Flex>
    </PageContainer>
  );
}
