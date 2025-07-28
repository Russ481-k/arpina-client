interface OpenChatOptions {
  threadId?: string | number;
  userName: string;
  userType: 'USER' | 'ADMIN';
}

export function openChatPopup({ threadId = 1, userName, userType }: OpenChatOptions) {
  const width = 500;
  const height = 600;
  const left = window.screen.width - width - 20;
  const top = window.screen.height - height - 100;

  // 팝업 창 열기
  const popup = window.open(
    `/chat-popup?threadId=${threadId}&userName=${userName}&userType=${userType}`,
    `chatWindow_${userType.toLowerCase()}_${Date.now()}`,
    `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=no,location=no,menubar=no`
  );

  // 팝업 창이 차단되었는지 확인
  if (!popup || popup.closed || typeof popup.closed === 'undefined') {
    alert('팝업 창이 차단되었습니다. 팝업 차단을 해제해주세요.');
  }

  return popup;
} 