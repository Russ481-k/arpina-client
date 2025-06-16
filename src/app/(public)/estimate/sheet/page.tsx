"use client";

import { Box, Flex, Text, Icon } from "@chakra-ui/react";
import { PageContainer } from "@/components/layout/PageContainer";

export default function SheetPage() {
  return (
    <PageContainer>
      <Box
        className="sheet-info-box"
        bg="#F7F8FB"
        borderRadius="2xl"
        p={{ base: 4, md: 8 }}
      >
        {/* 상단 타이틀 영역 */}
        <Flex justify="space-between" align="center" mb={7}>
          <Flex align="center" gap={2}>
            <Box as="span">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="29"
                height="35"
                viewBox="0 0 29 35"
                fill="none"
              >
                <path
                  d="M25.8286 10.8155C24.9784 10.8683 24.127 11.0203 23.299 11.2393C20.5183 16.7451 14.5995 18.3757 11.5254 19.1947C11.6035 19.1992 11.6894 19.1992 11.7613 19.1947C15.5611 19.0429 23.3418 17.1569 26.5233 11.9932C26.7519 11.6125 27.3062 10.6952 25.8286 10.8155Z"
                  fill="#80D4CE"
                />
                <path
                  d="M11.2735 18.6842C13.472 16.61 18.117 12.5759 23.3022 11.2415C24.3176 9.10978 24.8424 6.92279 24.7426 3.75319C24.6902 2.8645 24.4797 2.75362 23.8227 3.18741C18.9227 6.40509 12.1469 15.2806 11.0805 18.7998C10.9805 19.161 11.0857 19.2958 11.4691 19.2163C11.4934 19.2091 11.5117 19.1994 11.5289 19.1969C11.1735 19.1923 10.8229 19.1224 11.2735 18.6842Z"
                  fill="#80D4CE"
                />
                <path
                  d="M23.3009 11.2402C18.1188 12.5747 13.4701 16.6088 11.2722 18.6852C10.825 19.1212 11.1719 19.1931 11.5273 19.1981C14.5988 18.3767 20.5196 16.7461 23.3009 11.2402Z"
                  fill="#0C8EA4"
                />
                <path
                  d="M0.871238 13.595C4.50559 13.7203 7.08651 16.1288 8.84789 19.6313C8.94061 19.8167 9.01727 20.1826 8.49223 19.9853C5.3939 18.8774 2.31979 16.7627 0.501208 14.6235C-0.334111 13.7448 -0.0669438 13.5761 0.871238 13.595Z"
                  fill="#80CC28"
                />
                <mask
                  id="mask0_1208_4819"
                  style={{ maskType: "luminance" }}
                  maskUnits="userSpaceOnUse"
                  x="8"
                  y="21"
                  width="14"
                  height="15"
                >
                  <path
                    d="M12.0782 22.2805C8.68194 23.7931 7.17336 27.7385 8.70759 31.0815C10.2449 34.4365 14.2426 35.9226 17.6512 34.4076C21.0403 32.8878 22.5512 28.9473 21.0158 25.5993C19.8922 23.145 17.4313 21.6855 14.8628 21.6855C13.9275 21.6855 12.982 21.8784 12.0782 22.2805Z"
                    fill="white"
                  />
                </mask>
                <g mask="url(#mask0_1208_4819)">
                  <mask
                    id="mask1_1208_4819"
                    style={{ maskType: "luminance" }}
                    maskUnits="userSpaceOnUse"
                    x="7"
                    y="21"
                    width="16"
                    height="15"
                  >
                    <path
                      d="M7.32031 21.5332H22.6982V35.7718H7.32031V21.5332Z"
                      fill="white"
                    />
                  </mask>
                  <g mask="url(#mask1_1208_4819)">
                    <mask
                      id="mask2_1208_4819"
                      style={{ maskType: "luminance" }}
                      maskUnits="userSpaceOnUse"
                      x="7"
                      y="21"
                      width="16"
                      height="15"
                    >
                      <path
                        d="M7.32031 21.5332H22.6982V35.7718H7.32031V21.5332Z"
                        fill="white"
                      />
                    </mask>
                    <g mask="url(#mask2_1208_4819)">
                      <mask
                        id="mask3_1208_4819"
                        style={{ maskType: "luminance" }}
                        maskUnits="userSpaceOnUse"
                        x="7"
                        y="21"
                        width="16"
                        height="15"
                      >
                        <path
                          d="M7.32031 21.5332H22.6982V35.7718H7.32031V21.5332Z"
                          fill="white"
                        />
                      </mask>
                      <g mask="url(#mask3_1208_4819)">
                        <mask
                          id="mask4_1208_4819"
                          style={{ maskType: "luminance" }}
                          maskUnits="userSpaceOnUse"
                          x="7"
                          y="21"
                          width="16"
                          height="15"
                        >
                          <path
                            d="M7.32031 21.5332H22.6982V35.7718H7.32031V21.5332Z"
                            fill="white"
                          />
                        </mask>
                        <g mask="url(#mask4_1208_4819)">
                          <path
                            d="M7.32031 21.5332H22.6982V35.7718H7.32031V21.5332Z"
                            fill="url(#paint0_radial_1208_4819)"
                          />
                        </g>
                      </g>
                    </g>
                  </g>
                </g>
                <path
                  d="M2.14359 8.87683C3.10348 13.2005 5.45809 17.3794 8.09621 19.6553C8.9025 20.3081 8.92899 19.9782 8.92899 19.3299C9.0048 16.3821 8.88646 10.8882 3.37459 8.10874C2.43049 7.62938 1.80034 7.46765 2.14359 8.87683Z"
                  fill="#0C8EA4"
                />
                <path
                  d="M10.4274 19.9575C14.8351 18.1173 23.5896 12.4114 21.5706 0.852378C21.401 -0.318096 20.8649 -0.0699375 20.3895 0.344397C14.9926 4.74727 10.8231 13.7914 9.69921 19.7069C9.59916 20.1887 9.89 20.1743 10.4274 19.9575Z"
                  fill="#0C8EA4"
                />
                <path
                  d="M27.0975 13.7853C20.1162 13.6019 12.8481 17.6918 9.87907 19.7246C9.37602 20.1317 9.85852 20.2834 10.1538 20.3579C14.7413 21.49 24.133 20.1873 27.8902 14.9268C28.1332 14.592 28.7134 13.8239 27.0975 13.7853Z"
                  fill="#80CC28"
                />
                <defs>
                  <radialGradient
                    id="paint0_radial_1208_4819"
                    cx="0"
                    cy="0"
                    r="1"
                    gradientUnits="userSpaceOnUse"
                    gradientTransform="translate(15.1338 28.0553) scale(6.75512 6.66089)"
                  >
                    <stop stopColor="#FAB20B" />
                    <stop offset="0.48888" stopColor="#FAB20B" />
                    <stop offset="1" stopColor="white" />
                  </radialGradient>
                </defs>
              </svg>
            </Box>
            <Text
              fontWeight="800"
              fontSize={{ base: "2xl", md: "4xl" }}
              color="#444445"
            >
              <Box as="span">아르피나 단체예약 가견적 산출</Box>
            </Text>
          </Flex>
          <Text color="#2E3192" fontSize="md" fontWeight="600" mr={2}>
            가견적과 실제금액은 차이가 있을 수 있습니다
          </Text>
        </Flex>
        {/* 내부 3분할 박스 + 금액 */}
        <Box position="relative">
          <Flex gap={6} align="center">
            {/* 회의실 */}
            <Box
              flex="1"
              bg="#fff"
              border="4px solid #0C8EA4"
              borderRadius="lg"
              p={8}
              display="flex"
              alignItems="center"
              gap={4}
              minW="240px"
              fontSize="xl"
              fontWeight="600"
              color="#373636"
            >
              <Text>회의실 2개</Text>
              {/* <Box w="26px" h="26px" borderRadius="full" bg="#FAB20B" ml={2} /> */}
            </Box>
            {/* 날짜 */}
            <Box
              flex="1"
              bg="#fff"
              border="4px solid #2E3192"
              borderRadius="lg"
              p={8}
              display="flex"
              alignItems="center"
              gap={4}
              minW="240px"
              fontSize="xl"
              fontWeight="600"
              color="#373636"
            >
              <Text>11월 9일 ~ 12월 23일</Text>
            </Box>
            {/* 객실 */}
            <Box
              flex="1"
              bg="#fff"
              border="4px solid #2E3192"
              borderRadius="lg"
              p={8}
              display="flex"
              alignItems="center"
              gap={4}
              minW="240px"
              fontSize="xl"
              fontWeight="600"
              color="#373636"
            >
              <Text>객실 10개</Text>
              {/* <Box w="26px" h="26px" borderRadius="full" bg="#FAB20B" ml={2} /> */}
            </Box>
          </Flex>
        </Box>
        {/* 금액 */}
        <Box textAlign="right">
          <Text
            fontWeight="900"
            fontSize="4xl"
            color="#373636"
            letterSpacing={-2}
          >
            ₩&nbsp;123,123,123,000
          </Text>
        </Box>
      </Box>
      <Box className="sheet-input-box" mt={16} maxW="600px" mx="auto">
        {/* 이름 및 단체명 */}
        <Text fontWeight="700" fontSize="lg" color="#373636" mb={2}>
          이름 및 단체명
        </Text>
        <Box mb={6}>
          <Box
            as="input"
            type="text"
            placeholder="이름 및 단체명을 입력해주세요"
            w="100%"
            h="52px"
            px={5}
            bg="#F3F3F5"
            borderRadius="xl"
            border="none"
            fontSize="md"
            color="#373636"
            _placeholder={{ color: "#9E9E9E", fontWeight: 500 }}
            mb={0}
          />
        </Box>
        {/* 연락처 */}
        <Text fontWeight="700" fontSize="lg" color="#373636" mb={2}>
          연락처
        </Text>
        <Flex gap={3} mb={6}>
          <Box
            as="select"
            w="110px"
            h="52px"
            px={4}
            bg="#F3F3F5"
            borderRadius="xl"
            border="none"
            fontSize="md"
            color="#373636"
            fontWeight={600}
          >
            <option value="010">010</option>
            <option value="011">011</option>
            <option value="016">016</option>
            <option value="017">017</option>
            <option value="018">018</option>
            <option value="019">019</option>
          </Box>
          <Box
            as="input"
            type="text"
            maxLength={4}
            w="33%"
            h="52px"
            px={4}
            bg="#F3F3F5"
            borderRadius="xl"
            border="none"
            fontSize="md"
            color="#373636"
            _placeholder={{ color: "#9E9E9E", fontWeight: 500 }}
          />
          <Box
            as="input"
            type="text"
            maxLength={4}
            w="33%"
            h="52px"
            px={4}
            bg="#F3F3F5"
            borderRadius="xl"
            border="none"
            fontSize="md"
            color="#373636"
            _placeholder={{ color: "#9E9E9E", fontWeight: 500 }}
          />
        </Flex>
        {/* 이메일 */}
        <Text fontWeight="700" fontSize="lg" color="#373636" mb={2}>
          이메일
        </Text>
        <Box mb={10}>
          <Box
            as="input"
            type="email"
            placeholder="견적서를 받을 이메일을 입력해주세요"
            w="100%"
            h="52px"
            px={5}
            bg="#F3F3F5"
            borderRadius="xl"
            border="none"
            fontSize="md"
            color="#373636"
            _placeholder={{ color: "#9E9E9E", fontWeight: 500 }}
          />
        </Box>
        {/* 버튼 영역 */}
        <Flex gap={4} justify="center" mt={8}>
          <Box
            as="button"
            type="button"
            w="48%"
            h="54px"
            borderRadius="xl"
            border="2px solid #2E3192"
            bg="white"
            color="#2E3192"
            fontWeight="900"
            fontSize="xl"
            _hover={{ bg: "#F3F3F5" }}
          >
            이전 페이지
          </Box>
          <Box
            as="button"
            type="submit"
            w="48%"
            h="54px"
            borderRadius="xl"
            bg="#2E3192"
            color="white"
            fontWeight="900"
            fontSize="xl"
            border="none"
            _hover={{ bg: "#22246B" }}
          >
            견적서 다운로드
          </Box>
        </Flex>
      </Box>
    </PageContainer>
  );
}
