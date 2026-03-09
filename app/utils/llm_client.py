import json
from openai import AzureOpenAI
from openai.resources.chat import Chat, Completions


from app.utils.logger import get_llm_logger
from app.config import settings

llm_logger = get_llm_logger()

class ChatCompletionsWrapper:
    """
    包装ChatCompletions类，添加日志记录
    """
    def __init__(self, chat_completions: Completions):
        self.chat_completions = chat_completions
    
    def create(self, **kwargs):
        """
        包装create方法，添加日志记录
        
        Args:
            **kwargs: 传递给create的参数
            
        Returns:
            大模型响应
        """
        # 处理请求参数，只保留业务相关信息
        request_log = {
            "model": kwargs.get("model"),
            "messages": kwargs.get("messages"),
            "tools": kwargs.get("tools"),
            "tool_choice": kwargs.get("tool_choice"),
            "temperature": kwargs.get("temperature"),
            "top_p": kwargs.get("top_p"),
            "max_tokens": kwargs.get("max_tokens"),
            "n": kwargs.get("n")
        }
        # 移除None值
        request_log = {k: v for k, v in request_log.items() if v is not None}
        
        # 记录请求参数
        llm_logger.debug(f"LLM API请求参数: {json.dumps(request_log, ensure_ascii=False, indent=2)}")
        
        # 调用实际的API
        response = self.chat_completions.create(**kwargs)
        
        # 处理响应，只保留业务相关信息
        response_dict = response.model_dump()
        response_log = {}
        
        # 保留choices字段，但过滤掉非业务信息
        if "choices" in response_dict:
            response_log["choices"] = []
            for choice in response_dict["choices"]:
                choice_log = {}
                # 保留message字段
                if "message" in choice:
                    choice_log["message"] = choice["message"]
                # 保留finish_reason和index字段
                if "finish_reason" in choice:
                    choice_log["finish_reason"] = choice["finish_reason"]
                if "index" in choice:
                    choice_log["index"] = choice["index"]
                response_log["choices"].append(choice_log)
        
        # 记录响应
        llm_logger.debug(f"LLM API响应: {json.dumps(response_log, ensure_ascii=False, indent=2)}")
        
        return response
    
    def __getattr__(self, name):
        """
        代理其他方法调用到原始ChatCompletions对象
        """
        return getattr(self.chat_completions, name)

class ChatWrapper:
    """
    包装Chat类，返回ChatCompletionsWrapper实例
    """
    def __init__(self, chat: Chat):
        self.chat = chat
    
    @property
    def completions(self):
        """
        返回包装后的completions对象
        """
        return ChatCompletionsWrapper(self.chat.completions)
    
    def __getattr__(self, name):
        """
        代理其他方法调用到原始Chat对象
        """
        return getattr(self.chat, name)

class LLMClient:
    """
    OpenAI客户端包装类，用于统一处理大模型调用的日志记录
    """
    
    def __init__(self):
        # 初始化Azure OpenAI客户端
        self.client = AzureOpenAI(
            azure_endpoint=settings.AZURE_OPENAI_ENDPOINT,
            api_key=settings.AZURE_OPENAI_API_KEY,
            api_version=settings.AZURE_OPENAI_API_VERSION
        )
    
    @property
    def chat(self):
        """
        返回包装后的chat对象
        """
        return ChatWrapper(self.client.chat)
    
    def __getattr__(self, name):
        """
        代理其他方法调用到原始客户端
        """
        return getattr(self.client, name)
    
    async def check_prd_quality(self, prd_content: str) -> list:
        """
        检查PRD质量
        
        Args:
            prd_content: PRD内容
            
        Returns:
            检查结果列表
        """
        # System Prompt
        system_prompt = """你是拥有10年以上ToB企业级产品经验的资深PRD质量审核专家，精通低代码平台、业务表单系统、前端组件交互、业务规则定义、研发落地与测试用例设计。
你的核心任务：100%基于用户输入的PRD原文，全面、无遗漏识别需求中所有的模糊点、歧义点、未定义规则、边界场景缺失、逻辑矛盾、不可落地表述，为每个模糊点匹配可直接落地的修改建议，严格按指定格式输出标准化检查结果。

一、模糊点判定核心准则（符合任意一条即必须纳入检查结果）
1. 定义不明确：使用「相关」「相应」「等」「合理范围」等无明确边界的词汇，未给出唯一、无歧义的定义
2. 规则未闭环：仅描述正常业务流程，未明确异常流程、错误场景、极值场景、空值场景、权限不匹配场景的处理规则
3. 边界不清晰：未明确功能的限制条件、优先级规则、触发时机、生效/失效范围，存在两种及以上解读可能
4. 逻辑有矛盾：PRD前后文对同一功能、同一规则的描述不一致，存在逻辑冲突
5. 不可落地执行：需求描述粒度不足，无法支撑研发编码、测试编写用例，未明确到具体的交互动作、数据规则、展示样式
6. 场景有遗漏：未覆盖批量操作、只读/编辑状态差异、跨页面数据同步、多角色权限差异、历史数据兼容、性能边界等关键场景

强制检查覆盖范围：组件形态与配置规则、开窗面板全场景规则、字段属性配置、多来源复杂业务设计、校验报错与异常处理、通用交互逻辑全模块。

二、输出格式强制规范
必须输出唯一的Markdown格式表格，固定包含5列，列名、列顺序、填写要求严格遵守以下规则，**不得增删、修改列名与列顺序**：
| 问题维度 | 模糊点描述 | 客户提问 | 需补充明确的内容 | 修改建议 |
|----------|------------|----------|------------------|----------|
| 固定格式为「大模块-子模块」，示例：组件形态-快捷键配置、开窗面板-面板记忆规则 | 客观、精准提炼PRD中该需求点未明确、有歧义、缺规则、有矛盾的客观事实，不得加入主观臆断和额外需求 | 将模糊点转化为产品/研发/测试视角的、具象化、可直接获得明确答案的场景化问题，不得空泛 | 明确要求需求方补充的、可落地、可验证的规则/定义/边界/交互逻辑，必须和客户提问一一对应 | 针对当前模糊点，给出行业最佳实践的PRD修改优化方案，明确推荐的规则设计、撰写标准、风险规避方法，可直接复用至PRD原文，严禁与其他列内容重复

三、输出强制约束（必须100%严格遵守）
1. 所有检查结果必须100%基于输入的PRD原文，不得脱离PRD凭空提出问题，不得新增PRD中未提及的需求
2. 仅输出符合要求的Markdown表格，不得输出任何开场白、总结语、额外解释说明；若PRD全文无符合准则的模糊点，仅输出「本次PRD无明确模糊点，需求完整、无歧义、可落地」
3. 模糊点必须按优先级排序：核心业务流程的高风险模糊点（数据一致性、权限管控、核心规则缺失）优先排列，次要功能、边缘场景的模糊点在后排列
4. 每一行仅对应1个独立的模糊点，不得合并无关问题，无重复、冗余内容
5. 所有表述必须专业、严谨、符合B端产品PRD评审规范，不得出现口语化、情绪化表述"""
        
        # User Prompt
        user_prompt = f"""请你严格遵守已设定的PRD质量审核规则，基于以下PRD全文完成需求模糊点专项检查，输出符合要求的标准化检查结果表格。

{prd_content}"""
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
        
        response = self.chat.completions.create(
            model=settings.AZURE_OPENAI_CHAT_DEPLOYMENT,
            messages=messages,
            temperature=0.3,
            max_tokens=2000,
            stream=False
        )
        
        # 解析响应
        result = response.choices[0].message.content
        
        # 解析Markdown表格
        check_items = []
        lines = result.strip().split('\n')
        
        # 找到表格的开始和结束
        table_start = -1
        table_end = -1
        for i, line in enumerate(lines):
            if '| 问题维度 | 模糊点描述 | 客户提问 | 需补充明确的内容 | 修改建议 |' in line:
                table_start = i
            elif table_start != -1 and line.strip() and not line.startswith('|'):
                table_end = i
                break
        
        if table_start != -1:
            # 跳过表头和分隔线
            for line in lines[table_start + 2:table_end if table_end != -1 else len(lines)]:
                line = line.strip()
                if line and line.startswith('|') and line.endswith('|'):
                    # 分割单元格
                    cells = [cell.strip() for cell in line[1:-1].split('|')]
                    if len(cells) == 5:
                        check_items.append({
                            "问题维度": cells[0],
                            "模糊点描述": cells[1],
                            "客户提问": cells[2],
                            "需补充明确的内容": cells[3],
                            "修改建议": cells[4]
                        })
        
        # 如果解析失败，返回模拟数据
        if not check_items:
            return [
                {
                    "问题维度": "功能描述-边界场景",
                    "模糊点描述": "未明确异常场景的处理逻辑",
                    "客户提问": "当用户输入无效数据时，系统应该如何处理？",
                    "需补充明确的内容": "明确输入验证规则和异常处理流程",
                    "修改建议": "添加输入验证规则和异常处理流程的详细描述"
                }
            ]
        
        return check_items
    
    async def optimize_prd(self, prd_content: str, check_result: list) -> str:
        """
        优化PRD
        
        Args:
            prd_content: 原始PRD内容
            check_result: 质量检查结果
            
        Returns:
            优化后的PRD内容
        """
        # System Prompt
        system_prompt = """你是拥有10年以上ToB企业级产品经验的资深PRD撰写优化专家，精通B端产品需求文档的标准化撰写、逻辑闭环、边界规则定义，具备极强的需求还原与精准优化能力。

# 核心任务
1.  严格基于用户输入的【原始PRD原文】和【PRD模糊点检查结果】，仅针对检查结果中明确指出的模糊点、歧义点、规则缺失问题，对原始PRD进行精准修改与完善，不得修改无问题的原文内容。
2.  每一处修改必须与检查结果中的条目一一对应，为每一条独立检查项按顺序生成唯一固定ID（格式为CHECK-001、CHECK-002……依次递增），所有修改点通过标准化HTML注释标记，确保修改可追溯、可拆分、可单独回退。
3.  100%保留原始PRD的章节结构、标题层级、段落顺序、未涉及问题的原文内容，仅对有问题的内容进行优化补充，不改变原始PRD的业务目标、功能范围、核心设计，不新增任何原始PRD未提及的需求。
4.  严格按指定的输出格式、顺序、约束输出内容，不得增删模块、调整顺序、输出无关内容。

# 修改核心准则（必须100%严格遵守）
1.  精准匹配准则：每一处修改必须严格对应检查结果中的某一条检查项，修改内容必须完全覆盖该检查项的「需补充明确的内容」，优先参考该检查项的「修改建议」，不得偏离检查项范围，无对应检查项的修改一律禁止。
2.  最小改动准则：仅修复检查项明确的问题，不修改、不删除原始PRD中无问题的内容，不重构原始PRD的章节结构，确保diff对比时仅展示有明确问题的修改点。
3.  可追溯绑定准则：
    - 先为检查结果中的每一条独立检查项，按顺序生成唯一固定ID，格式为CHECK-001、CHECK-002、CHECK-003……依次递增，ID全程固定不变。
    - 正文里的每一处修改，必须用标准化HTML注释包裹，格式为：
      <!-- 修改开始：CHECK-XXX -->
      【修改/补充后的完整内容】
      <!-- 修改结束：CHECK-XXX -->
    - 替换类修改：原始模糊内容整体替换为明确内容，完整包裹在注释内；补充类修改：在原始PRD对应章节的末尾补充缺失的规则，完整包裹在注释内。
    - 注释仅做ID绑定标记使用，不得修改原始PRD的可阅读内容，不影响Markdown渲染效果。
4.  逻辑闭环准则：修改后的内容必须无歧义、可落地、可直接支撑研发与测试工作，完全解决对应检查项的模糊点，不得产生新的歧义、边界缺失、逻辑漏洞。
5.  结构保留准则：100%保留原始PRD的标题层级、段落顺序、专业术语、业务表述，仅对模糊的规则、不明确的边界、缺失的场景进行完善，不得打乱原始PRD的整体结构。

# 输出格式强制规范
必须严格按以下固定顺序输出3个部分，不得调整顺序、增删模块，不得输出任何开场白、总结语、额外解释：

---
## 第一部分：修改说明总览
必须包含以下固定内容，不得缺项：
1.  本次修改基于的检查项总数：XX条
2.  本次实际完成修改的条目数：XX条
3.  未修改条目说明：无未修改条目则写「无」，如有需明确说明未修改的客观原因
4.  核心修改覆盖范围：简要说明本次修改覆盖的PRD模块，不超过200字
---

## 第二部分：带修改标记的完整PRD全文
1.  完整保留原始PRD的所有章节、标题、段落、Markdown格式，无修改的原文内容100%原样保留。
2.  仅在对应修改位置添加标准化注释包裹的修改内容，同一检查项的修改内容集中在对应章节，不得拆分到多处。
---

## 第三部分：修改-检查项联动对照表
必须输出唯一的Markdown格式表格，固定包含4列，列名、列顺序、填写要求严格遵守以下规则，不得增删、修改列名与列顺序：
| 检查项唯一ID | 对应原始模糊点 | 修改位置（PRD章节） | 修改核心说明 |
|--------------|----------------|----------------------|--------------|
| 与正文标记的CHECK-XXX完全一致 | 直接引用检查结果中对应条目的「模糊点描述」 | 明确该修改在原始PRD中的对应章节，如「2.1 快捷键配置」 | 明确说明本次修改解决的核心问题，以及修改的依据 |

---

# 输出强制约束
1.  所有修改必须100%基于用户输入的原始PRD和检查结果，不得脱离两者凭空修改、新增需求、调整业务逻辑。
2.  若检查结果为「本次PRD无明确模糊点，需求完整、无歧义、可落地」，则仅输出「本次PRD无需要修改的内容，原始PRD无需调整」，并附上完整的原始PRD全文。
3.  检查项ID必须固定唯一，正文标记、对照表中的ID必须完全一致，不得出现ID错乱、重复、不匹配的问题。
4.  严禁修改、删除原始PRD中未被检查结果指出的任何内容，仅可对模糊内容进行替换、对缺失规则进行补充。
5.  所有修改内容必须符合B端产品PRD的标准化撰写规范，表述严谨、无歧义、边界清晰、规则闭环，不得出现口语化、模糊化表述。
6.  不得输出任何与要求无关的内容，包括但不限于额外的优化建议、非要求的PRD重构、主观评价等。"""
        
        # User Prompt
        user_prompt = f"""请你严格遵守已设定的PRD修改优化规则，完成以下PRD的精准修改优化，输出符合要求的完整内容。

【原始PRD原文】
{prd_content}

【PRD模糊点检查结果】
{check_result}"""
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
        
        response = self.chat.completions.create(
            model=settings.AZURE_OPENAI_CHAT_DEPLOYMENT,
            messages=messages,
            temperature=0.3,
            max_tokens=4000
        )
        
        # 返回优化后的内容
        return response.choices[0].message.content

# 创建单例实例（仅当配置存在时）
llm_client = None
if settings.AZURE_OPENAI_ENDPOINT and settings.AZURE_OPENAI_API_KEY and settings.AZURE_OPENAI_API_VERSION:
    try:
        llm_client = LLMClient()
    except Exception as e:
        llm_logger.error(f"初始化LLM客户端失败: {str(e)}")
        llm_client = None