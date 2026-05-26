import { ItemCode } from './types';

export const SUPP_CATEGORIES: Record<ItemCode, string[]> = {
  passport_info: [
    '사진이 흐릿함 - 재촬영 필요',
    '정보면 일부 가림 - 정면 재촬영',
    '만료일 임박/지남 - 재발급 후 제출',
  ],
  passport_visa: ['비자 도장 안 보임 - 재촬영', '잘못된 페이지 첨부'],
  activation_date: [
    '과거 날짜 입력됨 - 미래 날짜로 재입력',
    '운영 가능일 외 - 조정 필요',
  ],
  sim_type: ['기기와 호환 안 됨 - 다른 SIM 종류 선택'],
  device_model: ['모델명 불명확 - 정확한 모델명 재입력'],
  imei: [
    '형식 오류 - 15자리 숫자 재입력',
    '오타 의심 - 재확인 후 입력',
  ],
  current_number: ['번호 형식 오류', '본인 명의 아님 - 확인 필요'],
  current_carrier: ['통신사 정보 불일치'],
  mnp_consent: ['서명 누락', '본인 서명 아님 - 재제출', '동의서 양식 오류'],
};
