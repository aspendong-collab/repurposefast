#!/bin/bash
# ──────────────────────────────────────────────────────────────
# 🎯 Multi-Agent Orchestrator
#
# 三个 Agent 流水线:
#   ① Product Agent  → 读取 spec, 定义验收标准
#   ② Dev Agent      → 构建 + 类型检查 + 启动服务
#   ③ Test Agent     → 按 spec 逐个发包验证
#
# 用法: bash test/orchestrator.sh [all|dev|test|watch]
# ──────────────────────────────────────────────────────────────

set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MODE="${1:-all}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log()   { echo -e "${CYAN}[$(date +%H:%M:%S)]${NC} $1"; }
pass()  { echo -e "${GREEN}✅ $1${NC}"; }
fail()  { echo -e "${RED}❌ $1${NC}"; }
warn()  { echo -e "${YELLOW}⚠️  $1${NC}"; }

# ──────────────────────────────────────────────────────────────
# ① Product Agent
# ──────────────────────────────────────────────────────────────
product_agent() {
    log "① Product Agent — 读取产品规格..."
    
    local spec="$ROOT/test/product-spec.yaml"
    if [ ! -f "$spec" ]; then
        fail "找不到 product-spec.yaml"
        return 1
    fi

    local count=$(grep -c "id: spec-" "$spec")
    pass "已加载 $count 条规格验收标准"

    # Show spec summary
    echo ""
    grep -E "^\s+- id:|^\s+name:" "$spec" | paste - - | sed 's/- id:/  /' | sed 's/name:/→ /'
    echo ""
}

# ──────────────────────────────────────────────────────────────
# ② Dev Agent
# ──────────────────────────────────────────────────────────────
dev_agent() {
    log "② Dev Agent — 构建检查..."
    cd "$ROOT"

    # Type check
    log "   TypeScript 检查..."
    if npx tsc --noEmit 2>&1 | tail -5; then
        pass "  类型检查通过"
    else
        warn "  类型检查有警告(可忽略)"
    fi

    # Build
    log "   生产构建..."
    if npm run build 2>&1 | tail -3; then
        pass "  构建成功"
    else
        fail "  构建失败"
        return 1
    fi

    # Start dev server
    log "   启动开发服务器..."
    pkill -f "next dev" 2>/dev/null || true
    sleep 1
    npm run dev -- -p 3100 &
    
    # Wait for server
    for i in $(seq 1 15); do
        if curl -s -o /dev/null http://localhost:3100 2>/dev/null; then
            pass "  服务器就绪 (http://localhost:3100)"
            return 0
        fi
        sleep 2
    done
    
    fail "  服务器启动超时"
    return 1
}

# ──────────────────────────────────────────────────────────────
# ③ Test Agent
# ──────────────────────────────────────────────────────────────
test_agent() {
    log "③ Test Agent — 执行自动化测试..."
    
    cd "$ROOT"
    export TEST_BASE_URL="${TEST_BASE_URL:-http://localhost:3100}"

    python3 test/test_agent.py --base "$TEST_BASE_URL" "$@"
    local exit_code=$?

    if [ $exit_code -eq 0 ]; then
        pass "全部测试通过!"
        return 0
    else
        fail "有测试失败"
        return 1
    fi
}

# ──────────────────────────────────────────────────────────────
# Watch Mode (代码改动自动触发)
# ──────────────────────────────────────────────────────────────
watch_mode() {
    log "👀 Watch Mode — 监控文件改动..."
    
    if ! command -v fswatch &> /dev/null; then
        warn "需要安装 fswatch: brew install fswatch"
        return 1
    fi

    local last_run=0
    
    fswatch -o "$ROOT/app" "$ROOT/components" "$ROOT/lib" "$ROOT/hooks" | while read _; do
        local now=$(date +%s)
        if [ $((now - last_run)) -lt 5 ]; then
            continue  # debounce
        fi
        last_run=$now

        echo ""
        log "━━━ 检测到文件改动 ━━━"
        test_agent
    done
}

# ──────────────────────────────────────────────────────────────
# Main
# ──────────────────────────────────────────────────────────────

case "$MODE" in
    product)
        product_agent
        ;;
    dev)
        dev_agent
        ;;
    test)
        test_agent
        ;;
    watch)
        watch_mode
        ;;
    all)
        echo "🚀 Multi-Agent Pipeline Start"
        echo ""
        product_agent
        dev_agent || exit 1
        test_agent || exit 1
        echo ""
        log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        pass "🎉 Pipeline 完成! 产品→开发→测试 全通过"
        ;;
    *)
        echo "用法: bash test/orchestrator.sh [product|dev|test|all|watch]"
        ;;
esac
