export const documentSchemas = {
  "安全规范": {
    "type": "object",
    "title": "安全规范",
    "properties": {
      "title": { "type": "string", "label": "标题", "required": true, "placeholder": "输入安全规范标题" },
      "summary": { "type": "string", "label": "摘要", "format": "textarea", "placeholder": "简要描述安全规范内容" },
      "content": { "type": "string", "label": "详细内容", "format": "markdown", "required": true, "placeholder": "输入安全规范详细内容" }
    }
  },
  "操作流程": {
    "type": "object",
    "title": "操作流程",
    "properties": {
      "title": { "type": "string", "label": "标题", "required": true, "placeholder": "输入操作流程标题" },
      "summary": { "type": "string", "label": "摘要", "format": "textarea", "placeholder": "简要描述操作流程内容" },
      "content": { "type": "string", "label": "详细内容", "format": "markdown", "required": true, "placeholder": "输入操作流程详细内容" },
      "process_steps": { "type": "string", "label": "流程步骤", "format": "textarea", "placeholder": "列出操作流程的步骤" },
      "equipment": { "type": "string", "label": "所需设备", "placeholder": "列出所需设备" }
    }
  },
  "质量检查": {
    "type": "object",
    "title": "质量检查",
    "properties": {
      "title": { "type": "string", "label": "标题", "required": true, "placeholder": "输入质量检查标题" },
      "summary": { "type": "string", "label": "摘要", "format": "textarea", "placeholder": "简要描述质量检查内容" },
      "content": { "type": "string", "label": "详细内容", "format": "markdown", "required": true, "placeholder": "输入质量检查详细内容" },
      "check_items": { "type": "string", "label": "检查项目", "format": "textarea", "placeholder": "列出质量检查项目" },
      "acceptance_criteria": { "type": "string", "label": "验收标准", "format": "textarea", "placeholder": "输入质量验收标准" }
    }
  }
};

export const getSchemaByType = (type) => {
  return documentSchemas[type] || documentSchemas["安全规范"];
};
