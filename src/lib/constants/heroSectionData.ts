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
  "/mypage": {
    header: "사용자정보",
    title: "마이페이지",
    image: "/images/mypage/sub_visual.png",
    breadcrumbBorderColor: "#2E3192",
    breadcrumb: [
      { label: "홈", url: "/" },
      { label: "사용자정보", url: "/mypage" },
    ],
  },
  "/sports/swimming": {
    header: "스포츠",
    title: "수영장 온라인 신청",
    image: "/images/mypage/sub_visual.png",
    breadcrumbBorderColor: "#2E3192",
    breadcrumb: [
      { label: "홈", url: "/" },
      { label: "스포츠", url: "/sports/swimming/lesson" },
    ],
  },
  "/application/confirm": {
    header: "스포츠",
    title: "수영장 온라인 신청",
    image: "/images/mypage/sub_visual.png",
    breadcrumbBorderColor: "#2E3192",
    breadcrumb: [
      { label: "홈", url: "/" },
      { label: "스포츠", url: "/sports/swimming/lesson" },
    ],
  },
  "/bbs/notices": {
    header: "알림",
    title: "공지사항",
    image: "/images/bbs/sub_visual.png",
    breadcrumbBorderColor: "#353535",
    breadcrumb: [
      { label: "홈", url: "/" },
      { label: "알림", url: "/bbs/notices" },
    ],
  },
  "/bbs/gallery": {
    header: "알림",
    title: "공지사항",
    image: "/images/bbs/sub_visual.png",
    breadcrumbBorderColor: "#353535",
    breadcrumb: [
      { label: "홈", url: "/" },
      { label: "알림", url: "/bbs/gallery" },
    ],
  },
  "/bbs/public-notice": {
    header: "알림",
    title: "고시공고",
    image: "/images/bbs/sub_visual.png",
    breadcrumbBorderColor: "#353535",
    breadcrumb: [
      { label: "홈", url: "/" },
      { label: "알림", url: "/bbs/public-notice" },
    ],
  },
  "/bbs/resources": {
    header: "알림",
    title: "자료실",
    image: "/images/bbs/sub_visual.png",
    breadcrumbBorderColor: "#353535",
    breadcrumb: [
      { label: "홈", url: "/" },
      { label: "알림", url: "/bbs/resources" },
    ],
  },
  "/bbs/faq": {
    header: "알림",
    title: "자주하는질문",
    image: "/images/bbs/sub_visual.png",
    breadcrumbBorderColor: "#353535",
    breadcrumb: [
      { label: "홈", url: "/" },
      { label: "알림", url: "/bbs/faq" },
    ],
  },
  "/bbs/bdc": {
    header: "알림",
    title: "부산도시공사",
    image: "/images/bbs/sub_visual.png",
    breadcrumbBorderColor: "#353535",
    breadcrumb: [
      { label: "홈", url: "/" },
      { label: "알림", url: "/bbs/bdc" },
    ],
  },
  "/bbs/voice": {
    header: "알림",
    title: "고객의소리",
    image: "/images/bbs/sub_visual.png",
    breadcrumbBorderColor: "#353535",
    breadcrumb: [
      { label: "홈", url: "/" },
      { label: "알림", url: "/bbs/voice" },
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
