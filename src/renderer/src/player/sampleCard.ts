import type { StoryCard } from '@shared/types/card'

/** 엔진/플레이어 UI 동작 확인용 샘플 카드 (실제 콘텐츠 제작 파이프라인 결과물이 아님) */
export const sampleCard: StoryCard = {
  card_id: 'sample_001',
  character: {
    name: '리아',
    personality: '차분하지만 호기심이 많다',
    speech_style: '존댓말, 짧고 담백한 문장'
  },
  outline: {
    world_setting: '작은 산골 마을의 오래된 도서관',
    target_depth: 6
  },
  required_nodes: [
    {
      node_id: 'req_1',
      approx_stage: 1,
      text: '리아: 어서오세요. 이 도서관에 온 건 처음이시죠?',
      fixed: true,
      next_node: 'n_branch_1',
      allow_free_text: false,
      image_ids: ['img_library_day']
    },
    {
      node_id: 'req_2',
      approx_stage: 4,
      text: '리아: ...당신에게만 보여주고 싶은 게 있어요.',
      fixed: true,
      next_node: 'n_free_text',
      allow_free_text: false,
      image_ids: ['img_library_secret']
    }
  ],
  ending_nodes: [
    {
      ending_id: 'end_good',
      text: '리아: 다음에 또 와주세요. 기다리고 있을게요.',
      requirements: '호감도 높음',
      path_count: 1,
      image_ids: ['img_library_sunset']
    },
    {
      ending_id: 'end_neutral',
      text: '리아: 네, 안녕히 가세요.',
      requirements: '기본값',
      path_count: 1,
      image_ids: ['img_library_day']
    }
  ],
  story_nodes: [
    {
      node_id: 'n_branch_1',
      type: 'branch',
      text: '리아: 오늘은 어떤 책을 찾으세요?',
      image_ids: ['img_library_day', 'img_library_shelves'],
      choices: [
        { label: '옛날이야기책을 찾고 있어요', next_node: 'n_kind' },
        { label: '그냥 둘러보러 왔어요', next_node: 'n_neutral' }
      ]
    },
    {
      node_id: 'n_kind',
      type: 'linear',
      text: '리아: (살짝 웃으며) 좋은 취향이네요. 이쪽으로 오세요.',
      image_ids: ['img_library_shelves'],
      next_node: 'req_2'
    },
    {
      node_id: 'n_neutral',
      type: 'linear',
      text: '리아: 편하게 둘러보세요.',
      image_ids: ['img_library_day'],
      next_node: 'end_neutral'
    },
    {
      node_id: 'n_free_text',
      type: 'linear',
      text: '리아가 오래된 책 한 권을 조심스럽게 꺼내 보여줍니다.',
      image_ids: ['img_library_secret'],
      allow_free_text: true,
      next_node: 'end_good'
    }
  ],
  assets: {
    media_set: [
      { id: 'img_library_day', type: 'image', source: 'uploaded', file: 'library_day.png' },
      { id: 'img_library_shelves', type: 'image', source: 'uploaded', file: 'library_shelves.png' },
      {
        id: 'img_library_secret',
        type: 'image',
        source: 'generated',
        generation: { provider: 'sample', prompt: '오래된 책이 놓인 비밀 서가' },
        file: 'library_secret.png'
      },
      { id: 'img_library_sunset', type: 'image', source: 'uploaded', file: 'library_sunset.png' }
    ],
    default_transition_seconds: 5,
    animation_style: 'subtle_zoom'
  }
}
