"use client";

import { Box, Heading, Text, Table } from "@chakra-ui/react";

interface MeetingRoomInfoProps {
  title: string;
  subtitle?: string;
  data: {
    size: string;
    dimensions: string;
    screen: string;
    capacity: string;
    price: string;
  };
}

export default function MeetingRoomInfo({
  title,
  subtitle,
  data,
}: MeetingRoomInfoProps) {
  return (
    <Box className="mr-info-box" mt="100px">
      <Heading
        as="h4"
        color="#393939"
        fontSize="60px"
        fontWeight="bold"
        lineHeight="1"
      >
        {title}
      </Heading>
      {subtitle && (
        <Text
          mt="10px"
          mb="60px"
          color="#FAB20B"
          fontSize="3xl"
          fontWeight="medium"
        >
          {subtitle}
        </Text>
      )}
      <Table.Root borderRadius="20px" overflow="hidden">
        <Table.Header>
          <Table.Row
            backgroundColor="#F7F8FB"
            fontSize="3xl"
            fontWeight="semibold"
          >
            <Table.ColumnHeader borderBottom="0" py={7} textAlign="center">
              규모
            </Table.ColumnHeader>
            <Table.ColumnHeader borderBottom="0" py={7} textAlign="center">
              사이즈
            </Table.ColumnHeader>
            <Table.ColumnHeader borderBottom="0" py={7} textAlign="center">
              스크린
            </Table.ColumnHeader>
            <Table.ColumnHeader borderBottom="0" py={7} textAlign="center">
              정원
            </Table.ColumnHeader>
            <Table.ColumnHeader borderBottom="0" py={7} textAlign="center">
              표준요금
            </Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row fontSize="2xl" fontWeight="medium">
            <Table.Cell borderBottom="0" py={5} textAlign="center">
              {data.size}
            </Table.Cell>
            <Table.Cell borderBottom="0" py={5} textAlign="center">
              {data.dimensions}
            </Table.Cell>
            <Table.Cell borderBottom="0" py={5} textAlign="center">
              {data.screen}
            </Table.Cell>
            <Table.Cell borderBottom="0" py={5} textAlign="center">
              {data.capacity}
            </Table.Cell>
            <Table.Cell borderBottom="0" py={5} textAlign="center">
              {data.price}
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table.Root>
    </Box>
  );
}
