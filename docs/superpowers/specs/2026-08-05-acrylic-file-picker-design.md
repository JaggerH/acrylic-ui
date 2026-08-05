# Acrylic File Picker — Design

**Date:** 2026-08-05
**Status:** Approved (brainstorming), pending implementation plan
**Component:** `file-picker`（acrylic-only 新组件，correspondence 表中无对应 shadcn 项）
**Consumer:** stream（`app/src/components/netdisk/`）

> 本文用中文写，因为它的读者是维护者。**组件的 docstring、`.mdx` 文档和所有默认文案一律英文**——
> acrylic-ui 是对外分发的英文 registry。这条分界见「文案与本地化」。

## Goal

给 acrylic registry 加一个文件系统浏览/选择组件，并把 stream 里两个近亲实现收编到它上面。
组件不绑定任何具体后端——数据全部经回调从宿主取。

## 为什么现在做

shadcn/ui 没有任何 tree / file / folder 组件（搜 `tree`、`file` 只命中 `sidebar-11` 这个用
Collapsible 手搓的静态文件树 block，无选中态、无异步、无新建）。acrylic 也没有。所以这是新物种，
不是某个 shadcn 组件的重新上色——`audio-player`、`media-box`、`searchbar`、`silk` 是同类先例。

stream 侧的存量是直接动因：

- `NetdiskDirPicker.tsx`（选目录）和 `NetdiskFilePicker.tsx`（选文件，带跨目录切换）**约 70% 代码重复**
  ——Dialog 外壳、搜索框、带图标的列表行、加载/空态各写了一遍。
- 合计 **13 个调用点**：`NetdiskDirPicker` 11 处（`ReconcilePanel` 4、`NetdiskBindings` 5、
  `WorkBinding` 1、`MusicChannel` 1）+ `NetdiskFilePicker` 2 处（都在 `NetdiskBindings`）。
- 缺「新建文件夹」，尽管后端 `POST /api/netdisk/fs/mkdir` 和前端 `api.netdisk.mkdir()` 早就存在。
- 两份实现都手搓了 acrylic 已经提供的东西（见「UI 与材质」的替换表）。

## Decisions (locked)

后续讨论若要推翻某条，先引用编号。

1. **一族，不是一个。** 同一个浏览内核，「能选中什么」是一个开关（`select`），选目录/选文件是它的两种用法。
   理由：那 70% 重复不是巧合，两个 picker 是同一个组件的两种模式；难做的部分（下钻、面包屑、加载态、
   搜索、新建、键盘）在两种模式里完全一样，拆开等于把难的部分写两遍。
2. **核心无壳 + 官方薄壳。** `FileBrowser`（可放进任何容器）+ `FilePickerDialog`（装在 acrylic Dialog 里）。
   理由见「为什么壳必须可换」。
3. **数据经回调，可降级。** `loadDir` 必需；`searchDir`、`onCreateFolder` 可选，不给则对应能力不存在
   （搜索退化为本层过滤、新建按钮不渲染），不给假 UI 也不报错。
4. **选中 = 当前焦点对象。** 选目录时焦点是「当前所处的层」，所以点文件夹＝下钻＝选中它，不做
   「进入 / 选定」双热区（最易误触）。选文件时焦点是被点的文件。
5. **核心不负责关闭。** `value` / `onValueChange` 受控；确认与关闭归薄壳（`commitOnSelect` 决定点了就走还是要按确认）。
6. **不做多选。** 11 个调用点没有一个需要；多选会推翻决策 4 的整个模型（要引入选中集合、全选、跨目录累积）。
7. **新建后进入新目录。** 在决策 4 的模型下，「选中新建的目录」和「进入它」是同一件事。
8. **`FileEntry` 只有 `{ name, isDir, meta? }`。** 不把某个具体网盘的字段（`size`、`modified`）焊进通用组件。

## 为什么壳必须可换

现有实现把 `Dialog` 焊死在组件里，这已经付过一次代价。`ReconcilePanel.tsx:1234` 有一段注释记录了它：
那里的「认领的文件夹」编辑器本来该用 Popover，但因为目录选择器自己就是个从 portal 弹出的 Dialog，
Popover 一见到自己 portal 之外的点击就关掉自己——用户点「浏览」的瞬间编辑器连根卸掉，挑完目录回来
没地方落。只好被迫改成 Dialog 套 Dialog。

**宿主的壳被组件的壳绑架了。** 一个通用 registry 组件无权替所有消费者做这个决定。

但纯无壳会把 Dialog 样板成本摊到 11 个调用点，所以两头都要：核心无壳，另配一个薄壳（默认路径和今天一样省事）。
`audio-player` / `audio-player-stage` 是同样的「一个内核两种呈现」结构。

## Anatomy

`registry/acrylic/file-picker.tsx` 一个文件，导出：

- `FileBrowser` — 无壳核心面板
- `FilePickerDialog` — 装在 acrylic Dialog 里的现成版本
- `FileEntry`、`FileBrowserLabels`、`DEFAULT_FILE_BROWSER_LABELS`（类型 + 默认文案）

`registry.json` 条目：`target: components/acrylic/file-picker.tsx`（**必须**，否则 `shadcn add`
把文件丢进宿主的 `components/ui/` 覆盖 stock shadcn）；`registryDependencies` 含
`acrylic.json` + `dialog.json` + `button.json` + `input-group.json` + `breadcrumb.json` +
`item.json` + `skeleton.json`；`dependencies` 只列 `lucide-react`。

一族一文件的代价：只想用 `FileBrowser`（无壳）的消费者也会被装进 `dialog`。可接受——Dialog 几乎是任何
acrylic 应用的必装件，为省这一个依赖把一族拆成两文件、两个 registry 条目，维护成本更高。

## API

```ts
type FileEntry = { name: string; isDir: boolean; meta?: unknown }

type FileBrowserProps = {
  // 数据（决策 3）
  loadDir: (path: string) => Promise<FileEntry[]>                   // 必需
  searchDir?: (path: string, query: string) => Promise<FileEntry[]> // 有则跨子树搜，无则本层过滤
  onCreateFolder?: (parentPath: string, name: string) => Promise<void>

  // 选择（决策 4、5）
  select?: 'dir' | 'file' | 'any'          // 默认 'dir'
  value?: string | null                     // 受控：选中的绝对路径
  onValueChange?: (path: string | null, entry: FileEntry | null) => void

  // 浏览位置
  defaultPath?: string                      // 非受控起点，默认 '/'
  path?: string                             // 需要时可受控
  onPathChange?: (path: string) => void

  // 呈现
  labels?: Partial<FileBrowserLabels>
  className?: string
}

type FilePickerDialogProps = FileBrowserProps & {
  open: boolean
  onOpenChange: (open: boolean) => void
  commitOnSelect?: boolean                  // true = 选中即确认并关闭
  onCommit?: (path: string, entry: FileEntry | null) => void
}
```

三个可选回调各自解锁一块能力。这是**可降级**的形状：必需的那个撑起最小可用，可选的把能力加上去，
没有宿主被迫实现自己不需要的东西。

`select` 的语义：决定**哪种条目能成为 `value`**。`'dir'` 时文件仍然显示，但是只读的上下文，不可选中。
`'any'` 时点目录仍然是下钻＋选中同一个动作（决策 4），所以这个模式下**无法选中一个目录而不进入它**——
这是决策 4 的直接后果，不是遗漏。

`onValueChange` 的第二个参数在「选中的是当前所处的层、而这一层不是从列表点进来的」时为 `null`
（例如初始 `defaultPath`、面包屑回跳、新建后自动进入）。宿主要靠 `meta` 认条目时必须处理这个情况。

## 状态归属与数据流

核心自己持有的只有三样：**当前浏览路径、当前目录条目、搜索词**。选中值受控，关闭/提交不归它管。

**回调不要求稳定引用。** 组件内部用 ref 持有最新的 `loadDir` / `searchDir` / `onCreateFolder`，加载
effect 只依赖 `path`。理由：消费者最自然的写法就是内联箭头函数（本项目的 stream 适配层正是如此），
每次渲染都是新引用；若把它放进 effect 依赖数组，同一个目录会随父组件每次重渲染反复拉取。把「请用
`useCallback` 包一下」写进文档是把一个组件能自己解决的问题推给每一个消费者，而且没人会记得。
（用 `vi.fn()` 写的测试跑不出这个问题——它是外部创建的稳定引用。要覆盖必须显式传内联函数并重渲染。）

**加载时机从 `open` 触发改为挂载即加载、卸载即忘。** 这是无壳化的必然——核心面板手上没有 `open` 这个 prop。
顺带修掉现有实现的一个隐性缺陷：`useEffect` 依赖数组里带着 `open`，重复打开时旧目录数据会先闪一帧
（`files` 状态没跟着重置）。

搜索：`searchDir` 存在时，非空查询走它；不存在时对已加载的本层条目做子串过滤。两种模式下
**目录都排在文件前面**。

**`searchDir` 返回条目的 `name` 必须是相对于 `path` 的相对路径**（如 `第3季/ep05.mp4`），不是裸文件名。
否则跨子树结果里两个不同目录下的同名文件在界面上无法区分，选中后也拼不出正确的绝对路径。组件原样显示
这个相对路径，选中时与 `path` 拼接。这是契约的一部分，写进 docstring。

（stream 的现状恰好已经是这个形状：`/api/netdisk/fs?recursive=1` 明确「name 为相对子路径」，
且只返回文件——见 `src/http/netdisk-routes.ts:222`。适配层直接透传即可。）

## 新建文件夹

- **Finder 的就地编辑**：列表顶部长出一个可编辑行，回车确认 / Esc 取消。绝不再弹一个输入框弹窗——
  在薄壳场景下那已经是 Dialog 套 Dialog 套 Dialog。
- **校验按「谁知道谁管」分**：空名和重名**组件自己拦**（当前目录列表就在它手上，本地拦掉省一次往返）；
  **非法字符归宿主**——组件不可能知道 AList / S3 / Windows 各自的禁用字符集，猜一套只会误伤。
- **失败留现场**：`onCreateFolder` reject 出来的消息原样贴在那行下面，新行不消失，让人能直接改。
- **成功后组件自己重拉当前目录**，不要求宿主回传新条目——少一个「宿主必须做对才能工作」的约定。
  然后进入新目录（决策 7）。

## 文案与本地化

所有面向用户的字符串收进 `labels` 对象，**英文默认值**，宿主可整体或逐条覆盖。`FileBrowser` 里零硬编码非英文。

这条是新立的约定，因为 registry 里已经有反例：`audio-player.tsx` / `audio-player-stage.tsx` 的
`aria-label` 曾是硬编码中文（英文用户装了会听到中文）。那个缺陷已在 `6c67c3c` 修掉——同样是
「英文默认 + `labels` 覆盖」，本组件沿用同一形状，键名扁平、类型和 `DEFAULT_*` 常量都导出。

## UI 与材质

**能 compose 的绝不手搓**——这是 acrylic skill 列的头号失败模式，而现有实现每条都踩了。替换表：

| 现有手搓 | 换成 |
|---|---|
| `<div className="flex items-center gap-1.5 rounded-md border...">` 裹 `<Input className="border-0 px-0 focus-visible:ring-0">` | `InputGroup` + `InputGroupInput` + `InputGroupAddon` |
| 手拼的面包屑 `<button>` + `ChevronRight` | `Breadcrumb` 全家；长路径中间层用 `BreadcrumbEllipsis` 折叠 |
| `<button className="flex w-full items-center gap-2 rounded px-2 py-1.5...">` | `Item asChild` + `ItemMedia` / `ItemContent`（`Item` 自带 `selected` prop） |
| 手写在 hover/选中上的 `bg-[var(--acr-card-nested)]` | `Item variant="muted"` |
| `<li>加载中…</li>` | `Skeleton` 行 |
| `text-[11px]` / `text-[12px]` | 标准尺寸类（跟随 `breadcrumb.tsx` 的 `text-sm`） |

第一行是最典型的：**把 Input 的样式关掉再自己画一个框**，而 `InputGroup` 就是为这件事存在的。

**表面层级**：列表区不再套 `rounded-md border border-[var(--acr-border-soft)]` 的框——那是在 Dialog 的
玻璃面板上又画一个框，而 acrylic 的深度来自嵌套色阶不是描边（"the material is the design"）。
行的凹陷走 **`Item` 自己的 variant**（materials.md：「单个凹陷**行**用 `Item variant="muted"`，
不要手搓 `bg-black/5`」）。
同时这也遵守 Apple 的「不要把一层浅色半透明表面叠在另一层上」。

> **别用 `data-nested-surface` 做这件事。** 那条 CSS 规则是
> `[data-nested-surface="true"] [data-slot="card"]`——只对内部的 **Card** 生效。列表行是 `Item`
> （`data-slot="item"`），永远匹配不上，加了等于什么都没做。本设计初稿写错过一次，Task 1 的 review
> 抓出来了。

**滚动边缘而非硬分隔线**：面包屑/搜索与列表之间、列表与 footer 之间的 1px 线去掉，换成 scroll edge
effect——只在内容确实被滚上去时，在交界处淡出一小段遮罩。1px 线是永远在那儿的装饰；遮罩只在真有
内容被盖住时出现，它传递信息而不是分割。

**选中态显示在哪**（真实的设计问题）：选目录时选中的是「当前所处的层」，而它**不在列表里**——列表显示的是
它的子项，所以没有行可以高亮。解法是底部一条常驻的选中条，显示当前 `value` 的完整路径：选目录时跟着
面包屑走，选文件时显示选中的文件。现有实现 footer 里那个 `<code>{path}</code>` 方向对，但只在选目录时
说得通，选文件模式下会显示错东西。这条同时是 wayfinding 的「我现在在哪、我选中的到底是什么」。

## 动效

**CSS tier，不引 `motion`。** motion.md 写死：JS 手势库只在真有拖拽的组件上作为该组件自己的
`registryDependency`，这个组件没有任何拖拽。

- **下钻/返回不做整页滑动**——这是原地换内容不是导航。用 `--acr-spring-default`（阻尼 1.0 / 响应 0.4，
  临界阻尼无过冲）做交叉淡入 **+ 约 10px 的方向性位移**：进入子目录从右侧推入，返回上层从左侧推入。
  进出同路径，符合「从哪儿消失就从哪儿回来」。
- **新建行**从列表顶部长出（高度 + 透明度同时动），输入框自动聚焦并全选。确认后先变成一个正常目录行、
  再触发下钻——两步分开，让人看得见「它建成了」。
- **行的按下反馈在 pointer-down 上**，不等 click。
- 不写任何手挑的 `cubic-bezier` + ms；`prefers-reduced-motion` 等三个 a11y 信号已在 token 层解决，
  组件不重复实现。

## 键盘与无障碍

macOS 打开面板的模型：`↑`/`↓` 移焦点，`→` 或 `Enter` 进目录，`←` 回上层，`Enter` 在文件上即选中，
`Esc` 归壳处理。列表用 **roving tabindex**（整个列表一个 tab stop），不是每行一个。
不可选中的条目（`select='dir'` 时的文件）`aria-disabled`，仍可被朗读但不可激活。

## 明确不做

- **多选**（决策 6）。
- **虚拟化**——DOM 结构保持成不挡路的形状（扁平 `<ul>` + 固定行高），真撞上千条目录再接
  virtualizer，不为假想需求给 registry 引新依赖。
- **重命名 / 删除 / 移动**——那是文件管理器，不是选择器。
- **多目录来源下拉**——`NetdiskFilePicker` 那个「切换搜索目录」留在 stream 侧，它是网盘绑定的领域概念。

## stream 侧迁移

不让 11 个调用点直接面对新接口。stream 里留一层薄适配 `app/src/components/netdisk/NetdiskPicker.tsx`：
把 `loadDir` / `searchDir` / `onCreateFolder` 绑到 `api.netdisk`（`listFs` / `listFs({recursive:true})` /
`mkdir`）、填中文 labels，其余 props 透传。调用点基本只改 import 和个别 prop 名。

`NetdiskDirPicker.tsx` / `NetdiskFilePicker.tsx` 删除，其测试改为打适配层。
「多目录来源下拉」作为适配层自己的一段 UI 保留在 stream。

**顺序约束**：acrylic-ui 必须先 push（Vercel 部署）才能 `npx shadcn add @acrylic/file-picker`——
registry 是从部署站点服务的，不是本地 `public/r`。

## 测试

acrylic 侧 vitest（`media-box.test.tsx` / `sheet.test.tsx` 是先例）：

- 下钻与面包屑回跳
- 搜索两种模式：给 `searchDir` 走它，不给降级为本层过滤
- 新建三条路：成功（重拉 + 进入）、本地拦重名/空名、宿主 reject（消息落在行下、行不消失）
- `select` 三种模式下什么可被选中、什么 `aria-disabled`
- 键盘：方向键下钻/返回、roving tabindex 只有一个 tab stop

stream 侧靠适配层的现有测试守回归。

## 交付顺序

1. `registry/acrylic/file-picker.tsx` + docstring
2. `registry.json` 条目 → `npm run registry:build`（`public/r/*.json` 是 gitignored，不提交）
3. 测试
4. 文档三件套：`content/docs/components/file-picker.mdx`、`components/examples/file-picker-demo.tsx`
   + **跑 `node scripts/gen-examples.mjs`**（漏了预览会渲染空白）、`meta.json` 加 `"file-picker"`
5. 在 acrylic-ui skill 的 correspondence 表里登记为 acrylic-only
6. `npm run types:check` → commit → **push（部署）**
7. stream：装组件 → 写 `NetdiskPicker.tsx` 适配层 → 迁 11 个调用点 → 删两个旧组件 → typecheck + 测试
