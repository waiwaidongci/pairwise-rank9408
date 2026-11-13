# 弦序公共艺术成对评议簿

把匿名机构作品的成对选择票数，变成有对手调整、有重采样留档、可人工审阅的补充评议依据。

## 在谁的工作里

弦序展陈研究组有17位策展分析员，为滨河公共艺术委托方整理机构方案。上游提供 `滨河匿名成对票数_20261112.csv`，每行是一对匿名方案的两侧累计选择票数。过去研究员在工作表里分别算总胜率，再把最高名次抄入评议纪要。三个问题反复出现：遇到的对手不同、断连作品组被排在同一榜单、一次名次被理解为稳定结论。

本应用替代“核对汇总票数→比较研究→提出补票→负责人审阅”的一段。来源文件名作为溯源元数据，票数可在核对页逐对录入/编辑或用 API 写入；没有通用文件上传解析器。下游收到经人工批准的补充评议 CSV，安排新一轮匿名选择。模型不代替公共价值、可实施性与预算审议，不自动立项。

| 角色 | 主要页面 | 权限 | 典型动作 |
|---|---|---|---|
| admin 策展负责人 | 全部六页 | 读写、排队、提出建议、批准/退回、导出 | 审阅补票安排并留下批注 |
| analyst 策展分析员 | 全部六页 | 核对/录入研究作品票数、排队、提出建议、导出已批准提案 | 比较水纹折页与风的尺度 |
| viewer 委托方观察员 | 全部六页 | 只读、下载已批准提案；写入和审批均403 | 读取研究边界与分发CSV |

演示账号：`admin@xianxu.local`、`analyst@xianxu.local`、`viewer@xianxu.local`；共同密码 `Xianxu2026!`。账号为本地模拟资料，不是个人评审者名单。

## 一天的研究剧本

1. 09:00 许澄以 analyst 登录，打开 `XX-2026 滨河公共艺术 · 匿名方案评议`。
2. 09:05 对照来源文件登记12项方案，核对48条比较边、1640票；每条边20–50票。网络图使用真实比较关系，线宽随该对总票数变化。
3. 09:15 到拟合工作台，取 λ=1、100次 bootstrap、seed=20261112，填写研究名后“冻结票数并排队”。worker执行，页面每2.5秒刷新。
4. 09:17 阅读结果：固定数据下回声廊中心化能力为1.020641，水纹折页为0.572832、风的尺度为0.551493。能力来自对手调整的选择模型，负能力仍可有价值。
5. 09:20 切换“名次重现”：水纹折页与风的尺度的2.5%–97.5%经验名次分位均为2–4。回声廊100次中98次第1、2次第2，首位分摊频率98%；这不是后验概率。
6. 09:25 在“重复留档”逐页核对100次原始重拟合；每次保留48条边的实际重采样胜票、12个能力、平均名次及一阶条件残差。
7. 09:35 提出“水纹折页 × 风的尺度 · 独立补票30票”，说明名次范围、题序检查和成对独立假设。提案不会自动增加原始票数。
8. 10:00 梁晴用 admin 留下批注并同意补充评议；周原用 viewer 下载 `review-proposal-<id>.csv`。文件包含审批、指纹、12项模型摘要和66对胜率；新票需回核对页录入，再建新快照。

这些数值来自固定seed真实计算；并列与重采样范围不能被解读为策展决策或个人绩效。

## 启动

```bash
cp .env.example .env
docker compose config --quiet
docker compose up -d --build
docker compose ps
docker compose exec -T backend python -m scripts.seed_demo
```

- 前端 `http://localhost:18224`，后端文档 `http://localhost:19224/docs`，健康检查 `/health`。
- PostgreSQL `localhost:17724`；库/用户 `pairwise`，本地密码见 `.env.example`。
- `SEED_DEMO=true` 启动插入演示数据；失败会记录日志而不阻止服务启动。手动 seed 使用自然键只插入缺项，既有研究、票数方向/计数/来源与人工修改不会覆盖。
- 初始3个研究：主研究12作品48边1640票、均衡两项10:10、两组断连边界。合计18作品51比较记录。seed不提前创建计算结果，用户真实排队后才能阅读。
- 收尾 `docker compose down -v --remove-orphans` 会删除本题数据库、Redis和分析产物卷。

## 五服务与配置

| 服务 | 技术/职责 | 健康条件 |
|---|---|---|
| frontend | React18.3.1 / TypeScript / Vite6.4.6 构建，Nginx1.27分发 | HTTP 127.0.0.1 |
| backend | Python3.11 / FastAPI0.115.6 / SQLAlchemy2 / PyJWT | 数据库SELECT1 + Redis ping |
| worker | 同后端镜像；单进程扫描数据库队列并读取Redis唤醒 | 心跳文件30秒内更新 |
| db | PostgreSQL16 | pg_isready |
| redis | Redis7 AOF；队列唤醒/登录限流 | redis-cli ping |

Compose恰好5服务，依赖使用 service_healthy；命名卷为数据库、Redis和backend/worker共享 `/artifacts`。PostgreSQL科学标量 `ridge` 用 DOUBLE PRECISION；结果与快照用JSON保留Python双精度值。Nginx `/api/` 只剥离一次，后端路由不带 `/api`。

| 环境变量 | 用途 / 默认 |
|---|---|
| COMPOSE_PROJECT_NAME | `pairwise-rank`；容器名前缀 |
| FRONTEND_PORT / BACKEND_PORT / DB_PORT | 18224 / 19224 / 17724 |
| DB_PASSWORD | `pairwise-demo-local`，仅本地示例 |
| JWT_SECRET | 本地示例签名键，部署前用独立随机值 |
| SEED_DEMO | true：后端启动尝试自然键插入 |
| DATABASE_URL / REDIS_URL | Compose内部地址；本地开发可覆盖 |
| OMP_NUM_THREADS / OPENBLAS_NUM_THREADS | 1，限制数值线程 |

JWT有效8小时，PBKDF2-SHA256存储密码。三组跨端枚举为Role、RunStatus、ProposalStatus，定义位置分别在 `backend/src/constants/enums.py` 与 `frontend/src/constants/enums.ts`；被auth依赖、run/proposal服务与schema、worker、状态组件/账户/结果及提案页面使用。审计中间件记录写操作和导出（含权限拒绝）；全局异常中间件统一失败；Redis按IP限制登录30次/分钟。全局最多3个活动任务，单任务2–30作品、≤300边、50–200次重复；数值库单线程。

## 核心口径与可复算性

对每条无向作品对选定一个记录方向，`w_ij` 为左胜票、`n_ij` 为总票。负对数似然加固定正ridge惩罚为：

```text
Σ_edges [n_ij logaddexp(0, θ_i−θ_j) − w_ij (θ_i−θ_j)] + λ/2 Σ_i θ_i²
p(i beats j) = expit(θ_i−θ_j),    Σ_i θ_i = 0,    λ > 0
```

显式正交零和基消除平移不确定性；解析梯度与Hessian交给SciPy trust-exact。接近机器精度的信赖域停滞用解析Newton步精修，每步需降低实际投影梯度且目标不超过浮点容差；最终独立检查有限目标及最大投影梯度≤1e−6，否则失败。原优化器消息与精修次数可查。正ridge防止完全分离使能力发散，但并不把断连图强行合并。稳定运算参考 [SciPy expit](https://docs.scipy.org/doc/scipy/reference/generated/scipy.special.expit.html) 与 [SciPy minimize](https://docs.scipy.org/doc/scipy/reference/generated/scipy.optimize.minimize.html)。

提交时冻结研究、作品与票数；修改原始台账不回写历史快照。每条无向边只能有一条汇总记录；计算时按作品代码规范方向、台账保留录入方向，不把反向作为另一条证据。检查全部已登记作品（含孤点），拒绝自比、外部作品、重复边、无票边、负/非整数票数、断连图。自比不进入模型，胜率矩阵对角为null，页面只列其他对手。

Bootstrap使用 `Binomial(n_ij, w_ij/n_ij)`，每条边总票数固定、按观测比例抽样，再用相同λ重新拟合；不是按模型预测比例抽样。固定NumPy RNG seed，保存每次重采样的实际胜票、中心化能力、平均名次、首位分摊和梯度。能力相差≤1e−8按并列组取平均名次；并列首位均分1份。名次频率保留可能的小数名次；2.5%与97.5%经验分位采用线性插值，因此端点可为非整数，不宣称后验、家族覆盖或同时置信区间。

该方法条件于固定比较设计和成对iid选择假设，未建模同一评审人的相关选择、题序/呈现偏差、机构抽样、作品集变化。只保留匿名汇总计数，无法从这些数据检验评审人依赖。不同λ的能力不能混为同一估计。

SHA256覆盖算法版本、完整冻结快照、λ、重复数、seed。JSON结果同时写数据库和 `/artifacts/run-<id>.json`。相同软件环境与完整快照可逐字复算；指纹包含数据库ID，重新建库或更换来源标识不保证指纹相同。

## 代码与本地开发

```text
backend/src/
  models + schemas + services + controllers + routes  五条业务链
  services/{comparison_graph,bt_solver,rank_bootstrap}.py
  config / constants / middlewares / utils / main.py / worker.py
backend/scripts/seed_demo.py
backend/migrations/001_initial.sql
frontend/src/
  api / stores / types / constants / components/common / hooks
  pages / router / utils / App.tsx / main.tsx / styles.css
```

五个实体 ComparisonStudy、Concept、PairCount、RankingRun、ReviewProposal 各有独立model/schema/service/controller/route/API模块；studyStore、inputStore和researchStore承接对应实体状态，分别贯穿总谱/核对/运行/结果/审阅页面。StudySelect复用于总谱、输入、配置；PageHeading、StatusBadge、ErrorNotice等共享。独立留档页为第六页，登录单独。

```bash
# 从项目根先启动两个依赖
docker compose up -d db redis
cd backend
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export DATABASE_URL='postgresql+psycopg://pairwise:pairwise-demo-local@localhost:17724/pairwise'
export REDIS_URL='redis://localhost:6379/0'
export SEED_DEMO=true
uvicorn src.main:app --host 0.0.0.0 --port 19224
# 另一终端在backend同一虚拟环境、相同环境变量下执行
python -m src.worker
# 另一个终端进入frontend
npm ci
npm run dev -- --port 18224
```

Vite开发代理指向19224并剥离一次 `/api`。本地worker写 `/artifacts`，可在有权限的环境创建该目录；默认推荐Compose共享卷。建表通过SQLAlchemy metadata.create_all，迁移目录保存初始DDL用于审阅，不提供生产环境版本升级工具。字体为Google Fonts DM Sans与Noto Serif SC，网络不可用时回退Georgia/serif。

测试脚本、日志、真实截图、数值oracle和TESTING独立存放在批次的 `test-artifacts/gb-0020`，不进入应用源码。测试包含两项闭式导数、均衡并列、梯度差分、标签置换、极端胜票、断连/无票与真实角色分发。MIT License。
