"use client";

import {
  Box,
  Button,
  Flex,
  Heading,
  Progress,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";

import {
  RadioGroup,
  RadioProps as BaseRadioProps,
} from "@/components/ui/radio";
import { RadioGroup as ChakraRadioGroup } from "@chakra-ui/react";

// 로컬 커스텀 라디오 컴포넌트 정의
interface RadioProps extends BaseRadioProps {}

const CustomRadio = React.forwardRef<HTMLInputElement, RadioProps>(
  function Radio(props, ref) {
    const { children, inputProps, rootRef, ...rest } = props;
    return (
      <ChakraRadioGroup.Item ref={rootRef} {...rest}>
        <ChakraRadioGroup.ItemHiddenInput ref={ref} {...inputProps} />
        {/* <ChakraRadioGroup.ItemIndicator /> -- 기본 인디케이터 제거 */}
        {children && (
          <ChakraRadioGroup.ItemText>{children}</ChakraRadioGroup.ItemText>
        )}
      </ChakraRadioGroup.Item>
    );
  }
);

const PSS_QUESTIONS = [
  "예상치 못한 일이 생겨서 기분 나빠진 적이 얼마나 있었나요?",
  "중요한 일들을 통제할 수 없다고 느낀 적은 얼마나 있었나요?",
  "어려운 일이 너무 많이 쌓여서 극복할 수 없다고 느낀 적이 얼마나 있었나요?",
  "당신이 통제할 수 없는 범위에서 발생한 일 때문에 화가 난 적이 얼마나 있었나요?",
  "매사를 잘 컨트롤하고 있다고 느낀 적이 얼마나 있었나요?",
  "자신의 뜻대로 일이 진행된다고 느낀 적이 얼마나 있었나요?",
  "개인적인 문제를 처리하는 능력에 대해 자신감을 느낀적은 얼마나 있었나요?",
  "생활 속에서 일어난 중요한 변화들을 효과적으로 대처한 적이 얼마나 있었나요?",
  "짜증나고 성가신 일들을 성공적으로 처리한 적이 얼마나 있었나요?",
  "초조하거나 스트레스가 쌓인다고 느낀적이 얼마나 있었나요?",
];

const StressTestPage = () => {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [totalScore, setTotalScore] = useState<number | null>(null);
  const questionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const [isProgressBarVisible, setIsProgressBarVisible] = useState(false);
  const [isAnsweringSkipped, setIsAnsweringSkipped] = useState(false);
  const [isSubmitVisible, setIsSubmitVisible] = useState(false);

  const answeredQuestions = Object.keys(answers).length;
  const totalQuestions = PSS_QUESTIONS.length;
  const progress = (answeredQuestions / totalQuestions) * 100;

  useEffect(() => {
    const answeredIndexes = Object.keys(answers).map(Number);
    const allAnswered = answeredIndexes.length === totalQuestions;
    const lastQuestionAnswered = answeredIndexes.includes(totalQuestions - 1);

    if (allAnswered || lastQuestionAnswered) {
      setIsSubmitVisible(true);
    }
  }, [answers, totalQuestions]);

  const handleAnswerChange = (
    questionIndex: number,
    details: { value: string | null }
  ) => {
    if (!isProgressBarVisible) {
      setIsProgressBarVisible(true);
    }

    if (!details.value) return;

    const newAnswers = { ...answers, [questionIndex]: details.value };
    setAnswers(newAnswers);

    const allNowAnswered = Object.keys(newAnswers).length === totalQuestions;

    if (allNowAnswered) {
      setIsAnsweringSkipped(false);
      return;
    }

    if (isAnsweringSkipped) {
      let nextUnansweredIndex = -1;
      for (let i = questionIndex + 1; i < totalQuestions; i++) {
        if (!newAnswers[i]) {
          nextUnansweredIndex = i;
          break;
        }
      }
      if (nextUnansweredIndex === -1) {
        for (let i = 0; i < questionIndex; i++) {
          if (!newAnswers[i]) {
            nextUnansweredIndex = i;
            break;
          }
        }
      }

      if (nextUnansweredIndex !== -1) {
        questionRefs.current[nextUnansweredIndex]?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    } else {
      const nextQuestionIndex = questionIndex + 1;
      if (nextQuestionIndex < totalQuestions) {
        questionRefs.current[nextQuestionIndex]?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }
  };

  const handleSubmit = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const allAnswered = Object.keys(answers).length === totalQuestions;

    if (!allAnswered) {
      e.preventDefault();

      let firstUnansweredIndex = -1;
      for (let i = 0; i < PSS_QUESTIONS.length; i++) {
        if (!answers[i]) {
          firstUnansweredIndex = i;
          break;
        }
      }

      if (firstUnansweredIndex !== -1) {
        setIsAnsweringSkipped(true);
        questionRefs.current[firstUnansweredIndex]?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        alert("답변하지 않은 질문으로 이동합니다.");
      }
    }
  };

  const handleCalculateScore = () => {
    const allAnswered = Object.keys(answers).length === totalQuestions;
    if (!allAnswered) {
      let firstUnansweredIndex = -1;
      for (let i = 0; i < PSS_QUESTIONS.length; i++) {
        if (answers[i] === undefined) {
          firstUnansweredIndex = i;
          break;
        }
      }

      if (firstUnansweredIndex !== -1) {
        setIsAnsweringSkipped(true);
        questionRefs.current[firstUnansweredIndex]?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        alert("모든 답변을 다 선택해야 점수를 계산할 수 있습니다.");
      }
      return;
    }

    let score = 0;
    Object.entries(answers).forEach(([questionIndexStr, radioIndexStr]) => {
      const questionIndex = parseInt(questionIndexStr, 10);
      const radioIndex = parseInt(radioIndexStr, 10);

      if ((questionIndex >= 0 && questionIndex <= 3) || questionIndex === 9) {
        score += radioIndex + 1;
      } else if (questionIndex >= 4 && questionIndex <= 8) {
        score += 4 - radioIndex;
      }
    });
    setTotalScore(score);
    setTimeout(() => {
      submitButtonRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 100);
  };

  const radioStyles = [
    {
      color: "#48AF84",
      borderWidth: "2px",
      borderRadius: "50%",
      w: "40px",
      h: "40px",
    },
    {
      color: "#48AF84",
      borderWidth: "2px",
      borderRadius: "50%",
      w: "30px",
      h: "30px",
    },
    {
      color: "#8F2581",
      borderWidth: "2px",
      borderRadius: "50%",
      w: "30px",
      h: "30px",
    },
    {
      color: "#8F2581",
      borderWidth: "2px",
      borderRadius: "50%",
      w: "40px",
      h: "40px",
    },
  ];

  return (
    <Box maxW="800px" mx="auto" px={5} paddingBottom="100px">
      <Box as="header" position="sticky" top="0" zIndex={10} bg="white" py={4}>
        <Box textAlign="center" bg="#48AF84" p={6} borderRadius="md">
          <Heading fontSize="32px" size="lg" color="white" mb={5}>
            한국판 지각된 스트레스 척도
          </Heading>
          <Text fontSize="md" color="white">
            (Perceived Stress Scale, PSS)
          </Text>
        </Box>
      </Box>

      <Box>
        <Text
          fontSize="14px"
          border="1px solid #48AF84"
          borderRadius="md"
          p={5}
        >
          이 척도는 일상생활에서 주관적을 느끼는 스트레스의 정도를 평가하기 위한
          척도입니다. 지난 1개월 동안 각 문항에 해당하는 내용을 얼마나 자주
          느꼈는지 선택해주세요.
        </Text>
      </Box>

      <VStack as="main" gap={12} align="stretch" py={8}>
        {PSS_QUESTIONS.map((question, index) => (
          <Box
            key={index}
            p={6}
            borderRadius="md"
            borderWidth="1px"
            ref={(el: HTMLDivElement | null) =>
              (questionRefs.current[index] = el)
            }
            scrollMarginTop="160px"
          >
            <Text mb={4} fontWeight="medium" marginBottom="50px">
              {question}
            </Text>
            <RadioGroup
              value={answers[index]}
              onValueChange={(details) => handleAnswerChange(index, details)}
            >
              <Stack
                direction="row"
                justify="space-between"
                w="full"
                alignItems="center"
              >
                <Text>전혀없었다</Text>
                <Stack direction="row" gap={10} alignItems="center">
                  {radioStyles.map((style, radioIndex) => (
                    <CustomRadio
                      key={radioIndex}
                      value={String(radioIndex)}
                      id={`q${index}-${radioIndex}`}
                      w={style.w}
                      h={style.h}
                      borderColor={style.color}
                      borderWidth={style.borderWidth}
                      borderRadius={style.borderRadius}
                      _checked={{
                        bg: style.color,
                        borderColor: style.color,
                      }}
                      cursor="pointer"
                    />
                  ))}
                </Stack>
                <Text>자주 있었다</Text>
              </Stack>
            </RadioGroup>
          </Box>
        ))}
        <Flex
          justifyContent="space-between"
          alignItems="center"
          p={6}
          borderRadius="md"
          borderWidth="1px"
          borderColor="gray.200"
          bg="gray.50"
        >
          {totalScore !== null ? (
            <VStack align="flex-start">
              <Text fontSize="md" color="gray.600">
                스트레스 지수 총점
              </Text>
              <Text fontSize="3xl" fontWeight="bold" color="#80076F">
                {totalScore}점
              </Text>
            </VStack>
          ) : (
            <Text fontSize="md" fontWeight="medium" color="gray.500">
              모든 문항에 답변 후, 총점을 계산해보세요.
            </Text>
          )}
          <Button
            onClick={handleCalculateScore}
            bg="#48AF84"
            color="white"
            _hover={{ bg: "#3a8f6a" }}
            size="lg"
            px={8}
          >
            점수 보기
          </Button>
        </Flex>
        {isSubmitVisible && (
          <Flex justifyContent="center" mt={4}>
            <Link
              href="https://clover.uc.ac.kr/clientMain/a/t/main.do"
              target="_blank"
              rel="noopener noreferrer"
              passHref
              onClick={handleSubmit}
            >
              <Button
                ref={submitButtonRef}
                colorPalette="purple"
                size="lg"
                w="300px"
                as="span"
                bg="#80076F"
                borderRadius="30px"
              >
                상담하기
              </Button>
            </Link>
          </Flex>
        )}
      </VStack>

      {isProgressBarVisible && (
        <Box
          position="fixed"
          bottom="0"
          left="0"
          right="0"
          bg="white"
          p={4}
          boxShadow="0 -2px 10px rgba(0,0,0,0.1)"
        >
          <Box maxW="800px" mx="auto">
            <Text textAlign="right">{`${Math.round(progress)}%`}</Text>
            <Progress.Root value={progress}>
              <Progress.Track>
                <Progress.Range bg="#48AF84" />
              </Progress.Track>
            </Progress.Root>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default StressTestPage;
