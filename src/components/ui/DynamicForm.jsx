import React from "react";
import { Input } from "./input";
import { Textarea } from "./textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { Label } from "./label";
import { Button } from "./button";
import { Upload } from "lucide-react";

export default function DynamicForm({ schema, data, onChange }) {
  const handleChange = (field, value) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  const handleFileUpload = (field, file) => {
    // 这里可以添加文件上传逻辑
    // 目前只是模拟上传，实际项目中需要实现真实的文件上传
    console.log(`上传文件: ${file.name} 到字段: ${field}`);
    // 模拟文件上传成功，返回文件路径
    handleChange(field, `./uploads/${file.name}`);
  };

  const renderField = (fieldName, fieldSchema) => {
    const value = data[fieldName] || "";
    
    return (
      <div key={fieldName} className="space-y-2">
        <Label htmlFor={fieldName}>
          {fieldSchema.label}
          {fieldSchema.required && <span className="text-destructive ml-1">*</span>}
        </Label>
        
        {fieldSchema.format === "textarea" ? (
          <Textarea
            id={fieldName}
            value={value}
            onChange={(e) => handleChange(fieldName, e.target.value)}
            placeholder={fieldSchema.placeholder || ""}
            className="mt-1 h-20"
          />
        ) : fieldSchema.format === "markdown" ? (
          <div className="space-y-2">
            <Textarea
              id={fieldName}
              value={value}
              onChange={(e) => handleChange(fieldName, e.target.value)}
              placeholder={fieldSchema.placeholder || ""}
              className="mt-1 h-40"
            />
            <p className="text-xs text-muted-foreground">支持 Markdown 格式</p>
          </div>
        ) : fieldSchema.format === "docx" ? (
          <div className="space-y-2">
            <Input
              id={fieldName}
              value={value}
              readOnly
              placeholder="上传 DOCX 文件"
              className="mt-1"
            />
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.docx';
                input.onchange = (e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(fieldName, e.target.files[0]);
                  }
                };
                input.click();
              }}
            >
              <Upload className="w-4 h-4" />
              上传 DOCX 文件
            </Button>
          </div>
        ) : fieldSchema["ui:widget"] === "select" || fieldSchema.enum ? (
          <Select 
            value={value} 
            onValueChange={(v) => handleChange(fieldName, v)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder={fieldSchema.placeholder || "选择"} />
            </SelectTrigger>
            <SelectContent>
              {fieldSchema.enum.map((option) => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            id={fieldName}
            value={value}
            onChange={(e) => handleChange(fieldName, e.target.value)}
            placeholder={fieldSchema.placeholder || ""}
            className="mt-1"
          />
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {Object.entries(schema.properties || {}).map(([fieldName, fieldSchema]) => 
        renderField(fieldName, fieldSchema)
      )}
    </div>
  );
}
