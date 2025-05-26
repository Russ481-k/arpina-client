"use client";

import { Box, List } from "@chakra-ui/react";

interface InfoBoxList01Props {
  items: string[];
}

export default function InfoBoxList01({ items }: InfoBoxList01Props) {
  return (
    <Box
      className="info-list-box01"
      style={{
        backgroundColor: "#F7F8FB",
        borderRadius: "20px",
        marginTop: "60px",
        padding: "20px",
      }}
    >
      <List.Root>
        {items.map((item, index) => (
          <List.Item
            key={index}
            _marker={{ fontSize: "0" }}
            color={"#393939"}
            fontSize="lg"
            style={{
              display: "flex",
              alignItems: "center",
              marginTop: "10px",
            }}
            _before={{
              content: '"·"',
              alignSelf: "flex-start",
              marginRight: "10px",
            }}
          >
            {item}
          </List.Item>
        ))}
      </List.Root>
    </Box>
  );
}
