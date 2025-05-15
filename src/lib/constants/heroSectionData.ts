export const heroSectionData: Record<
  string,
  {
    header: string;
    title: string;
    image: string;
    breadcrumbBorderColor: string;
    breadcrumb: { label: string; url: string }[];
  }
> = {
  "/bbs/faq": {
    header: "종합게시판",
    title: "자주하는질문",
    image: "/images/bbs/sub_visual.png",
    breadcrumbBorderColor: "#353535",
    breadcrumb: [
      { label: "홈", url: "/" },
      { label: "종합게시판", url: "/bbs/faq" },
    ],
  },
  "/bbs/notice": {
    header: "종합게시판",
    title: "센터소식",
    image: "/images/bbs/sub_visual.png",
    breadcrumbBorderColor: "#353535",
    breadcrumb: [
      { label: "홈", url: "/" },
      { label: "종합게시판", url: "/bbs/notice" },
    ],
  },
  "/bbs/public-notice": {
    header: "종합게시판",
    title: "고시공고",
    image: "/images/bbs/sub_visual.png",
    breadcrumbBorderColor: "#353535",
    breadcrumb: [
      { label: "홈", url: "/" },
      { label: "종합게시판", url: "/bbs/public-notice" },
    ],
  },
  "/bbs/qna": {
    header: "종합게시판",
    title: "답변게시판",
    image: "/images/bbs/sub_visual.png",
    breadcrumbBorderColor: "#353535",
    breadcrumb: [
      { label: "홈", url: "/" },
      { label: "종합게시판", url: "/bbs/qna" },
    ],
  },
  "/reference/press": {
    header: "자료실",
    title: "보도자료",
    image: "/images/reference/sub_visual.png",
    breadcrumbBorderColor: "#353535",
    breadcrumb: [
      { label: "홈", url: "/" },
      { label: "자료실", url: "/reference/press" },
    ],
  },
  "/reference/form": {
    header: "자료실",
    title: "서식",
    image: "/images/reference/sub_visual.png",
    breadcrumbBorderColor: "#353535",
    breadcrumb: [
      { label: "홈", url: "/" },
      { label: "자료실", url: "/reference/form" },
    ],
  },
  "/about/overview": {
    header: "센터안내",
    title: "시설개요",
    image: "/images/about/sub_visual.png",
    breadcrumbBorderColor: "#353535",
    breadcrumb: [
      { label: "홈", url: "/" },
      { label: "센터안내", url: "/about/overview" },
    ],
  },
  "/program/gs-class": {
    header: "창업기업 모집",
    title: "모집공고",
    image: "/images/program/sub_visual.png",
    breadcrumbBorderColor: "#353535",
    breadcrumb: [
      { label: "홈", url: "/" },
      { label: "창업기업 모집", url: "/program/gs-class" },
    ],
  },
  "/program/grow-up": {
    header: "창업기업 모집",
    title: "모집공고",
    image: "/images/program/sub_visual.png",
    breadcrumbBorderColor: "#353535",
    breadcrumb: [
      { label: "홈", url: "/" },
      { label: "창업기업 모집", url: "/program/grow-up" },
    ],
  },
  "/about/greet": {
    header: "센터안내",
    title: "인사말",
    image: "/images/about/sub_visual.png",
    breadcrumbBorderColor: "#353535",
    breadcrumb: [
      { label: "홈", url: "/" },
      { label: "센터안내", url: "/about/greet" },
    ],
  },
  "/about/location": {
    header: "센터안내",
    title: "오시는길",
    image: "/images/about/sub_visual.png",
    breadcrumbBorderColor: "#353535",
    breadcrumb: [
      { label: "홈", url: "/" },
      { label: "센터안내", url: "/about/location" },
    ],
  },
  "/about/contact": {
    header: "센터안내",
    title: "문의하기",
    image: "/images/about/sub_visual.png",
    breadcrumbBorderColor: "#353535",
    breadcrumb: [
      { label: "홈", url: "/" },
      { label: "센터안내", url: "/about/contact" },
    ],
  },
  "/program/scale-up": {
    header: "창업기업 모집",
    title: "모집공고",
    image: "/images/program/sub_visual.png",
    breadcrumbBorderColor: "#353535",
    breadcrumb: [
      { label: "홈", url: "/" },
      { label: "창업기업 모집", url: "/program/scale-up" },
    ],
  },
  "/reference/process": {
    header: "자료실",
    title: "입주신청절차",
    image: "/images/reference/sub_visual.png",
    breadcrumbBorderColor: "#353535",
    breadcrumb: [
      { label: "홈", url: "/" },
      { label: "자료실", url: "/reference/process" },
    ],
  },
  "/reference/apply": {
    header: "자료실",
    title: "프로그램신청안내",
    image: "/images/reference/sub_visual.png",
    breadcrumbBorderColor: "#353535",
    breadcrumb: [
      { label: "홈", url: "/" },
      { label: "자료실", url: "/reference/apply" },
    ],
  },
  "/enterprise/participants": {
    header: "입주기업소개",
    title: "입주현황",
    image: "/images/enterprise/sub_visual.png",
    breadcrumbBorderColor: "#353535",
    breadcrumb: [
      { label: "홈", url: "/" },
      { label: "창업기업 소개", url: "/enterprise/participants" },
    ],
  },
  // ...다른 게시판 추가
};
