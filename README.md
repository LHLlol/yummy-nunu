# 会偷吃心愿的怒怒｜Yummy Nunu

## Chinese

**《会偷吃心愿的怒怒》** 是一个围绕“想吃什么”展开的情绪化网页实验。为后续yummy nunu这一点单网页做前期资源素材积累使用。

项目以怒怒作为核心角色，将普通的链接提交动作转化为一次“投喂”互动。怒怒看起来暴躁、火焰熊熊，却会认真收下每一个突然冒出来的食欲心愿。

视觉上，项目采用明亮黄色、红橙角色、黑色粗线条和手绘贴纸元素，营造出热辣、俏皮、带有餐饮品牌感的网页氛围。它不像一个传统工具，更像一个带有角色表情和情绪反馈的小型互动玩具。

---

## English

**Yummy Nunu** is an emotional web experiment built around the idea of food cravings.This is to accumulate preliminary resources and materials for the subsequent single webpage featuring yummy nunu.

With Nunu as the central mascot, the project turns a simple link submission into a playful act of “feeding.” Nunu appears fiery, impatient, and grumpy, yet carefully receives every small craving given to it.

The visual style combines a bright yellow background, red-orange character design, bold black outlines, and hand-drawn sticker elements. Instead of feeling like a conventional tool, it works more like a small interactive toy with personality, expression, and playful feedback.

---

## Link Sync Setup

This project is configured for static export, so cross-device link sync uses Supabase.

1. Create a Supabase project.
2. Run `supabase-links.sql` in the Supabase SQL editor.
3. Set these environment variables before building or deploying:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

New submissions are written to the shared `links` table. The vault reads the same table and refreshes every 8 seconds.

## Supabase Configuration

This project uses Supabase for cross-device submission syncing.

Required environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

For GitHub Pages deployment, add them in:

GitHub Repository → Settings → Secrets and variables → Actions → Repository secrets

---

## License

This project is a personal creative web experiment.
Please do not directly reuse the visual identity or character concept without permission.

本项目为个人创意网页实验，无任何盈利性质仅做个人创作尝试。
请勿未经允许直接复用项目视觉设定与角色创意。
