# AGENTS

## 功能清单

### 身份认证与鉴权
- 登录页提供管理员用户名/密码登录（`src/components/LoginView.vue`），包含用户名/密码长度校验、中文/英文账号支持、冷却倒计时（默认 3 秒）防止重复请求，以及登录后将 JWT 与用户名分别写入 `localStorage` / `sessionStorage` 并重定向到后台。
- 注册页（`src/components/RegisterView.vue`）支持用户名、密码二次确认、邮箱输入与格式校验，同样复用冷却机制以防刷注册。
- 全局路由守卫（`src/router/index.js`）限制 `/admin` 路由必须携带本地令牌；`logout()`（`src/net/index.js`）统一清除令牌、用户名与各类测试状态。

### 模型管理后台
- `AdminView.vue` 初始化即调用 `/v1/models` 拉取模型分页列表，表格展示模型优先级、名称/标识、能力集合以及上下线状态，可通过 `el-switch` 实时切换状态。
- “注册/编辑模型”弹窗覆盖新增与更新逻辑：字段包括名称、Model ID、API Key、优先级、基准 URL 与多选的四类能力（t2t/t2i/i2t/i2i），带有 Element Plus 校验规则与必填提示；保存时依据 `isUpdate` 自动走 POST 或 PUT。
- 支持在行内触发编辑、删除（带 `ElMessageBox.confirm` 确认）与测试；删除成功会刷新分页数据。
- 列表底部集成 Element Plus 分页器，并在页面顶部展示调用调度规则说明。

### AccessKey 管理
- `KeyAdmin.vue` 弹窗按页展示当前管理员全部 AccessKey，包含创建时间、启用状态（前端将数值转布尔）以及删除按钮；可一键请求创建新 Key。
- 组件对外暴露 `get_access_keys` 与 `get_accKey`：前者刷新分页数据，后者为模型测试寻找首个可用 Key 并写入全局 `states.KeyInUse`。

### 使用量统计
- `UsageSelect.vue` 包含日期选择器（默认当天、禁选未来、常用日期快捷入口）与模型使用表格，表格显示某日的总请求数/成功数/失败数，并可分页查看历史记录。
- 查询逻辑向 `/v1/models/usage` 发送 POST，请求体可携带模型 ID、标识及日期，返回结果缓存到 `states.Usages` 复用。

### 模型测试工具
- 测试入口会先确保当前账号拥有可用 AccessKey，并依据模型 `capabilities` 决定展示文生文/图生文或文生图/图生图工具。
- `ModelTest2Text.vue` 支持 text-to-text 与 image-to-text：可输入用户消息、附带历史对话、设置 temperature/max_tokens/top_p/frequency_penalty，必要时附带图片 URL。提交后显示用户输入及模型响应、所用模型 ID，并提供 loading 进度条、错误 fallback、重置/退出功能。
- `ModelTest2Image.vue` 覆盖 text-to-image 与 image-to-image：输入 prompt、可选原图 URL，配置生成参数（x/y 尺寸、图片数量、seed、智能改写、水印、强度等），响应区展示实际使用的 prompt 及生成的图片链接；同样带等待指示、错误提示与重置入口。

### 账号管理与异常页面
- 导航栏提供“账号管理”按钮，触发 `ChangePasswordModal.vue`，可在校验通过后调用 `/v1/auth/change-password` 修改旧密码。
- 页面右上角展示当前用户名并提供登出按钮。
- `ErrorView.vue` 提供简洁的 404 兜底页面，包括返回首页与返回上一页操作；未知路由统一重定向到该视图。

