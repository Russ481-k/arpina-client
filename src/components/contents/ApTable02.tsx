"use client";

import { Box, Table } from "@chakra-ui/react";
import { ReactNode } from "react";

interface TableColumn {
  header: string;
  content: string | ReactNode;
}

interface TableRow {
  columns: TableColumn[];
}

interface ApTable02Props {
  rows: TableRow[];
}

export default function ApTable02({ rows }: ApTable02Props) {
  return (
    <Box className="ap-table-box">
      <Table.Root borderRadius="20px" overflow="hidden">
        <Table.Header>
          <Table.Row
            backgroundColor="#F7F8FB"
            fontSize="3xl"
            fontWeight="semibold"
          >
            {rows[0]?.columns.map((column, index) => (
              <Table.ColumnHeader
                key={`header-${index}`}
                borderBottom="0"
                py={7}
                textAlign="center"
              >
                {column.header}
              </Table.ColumnHeader>
            ))}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rows.map((row, rowIndex) => (
            <Table.Row
              key={`row-${rowIndex}`}
              fontSize="2xl"
              fontWeight="medium"
            >
              {row.columns.map((column, colIndex) => (
                <Table.Cell
                  key={`cell-${rowIndex}-${colIndex}`}
                  borderBottom="0"
                  py={5}
                  textAlign="center"
                >
                  {column.content}
                </Table.Cell>
              ))}
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  );
}
