# Word Learner — AIエージェント向けガイド

このリポジトリを改造(お題の単語セットの入れ替えなど)したいときは、まず [docs/customization.md](./docs/customization.md) を読んでください。

- **お題の単語セットを入れ替えたい/増やしたい**(最も多い依頼): `docs/customization.md` の「編集すればいいファイル一覧」を参照。`resources/js/lib/customize/words/` 配下を編集する
- カスタマイズを前提にした箇所には `// CUSTOMIZE:` というコメントが付いています。`grep -rn "CUSTOMIZE" resources/js/` で一覧できます
- プロジェクト全体の設計は [docs/01-overview.md](./docs/01-overview.md) を参照してください
- 実装の進め方・コミット規約は [docs/04-implementation-roadmap.md](./docs/04-implementation-roadmap.md) を参照してください
