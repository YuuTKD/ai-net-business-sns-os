# 実装スケジュール & ゴーイング・チェックリスト
## AI-NET-BUSINESS 収益化加速（2026年8月-9月）

**対象**: SNS 運用チーム・開発チーム  
**期限**: 2026-08-04 〜 2026-09-30  
**所有者**: ゆうさん CEO  

---

## Timeline Overview

```
2026-08-04 (Mon)    ⇦ TODAY (Go/No-Go Decision)
├─ 実装キックオフ
├─ API 認証準備 START
└─ posts_queue_v2.csv & note 初稿 作成 START

2026-08-11 (Mon)
├─ DEV_RIO_801 (note) テスト完了 → 初投稿実施
├─ メルマガ登録フォーム ライブ
└─ Threads post_7 投稿 (既存 post_4-6 フォローアップ)

2026-08-18 (Mon)
├─ DEV_RIO_802 (Instagram) テスト完了 → 初投稿実施
├─ Instagram weekly 2x schedule 開始
└─ メルマガ Vol.2 配信 (note セルアップ)

2026-08-25 (Mon)
├─ 全媒体 統合テスト完了
├─ KPI ダッシュボード ライブ
└─ Threads post_8-11 スケジュール確定

2026-08-31 (Sun) ⇦ Month 1 Review
├─ LTV 測定レポート 作成
├─ Go/Stop 判定 実施
└─ 9月 拡大 Plan 承認

2026-09-30 (Tue) ⇦ Month 2 End
├─ 月間売上 ¥68,000 達成確認
├─ フォロワー 3 媒体合算 3.2K+ 達成確認
└─ Q4 戦略会議 開催
```

---

## Week-by-Week Task Breakdown

### 📅 Week 1: Aug 4-10 (Infrastructure & Preparation)

#### Mon 8/4
**朝: キックオフ会議 (09:00 JST)**
- [ ] Attendees: ゆうさん, dev_lead, ops_lead, writer_lead
- [ ] Agenda:
  1. 戦略書 & n8n 仕様書 読み合わせ (15 min)
  2. API キー 配布 & 認証確認 (15 min)
  3. 各チームの工数コミット (15 min)
  4. 初週の期待値 & ブロッカー共有 (15 min)
- [ ] 成果物: タスク JIRA / GitHub Issues 登録完了

**API 認証準備 (並行)**
- [ ] dev: note.com OAuth 2.0 token 取得
  - 手順: note Settings → API applications → 新規作成
  - テスト実行: `GET /api/v1/user/me` で認証確認
  - タイムラック: 15 min
- [ ] dev: Meta Graph API token 有効化
  - Instagram ビジネスアカウント確認 (ai_store_lab)
  - 手順: Meta Developers → Apps → Instagram Basic Display + Graph API 権限追加
  - タイムライン: 30 min (Meta側レビュー遅れ可能性)
- [ ] dev: Mailchimp API key 確認
  - 既存 Mailchimp 登録 確認
  - List ID: {list_id_warmers}, {list_id_customers}, {list_id_vip}
  - タイムライン: 10 min

**posts_queue_v2.csv 作成**
- [ ] ops: Google Sheets テンプレ 作成
  - Columns: id, content_id, media, scheduled, status, approver_action, url, channels, include_rakuten, note_eye_catch_prompt, ig_hashtags, utm_source, utm_campaign, mailchimp_segment
  - Sample data 3 行作成 (post_4, 5, 6)
  - Sharing: dev / ops 両チーム Read-Write
  - タイムライン: 30 min
- [ ] ops: CSV export 設定
  - `File > Download > CSV` ショートカット確認
  - n8n で読込 URL 設定 (share link → export?format=csv)

**note 初稿 3 本 執筆**
- [ ] writer: post_4 用 note 記事 執筆
  - Title: "待ち時間クレームへの返信例 25 パターン限定公開"
  - Length: 2,000-3,000 文字
  - Includes: Brain キット ¥1,980 + テンプレ ¥980 販売導線
  - CTA: メルマガ登録フォーム
  - Deadline: 水 18:00
- [ ] writer: post_7 用 note 記事 執筆
  - Title: "口コミ返信の NGパターン 3つと正解例"
  - Length: 1,500-2,000
  - CTA: Brain キット
  - Deadline: 水 18:00
- [ ] writer: post_11 用 note 記事 執筆
  - Title: "実装チェックリスト：24時間で口コミ返信体制を作る"
  - Length: 2,500-3,000 (充実版)
  - CTA: コンサル相談 + メルマガ VIP 層向け
  - Deadline: 水 18:00

#### Tue 8/5 - Thu 8/7
**n8n ワークフロー 骨組み作成**
- [ ] dev: DEV_RIO_800 (Multi-Channel Distributor) 骨組み
  - Manual Trigger ノード
  - Read CSV (Google Drive link)
  - Filter Scheduled Items
  - Switch/Route ノード (channels 分岐用)
  - タイムライン: 3h
- [ ] dev: DEV_RIO_701 (Threads拡張版) 準備
  - 既存 DEV_RIO_705 をコピー
  - メルマガ QR コード生成ノード 追加 (skeleton)
  - タイムライン: 1h
- [ ] dev: DEV_RIO_801 (note) skeleton
  - note Payload Builder ノード
  - note API POST ノード (認証 connect)
  - Publish Decision (if/else)
  - タイムライン: 2h
- [ ] dev: DEV_RIO_802 (Instagram) skeleton
  - Instagram Payload Builder ノード
  - Meta Graph API POST (認証 connect)
  - タイムライン: 2h
- [ ] dev: DEV_RIO_803 (Mailchimp) skeleton
  - Webhook 受信 ノード (Typeform)
  - Mailchimp API POST (認証 connect)
  - タイムライン: 1.5h

**ハッシュタグ & メタデータ準備**
- [ ] writer: Instagram ハッシュタグ辞書 作成
  - Primary: #口コミ返信, #店舗集客, #GoogleBusiness (各投稿共通)
  - Secondary by theme:
    - reply-template: #返信テンプレ, #ビジネス, #飲食店
    - ai-automation: #AI, #自動化, #業務効率化
    - case-study: #事例紹介, #成功, #ケーススタディ
  - Cooldown: 投稿のたびに monthly rotation (重複回避)
  - Format: CSV (tag_name, category, frequency_max_per_month)
  - Deadline: 金 12:00
- [ ] writer: note eye-catch プロンプト テンプレ 3 種
  - Template A: スマートフォン操作（手元アップ）
  - Template B: チェックリスト紙 & ペン
  - Template C: グラフ / チャート
  - Deadline: 金 12:00

**QA & テスト計画**
- [ ] dev: API テスト リスト作成
  - note: GET /user/me, POST /articles, GET /articles/{id}
  - Instagram: GET /ig_user_id/media, POST /media
  - Mailchimp: POST /lists/{id}/members
  - 各テスト 1-3 件 成功サンプル用意
  - Deadline: 金 15:00

#### Fri 8/8-10
**Week 1  微調整 & 準備完了**
- [ ] dev: API 認証完了 確認
  - note, Instagram, Mailchimp 全て接続テスト実施
  - Errors log: Slack #dev-errors へ自動投稿
- [ ] ops: posts_queue_v2.csv 最終版 Google Sheets 完成
  - post_4, 5, 6, 7 データ確定
  - Read-only share link 作成 (ゆうさん → 全チーム)
- [ ] writer: note 初稿 3 本 ドラフト完成
  - Sales review: ゆうさん承認 または 修正依頼
  - Note として save (公開はまだ)
- [ ] dev: ワークフロー skeleton デプロイ
  - 実際の n8n クラウド へ 4 つのワークフロー save
  - Version: v0.1-skeleton
  - Errors: 無視可（ノード接続未完了）

**金 17:00: Week 1 チェックポイント**
- [ ] Checklist:
  - [ ] API 認証 3/3 完了？
  - [ ] posts_queue_v2.csv 確定？
  - [ ] note 初稿 3/3 完成？
  - [ ] n8n skeleton 4/4 デプロイ？
  - [ ] ハッシュタグ辞書 完成？
- [ ] Go/Stop 判定:
  - ✅ Go: 上記 5 項目全て ✓ の場合 → Week 2 本実装へ
  - ⚠️ Caution: 2-3 項目未完 → 月曜朝の修正実施
  - 🛑 Stop: 3 項目以上未完 → 会議 + スケジュール調整

---

### 📅 Week 2: Aug 11-17 (Development & Testing)

#### Mon 8/11 (Day 1 of Go-Live Prep)

**朝: Week 2 キックオフ (08:30 JST)**
- [ ] 確認: Week 1 チェックポイント 全 Go？
- [ ] 今週ミッション:
  1. DEV_RIO_801 (note) テスト & 初投稿
  2. DEV_RIO_802 (Instagram) テスト
  3. DEV_RIO_803 (Mailchimp) テスト
  4. メルマガ登録フォーム ライブ

**note ワークフロー (DEV_RIO_801) 完成 & テスト**
- [ ] dev: Payload Builder ノード 完成
  - threads_post テキスト → note_draft_body へ 転記
  - メルマガ CTA テキスト 挿入: "ご購読ありがとうございます。メルマガ登録で全 30 パターン 割引クーポン付き 👇"
  - Brain キット link + utm_source=note + utm_campaign={content_id} 追加
  - テスト: post_4 コンテンツで dry-run
  - 期限: 月 12:00
- [ ] dev: note API POST ノード テスト
  - OAuth token 接続 確認
  - Dry-run: test note を下書き状態で作成
  - Response: status=201 & article_id 取得
  - 期限: 月 14:00
- [ ] writer: note draft 3 本 最終版
  - Sales review → ゆうさん承認
  - Edit for note API:
    - Body に #PR 表記 & CTA link 挿入
    - Markdown formatting (headers, bold, lists)
    - 2000-3000 chars 確認
  - 期限: 월 15:00
- [ ] dev: DEV_RIO_801 統合テスト
  - posts_queue_v2 post_4 row で完全実行
  - 期待: note 下書き作成 + 記事 URL 取得
  - Actual result: ___________________ (テスト実施後記入)
  - 期限: 月 17:00

**火 8/12: note 初投稿 準備**
- [ ] ops: note draft 3 本 → 下書きへ アップロード（note.com 手動）
  - post_4 용 기사 (今日中 or 明朝 발행)
  - 期待: 記事 URL 取득 → posts_queue_v2 の `url` 칼럼 업데이트
- [ ] dev: DEV_RIO_701 (Threads 개선) 메일침프 QR 생성 노드 테스트
  - Mailchimp form URL → QR 이미지 URL 생성
  - QR 코드 이미지 Threads 투고문에 임베드 (텍스트 끝)
  - 테스트: post_4 with QR
  - 기한: 화 12:00

**수 8/13: Mailchimp 통합 테스트**
- [ ] ops: Typeform 등록 폼 이동
  - Typeform 계정 에서 메일링리스트 양식 만들기
  - 필드: email (required), first_name (optional)
  - Success message: "가입 완료! 30% 할인 코드: AISTORE30 을 받았습니다."
  - Webhook: n8n DEV_RIO_803 로 연결
  - 기한: 수 10:00
- [ ] dev: DEV_RIO_803 Mailchimp integrator 테스트
  - Typeform webhook 수신 테스트 (테스트 form 제출)
  - Mailchimp 에 contact 추가 확인
  - Segment: warmers (기본값)
  - 기한: 수 14:00

**목 8/14: Instagram API 테스트**
- [ ] dev: DEV_RIO_802 Instagram 워크플로우 테스트
  - Carousel 투고 테스트 (이미지 2장)
  - Hashtag 자동 선택 로직 테스트
  - 기대: Instagram 앱에서 새 투고 확인
  - 기한: 목 15:00

**금 8/15 - 일 8/17: 통합 테스트 & 본운영 준비**
- [ ] dev: 통합 테스트
  - posts_queue_v2 post_4 행 으로 Threads + note + Instagram 동시 투고
  - 기대: 3 개 매체 동시 발행 성공
  - 실제 결과: __________________________ (테스트 후 기입)
  - 기한: 금 17:00
- [ ] ops: 메일링 리스트 초기 세그먼트 만들기
  - warmers (신규 가입자)
  - customers (뇌 구매자)
  - vip (컨설팅 상담자)
  - Deadline: 토 12:00
- [ ] dev: 에러 핸들링 완성
  - API 404 / 403 / timeout 시나리오 테스트
  - 실패 시 Slack 알림 설정
  - Deadline: 토 12:00
- [ ] dev: ダッシュボード (n8n 결과 가시화)
  - 매일 21:00 투고 결과 Summary
  - Slack #ops-updates 에 자동 발행
  - Deadline: 일 15:00

**日 8/17: Week 2 최종 체크**
- [ ] Checklist:
  - [ ] note 투고 1/1 성공?
  - [ ] Instagram 투고 1/1 성공?
  - [ ] Mailchimp 가입 1/1 성공?
  - [ ] 메일링 초대 이메일 발행됨?
  - [ ] 대시보드 라이브?
- [ ] Go/Stop 판정:
  - ✅ Go: 5/5 성공 → Week 3 투고 빈도 증가
  - ⚠️ Caution: 3-4 성공 → 월요 오전 회의 + 조정
  - 🛑 Stop: 2 이하 성공 → 중단 & 원인 분석

---

### 📅 Week 3: Aug 18-24 (Expansion & Optimization)

#### Mon 8/18
**Weekly 투고 증가**
- [ ] ops: posts_queue_v2 post_8, 9, 10, 11 행 추가
  - post_8: 미용실 맞춤형 → scheduled 2026-08-18T21:00
  - post_9: 정체시술원 맞춤형 → scheduled 2026-08-20T21:00
  - post_10: 컨설팅 권유 → scheduled 2026-08-22T21:00
  - post_11: 사용자 사례 → scheduled 2026-08-24T21:00
  - Deadline: 월 10:00
- [ ] writer: Threads 초안 4개 + note 기사 1개 (기말) 완성
  - Threads 텍스트: Brain 링크 CTA 포함
  - note: 컨설팅 상담 케이스 스터디 (VIP 메일링 향)
  - Deadline: 월 15:00

**메일링 CFI 구성**
- [ ] ops: Mailchimp 자동화 메시지 3 종 설정
  - Vol.1 Welcome (warmers): "가입 감사합니다. 30% 할인 코드: AISTORE30"
  - Vol.1 Welcome (customers): "재구매 감사합니다. 다음 Brain 킷 프리뷰"
  - Vol.1 Welcome (vip): "VIP 특별 제안: 개인 상담 예약 50% 할인"
  - Deadline: 화 12:00
- [ ] ops: 주간 뉴스레터 템플릿 제작
  - Vol.2 (8/21): note 기사 링크 + Brain 할인 쿠폰
  - Vol.3 (8/28): AI 자동화 가이드 + 컨설팅 문의
  - 기한: 수 18:00

**Instagram 주 2회 스케줄 확정**
- [ ] ops: Instagram 투고 일정표 작성
  - 수/일 20:00 (post_4, 8)
  - 토/월 20:00 (post_5, 9)
  - Carousel vs Reels 형식 결정
  - Deadline: 금 10:00

#### Tue 8/19 - Fri 8/22
**현재 진행: 투고, 측정, 최적화**
- [ ] ops: Threads post_8, 9, 10 자동 투고
  - 기대: 각 1.5K-2K 뷰
  - CTR 측정 (Brain 링크): 0.8%-1.2%
  - 현황: __________________________ (투고 후 기입)
- [ ] ops: Instagram post_4, 5 자동 투고
  - 기대: 초기 300-500 뷰
  - 해시태그 성과 측정
  - 현황: __________________________
- [ ] dev: KPI 대시보드 업그레이드
  - 각 매체별 리치 실시간 추적
  - Brain CTR 추적 (Threads vs note)
  - 메일링 개봉율 추적
  - Deadline: 금 15:00

#### Sat 8/23 - Sun 8/24
**8월 중간 리뷰 & 조정**
- [ ] analyst: 1.5주 KPI 리포트 작성
  - Threads: 누적 리치, 팔로어 증가, CTR
  - note: 기사 수, 독자 수, 판매 (유닛)
  - Instagram: 팔로어, 리치, 저장함
  - Mailchimp: 구독자 수, 개봉율, 클릭율
  - Deadline: 토 18:00
- [ ] dev: 에러 로그 리뷰 & 최적화
  - 투고 실패율 (목표: 0%)
  - API 응답시간 (목표: <2초)
  - Retry 성공률 (목표: >95%)
  - 조정사항 노트: __________________________
  - Deadline: 일 12:00
- [ ] ops/writer: 투고 성과 기반 A/B 테스트 계획
  - 테스트 주제 1: CTA 형식 (한 줄 vs 다단계)
  - 테스트 주제 2: 해시태그 개수 (10 vs 20)
  - 테스트 주제 3: 메일링 제목 A/B 테스트
  - 시작일: 8/25 (Week 4)
  - Deadline: 일 17:00

---

### 📅 Week 4: Aug 25-31 (Scale & Month-End Review)

#### Mon 8/25
**투고 빈도 최종 증가**
- [ ] ops: posts_queue_v2 post_12-15 추가 (주간 증가: 3 → 5회)
  - Mon/Wed/Fri/Sat/Sun 총 5회
  - 테마 다양화 (비용절감 안내, 상담 사례, 교육, 질문 응답)
  - Deadline: 월 10:00

**초월 심화 최적화**
- [ ] writer: 투고 텍스트 A/B 변형 3개 준비
  - 원본 (기존)
  - 변형 A: 더 짧은 버전 (텍스트 -30%)
  - 변형 B: 스토리텔링 버전 (사례 + 해결책)
  - Deadline: 월 14:00
- [ ] dev: Anthropic LLM 을 이용해 자동 CTA 텍스트 생성
  - Threads 기본 텍스트 + "Brain 링크 CTA 생성" 프롬프트
  - 다양한 CTA 변형 생성 (할인가, 한정판, 긴급성 등)
  - Deadline: 화 12:00

#### Tue 8/26 - Thu 8/28
**유료 구독 상품 성과 추적**
- [ ] analyst: LTV 분석 시작
  - Threads → Brain 판매 경로 추적 (post_4-11)
  - note → 메일링 등록 경로 추적
  - 메일링 → Brain 재구매 경로 추적
  - 메일링 → 컨설팅 상담 경로 추적
  - 데이터 소스: n8n 로그 + Mailchimp API + note.com API
  - Deadline: 수 18:00
- [ ] ops: 메일링 vol.2 (8/21) & Vol.3 (8/28) 발행
  - 개봉율 / 클릭율 / 판매 전환 측정
  - A/B 테스트 결과 반영
  - Deadline: 목/수 18:00
- [ ] dev: Instagram 분석 도구 연결
  - Meta Insights API (팔로어, 도달률, 저장함, 공유수)
  - 해시태그별 성과 분석
  - 최고 성과 해시태그 3개 → 9월 집중 투자
  - Deadline: 목 15:00

#### Fri 8/29 - Sun 8/31
**8월 최종 리뷰 & 9월 계획 승인**

**금 8/29: 월간 KPI 리포트 작성**
- [ ] analyst: 8월 성과 종합 리포트
  - Threads: 팔로어 (1.2K → ___ 목표 1.8K), 리치 (월 25K → ___), CTR (3.5% → ___)
  - note: 기사 수 (5 발행), 독자 수 (50 명), 판매 (¥ ___)
  - Instagram: 팔로어 (0 → 200-300 목표), 리치 (월 2K 목표)
  - Mailchimp: 구독자 (50+ 목표), 개봉율 (35-40% 목표), 클릭율 (8-10% 목표)
  - 월간 매출: Brain ¥ ___ + 템플릿 ¥ ___ + note ¥ ___ = 합계 ¥ ___
  - 목표 대비 달성률: ___%
  - Deadline: 금 16:00

**토 8/30: Go/Stop 의사결정 회의 (14:00 JST)**
- [ ] Attendees: ゆうさん CEO, dev_lead, ops_lead, analyst
- [ ] 의제:
  1. 8월 성과 검토 (리포트 기반)
  2. 주요 성과 / 실패 포인트 분석
  3. 9월 목표 상향 또는 조정
  4. 신규 테스트 아이템 (Google 비즈니스 프로필, YouTube Shorts 등)
- [ ] 의사결정:
  - [ ] Go to Phase 2: 9월부터 투고 빈도 주 5회 → 주 7회 (일일 1회)
  - [ ] 또는 Adjust: 성과 부족 시 CTA / 테마 대대적 수정
  - [ ] 또는 Stop & Pivot: LTV < ¥500 시 전략 재검토

**일 8/31: 9월 계획 최종 승인**
- [ ] ops: 9월 posts_queue_v2 완성
  - post_16-40 (주 7일 × 4주 = 28개 + 버퍼 8개)
  - 각 투고 테마 / CTA / 채널 확정
  - Brain 할인 프로모션 일정 (9월 한 번)
  - Deadline: 일 15:00
- [ ] writer: 9월 Threads 초안 14개 + note 기사 4개 + 메일링 4개
  - 재정 배치: 일일 1회 Threads + 주간 1회 note + 주간 1회 메일링
  - Deadline: 일 20:00
- [ ] dev: 9월 n8n 일정 최적화
  - 투고 시간대 테스트 (21:00 vs 08:00 vs 12:00)
  - 이미지 생성 자동화 (note eye-catch)
  - Deadline: 일 20:00

---

## Tasks by Owner

### Developer Lead Checklist

**Week 1**
- [ ] API 키 3개 (note, Instagram, Mailchimp) 확보 & 테스트
- [ ] n8n 4 개 워크플로우 skeleton 배포
- [ ] ハッシュタグ辞書 검토 (technical validation)

**Week 2**
- [ ] DEV_RIO_801 (note) 완성 & 테스트
- [ ] DEV_RIO_802 (Instagram) 완성 & 테스트
- [ ] DEV_RIO_803 (Mailchimp) 완성 & 테스트
- [ ] 통합 테스트 (post_4로 3개 매체 동시 투고)

**Week 3-4**
- [ ] 에러 핸들링 최적화
- [ ] KPI 대시보드 구축 & 자동화
- [ ] Instagram Insights API 연결
- [ ] Anthropic LLM 기반 CTA 생성 자동화

**월간 시간 투입**: ~40 시간 (1 주 10 시간)

---

### Operations Lead Checklist

**Week 1**
- [ ] posts_queue_v2.csv Google Sheets 작성 & 공유 설정
- [ ] Typeform 메일링 폼 생성
- [ ] note 초안 3개 수집 (from writer)

**Week 2**
- [ ] note 3개 기사 note.com에 draft 업로드
- [ ] Mailchimp 자동 메시지 설정 (warmers/customers/vip)
- [ ] Instagram 일정표 작성

**Week 3-4**
- [ ] 주간 투고 스케줄 관리 (posts_queue_v2 업데이트)
- [ ] KPI 대시보드 일일 모니터링
- [ ] 8월 종합 리포트 수집 (from analyst)
- [ ] 9월 posts_queue_v2 완성

**월간 시간 투입**: ~25 시간 (1주 6-7시간)

---

### Writer/Content Lead Checklist

**Week 1**
- [ ] note 초안 3개 (post_4, 7, 11용) 완성
- [ ] Instagram 해시태그 辞書 작성
- [ ] note eye-catch 프롬프트 3개 준비

**Week 2**
- [ ] note 기사 최종본 3개 완성 (Sales review 후)
- [ ] Threads 초안 4개 (post_8-11) 완성
- [ ] 메일링 타이틀 + 본문 템플릿 2개 (warmers, customers)

**Week 3-4**
- [ ] Threads A/B 테스트 텍스트 변형 3개
- [ ] note 기사 5개 추가 (월간 5개 + 9월 3개)
- [ ] 메일링 vol.2 & 3 완성
- [ ] 9월 Threads 초안 14개 완성

**월간 시간 투입**: ~30 시간 (1주 7-8시간)

---

### Analyst/Growth Checklist

**Week 1-2**
- [ ] LTV 추적 프레임 설계 (Threads → note → 메일링 → Brain 경로)
- [ ] n8n 로그 수집 자동화 설정

**Week 3**
- [ ] 1.5주 중간 리포트 작성 (KPI 달성률)
- [ ] A/B 테스트 설계 (CTA, 해시태그, 메일링 타이틀)

**Week 4**
- [ ] 8월 종합 리포트 작성 (각 매체별 성과)
- [ ] 9월 목표 수정안 제시
- [ ] Instagram Insights 분석 (top 3 hashtags)

**월간 시간 투입**: ~15 시간 (1주 3-4시간)

---

## Risk & Mitigation

| 리스크 | 확률 | 영향 | 대응 |
|--------|------|------|------|
| Meta Graph API 승인 지연 | 중 (30%) | 높음 (Instagram 지연) | API 사전 신청 (금주) + 승인 과정 가속화 문의 |
| note.com API 레이트 리밋 | 낮음 (10%) | 중간 (일일 투고 제한) | 배치 처리 설계 (최대 10개/일) |
| Threads API 버그 / 변경 | 낮음 (5%) | 높음 (투고 불가) | Meta status page 모니터링 + Slack alert 설정 |
| Mailchimp 스팸 플래그 | 낮음 (10%) | 높음 (배신 감소) | SPF/DKIM 설정 + 구독자 품질 관리 |
| 메일링 등록 부진 | 중 (40%) | 중간 (LTV 감소) | Typeform 배치 2개 시도 (폼 디자인 A/B) |
| 제작 속도 저하 | 중 (50%) | 중간 (일정 연기) | Slack 일일 타스크 보드 + 주간 회의 추가 |

---

## Critical Success Factors

| CSF | 측정치 | 목표 (9월 말) | 현재 (8월 초) |
|-----|--------|--------------|--------------|
| Threads 팔로어 | 명 | 2,500 | 1,200 |
| note 독자 | 명 | 200 | 0 |
| Instagram 팔로어 | 명 | 500 | 0 |
| 메일링 구독자 | 명 | 150 | 0 |
| 월간 판매액 | 원 | 68,000 | 21,000 |
| Brain LTV | 원 | 1,500 | 불명확 |
| CPA (Brain) | 원 | 200 | 400 |

---

## Rollback Plan (If Needed)

### Scenario 1: Instagram API 승인 불가 (Week 2 말)
1. DEV_RIO_802 배포 취소
2. posts_queue_v2에서 instagram 채널 제거
3. 9월 목표 조정: Threads-only focus
4. 대체 매체: Google 비즈니스 프로필 (10월로 연기)

### Scenario 2: note 판매 0건 (8월 말)
1. note 기사 무료 오픈 (가입 유도 다시)
2. Brain 할인 쿠폰 ¥300 → ¥500 인상
3. 메일링 CTA 강화 (긴급 재정 안내)
4. Threads에서 note 링크 클릭율 측정 → CTA 텍스트 재작성

### Scenario 3: Mailchimp 개봉율 저조 (<25%)
1. 메일링 발송 시간 변경 (20:00 → 08:00 또는 12:00)
2. 제목 A/B 테스트 실시 (긴급성 vs 호기심)
3. 구독자 세그먼트 정교화 (최근 활동자만 타겟)
4. 메일링 빈도 조정 (주 1회 → 격주)

---

## Sign-Off & Approval

**CEO (ゆうさん)**  
- [ ] 戦略書 承認 (REVENUE_ACCELERATION_STRATEGY_2026-08-09.md)
- [ ] n8n 仕様書 承認 (N8N_PIPELINE_EXPANSION_SPEC.md)
- [ ] 本チェックリスト 承認
- [ ] Weekly 会議 参加 (毎月曜 09:00 JST)

署名: ________________  
日付: ________________

---

**作成日**: 2026-08-03  
**最終版**: Ready for Implementation (Go/No-Go待ち)  
**次段階**: 2026-08-04 09:00 JST実装キックオフ

