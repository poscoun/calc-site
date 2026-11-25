import { guides, type GuideMeta } from "./guides";

export type GuideTopic = {
  id: string;
  name: string;
  /** 이 주제에 속하는 계산기 slug (글의 calculator로 분류) */
  calculators: string[];
};

// 표시 순서. 새 계산기를 추가하면 여기에도 넣는다 (guide-topics.test.ts가 누락을 잡는다).
export const TOPICS: GuideTopic[] = [
  { id: "yearend", name: "연말정산", calculators: ["yearend-tax"] },
  { id: "salary", name: "월급·실수령액", calculators: ["net-salary"] },
  { id: "retirement", name: "퇴직금·실업급여", calculators: ["severance-pay", "unemployment-benefit"] },
  { id: "work", name: "주휴수당·연차", calculators: ["weekly-holiday-pay", "annual-leave"] },
  { id: "loan", name: "대출", calculators: ["loan-interest"] },
];

export type TopicGroup = GuideTopic & { guides: GuideMeta[] };

/** 주제별 글 목록 (각 주제 안에서는 guides 순서, 즉 최신순). 글이 없는 주제는 뺀다. */
export function guidesByTopic(list: GuideMeta[] = guides): TopicGroup[] {
  return TOPICS.map((t) => ({ ...t, guides: list.filter((g) => t.calculators.includes(g.calculator)) })).filter((t) => t.guides.length > 0);
}
