"use client";

import {
  Box,
  Flex,
  Heading,
  Text,
  Image,
  Tabs,
  Link,
  useBreakpointValue,
} from "@chakra-ui/react";
import { Global } from "@emotion/react";
import { useEffect, useState } from "react";
import { articleApi, Article } from "@/lib/api/article";

export function NoticeSection() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setIsLoading(true);
        const response = await articleApi.getArticles({
          bbsId: 1,
          menuId: 79,
          page: 0,
          size: 6,
          sort: "createdAt,desc",
        });

        if (response.success && response.data) {
          setArticles(response.data.content);
        } else {
          console.error("Failed to fetch articles:", response.message);
        }
      } catch (error) {
        console.error("Error fetching articles:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const noticeItemPadding = useBreakpointValue({ base: "14px", md: "28px" });
  const noticeCateWidth = useBreakpointValue({ base: "80px", md: "130px" });
  const noticeCateFontSize = useBreakpointValue({ base: "12px", md: "16px" });
  const noticeTitleFontSize = useBreakpointValue({ base: "16px", md: "24px" });
  const noticeDateFontSize = useBreakpointValue({ base: "14px", md: "20px" });
  const noticeDateWidth = useBreakpointValue({ base: "auto", md: "140px" });

  const renderNoticeList = (items: Article[]) => {
    if (isLoading) {
      return <Text>Loading...</Text>;
    }

    if (items.length === 0) {
      return <Text>게시물이 없습니다.</Text>;
    }

    return (
      <Flex className="mnotice-list" flexDirection={"column"} gap={5}>
        {items.map((article) => (
          <Link
            key={article.nttId}
            href={`/bbs/1/read/${article.nttId}`}
            className="notice-item notice"
            p={noticeItemPadding}
          >
            <Box
              as="span"
              className="notice-cate"
              w={noticeCateWidth}
              fontSize={noticeCateFontSize}
            >
              공지
            </Box>
            <Box
              as="span"
              className="notice-title"
              fontSize={noticeTitleFontSize}
            >
              {article.title}
            </Box>
            <Box
              as="span"
              className="notice-date"
              w={noticeDateWidth}
              fontSize={noticeDateFontSize}
            >
              {new Date(article.createdAt).toLocaleDateString("ko-KR")}
            </Box>
          </Link>
        ))}
      </Flex>
    );
  };

  const flexDirection = useBreakpointValue<"row" | "column">({
    base: "column",
    lg: "row",
  });
  const bannerWidth = useBreakpointValue({ base: "100%", lg: "460px" });
  const headingFontSize = useBreakpointValue({ base: "30px", md: "40px" });
  const tabsPaddingLeft = useBreakpointValue({ base: "0", md: "160px" });
  const sectionMarginBottom = useBreakpointValue({ base: "40px", md: "80px" });

  return (
    <>
      <Global
        styles={{
          ".notice-item": {
            padding: "28px",
            display: "flex",
            alignItems: "center",
            gap: "28px",
            borderRadius: "50px",
            border: "1px solid",
            transition: "all 0.3s ease-out",
            "&:hover": {
              color: "#fff",
              "& .notice-title": {
                color: "#fff",
              },
              "& .notice-date": {
                color: "#fff",
              },
            },
          },
          ".notice-item.notice": {
            borderColor: "#2E3192",
            "&:hover": {
              backgroundColor: "#2E3192",
              "& .notice-cate": {
                backgroundColor: "#fff",
                color: "#2E3192",
              },
            },
            "& .notice-cate": {
              backgroundColor: "#2E3192",
            },
          },
          ".notice-item.promotion": {
            borderColor: "#FAB20B",
            "&:hover": {
              backgroundColor: "#FAB20B",
              "& .notice-cate": {
                backgroundColor: "#fff",
                color: "#FAB20B",
              },
            },
            "& .notice-cate": {
              color: "#fff",
              backgroundColor: "#FAB20B",
            },
          },
          ".notice-item.related": {
            borderColor: "#0C8EA4",
            "&:hover": {
              backgroundColor: "#0C8EA4",
              "& .notice-cate": {
                backgroundColor: "#fff",
                color: "#0C8EA4",
              },
            },
            "& .notice-cate": {
              backgroundColor: "#0C8EA4",
            },
          },
          ".notice-cate": {
            flexShrink: 0,
            width: "130px",
            textAlign: "center",
            color: "#fff",
            padding: "10px 20px",
            borderRadius: "50px",
            fontSize: "16px",
            fontWeight: "800",
          },
          ".notice-title": {
            color: "#232323",
            fontSize: "24px",
            fontWeight: "700",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: "100%",
          },
          ".notice-date": {
            marginLeft: "auto",
            color: "#808080",
            fontSize: "20px",
            fontWeight: "700",
          },
        }}
      />
      <Box className="msec02" mb={sectionMarginBottom}>
        <Box
          w={"100%"}
          maxW={"1600px"}
          mx="auto"
          my={0}
          px={{ base: 4, md: 0 }}
        >
          <Flex gap={5} direction={flexDirection}>
            <Box flex="1" minW="0">
              <Heading
                as="h3"
                fontSize={headingFontSize}
                fontWeight="bold"
                color={"#333333"}
                lineHeight={"1"}
                fontFamily="'Paperlogy', sans-serif"
                mb={6}
              >
                공지사항
              </Heading>
              <Tabs.Root
                defaultValue="all"
                colorPalette="purple"
                variant="subtle"
              >
                <Tabs.List
                  borderBottom="0"
                  style={{
                    display: "flex",
                    gap: "20px",
                    marginTop: "-65px",
                    paddingLeft: tabsPaddingLeft,
                  }}
                >
                  <Tabs.Trigger
                    value="all"
                    fontSize="lg"
                    fontWeight="semibold"
                    color="#5F5F5F"
                    transition="all 0.2s"
                    cursor="pointer"
                    _active={{
                      color: "#2E3192",
                      bg: "rgba(46, 49, 146, 0.05)",
                      borderBottom: "2px solid #2E3192",
                    }}
                  >
                    전체
                  </Tabs.Trigger>
                </Tabs.List>
                <Tabs.Content value="all" mt={7}>
                  <Box>{renderNoticeList(articles)}</Box>
                </Tabs.Content>
              </Tabs.Root>
            </Box>
            <Box w={bannerWidth} flexShrink={0}>
              <Heading
                as="h3"
                fontSize={headingFontSize}
                fontWeight="bold"
                color={"#333333"}
                lineHeight={"1"}
                fontFamily="'Paperlogy', sans-serif"
                mb={6}
              >
                배너존
              </Heading>
              <Box borderRadius="20px" overflow="hidden">
                <Link href="...">
                  <Image
                    src="/images/main/main_1.png"
                    alt="부산 유스호스텔 아르피나 배너"
                    w="100%"
                    h="100%"
                    objectFit="cover"
                  />
                </Link>
              </Box>
            </Box>
          </Flex>
        </Box>
      </Box>
    </>
  );
}
