import { ItemDefinition, Seg } from './types';

export const SEG_REQUIREMENTS: Record<Seg, ItemDefinition[]> = {
  S1: [
    {
      code: 'passport_info',
      name: '여권 정보면',
      icon: '📘',
      type: 'file',
      hint: '이름·사진·여권번호·만료일이 보이는 면',
    },
    {
      code: 'passport_visa',
      name: '여권 비자면',
      icon: '🛂',
      type: 'file',
      hint: '비자 도장이 있는 면',
    },
    {
      code: 'activation_date',
      name: '개통 희망일',
      icon: '📅',
      type: 'date',
      hint: '오늘 이후 날짜 선택',
    },
    {
      code: 'sim_type',
      name: 'SIM 종류',
      icon: '📶',
      type: 'select',
      options: ['uSIM (실물 SIM)', 'eSIM (디지털 SIM)'],
    },
    {
      code: 'device_model',
      name: '기기 모델명',
      icon: '📱',
      type: 'text',
      placeholder: '예: iPhone 15 Pro',
      hint: '제조사/모델명',
      validate: (v) => v.trim().length > 0,
      validateMsg: '모델명을 입력해주세요.',
    },
    {
      code: 'imei',
      name: 'IMEI (15자리)',
      icon: '🔢',
      type: 'text',
      placeholder: '15자리 숫자',
      hint: '*#06# 으로 확인 가능',
      validate: (v) => /^\d{15}$/.test(v.replace(/[\s-]/g, '')),
      validateMsg: '15자리 숫자여야 합니다.',
    },
  ],
  S2: [
    {
      code: 'passport_info',
      name: '여권 정보면',
      icon: '📘',
      type: 'file',
      hint: '이름·사진·여권번호·만료일이 보이는 면',
    },
    {
      code: 'passport_visa',
      name: '여권 비자면',
      icon: '🛂',
      type: 'file',
      hint: '비자 도장이 있는 면',
    },
    {
      code: 'current_number',
      name: '현재 사용 번호',
      icon: '📞',
      type: 'text',
      placeholder: '010-XXXX-XXXX',
      validate: (v) => /^01[0-9]-?\d{3,4}-?\d{4}$/.test(v),
      validateMsg: '한국 휴대폰 형식이 아닙니다.',
    },
    {
      code: 'current_carrier',
      name: '기존 통신사',
      icon: '🏢',
      type: 'select',
      options: ['SKT', 'KT', 'LG U+', '알뜰폰'],
    },
    {
      code: 'mnp_consent',
      name: 'MNP 동의서',
      icon: '📄',
      type: 'file',
      hint: '서명된 MNP 동의서 사진/PDF',
    },
  ],
};

export const SEG_LABELS: Record<Seg, string> = {
  S1: 'S1 신규개통·여권',
  S2: 'S2 MNP·여권',
};
