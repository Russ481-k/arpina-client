import {
  LuLayoutPanelLeft,
  LuFileText,
  LuCalendar,
  LuUser,
  LuLayoutPanelTop,
  LuBuilding2,
  LuAlarmClockCheck,
  LuFiles,
} from "react-icons/lu";
export const MenuItems = [
  // { icon: LuHouse, label: "HOME", path: "/cms/dashboard" },
  { icon: LuFileText, label: "메뉴관리", path: "/cms/menu" },
  // { icon: LuLayoutPanelTop, label: "템플릿관리", path: "/cms/template" },
  // { icon: LuLayoutPanelLeft, label: "컨텐츠관리", path: "/cms/content" },
  { icon: LuCalendar, label: "게시판관리", path: "/cms/board" },
  { icon: LuAlarmClockCheck, label: "일정관리", path: "/cms/schedule" },
  { icon: LuBuilding2, label: "입주관리", path: "/cms/enterprise" },
  // { icon: LuFiles, label: "파일관리", path: "/cms/file" },
  // { icon: LuUser, label: "사용자관리", path: "/cms/user" },
];
