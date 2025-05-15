"use client";

import { useEffect } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Icon,
  SimpleGrid,
  Card,
} from "@chakra-ui/react";
import { FaMapMarkerAlt, FaPhone, FaEnvelope } from "react-icons/fa";
import { useColors } from "@/styles/theme";

export default function LocationPage() {
  const colors = useColors();

  useEffect(() => {
    const mapScript = document.createElement("script");
    mapScript.async = true;
    mapScript.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&autoload=false`;
    document.head.appendChild(mapScript);
    const onLoadKakaoMap = () => {
      window.kakao.maps.load(() => {
        const container = document.getElementById("map");
        const options = {
          center: new window.kakao.maps.LatLng(
            35.229896192111696,
            129.155449720031
          ), // 해운대구 윗반송로51번길 36 좌표
          level: 3,
        };
        const map = new window.kakao.maps.Map(
          container ?? document.body,
          options
        );

        // 마커 생성
        const markerPosition = new window.kakao.maps.LatLng(
          35.229896192111696,
          129.155449720031
        );
        const marker = new window.kakao.maps.Marker({
          position: markerPosition,
        });
        marker.setMap(map);

        // 인포윈도우 생성
        const infowindow = new window.kakao.maps.InfoWindow({
          content:
            '<div style="padding:5px; font-size: 14px; font-weight: bold; color: #000; width: 100px; text-align: center;">부산창업가꿈</div>',
        });
        infowindow.open(map, marker);
      });
    };

    mapScript.addEventListener("load", onLoadKakaoMap);

    return () => {
      mapScript.removeEventListener("load", onLoadKakaoMap);
    };
  }, []);

  return (
    <Container maxW="container.xl" py={16}>
      <VStack gap={12} align="stretch">
        <Box textAlign="center">
          <Heading
            as="h1"
            size="2xl"
            mb={4}
            bgGradient="linear(to-r, blue.500, purple.500)"
            bgClip="text"
            color={colors.primary.default}
          >
            오시는 길
          </Heading>
          <Text fontSize="xl" color={colors.text.primary}>
            부산창업가꿈 해운대는 해운대구에 위치해 있습니다
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2 }} gap={8}>
          <Card.Root
            bg={colors.cardBg}
            borderWidth="1px"
            borderColor={colors.border}
            boxShadow="lg"
          >
            <Card.Body>
              <VStack align="start" gap={4}>
                <Box
                  w="100%"
                  h="400px"
                  bg={colors.cardBg}
                  borderRadius="lg"
                  overflow="hidden"
                >
                  <Box
                    id="map"
                    h="400px"
                    borderRadius="xl"
                    overflow="hidden"
                    border="1px"
                    borderColor={colors.border}
                  />
                </Box>
                <Box>
                  <Text fontWeight="bold" mb={2}>
                    주소
                  </Text>
                  <Text color={colors.text.primary}>
                    부산광역시 해운대구 윗반송로51번길 36
                  </Text>
                </Box>
              </VStack>
            </Card.Body>
          </Card.Root>

          <Card.Root
            bg={colors.cardBg}
            borderWidth="1px"
            borderColor={colors.border}
            boxShadow="lg"
          >
            <Card.Body>
              <VStack align="start" gap={6}>
                <Box>
                  <Text
                    fontWeight="bold"
                    mb={2}
                    display="flex"
                    alignItems="center"
                  >
                    <Icon as={FaMapMarkerAlt} mr={2} color="blue.500" />
                    위치 안내
                  </Text>
                  <Text color={colors.text.primary}>
                    부산 도시철도 4호선 윗반송역에서 내려서 도보 7분거리에 위치
                    하고 있습니다.
                  </Text>
                </Box>

                <Box>
                  <Text
                    fontWeight="bold"
                    mb={2}
                    display="flex"
                    alignItems="center"
                  >
                    <Icon as={FaPhone} mr={2} color="green.500" />
                    연락처
                  </Text>
                  <Text color={colors.text.primary}>051-343-0509</Text>
                </Box>

                <Box>
                  <Text
                    fontWeight="bold"
                    mb={2}
                    display="flex"
                    alignItems="center"
                  >
                    <Icon as={FaEnvelope} mr={2} color="purple.500" />
                    이메일
                  </Text>
                  <Text color={colors.text.primary}>buvakim@naver.com</Text>
                </Box>
              </VStack>
            </Card.Body>
          </Card.Root>
        </SimpleGrid>
      </VStack>
    </Container>
  );
}
