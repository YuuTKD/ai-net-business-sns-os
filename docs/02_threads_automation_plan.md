# Threads自動化設計

初期フロー：

1. スプレッドシートから未投稿行を取得
2. 投稿本文を取得
3. business_keyとusernameを照合
4. Threads APIへ投稿
5. 投稿URLと投稿IDを取得
6. 投稿済みに更新
7. SNS_RESULTへ記録
8. インサイト同期
9. 勝ち投稿分析
10. 再利用タスク生成
