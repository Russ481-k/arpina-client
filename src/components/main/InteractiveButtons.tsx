import { Box, Flex, Heading, Icon, HStack } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { IoArrowForward } from "react-icons/io5";
import { useColorMode } from "@/components/ui/color-mode";

const buttonsData = [
  {
    id: "personal",
    title: "자가진단",
    href: "/self-diagnosis",
  },
  {
    id: "apply",
    title: "상담신청",
    href: "/counseling-apply",
  },
];

const StaticButton = ({ button }: { button: (typeof buttonsData)[0] }) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const router = useRouter();

  return (
    <Flex
      as="button"
      onClick={() => router.push(button.href)}
      w="200px"
      p={4}
      align="center"
      justify="space-between"
      gap={2}
      borderRadius="xl"
      bg={isDark ? "gray.700" : "white"}
      color={isDark ? "white" : "gray.800"}
      boxShadow="md"
      transition="all 0.2s ease-in-out"
      cursor="pointer"
      _hover={{
        transform: "translateY(-2px)",
        boxShadow: "lg",
      }}
    >
      <Heading size="md" fontWeight="bold">
        {button.title}
      </Heading>
      <Icon as={IoArrowForward} w={6} h={6} />
    </Flex>
  );
};

const InteractiveButtons = () => {
  return (
    <HStack gap={4}>
      {buttonsData.map((button) => (
        <StaticButton key={button.id} button={button} />
      ))}
    </HStack>
  );
};

export default InteractiveButtons;
