"use client";

import { Box, Heading, List, Text, Image } from "@chakra-ui/react";
import { ReactNode } from "react";

// 서비스 아이템 인터페이스
export interface ServiceItem {
  title: string;
  description: string;
  imageSrc: string;
}

// ListStyle02 컴포넌트 props 인터페이스
export interface ListStyle02Props {
  title: string;
  items: ServiceItem[];
}

function ListStyle02({ title, items }: ListStyle02Props) {
  return (
    <Box className="fac-list-box" mt="100px">
      <Heading
        as="h4"
        mb="60px"
        color="#393939"
        fontSize="60px"
        fontWeight="bold"
        lineHeight="1"
      >
        {title}
      </Heading>
      <Box className="fac-list">
        <List.Root>
          {items.map((item, index) => (
            <List.Item
              key={`service-${index}`}
              _marker={{ fontSize: "0" }}
              mb={index !== items.length - 1 ? 10 : 0}
              style={{ display: "flex", alignItems: "center", gap: "40px" }}
            >
              <Box
                className="fac-ico"
                style={{
                  alignSelf: "flex-start",
                  flexShrink: 0,
                  borderRadius: "20px",
                  overflow: "hidden",
                }}
              >
                <Image src={item.imageSrc} alt={item.title} />
              </Box>
              <Box className="fac-detail-txt">
                <Text mb={3} color={"#393939"} fontSize="3xl" fontWeight="bold">
                  {item.title}
                </Text>
                <Text color={"#393939"} fontSize="2xl">
                  {item.description}
                </Text>
              </Box>
            </List.Item>
          ))}
        </List.Root>
      </Box>
    </Box>
  );
}

export default ListStyle02;
