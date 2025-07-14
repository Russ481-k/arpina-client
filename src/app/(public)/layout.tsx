"use client";

import { Suspense } from "react";
import { Center, Spinner } from "@chakra-ui/react";
import { FloatingButtons } from "@/components/layout/FloatingButtons";
import Layout from "@/components/layout/view/Layout";
import { useRecoilValue } from "recoil";
import { menuTreeState } from "@/stores/menu";

function LayoutWithData({ children }: { children: React.ReactNode }) {
  const menus = useRecoilValue(menuTreeState);
  return <Layout menus={menus}>{children}</Layout>;
}

export default function RoutesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense
        fallback={
          <Center h="100vh">
            <Spinner size="xl" />
          </Center>
        }
      >
        <LayoutWithData>{children}</LayoutWithData>
      </Suspense>
      <FloatingButtons />
    </>
  );
}
