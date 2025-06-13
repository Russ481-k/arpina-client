"use client";

import React from "react";
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  VStack,
  HStack,
  IconButton,
  Text,
  Textarea,
  Input,
  Separator,
  Checkbox,
  Field,
  Fieldset,
  RadioGroup,
  For,
  Select,
  createListCollection,
  Portal,
  Grid,
} from "@chakra-ui/react";
import { useGroupReservationForm } from "@/hooks/useGroupReservationForm";
import { AgreementItem } from "@/app/(public)/signup/components/AgreementItem";
import { MinusIcon, PlusIcon } from "lucide-react";
import Image from "next/image";
import { SIGNUP_AGREEMENT_TEMPLATES } from "@/data/agreements";

const seminarRoomsData = {
  대회의실: ["대회의실"],
  중회의실: ["시걸", "클로버", "자스민"],
  소회의실: ["가람", "누리", "오션"],
};

const seatingArrangements = createListCollection({
  items: ["강의식", "극장식", "ㄷ자", "H자", "T자"].map((item) => ({
    label: item,
    value: item,
  })),
});
const eventTypes = createListCollection({
  items: ["세미나", "워크숍", "컨퍼런스", "기타"].map((item) => ({
    label: item,
    value: item,
  })),
});
const usageTimes = createListCollection({
  items: ["오전 (09:00-12:00)", "오후 (13:00-18:00)", "종일 (09:00-18:00)"].map(
    (item) => ({ label: item, value: item })
  ),
});

const seminarRoomSizes = createListCollection({
  items: Object.keys(seminarRoomsData).map((item) => ({
    label: item,
    value: item,
  })),
});

const getSeminarRoomTypes = (size: string) => {
  const types = seminarRoomsData[size as keyof typeof seminarRoomsData] || [];
  return createListCollection({
    items: types.map((item) => ({ label: item, value: item })),
  });
};

export default function GroupReservationPage() {
  const {
    formData,
    isLoading,
    updateField,
    updateRoomField,
    addRoomRequest,
    removeRoomRequest,
    handleSubmit,
  } = useGroupReservationForm();

  const handleAgreementChange = (
    agreementKey: "privacy_agreed" | "marketing_agreed",
    isChecked: boolean
  ) => {
    updateField(agreementKey, isChecked);
  };

  const handleAllAgreementChange = (isChecked: boolean) => {
    updateField("privacy_agreed", isChecked);
    updateField("marketing_agreed", isChecked);
  };

  const areAllAgreed = formData.privacy_agreed && formData.marketing_agreed;

  return (
    <Container maxW="800px" py={12}>
      <VStack as="form" onSubmit={handleSubmit} gap={8} align="stretch">
        <Heading as="h1" size="xl" textAlign="center">
          회의실 단체 예약 문의
        </Heading>

        {/* Agreements */}
        <VStack gap={4} align="stretch">
          <Box>
            <Checkbox.Root
              variant="subtle"
              colorPalette="orange" // This will color the checkmark and box in orange theme
              size="md" // Adjust size as needed
              checked={areAllAgreed}
              onCheckedChange={(details) =>
                handleAllAgreementChange(details.checked === true)
              }
            >
              <Checkbox.HiddenInput />
              <Checkbox.Control />
              <Checkbox.Label fontWeight="bold" fontSize="md">
                아래의 모든 사항에 동의합니다.
              </Checkbox.Label>
            </Checkbox.Root>
            <Separator my={4} />
          </Box>
          <AgreementItem
            title="개인정보 수집 및 이용 동의"
            isRequired={true}
            isChecked={formData.privacy_agreed}
            onChange={(isChecked: boolean) =>
              handleAgreementChange("privacy_agreed", isChecked)
            }
          >
            <Textarea
              value={
                SIGNUP_AGREEMENT_TEMPLATES.find(
                  (agreement) => agreement.id === "terms"
                )?.details
              }
              readOnly
              border="1px solid"
              borderColor="gray.200"
              p={3}
              borderRadius="md"
              mt={2}
              fontSize="sm"
              h="240px"
              w="full"
              overflowY="auto"
              bg="gray.50"
              resize="none"
            />
          </AgreementItem>
          <AgreementItem
            title="선택 수집 항목(마케팅 활용)에 대한 동의"
            isRequired={false}
            isChecked={formData.marketing_agreed}
            onChange={(isChecked: boolean) =>
              handleAgreementChange("marketing_agreed", isChecked)
            }
          >
            <Textarea
              value={
                SIGNUP_AGREEMENT_TEMPLATES.find(
                  (agreement) => agreement.id === "marketing"
                )?.details
              }
              readOnly
              border="1px solid"
              borderColor="gray.200"
              p={3}
              borderRadius="md"
              mt={2}
              fontSize="sm"
              h="240px"
              w="full"
              overflowY="auto"
              bg="gray.50"
              resize="none"
            />
          </AgreementItem>
        </VStack>

        {/* Event Info */}
        <Fieldset.Root>
          <Fieldset.Legend>행사정보</Fieldset.Legend>
          <VStack gap={4} align="stretch" mt={4}>
            <Field.Root>
              <Field.Label>행사구분</Field.Label>
              <Select.Root
                collection={eventTypes}
                value={formData.event_type ? [formData.event_type] : []}
                onValueChange={(details) =>
                  updateField("event_type", details.value[0])
                }
              >
                <Select.Control>
                  <Select.Trigger>
                    <Select.ValueText placeholder="선택해주세요" />
                  </Select.Trigger>
                </Select.Control>
                <Portal>
                  <Select.Positioner>
                    <Select.Content>
                      <For each={eventTypes.items}>
                        {(item) => (
                          <Select.Item item={item} key={item.value}>
                            <Select.ItemText>{item.label}</Select.ItemText>
                            <Select.ItemIndicator />
                          </Select.Item>
                        )}
                      </For>
                    </Select.Content>
                  </Select.Positioner>
                </Portal>
              </Select.Root>
            </Field.Root>

            <Field.Root>
              <Field.Label>행사명</Field.Label>
              <Input
                placeholder="행사명을 입력해주세요"
                value={formData.event_name}
                onChange={(e) => updateField("event_name", e.target.value)}
              />
            </Field.Root>

            <For each={formData.room_reservations}>
              {(room, index) => (
                <Flex
                  key={index}
                  direction="column"
                  p={4}
                  borderWidth={1}
                  borderRadius="md"
                  mt={4}
                  gap={3}
                >
                  <Flex align="center" justify="space-between">
                    <Text fontWeight="bold">세미나실 {index + 1}</Text>
                    {formData.room_reservations.length > 1 && (
                      <IconButton
                        aria-label="Remove room"
                        size="sm"
                        onClick={() => removeRoomRequest(index)}
                        variant="ghost"
                      >
                        <MinusIcon />
                      </IconButton>
                    )}
                  </Flex>
                  <Flex gap={2}>
                    <Select.Root
                      collection={seminarRoomSizes}
                      value={room.room_size_desc ? [room.room_size_desc] : []}
                      onValueChange={(details) => {
                        updateRoomField(
                          index,
                          "room_size_desc",
                          details.value[0]
                        );
                        updateRoomField(index, "room_type_desc", ""); // Reset type on size change
                      }}
                    >
                      <Select.Control>
                        <Select.Trigger>
                          <Select.ValueText placeholder="세미나실 크기" />
                        </Select.Trigger>
                      </Select.Control>
                      <Portal>
                        <Select.Positioner>
                          <Select.Content>
                            <For each={seminarRoomSizes.items}>
                              {(item) => (
                                <Select.Item item={item} key={item.value}>
                                  <Select.ItemText>
                                    {item.label}
                                  </Select.ItemText>
                                  <Select.ItemIndicator />
                                </Select.Item>
                              )}
                            </For>
                          </Select.Content>
                        </Select.Positioner>
                      </Portal>
                    </Select.Root>
                    <Select.Root
                      collection={getSeminarRoomTypes(room.room_size_desc)}
                      value={room.room_type_desc ? [room.room_type_desc] : []}
                      onValueChange={(details) =>
                        updateRoomField(
                          index,
                          "room_type_desc",
                          details.value[0]
                        )
                      }
                      disabled={!room.room_size_desc}
                    >
                      <Select.Control>
                        <Select.Trigger>
                          <Select.ValueText placeholder="세미나실 종류" />
                        </Select.Trigger>
                      </Select.Control>
                      <Portal>
                        <Select.Positioner>
                          <Select.Content>
                            <For
                              each={
                                getSeminarRoomTypes(room.room_size_desc).items
                              }
                            >
                              {(item) => (
                                <Select.Item item={item} key={item.value}>
                                  <Select.ItemText>
                                    {item.label}
                                  </Select.ItemText>
                                  <Select.ItemIndicator />
                                </Select.Item>
                              )}
                            </For>
                          </Select.Content>
                        </Select.Positioner>
                      </Portal>
                    </Select.Root>
                  </Flex>
                  <Flex gap={2} align="center">
                    <Input
                      type="date"
                      value={room.start_date}
                      onChange={(e) =>
                        updateRoomField(index, "start_date", e.target.value)
                      }
                    />
                    <Text>~</Text>
                    <Input
                      type="date"
                      value={room.end_date}
                      onChange={(e) =>
                        updateRoomField(index, "end_date", e.target.value)
                      }
                    />
                    <Select.Root
                      collection={usageTimes}
                      value={room.usage_time_desc ? [room.usage_time_desc] : []}
                      onValueChange={(details) =>
                        updateRoomField(
                          index,
                          "usage_time_desc",
                          details.value[0]
                        )
                      }
                    >
                      <Select.Control>
                        <Select.Trigger>
                          <Select.ValueText placeholder="사용시간" />
                        </Select.Trigger>
                      </Select.Control>
                      <Portal>
                        <Select.Positioner>
                          <Select.Content>
                            <For each={usageTimes.items}>
                              {(item) => (
                                <Select.Item item={item} key={item.value}>
                                  <Select.ItemText>
                                    {item.label}
                                  </Select.ItemText>
                                  <Select.ItemIndicator />
                                </Select.Item>
                              )}
                            </For>
                          </Select.Content>
                        </Select.Positioner>
                      </Portal>
                    </Select.Root>
                  </Flex>
                </Flex>
              )}
            </For>
            <Button onClick={addRoomRequest} variant="outline">
              <HStack>
                <PlusIcon />
                <Text>세미나실 추가</Text>
              </HStack>
            </Button>

            <Field.Root>
              <Field.Label>좌석배치방식</Field.Label>
              <RadioGroup.Root
                colorPalette="teal"
                value={formData.seating_arrangement}
                onValueChange={(details) =>
                  updateField("seating_arrangement", details.value ?? "")
                }
              >
                <HStack gap={4} align="flex-start" flexWrap="wrap">
                  <For each={seatingArrangements.items}>
                    {(item) => (
                      <RadioGroup.Item
                        key={item.value}
                        value={item.value}
                        p={2}
                        w="130px"
                        h="130px"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <VStack>
                          <RadioGroup.ItemHiddenInput />
                          <Image
                            src={`/images/meeting/${item.label}.png`}
                            alt={item.label}
                            width={100}
                            height={100}
                            style={{ objectFit: "contain" }}
                          />
                          <Box display="flex" flexDirection="row" gap={1}>
                            <RadioGroup.ItemIndicator />
                            <RadioGroup.ItemText>
                              {item.label}
                            </RadioGroup.ItemText>
                          </Box>
                        </VStack>
                      </RadioGroup.Item>
                    )}
                  </For>
                </HStack>
              </RadioGroup.Root>
            </Field.Root>

            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
              <Field.Root>
                <Field.Label>인원수</Field.Label>
                <Flex gap={4}>
                  <Field.Root required>
                    <Field.Label>성인</Field.Label>
                    <Input
                      type="number"
                      value={formData.adult_attendees}
                      onChange={(e) =>
                        updateField(
                          "adult_attendees",
                          parseInt(e.target.value, 10) || 0
                        )
                      }
                    />
                  </Field.Root>
                  <Field.Root required>
                    <Field.Label>소인</Field.Label>
                    <Input
                      type="number"
                      value={formData.child_attendees}
                      onChange={(e) =>
                        updateField(
                          "child_attendees",
                          parseInt(e.target.value, 10) || 0
                        )
                      }
                    />
                  </Field.Root>
                </Flex>
              </Field.Root>
            </Grid>
            <Field.Root>
              <Field.Label>식당 사용 여부</Field.Label>
              <RadioGroup.Root
                colorPalette="teal"
                value={String(formData.dining_service_usage)}
                onValueChange={(details) =>
                  updateField("dining_service_usage", details.value === "true")
                }
              >
                <HStack gap={4}>
                  <RadioGroup.Item value="false">
                    <RadioGroup.ItemHiddenInput />
                    <RadioGroup.ItemIndicator />
                    <RadioGroup.ItemText>사용안함</RadioGroup.ItemText>
                  </RadioGroup.Item>
                  <RadioGroup.Item value="true">
                    <RadioGroup.ItemHiddenInput />
                    <RadioGroup.ItemIndicator />
                    <RadioGroup.ItemText>사용함</RadioGroup.ItemText>
                  </RadioGroup.Item>
                </HStack>
              </RadioGroup.Root>
            </Field.Root>
            <Field.Root>
              <Field.Label>기타문의</Field.Label>
              <Textarea
                placeholder="기타 문의사항을 입력해주세요."
                value={formData.other_requests}
                onChange={(e) => updateField("other_requests", e.target.value)}
              />
            </Field.Root>
          </VStack>
        </Fieldset.Root>

        {/* Customer Info */}
        <Fieldset.Root>
          <Fieldset.Legend>고객정보</Fieldset.Legend>
          <VStack gap={4} align="stretch" mt={4}>
            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
              <Field.Root required>
                <Field.Label>단체명</Field.Label>
                <Input
                  placeholder="단체명을 입력해주세요"
                  value={formData.customer_group_name}
                  onChange={(e) =>
                    updateField("customer_group_name", e.target.value)
                  }
                />
              </Field.Root>
              <Field.Root>
                <Field.Label>소속지역</Field.Label>
                <Input
                  placeholder="소속지역을 입력해주세요"
                  value={formData.customer_region}
                  onChange={(e) =>
                    updateField("customer_region", e.target.value)
                  }
                />
              </Field.Root>
              <Field.Root required>
                <Field.Label>담당자명</Field.Label>
                <Input
                  placeholder="담당자명을 입력해주세요"
                  value={formData.contact_person_name}
                  onChange={(e) =>
                    updateField("contact_person_name", e.target.value)
                  }
                />
              </Field.Root>
              <Field.Root>
                <Field.Label>부서 및 직위</Field.Label>
                <Input
                  placeholder="부서 및 직위를 입력해주세요"
                  value={formData.contact_person_dpt}
                  onChange={(e) =>
                    updateField("contact_person_dpt", e.target.value)
                  }
                />
              </Field.Root>
              <Field.Root required>
                <Field.Label>담당자 연락처</Field.Label>
                <Input
                  type="tel"
                  placeholder="연락처를 입력해주세요"
                  value={formData.contact_person_phone}
                  onChange={(e) =>
                    updateField("contact_person_phone", e.target.value)
                  }
                />
              </Field.Root>
              <Field.Root required>
                <Field.Label>담당자 이메일</Field.Label>
                <Input
                  type="email"
                  placeholder="이메일을 입력해주세요"
                  value={formData.contact_person_email}
                  onChange={(e) =>
                    updateField("contact_person_email", e.target.value)
                  }
                />
              </Field.Root>
            </Grid>
          </VStack>
        </Fieldset.Root>

        <Button
          colorPalette="teal"
          size="lg"
          onClick={handleSubmit}
          loading={isLoading}
          type="submit"
          w="full"
        >
          문의하기
        </Button>
      </VStack>
    </Container>
  );
}
