// @ts-nocheck

import { Label } from "@blueprintjs/core";
import { Input, Textarea } from "@fluentui/react-components";
import React, { useState, useCallback } from "react";
import FileAttachmentInput from "../FileAttachmentInput";
import NameAutocomplete from "../nameAutocomplete";
import CustomSelect from "./CustomDropdown";
import { v4 as uuidv4 } from "uuid";


// import React, { useState, useCallback } from 'react';
// import { Input, Textarea, Label } from '@/components/ui/input';
// import { FileAttachmentInput, NameAutocomplete, CustomSelect } from '@/components/ui/custom-inputs';

const NestedForm = ({ schema, recordid, formvalue, readonly, formData }: any) => {
  console.log("🚀 ~ file: nestedform.tsx ~ line 15 ~ NestedForm ~ formvalue", formvalue)
  console.log("🚀 ~ file: nestedform.tsx ~ line 15 ~ NestedForm ~ formData", formData)
  const [inputCount, setInputCount] = useState<number>(0);
  const [rootObjectTracer, setRootObjectTracer] = useState<number>(0);

  formData['fd'] = "fd"
  const initializeDataEntry = (item: any, data: any) => {
    if (!data[item.header]) {
      data[item.header] = {
        objectId: item.id,
        objectPrompt: item.prompt,
        objectUniqueID: item.UniqueID,
        order: item.order,
        value: '',
      };
    }
  };

  const initializeDataEntryForField = (name: string, data: any) => {
    if (!data[name]) {
      data[name] = {};
    }
  };

  const handleNameSelect = (selectedItem: string, item: any, data: any) => {
    initializeDataEntry(item, data);
    data[item.header].value = selectedItem;
    setInputCount(prev => prev + 1);
  };

  const handleSelectDropdown = (selectedValues: string | string[], item: any, data: any) => {
    initializeDataEntry(item, data);
    if (Array.isArray(selectedValues)) {
      data[item.header].value = selectedValues.join(',');
    } else {
      data[item.header].value = selectedValues;
    }
    setInputCount(prev => prev + 1);
  };

  const handleFileChange = (fileUrl: string, item: any, data: any) => {
    initializeDataEntry(item, data);
    data[item.header].value = fileUrl;
    setInputCount(prev => prev + 1);
  };

  const text_box_change_event = (event: React.ChangeEvent<HTMLInputElement>, data: any, item?: any) => {
    const { name, value } = event.target;
    initializeDataEntryForField(name, data);
    data[name].value = value;

    if (item) {
      data[name].objectId = item.id;
      data[name].objectPrompt = item.prompt;
      data[name].objectUniqueID = item.UniqueID;
    }

    setInputCount(prev => prev + 1);
  };

  const text_area_change_event = (event: React.ChangeEvent<HTMLTextAreaElement>, data: any, item?: any) => {
    const { name, value } = event.target;
    initializeDataEntryForField(name, data);
    data[name].value = value;

    if (item) {
      data[name].objectId = item.id;
      data[name].objectPrompt = item.prompt;
      data[name].objectUniqueID = item.UniqueID;
    }

    setInputCount(prev => prev + 1);
  };

  const generate_form = useCallback((item: any, value: any, parentKey: string = '') => {
    console.log("🚀 ~ file: nestedform.tsx ~ line 88 ~ constgenerate_form=useCallback ~ value", value)
    if (value === undefined) {
      value = {};
    }

    const itemKey = `${parentKey}${item.header}`;

    return (
      <div className="col-md-12" key={itemKey}>
        {item.hasInput && (
          <span>
            <Label htmlFor={itemKey} style={{ fontSize: 14, margin: 0, float: "left", fontWeight: "bold" }}>
              <span style={{ color: "#333", marginBottom: 5, display: "block", fontSize: "14px" }}>
                {item.prompt !== "" ? item.prompt : item.header}
              </span>
            </Label>

            {item.inputType === "textbox" && (
              <Input
                disabled={readonly}
                onChange={(e) => text_box_change_event(e, value, item)}
                name={item.header}
                value={value[item.header]?.value || ""}
                style={{ marginBottom: 12, width: "100%", fontSize: 12 }}
                id={itemKey}
              />
            )}

            {item.inputType === "textarea" && (
              <Textarea
                disabled={readonly}
                onChange={(e) => text_area_change_event(e, value, item)}
                name={item.header}
                value={value[item.header]?.value || ""}
                style={{ marginBottom: 12, width: "100%", fontSize: 12 }}
                id={itemKey}
              />
            )}

            {item.inputType === "date" && (
              <Input
                disabled={readonly}
                onChange={(e) => text_box_change_event(e, value, item)}
                name={item.header}
                type="date"
                value={value[item.header]?.value || ""}
                style={{ marginBottom: 12, width: "100%", fontSize: 12 }}
                id={itemKey}
              />
            )}

            {item.inputType === "number" && (
              <Input
                disabled={readonly}
                onChange={(e) => text_box_change_event(e, value, item)}
                name={item.header}
                type="number"
                value={value[item.header]?.value || ""}
                style={{ marginBottom: 12, width: "100%", fontSize: 12 }}
                id={itemKey}
              />
            )}

            {item.inputType === "attachments" && (
              <FileAttachmentInput
                key={itemKey}
                value={value}
                item={item}
                onSelect={handleFileChange}
              />
            )}

            {item.inputType === "autoComplete" && (
              <NameAutocomplete
                key={itemKey}
                value={value}
                item={item}
                onSelect={handleNameSelect}
              />
            )}

            {item.inputType === "select" && (
              <CustomSelect
                key={itemKey}
                item={item}
                value={value}
                isMultiple={false}
                onChange={handleSelectDropdown}
              />
            )}

            {item.inputType === "multiselect" && (
              <CustomSelect
                key={itemKey}
                item={item}
                value={value}
                isMultiple={true}
                onChange={handleSelectDropdown}
              />
            )}
          </span>
        )}

        {!item.hasInput && (
          <div className="col-md-12" style={{ marginBottom: 20 }}>
            <span style={{ textDecoration: "none", color: "rgba(11, 50, 142, 0.95)", fontSize: 12 }}>
              <strong>{item.header.replace(/_/g, " ").replace("Template", " ")}</strong>
            </span>
          </div>
        )}

        {item.children && Array.isArray(item.children) && item.children.length > 0 && (
          <div style={{ paddingLeft: 20 }}>
            {item.children.map((childItem: any, index: number) =>
              generate_form(
                childItem,
                formData,
                `${itemKey}-`
              )
            )}
          </div>
        )}
      </div>
    );
  }, [readonly, handleNameSelect, handleSelectDropdown, text_box_change_event, text_area_change_event, handleFileChange]);

  return (
    <div className="row">
      {generate_form(schema, formvalue,)}
    </div>
  );
};

export default NestedForm;
