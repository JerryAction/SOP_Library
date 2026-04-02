import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { documentSchemas } from "@/config/schemas";

export default function SchemaEditor() {
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState(Object.keys(documentSchemas)[0]);
  const [schema, setSchema] = useState(documentSchemas[selectedType]);
  const [fieldTypes] = useState([
    { value: "string", label: "文本" },
    { value: "number", label: "数字" },
    { value: "boolean", label: "布尔值" },
  ]);
  const [formats] = useState([
    { value: "", label: "单行文本" },
    { value: "textarea", label: "多行文本" },
    { value: "markdown", label: "Markdown" },
  ]);

  const handleSchemaChange = (newSchema) => {
    setSchema(newSchema);
    // 这里可以添加保存到后端的逻辑
  };

  const addField = () => {
    const newFieldName = `field_${Object.keys(schema.properties).length + 1}`;
    const newField = {
      type: "string",
      label: `新字段 ${Object.keys(schema.properties).length + 1}`,
      required: false,
      placeholder: `输入${`新字段 ${Object.keys(schema.properties).length + 1}`}`,
    };
    
    handleSchemaChange({
      ...schema,
      properties: {
        ...schema.properties,
        [newFieldName]: newField,
      },
    });
  };

  const removeField = (fieldName) => {
    const newProperties = { ...schema.properties };
    delete newProperties[fieldName];
    
    handleSchemaChange({
      ...schema,
      properties: newProperties,
    });
  };

  const updateField = (fieldName, updates) => {
    handleSchemaChange({
      ...schema,
      properties: {
        ...schema.properties,
        [fieldName]: {
          ...schema.properties[fieldName],
          ...updates,
        },
      },
    });
  };

  const reorderFields = (fromIndex, toIndex) => {
    const fields = Object.entries(schema.properties);
    const [movedField] = fields.splice(fromIndex, 1);
    fields.splice(toIndex, 0, movedField);
    
    const newProperties = {};
    fields.forEach(([key, value]) => {
      newProperties[key] = value;
    });
    
    handleSchemaChange({
      ...schema,
      properties: newProperties,
    });
  };

  const saveSchema = () => {
    // 这里可以添加保存到后端的逻辑
    toast({ title: "Schema 已保存" });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Schema 编辑器</h1>
        <Button onClick={saveSchema} className="gap-2">
          保存
        </Button>
      </div>

      {/* Document Type Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">文档类型</CardTitle>
        </CardHeader>
        <CardContent>
          <Select 
            value={selectedType} 
            onValueChange={(value) => {
              setSelectedType(value);
              setSchema(documentSchemas[value]);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="选择文档类型" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(documentSchemas).map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Schema Editor */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{schema.title} - 字段管理</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={addField} className="mb-4 gap-2">
            <Plus className="w-4 h-4" />
            添加字段
          </Button>

          <div className="space-y-4">
            {Object.entries(schema.properties).map(([fieldName, fieldSchema], index) => (
              <div key={fieldName} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Input
                      value={fieldSchema.label}
                      onChange={(e) => updateField(fieldName, { label: e.target.value })}
                      className="w-48"
                    />
                    <Input
                      value={fieldName}
                      onChange={(e) => {
                        const newFieldName = e.target.value;
                        if (newFieldName !== fieldName) {
                          const newProperties = { ...schema.properties };
                          newProperties[newFieldName] = fieldSchema;
                          delete newProperties[fieldName];
                          handleSchemaChange({
                            ...schema,
                            properties: newProperties,
                          });
                        }
                      }}
                      className="w-48"
                      placeholder="字段名"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    {index > 0 && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => reorderFields(index, index - 1)}
                      >
                        <ChevronUp className="w-4 h-4" />
                      </Button>
                    )}
                    {index < Object.keys(schema.properties).length - 1 && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => reorderFields(index, index + 1)}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-destructive"
                      onClick={() => removeField(fieldName)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>字段类型</Label>
                    <Select
                      value={fieldSchema.type}
                      onValueChange={(value) => updateField(fieldName, { type: value })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fieldTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>显示格式</Label>
                    <Select
                      value={fieldSchema.format || ""}
                      onValueChange={(value) => updateField(fieldName, { format: value || undefined })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {formats.map((format) => (
                          <SelectItem key={format.value} value={format.value}>{format.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>占位符</Label>
                    <Input
                      value={fieldSchema.placeholder || ""}
                      onChange={(e) => updateField(fieldName, { placeholder: e.target.value || undefined })}
                      className="mt-1"
                    />
                  </div>

                  <div className="flex items-end">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={fieldSchema.required || false}
                        onCheckedChange={(checked) => updateField(fieldName, { required: checked })}
                      />
                      <Label>必填</Label>
                    </div>
                  </div>

                  {fieldSchema.enum && (
                    <div className="col-span-2">
                      <Label>选项列表（用逗号分隔）</Label>
                      <Input
                        value={fieldSchema.enum.join(", ")}
                        onChange={(e) => updateField(fieldName, { enum: e.target.value.split(",").map(item => item.trim()) })}
                        className="mt-1"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
