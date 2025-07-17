import { useRef } from "react";
import { useDrag, useDrop, XYCoord } from "react-dnd";
import { Flex, Text, IconButton, Box, HStack, Input } from "@chakra-ui/react";
import { LuGripVertical, LuTrash2 } from "react-icons/lu";
import { ContentBlock } from "@/types/api/content";

interface ContentBlockItemProps {
  block: ContentBlock;
  index: number;
  moveBlock: (dragIndex: number, hoverIndex: number) => void;
  onDelete: (blockId: number) => void;
  onEdit: (block: ContentBlock) => void;
}

const ItemTypes = {
  BLOCK: "block",
};

export function ContentBlockItem({
  block,
  index,
  moveBlock,
  onDelete,
  onEdit,
}: ContentBlockItemProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [, drop] = useDrop({
    accept: ItemTypes.BLOCK,
    hover(item: { index: number }, monitor) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

      moveBlock(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag, preview] = useDrag({
    type: ItemTypes.BLOCK,
    item: () => ({ id: block.id, index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  const renderContent = () => {
    if (block.type === "TEXT") {
      return (
        <Input
          readOnly
          value={block.content || ""}
          placeholder="텍스트 블록"
          cursor="pointer"
          size="sm"
        />
      );
    }
    if (block.type === "IMAGE" && block.fileId) {
      // fileUrl 대신 fileId 존재 여부 체크
      // fileUrl을 무시하고 fileId를 사용하여 올바른 public 다운로드 URL을 생성
      const imageUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/cms/file/public/download/${block.fileId}`;
      return (
        <Flex align="center" cursor="pointer">
          <img
            src={imageUrl}
            alt={block.content || "image"}
            style={{
              width: "40px",
              height: "40px",
              objectFit: "cover",
              marginRight: "12px",
            }}
          />
          <Text>{block.content || "이미지 블록"}</Text>
        </Flex>
      );
    }
    return <Text>{block.type} 블록</Text>;
  };

  return (
    <Box
      id={`block-${block.id}`}
      ref={preview}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <Flex
        ref={ref}
        p={2}
        mb={2}
        gap={2}
        border="1px solid"
        borderColor="gray.100"
        _dark={{ bg: "gray.700" }}
        borderRadius="md"
        align="center"
        justifyContent="space-between"
      >
        <Flex align="center" flex="1" minW="0">
          <Box ref={drag} cursor="move" p={1} mr={2}>
            <LuGripVertical />
          </Box>
          <Box flex="1" minW="0" onClick={() => onEdit(block)} cursor="pointer">
            {renderContent()}
          </Box>
        </Flex>
        <HStack>
          <IconButton
            aria-label="Delete block"
            size="sm"
            variant="ghost"
            colorScheme="red"
            onClick={() => onDelete(block.id)}
          >
            <LuTrash2 />
          </IconButton>
        </HStack>
      </Flex>
    </Box>
  );
}
