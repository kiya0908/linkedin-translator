# LinkedIn Translator 项目 TODO List

> 更新时间：2026-03-22  
> 说明：当前基于你已描述的页面与功能目标整理，等 PowerShell 环境恢复后，建议再做一次代码级核对并补齐状态。

## 你当前方案里的关键盲点（先说问题）

1. 你把 UI、AI 能力、支付同时推进，容易互相阻塞，最后三边都不稳。
2. 你只说了“做两种模式和强度”，但没定义模式语义和输出边界，Prompt 很容易失控。
3. Pricing 只是“改文案”不够，必须和权限系统绑定（如 `Extreme` 锁定、试用次数、升级引导）。
4. 接支付如果不先定义“权益状态机”（免费/试用/付费/过期），后面 webhook 会把逻辑打烂。

## 总体优先级（按依赖关系）

- P0：翻译核心链路可用（模式 + 强度 + AI 输出稳定）
- P0：权限与计费规则打通（至少能锁 `Extreme`）
- P1：Pricing 页面重写并与产品能力一致
- P1：Creem 支付接入（Checkout + Webhook + 权益落库）
- P2：埋点、A/B、风控和运营化能力

## Stage 1：Translation Interface 2.0（重做）

**Goal**：前端可切换 2 种模式，且每种模式可切换输出强度，交互状态清晰。  
**Success Criteria**：
- 支持 `Mode 1: Human -> LinkedIn` 与 `Mode 2: LinkedIn -> Human`
- 强度选项：`Light`、`Standard`、`Extreme(可锁定)`
- 切换模式后，保留该模式上次选择的强度（减少用户重复操作）
- 锁定态有明确文案和 CTA（如 Upgrade）
- 移动端与桌面端布局均可用
**Tests**：
- 模式切换后 UI 状态正确
- 强度切换后请求参数正确
- 锁定态按钮不可触发翻译
**Status**：Completed（功能完成，待你明早做 UI 细磨）

### Stage 1 任务拆解

- [x] 定义前端状态模型：`mode`、`intensity`、`isLocked`
- [x] 定义映射：`mode + intensity -> prompt profile`
- [x] 实现锁定态视觉和行为（禁用 + 升级提示）
- [x] 同步“剩余次数”显示逻辑（免费版配额）
- [x] 统一空态、loading、error 文案

### Stage 1 已完成内容（2026-03-22）

- 已将首页旧翻译框重构为 `Translation Interface 2.0`，支持 `Human -> LinkedIn` 与 `LinkedIn -> Human` 双模式切换。
- 已实现三档强度：`Light`、`Standard`、`Extreme`，并支持“按模式记住上次选择的强度”。
- 已新增前端配置模型：`mode + intensity -> prompt profile`，前后端共用同一套映射，避免 UI 与 API 行为不一致。
- 已将 `/_api/translate.linkedin` 接口升级为支持 `intensity` 参数，不同模式/强度会使用不同 prompt 和 temperature。
- 已实现 `Extreme` 锁定态视觉与行为：锁定文案、锁图标、升级 CTA、锁定时不可直接触发翻译。
- 已补上“免费次数”展示逻辑：当前版本使用前端本地每日配额（默认 3 次，按天重置），用于完成 Stage 1 交互闭环。
- 已统一翻译区的空态、loading、error 文案，并保留复制结果能力。
- 核心改动在 translation-interface.tsx 和 config.ts
- 已适配移动端和桌面端的主交互布局，至少达到可用状态，视觉精修留待下一轮。

### Stage 1 当前实现决策（先记下来，避免后续遗忘）

- `Extreme` 当前按“已登录且 `credits > 0` 视为已解锁”处理，这是 Stage 4 entitlement 状态机落地前的临时决策。
- 免费额度当前未接后端真实 entitlement / quota，只做前端本地日配额闭环；后续应由 Stage 4 接管。
- 本轮优先确保功能链路正确，未对视觉细节做精修。

### Stage 1 验证结果（2026-03-22）

- [x] 已运行 `npm run build`，构建通过，说明页面与接口改动已接入打包链路。
- [ ] `npm run typecheck` 未通过，但失败点主要是仓库原有的全局 TypeScript / `cloudflare:workers` 类型问题，不属于本次 Stage 1 新增功能。
- [x] 从实现逻辑上已满足本阶段 3 条测试目标：
  - 模式切换后保留各自模式的强度状态。
  - 强度切换后请求会携带正确的 `mode + intensity` 参数。
  - 锁定态下按钮会跳升级 CTA，不会直接发起翻译请求。

## Stage 2：Pricing Section 重写（从“抄模板”改成“产品驱动”）

**Goal**：Pricing 内容和真实能力一致，不再复制外站。  
**Success Criteria**：
- 方案结构清晰：Free / Pro（可选 Team）
- 权益与实际功能一致：次数、强度、模式、速度、支持渠道
- 文案与按钮路径一致：免费试用、升级、登录后管理
- 不出现法律/品牌风险文案（避免“照抄结构+措辞”）
**Tests**：
- 定价卡展示权益与后端校验一致
- 升级按钮跳转到正确 checkout 链路
**Status**：Completed

### Stage 2 任务拆解

- [x] 重新定义套餐矩阵（功能、额度、限制）
- [x] 改写定价文案（价值导向，不是功能堆砌）
- [x] 对齐 UI 与真实 entitlement
- [x] 增加 FAQ（已覆盖退款、额度/credits 规则与 Team 说明；当前 credits pack 主路径不涉及取消订阅）

## Stage 3：KIE AI API 接入 + Prompt 体系

**Goal**：完成单模型接入，并可根据模式与强度稳定输出。  
**Success Criteria**：
- 后端有统一翻译接口（前端不直连供应商）
- 两种模式与三档强度均有 prompt 模板
- 输出可控：长度、语气、格式有明确规则
- 失败可降级（超时、429、空响应）
**Tests**：
- 单测：prompt 选择逻辑（mode/intensity）
- 集成测试：请求成功、超时、限流、无权限
- 回归：相同输入在同配置下输出风格稳定
**Status**：Completed

### Stage 3 任务拆解

- [x] 设计接口契约：`POST /api/translate.linkedin`
- [x] 配置环境变量（禁止硬编码 API Key）
- [x] 落地 Prompt 模板（按模式 + 强度）
- [x] 增加输出后处理（去脏词/去空行/长度裁剪）
- [x] 增加日志与观测字段（requestId、latency、errorCode）

### Prompt 设计建议（先定规则再写词）

- Mode 1（Human -> LinkedIn）：
  - Light：轻润色，尽量保留原意和结构
  - Standard：专业表达 + 清晰结构 + 可读性提升
  - Extreme：高密度商业表达 + 强行动导向（仅付费）
- Mode 2（LinkedIn -> Human）：
  - Light：直白化，不改核心信息
  - Standard：去术语、降复杂度、补上下文
  - Extreme：彻底去行话，改为可执行建议（仅付费）

## Stage 4：Creem 支付接入（最小可用闭环）

**Goal**：完成支付与权益闭环，真正支撑 `Extreme` 解锁。  
**Success Criteria**：
- 支持 checkout 创建与回跳
- webhook 可更新用户权益状态
- 前端能实时反映权益（锁定/解锁）
- 订阅取消或支付失败后正确降级
**Tests**：
- 测试支付成功/失败/取消
- webhook 重放幂等测试
- 权益更新后的前端可见性测试
**Status**：Mostly Completed

### Stage 4 任务拆解

- [x] 定义 entitlement 状态机（free/trial/pro/expired）
- [x] 接入 checkout API
- [x] 实现 webhook 验签与幂等处理
- [ ] 落库订阅状态与到期时间（当前 LinkedIn Translator 主售卖路径已改为一次性 credits pack，这项不是当前上线阻塞；若恢复订阅 SKU 再补强）
- [x] 前端按 entitlement 控制 Extreme 与配额

## 必须补的“框架外”任务（不做会翻车）

- [ ] 埋点：模式选择率、强度选择率、翻译成功率、升级转化
- [ ] 风控：接口限流、滥用检测、异常输入拦截
- [ ] 质量基线：10-20 条金标样例做回归评测
- [ ] Feature Flag：先灰度开放 Extreme 与新 Pricing
- [ ] 法务检查：定价页文案与隐私条款一致

## 环境变量与安全检查清单（提交前必须过）

- [ ] 未在代码/配置中硬编码任何 API Key / Secret
- [ ] 使用 `.env` 或平台 Secret 管理
- [ ] `.env*` 已在 `.gitignore` 中排除
- [ ] 日志中不输出敏感字段（token、email 全量、支付回执原文）

## 执行顺序建议（别乱并行）

1. 先做 Stage 1 + Stage 3（最小翻译闭环）
2. 再做 Stage 4（解锁付费能力）
3. 最后做 Stage 2（用真实能力反推定价文案）

## Definition of Done（本轮）

- [ ] 用户可在两种模式间切换并看到稳定输出
- [ ] 强度选项行为与权限一致（含锁定态）
- [ ] KIE API 接口可用且有错误兜底
- [ ] Creem 支付后权益可正确生效
- [ ] Pricing 内容与真实权益 100% 一致

## 2026-03-23 实施进展（Codex）

- [x] Stage 3 已按 `doc/gemini 2.5 flash.md` 改为走 `Gemini 2.5 Flash` 专用接口路径，而不是旧的通用 chat 路径。
- [x] 已重写 prompt 体系：按 `mode + intensity` 输出不同约束，显式限制事实保真、输出格式、长度与语气边界。
- [x] 已增加 structured output + 纯文本双轨兜底；当 `response_format` 不可用或响应为空时，会自动降级。
- [x] 已增加输出后处理：去 JSON 包裹、去代码块、去 `Translation:` 前缀、压缩空行、超长裁剪。
- [x] 已增加日志与观测字段：`requestId`、`latencyMs`、`providerModel`、`usage`、`chargedCredits`。
- [x] 已把 provider token usage 映射到平台 credits，采用 `Input 18 credits / M` 与 `Output 150 credits / M` 的计费规则，并保留最小 1 credit 成功计费单位。
- [x] Stage 4 已落地最小可用 entitlement 状态机：`free / trial / pro / expired`。
- [x] 已新增后端 `/api/entitlement/linkedin`，前端翻译面板不再只依赖本地 quota，而是以服务端 entitlement 为准。
- [x] 已把翻译接口接上真实 entitlement 校验：`Extreme` 需要 credits，免费/试用/过期态受日配额限制。
- [x] 已把成功翻译后的配额消耗与 credits 扣减收口到服务端统一处理。
- [x] 已复用现有 Creem 下单能力，把 LinkedIn Translator 的 `Pro Credit Pack` 接入真实 checkout 创建链路。
- [x] 已重写首页 Pricing Section，使 Free / Pro Credit Pack / Team 的展示、CTA、FAQ 与真实 entitlement 规则一致。
- [x] 已在首页加入登录后购买路径；未登录时先走 Google Sign-In，再回到定价区完成购买。
- [x] 已补轻量单测基建：`pnpm run test:unit`。
- [x] 已将 Creem test 环境的 `credit-200` / `credit-500` 商品接入本项目：`$4.9 / 200 credits` 与 `$9.9 / 500 credits` 均已映射到真实 checkout product id。
- [x] 已把 `LINKEDIN_TRANSLATOR_TEAM_PLAN` 改成和 `LINKEDIN_TRANSLATOR_PRO_PACK` 同结构的一次性 credit pack，并接入第二个 checkout 商品，而不再只是 `mailto` 联系销售入口。
- [x] 已为 checkout 创建请求补齐 `request_id`、`referenceId`、`userId`、`orderNo` 等 metadata，方便 Creem callback / webhook 与本地订单对账。
- [x] 已补本地 Creem 配置与监控脚本：新增 `.dev.vars` 中的 test store / test key 占位，新增 `pnpm run creem:heartbeat` 与 heartbeat state file，便于后续做 store 监控。
- [x] 已把正式环境 `credit-200` / `credit-500` Product ID 写入代码映射；生产环境下 Team 500-credit pack 不再回退成联系销售。
- [ ] 待将生产环境 `CREEM_KEY` 与 `CREEM_WEBHOOK_SECRET` 真正写入 Cloudflare Worker secrets；本机 `wrangler whoami` 当前访问 Cloudflare API 时出现 `terminated`，本轮未自动完成。
- [ ] 如果产品规则要严格改成“每次成功运行固定扣 1 积分”，还需把当前服务端的 token-usage 计费逻辑改成固定 1 credit；本轮完成的是商品、价格卡、checkout 映射与文案收口。
- [x] 本轮验证结果：
  - [x] `pnpm run test:unit` 通过（当前 9 条用例，覆盖 Stage 2 / 3 / 4 的核心纯逻辑）
  - [x] `pnpm run build` 通过
  - [x] `pnpm run typecheck` 已通过；本轮额外补齐了本地 Cloudflare runtime 声明，并清理了 React Router / fetch 的类型问题

### 本轮产品决策（已落地）

- 付费主路径采用 `credits pack`，而不是强依赖订阅闭环；这样可以最快把 `Extreme` 解锁、真实计费与 webhook 落地。
- `free` 定义为匿名访客；`trial` 定义为已登录但无付费历史/余额用户；`pro` 定义为当前有 credits；`expired` 定义为有付费历史但余额已归零。
- 当前售卖项已落地为两个一次性 credits pack：`Pro Credit Pack`（`$4.9 / 200 credits`）与 `Team Credit Pack`（`$9.9 / 500 credits`）；两者均走 Creem checkout，credits 不过期。
- Team 不再只是联系销售入口；如后续还要保留 enterprise / custom-volume 方案，可继续通过 support 邮件承接更高量需求。

### 补充记录：法务静态页与 Logo（2026-03-23）

- [x] 已将 `app/routes/_legal` 下 5 个法务静态页内容统一为 LinkedIn Translator 语境：`acceptable-use`、`cookie`、`privacy`、`refund`、`terms`。
- [x] 已同步更新上述 5 个页面的 `route.tsx` 元信息（`title` / `description`），移除旧品牌与旧产品描述，避免支付审核中的品牌不一致问题。
- [x] 已修复法务页顶部品牌元素显示为 `HairRoom` 的问题；现在法务页头部显示 `LinkedIn Translator`。
- [x] 已改造通用 Logo 组件：`app/components/common/logo.tsx` 新增 `label` 与 `imageAlt` 可选参数（默认值保持原行为，不影响其他页面）。
- [x] 已在法务页面组件 `app/components/pages/legal/index.tsx` 对 `Logo` 传入 `label="LinkedIn Translator"` 与 `imageAlt="LinkedIn Translator logo"`，实现仅法务页覆盖品牌文案。

### 下次改这块时的入口（避免重复排查）

- 需要修改法务正文时：直接改 `app/routes/_legal/*/content.md`。
- 需要修改法务页 SEO 文案时：改对应 `app/routes/_legal/*/route.tsx` 的 `meta`。
- 需要调整法务页顶部品牌字样时：优先改 `app/components/pages/legal/index.tsx` 里传给 `Logo` 的 `label` / `imageAlt`。
- 如果要全站统一品牌字样（而非仅法务页）：再改 `app/components/common/logo.tsx` 的默认 `label` / `imageAlt`。

## 2026-03-23 Codex review follow-up (to do later)

- [x] Verification run completed: pnpm run test:unit (9/9), pnpm run typecheck, pnpm run build.
- [x] Credits flow files confirmed:
- purchase/create order: app/routes/_api/create-order/route.ts, app/.server/services/order.ts
- consume/deduct on translation: app/routes/_api/translate.linkedin/route.ts, app/.server/services/linkedin-translator.ts, app/.server/services/credits.ts
- webhook/refund: app/routes/_webhooks/payment/route.ts, app/.server/services/order.ts
- DB schema/migrations: app/.server/drizzle/schema.ts, app/.server/drizzle/migrations/0000_workable_quentin_quire.sql
- [ ] Critical fix pending: callback idempotency.
- app/routes/_callback/payment/route.tsx currently always calls handleOrderComplete(rest.checkout_id).
- If webhook already completed the order first, handleOrderComplete throws "Transaction is completed", and callback may show Payment Failed incorrectly.
- Fix direction: make callback idempotent (completed order should still render success), only fail on real signature/order errors.
- [x] Local migration runtime check completed.
- Command executed: npm run db:migrate:local (wrangler d1 migrations apply DB --local).
- Result: migrations `0000` to `0004` applied; subsequent run shows `No migrations to apply!`.
- [x] Remote D1 migration pushed successfully.
- Command executed: npm run db:migrate:remote (wrangler d1 migrations apply DB --remote).
- Result: migrations `0000` to `0004` applied on database `4e83da95-b2db-49e3-8017-6c9c284afa8e`.
- [x] Remote table verification completed.
- Command executed: pnpm exec wrangler d1 execute DB --remote --command "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;".
- Tables confirmed: `users`, `user_auth`, `signin_logs`, `orders`, `credit_records`, `credit_consumptions`, `subscriptions`, `ai_tasks`, `d1_migrations`.
- [x] Migration scripts aligned to binding name.
- `package.json` updated: `db:migrate:local` and `db:migrate:remote` now use `DB` binding instead of old `nanobanana2pro`.
- [ ] Follow-up when back home:
- implement callback idempotency fix and add regression test
- run one end-to-end payment simulation (checkout.completed + callback + credits refresh)

## 2026-03-23 Latest updates (credits rules + naming)

- [x] Free plan rule updated: free usage now requires sign-in.
- [x] New-account initial credits standardized to `INITLIZE_CREDITS = 5`.
- [x] Guest daily free quota removed (`DEFAULT_FREE_DAILY_TRANSLATIONS = 0`).
- [x] Signed-in daily free quota standardized to `5` (`DEFAULT_TRIAL_DAILY_TRANSLATIONS = 5`).
- [x] Translation paid billing standardized to fixed `1 credit` per successful request.
- [x] Task-level credits constant renamed from `NANO_BANANA_TASK_CREDITS` to `EVERY_TASK_CREDITS`.
- [x] All related references updated and `pnpm run typecheck` passed.
