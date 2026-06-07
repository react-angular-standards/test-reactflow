// @ts-nocheck
/**
 * @file Template Builder — Add / Edit
 */
import React, { useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  Home20Regular,
  AddCircle20Filled,
  Save20Regular,
  Status20Filled,
  Calendar20Regular,
  Fluid16Regular,
} from "@fluentui/react-icons";
import { UrlConstant } from "../Util/UrlConstants";
import { TagIcon, PeopleIcon } from "@primer/octicons-react";

import {
  Skeleton,
  SkeletonItem,
  Avatar,
  Breadcrumb,
  BreadcrumbButton,
  BreadcrumbDivider,
  BreadcrumbItem,
  Field,
  Input,
  Label,
  makeStyles,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  Tag,
  TagPicker,
  TagPickerControl,
  TagPickerGroup,
  TagPickerInput,
  TagPickerList,
  TagPickerOption,
  Textarea,
  Select,
  TagPickerProps,
  Button,
  Spinner,
} from "@fluentui/react-components";

import { IFieldType } from "./Requirementobject";
import TemplateFlow from "./TemplateFlow";

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    overflow: "hidden",
  },
  headerBar: {
    padding: "10px 16px 0",
    flexShrink: 0,
    background: "#fff",
    borderBottom: "1px solid #e0e0e0",
    zIndex: 2,
  },
  main: {
    display: "flex",
    flex: 1,
    overflow: "hidden",
    minHeight: 0,
  },
  flowArea: {
    flex: 1,
    minWidth: 0,
    overflow: "hidden",
    position: "relative",
  },
  sidebar: {
    width: 280,
    flexShrink: 0,
    background: "#fafafa",
    borderLeft: "1px solid #e0e0e0",
    padding: 16,
    overflowY: "auto",
  },
  skeleton: {
    padding: 10,
  },
});

const emptyfields = (): IFieldType => ({
  UniqueID: Math.random().toString(),
  header: "",
  prompt: "",
  hasInput: false,
  inputType: "",
  choices: [],
  validators: [],
  children: [],
  sponsoring_customer: "",
  display: false,
  description: "",
  isDeleted: false,
});

export const AddElements = (): JSX.Element => {
  const { screenname } = useParams<{ screenname: string }>();
  const { id } = useParams<{ id: string }>();
  const styles = useStyles();

  const [templateObject, setTemplateObject] = useState<IFieldType>(emptyfields);
  const [templatearray, settemplatearray] = useState<IFieldType[]>([]);
  const [templatearray1, settemplatearray1] = useState<IFieldType[]>([]);
  const [requirementObjectlist, setrequirementObjectList] = useState<any[]>([]);
  const [loadwhileerender, setLoadwhilerender] = useState(false);
  const [disableSave, setDisableSave] = useState(false);
  const [saveButtonLoading, setSaveButtonLoading] = useState(false);
  const [tags, setTags] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [pickerKey, setPickerKey] = useState(0);

  React.useEffect(() => {
    setLoadwhilerender(true);
    fetch(UrlConstant.QUERY_TEMPLATE_OBJECT + "Tag", {
      mode: "cors",
      credentials: "include",
    })
      .then((res) => res.json())
      .then(setTags)
      .catch(() => setTags([]));

    if (id != undefined) {
      fetch(UrlConstant.QUERY_TEMPLATE_BY_ID + id, {
        mode: "cors",
        credentials: "include",
      })
        .then((res) => res.json())
        .then((result) => {
          settemplatearray1(result);
          settemplatearray(result);
          setTemplateObject(result[0]);
        })
        .catch(() => setErrorMsg("Failed to load template."))
        .finally(() => setLoadwhilerender(false));
    } else {
      setLoadwhilerender(false);
    }

    let temptemplateObjectlist: any[] = [];
    fetch(UrlConstant.QUERY_TEMPLATE_OBJECT + "RequirementObject", {
      mode: "cors",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((result) => {
        temptemplateObjectlist = result;
        return fetch(UrlConstant.QUERY_TEMPLATE_OBJECT + "Template", {
          mode: "cors",
          credentials: "include",
        });
      })
      .then((res) => res.json())
      .then((result) => {
        for (let i = 0; i < result.length; i++) {
          result[i]["type"] = "template";
          temptemplateObjectlist.push(result[i]);
        }
        setrequirementObjectList(temptemplateObjectlist);
      })
      .catch(() => setrequirementObjectList([]));
  }, []);

  const isTemplateSaved = !!templateObject?.id;

  const handleSuccess = (result: any) => {
    setDisableSave(true);
    setSaveButtonLoading(false);
    settemplatearray([result]);
    settemplatearray1([result]);
    setTemplateObject(result);
    setSuccessMsg(
      isTemplateSaved
        ? `Template "${result.header}" updated successfully.`
        : `Template "${result.header}" created successfully.`,
    );
    setTimeout(() => {
      setDisableSave(false);
      setSuccessMsg("");
    }, 4000);
  };

  const handleError = (msg: string) => {
    console.error(msg);
    setErrorMsg(msg);
    setSaveButtonLoading(false);
    setDisableSave(false);
    setTimeout(() => setErrorMsg(""), 5000);
  };

  const save_template = () => {
    setSaveButtonLoading(true);
    setErrorMsg("");
    fetch(UrlConstant.MANAGE_SAVE_TEMPLATE + "Template", {
      method: "post",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(templateObject),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Save failed: " + res.status);
        return res.json();
      })
      .then(handleSuccess)
      .catch((err) => handleError(err.message || "Error saving template."));
  };

  const update_tempalte = () => {
    setSaveButtonLoading(true);
    setErrorMsg("");
    fetch(UrlConstant.MANAGE_ASSOCIATE + "Template" + templateObject.id, {
      method: "post",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(templateObject),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Associate failed: " + res.status);
        return fetch(UrlConstant.MANAGE_SAVE_TEMPLATE + "Template", {
          method: "post",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(templateObject),
        });
      })
      .then(async (res) => {
        if (!res.ok) throw new Error("Save failed: " + res.status);
        return res.json();
      })
      .then(handleSuccess)
      .catch((err) => handleError(err.message || "Error updating template."));
  };

  const handletextchange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTemplateObject((prev: any) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const text_area_change_event = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setTemplateObject((prev: any) => ({ ...prev, [name]: value }));
  };

  const onTagSelect: TagPickerProps["onOptionSelect"] = (e, data) => {
    setTemplateObject((prev: any) => ({
      ...prev,
      Tag: data.selectedOptions,
    }));
    setPickerKey((k) => k + 1);
  };

  const handleTreeChange = useCallback((tree: any) => {
    setTemplateObject(tree);
    settemplatearray([tree]);
  }, []);

  /* ── Render helpers ─────────────────────────────────────────────── */

  const StatusField = () => (
    <div style={{ marginBottom: 16 }}>
      <span
        style={{
          textDecoration: "none",
          display: "block",
          marginBottom: 8,
          fontWeight: 600,
        }}
      >
        <Status20Filled /> Status
      </span>
      <Select
        disabled={templateObject.isDeleted}
        value={templateObject.status || "Draft"}
        appearance="filled-darker"
        name="status"
        onChange={(e: any) =>
          setTemplateObject((prev: any) => ({
            ...prev,
            status: e.target.value,
          }))
        }
      >
        <option value="Draft">Draft</option>
        <option value="Released">Released</option>
        <option value="Closed">Closed</option>
      </Select>
    </div>
  );

  const MetaInfo = () => (
    <>
      {templateObject.Updated_by && (
        <>
          <div style={{ marginBottom: 16 }}>
            <span
              style={{
                display: "block",
                marginBottom: 4,
                fontWeight: 600,
              }}
            >
              <PeopleIcon /> Updated by
            </span>
            <span>{templateObject.Updated_by.NAME}</span>
          </div>
          <div style={{ marginBottom: 16 }}>
            <span
              style={{
                display: "block",
                marginBottom: 4,
                fontWeight: 600,
              }}
            >
              <Calendar20Regular /> Updated on
            </span>
            <span>
              {templateObject.UPDATED_ON
                ? new Date(templateObject.UPDATED_ON).toLocaleString()
                : "—"}
            </span>
          </div>
        </>
      )}
    </>
  );

  const TagField = () => (
    <Field style={{ marginTop: 8 }}>
      <span
        style={{
          textDecoration: "none",
          display: "block",
          marginBottom: 8,
          fontWeight: 600,
        }}
      >
        <TagIcon size={16} /> Tags
      </span>
      <TagPicker
        key={pickerKey}
        disabled={templateObject.isDeleted}
        size="medium"
        appearance="filled-darker"
        onOptionSelect={onTagSelect}
        selectedOptions={templateObject.Tag || []}
      >
        <TagPickerControl>
          <TagPickerGroup>
            {(templateObject.Tag || []).map((option: any, i: number) => (
              <Tag
                disabled={templateObject.isDeleted}
                key={`tag-${option.NAME}-${i}`}
                shape="rounded"
                media={
                  <Avatar aria-hidden name={option.NAME} color="colorful" />
                }
                value={option}
              >
                {option.NAME}
              </Tag>
            ))}
          </TagPickerGroup>
          <TagPickerInput aria-label="Select tags" />
        </TagPickerControl>
        <TagPickerList>
          {tags.length > 0
            ? tags.map((option: any, i: number) => (
                <TagPickerOption
                  media={
                    <Avatar
                      shape="square"
                      aria-hidden
                      name={option.NAME}
                      color="colorful"
                    />
                  }
                  value={option}
                  key={`opt-${option.NAME}-${i}`}
                >
                  {option.NAME}
                </TagPickerOption>
              ))
            : "No options available"}
        </TagPickerList>
      </TagPicker>
    </Field>
  );

  return (
    <div className={styles.root}>
      <Breadcrumb
        aria-label="Breadcrumb"
        size="small"
        style={{ padding: "8px 16px", marginBottom: 0, flexShrink: 0 }}
      >
        <BreadcrumbItem>
          <BreadcrumbButton icon={<Home20Regular />}>Home</BreadcrumbButton>
        </BreadcrumbItem>
        <BreadcrumbDivider />
        <BreadcrumbItem>
          <BreadcrumbButton
            onClick={() => (window.location.href = "#/formbuilder")}
          >
            <Fluid16Regular color="black" fontSize={15} /> {screenname}
          </BreadcrumbButton>
        </BreadcrumbItem>
        <BreadcrumbDivider />
        <BreadcrumbItem>
          <BreadcrumbButton icon={<AddCircle20Filled />} current>
            {isTemplateSaved ? "Edit Template" : "Add Template"}
          </BreadcrumbButton>
        </BreadcrumbItem>
      </Breadcrumb>

      {loadwhileerender && (
        <Skeleton className={styles.skeleton}>
          <div style={{ display: "flex", gap: 20, padding: 10 }}>
            <div style={{ flex: 1 }}>
              <SkeletonItem size={28} style={{ marginBottom: 12 }} />
              <SkeletonItem size={72} />
            </div>
            <div style={{ width: 200 }}>
              <SkeletonItem size={96} />
            </div>
          </div>
        </Skeleton>
      )}

      {!loadwhileerender && (
        <>
          {/* ── Header bar ─────────────────────────────────────── */}
          <div className={styles.headerBar}>
            {templateObject.isDeleted && (
              <MessageBar style={{ marginBottom: 12 }} intent="error">
                <MessageBarBody>
                  Template{" "}
                  <MessageBarTitle>{templateObject.header}</MessageBarTitle> is
                  deleted and cannot be edited or used in any new statement of
                  work.
                </MessageBarBody>
              </MessageBar>
            )}

            {errorMsg && (
              <MessageBar style={{ marginBottom: 12 }} intent="error">
                <MessageBarBody>{errorMsg}</MessageBarBody>
              </MessageBar>
            )}

            {successMsg && (
              <MessageBar style={{ marginBottom: 12 }} intent="success">
                <MessageBarBody>{successMsg}</MessageBarBody>
              </MessageBar>
            )}

            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 16,
                paddingBottom: 10,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="row">
                  <div className="col-md-5">
                    <Label htmlFor="header" style={{ marginBottom: 6 }}>
                      <strong>Template Name</strong>
                    </Label>
                    <Input
                      id="header"
                      disabled={templateObject.isDeleted}
                      style={{ width: "100%" }}
                      onChange={handletextchange}
                      appearance="filled-darker"
                      name="header"
                      value={templateObject.header || ""}
                    />
                  </div>
                  <div className="col-md-5">
                    <Label htmlFor="description" style={{ marginBottom: 6 }}>
                      <strong>Description</strong>
                    </Label>
                    <Textarea
                      id="description"
                      disabled={templateObject.isDeleted}
                      style={{ width: "100%" }}
                      onChange={text_area_change_event}
                      appearance="filled-darker"
                      name="description"
                      value={templateObject.description || ""}
                      resize="vertical"
                    />
                  </div>
                  <div
                    className="col-md-2"
                    style={{
                      display: "flex",
                      alignItems: "flex-end",
                      paddingBottom: 2,
                    }}
                  >
                    <Button
                      appearance="primary"
                      shape="square"
                      icon={<Save20Regular />}
                      disabled={templateObject.isDeleted || saveButtonLoading}
                      onClick={
                        isTemplateSaved ? update_tempalte : save_template
                      }
                      style={{ minWidth: 100 }}
                    >
                      {saveButtonLoading ? (
                        <Spinner size="tiny" />
                      ) : isTemplateSaved ? (
                        "Update"
                      ) : (
                        "Save"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Main: full-screen flow + sidebar ─────────────── */}
          <div className={styles.main}>
            <div className={styles.flowArea}>
              <TemplateFlow
                root={templateObject}
                onTreeChange={handleTreeChange}
                paletteItems={requirementObjectlist}
                disabled={!isTemplateSaved}
              />
            </div>

            <div className={styles.sidebar}>
              <StatusField />
              <MetaInfo />
              <TagField />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
