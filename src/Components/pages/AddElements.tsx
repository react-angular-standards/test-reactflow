// @ts-nocheck
/**
 * @file Acme Detailed view
 * @author Gopinath Rajgopal
 * @copyright
 *   Company ,  and/or
 *     Copyright (c) 2023 The Company Company
 *     Unpublished Work - All Rights Reserved
 *   Third Party Disclosure Requires Written Approval
 */
import React from "react";
import { useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import {
  Home20Regular,
  Calendar20Filled,
  AddCircle20Filled,
  Save20Regular,
  DocumentAdd20Regular,
  Status20Filled,
  Calendar20Regular,
  DocumentPdf24Regular,
  DocumentData24Filled,
  Delete24Filled,
  Fluid16Regular,
} from "@fluentui/react-icons";
import { UrlConstant } from "../Util/UrlConstants";
import {
  TagIcon,
  WorkflowIcon,
  PeopleIcon,
  CalendarIcon,
  DownloadIcon,
} from "@primer/octicons-react";

import {
  Skeleton,
  SkeletonItem,
  Avatar,
  Breadcrumb,
  BreadcrumbButton,
  BreadcrumbDivider,
  BreadcrumbItem,
  DialogTitle,
  Field,
  Input,
  Label,
  Link,
  makeStyles,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  shorthands,
  Tag,
  TagPicker,
  TagPickerControl,
  TagPickerGroup,
  TagPickerInput,
  TagPickerList,
  TagPickerOption,
  Textarea,
  tokens,
  Select,
  TagPickerProps,
  Tooltip,
  Button,
  Spinner,
} from "@fluentui/react-components";

import { IFieldType } from "./Requirementobject";
// import ReactHierarchy from "../HierarchyNode/ReactHierarchy";
import Autocomplete from "@mui/material/Autocomplete";

import TextField from "@mui/material/TextField";
import {
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
} from "@mui/material";
import { selectedGridRowsSelector } from "@mui/x-data-grid";
import { table } from "console";
import { tr } from "date-fns/locale";
import SelectRequirement from "./SelectRequirement";
import { ExportToCSV_Template } from "./exportToCSV";
import TemplateFlow from "./TemplateFlow";

const useStyles = makeStyles({
  base: {
    display: "flex",
    flexDirection: "column",
  },
  field: {
    display: "grid",
    gridRowGap: tokens.spacingVerticalXXS,
    marginTop: tokens.spacingVerticalMNudge,
    ...shorthands.padding(tokens.spacingHorizontalMNudge),
  },
  filledLighter: {
    backgroundColor: tokens.colorNeutralBackgroundInverted,
    "> label": {
      color: tokens.colorNeutralForegroundInverted2,
    },
  },
  filledDarker: {
    backgroundColor: tokens.colorNeutralBackgroundInverted,
    "> label": {
      color: tokens.colorNeutralForegroundInverted2,
    },
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
  const [templateObject, setTemplateObject] = useState<IFieldType>(emptyfields);
  const [templatearray, settemplatearray] = useState<IFieldType[]>([]);
  const [templatearray1, settemplatearray1] = useState<IFieldType[]>([]);
  const [requirementObjectlist, setrequirementObjectList] = useState<any>([]);
  const [loadwhileerender, setLoadwhilerender] = useState<boolean>(false);
  const styles = useStyles();
  const [count, setCount] = useState<number>(0);
  const [count1, setCount1] = useState<number>(0);
  const [disableSave, setDisableSave] = useState<boolean>(false);
  const [saveButtonLoading, setSaveButtonLoading] = useState(false);

  const [open, setOpen] = React.useState(false);
  const [selectedRequirementObject, setSelectedRequirementObject] =
    React.useState<any>({});

  const [dataset, setdataset] = useState<any>({});
  const [dataset1, setdataset1] = useState<any>({});
  const [selectcount, setSelectCount] = useState<number>(0);
  const [inputRef, setInputFocus] = useState<boolean>(false);
  const [tags, setTags] = useState<any>([]);

  React.useEffect(() => {
    setLoadwhilerender(true);
    fetch(UrlConstant.QUERY_TEMPLATE_OBJECT + "Tag", {
      mode: "cors",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((result) => {
        setTags(result);
      });
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
          setLoadwhilerender(false);
        });
    } else {
      setLoadwhilerender(false);
    }
    let temptemplateObjectlist: any = [];
    fetch(UrlConstant.QUERY_TEMPLATE_OBJECT + "RequirementObject", {
      mode: "cors",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((result) => {
        temptemplateObjectlist = result;

        fetch(UrlConstant.QUERY_TEMPLATE_OBJECT + "Template", {
          mode: "cors",
          credentials: "include",
        })
          .then((res) => res.json())
          .then((result) => {
            for (let i = 0; i < result.length; i++) {
              result[i]["type"] = "template";
              temptemplateObjectlist.push(result[i]);
            }

            setrequirementObjectList(temptemplateObjectlist);
          });
      });
  }, []);

  const isTemplateSaved = !!(templateObject as any).id;

  const save_template = () => {
    setSaveButtonLoading(true);

    // If the template already has an id, use PUT to update; otherwise POST to create
    const isUpdate = !!(templateObject as any).id;
    const url = isUpdate
      ? UrlConstant.MANAGE_SAVE_TEMPLATE +
        "Template/" +
        (templateObject as any).id
      : UrlConstant.MANAGE_SAVE_TEMPLATE + "Template";
    const method = isUpdate ? "put" : "post";

    fetch(url, {
      method,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(templateObject),
    })
      .then((res) => res.json())
      .then((result) => {
        setDisableSave(true);
        setSaveButtonLoading(false);
        const temptemplatearray = [];
        temptemplatearray?.push(result);
        settemplatearray(temptemplatearray);
        settemplatearray1(temptemplatearray);
        setCount1(count1 + 1);
        setTemplateObject(result);
        setTimeout(() => {
          setDisableSave(false);
        }, 3000);
      })
      .catch((error) => {
        console.error("Error saving template:", error);
        setDisableSave(false);
        setSaveButtonLoading(false);
      });
  };

  const delete_template = () => {
    fetch(UrlConstant.DELETE_SAVE_TEMPLATE + "Template/" + templateObject.id, {
      method: "get",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((result) => {
        const temptemplatearray = [];
        temptemplatearray?.push(result);
        settemplatearray(temptemplatearray);
        settemplatearray1(temptemplatearray);
        setCount1(count1 + 1);
        setTemplateObject(result);
      });
  };

  const handletextchange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tempformprop: any = { ...templateObject };
    tempformprop[e.target.name] = e.target.value;
    setTemplateObject(tempformprop);

    setCount(count + 1);
  };

  const text_area_change_event = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    const tempformprop: any = { ...templateObject };
    tempformprop[name] = value;
    setTemplateObject(tempformprop);
    setCount(count + 1);
  };

  const associateRequirements = (node: any) => {
    setSelectedRequirementObject(node);
    setOpen(true);
  };

  const update_tempalte = (object: any) => {
    setLoadwhilerender(true);

    fetch(UrlConstant.MANAGE_ASSOCIATE + "Template" + templateObject.id, {
      method: "post",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(selectedRequirementObject),
    })
      .then((res) => res.json())
      .then((result) => {
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
              setLoadwhilerender(false);
            });
        } else {
          fetch(
            UrlConstant.QUERY_TEMPLATE_BY_ID + templateObject["id"]?.toString(),
            {
              mode: "cors",
              credentials: "include",
            },
          )
            .then((res) => res.json())
            .then((result) => {
              settemplatearray1(result);
              settemplatearray(result);
              setTemplateObject(result[0]);
              setLoadwhilerender(false);
            });
        }

        setOpen(false);
      });
  };

  const onTagSelect: TagPickerProps["onOptionSelect"] = (e, data) => {
    const updated: any = { ...templateObject, Tag: data.selectedOptions };
    setTemplateObject(updated);
    setInputFocus(true);
    setSelectCount(selectcount + 1);
  };

  const handleTreeChange = (tree: any) => {
    setTemplateObject(tree);
    settemplatearray([tree]);
  };

  return (
    <div>
      <Breadcrumb
        aria-label="Large breadcrumb example with buttons"
        size="small"
        style={{ marginBottom: 20 }}
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
            ADD SOW
          </BreadcrumbButton>
        </BreadcrumbItem>
      </Breadcrumb>
      {loadwhileerender && (
        <Skeleton>
          <div className="row" style={{ padding: 10 }}>
            <div className="col-md-12" style={{ marginBottom: 30 }}></div>
            <div className="col-md-9">
              <div className="row">
                <div className="col-md-12">
                  <span
                    style={{
                      textDecoration: "none",
                      marginBottom: 10,
                      display: "block",
                    }}
                  >
                    <strong>Template Name</strong>
                  </span>
                  <SkeletonItem size={28} />
                </div>

                <div className="col-md-12">
                  <Label
                    htmlFor={"outlineId"}
                    style={{ marginTop: 20, marginBottom: 10 }}
                  >
                    <strong>Description</strong>
                  </Label>
                  <br />
                  <SkeletonItem size={72} />
                </div>
                <div
                  className="col-md-2"
                  style={{ marginTop: 20, marginBottom: 20 }}
                >
                  <SkeletonItem size={32} />
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-9">
              <SkeletonItem size={96} />
              <SkeletonItem size={96} />
              <SkeletonItem size={96} />
              <SkeletonItem size={96} />
              <SkeletonItem size={96} />
            </div>
          </div>
        </Skeleton>
      )}

      {!loadwhileerender && (
        <>
          {/* ── Header bar: form fields + save button ─────────── */}
          <div style={{ padding: "10px 10px 0" }}>
            {templateObject.isDeleted && (
              <MessageBar
                style={{ marginBottom: 16, color: "red", padding: 10 }}
                intent={"error"}
              >
                <MessageBarBody style={{ fontSize: 14 }}>
                  Template{" "}
                  <MessageBarTitle style={{ fontSize: 14 }}>
                    {templateObject.header}
                  </MessageBarTitle>{" "}
                  is deleted, and cannot be edited or used in any new statement
                  of work.
                </MessageBarBody>
              </MessageBar>
            )}

            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 16,
              }}
            >
              {/* Left — form fields */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="row">
                  <div className="col-md-5">
                    <Label htmlFor="outlineId" style={{ marginBottom: 6 }}>
                      <strong>Template Name</strong>
                    </Label>
                    <Input
                      disabled={templateObject.isDeleted}
                      style={{ width: "100%" }}
                      onChange={handletextchange}
                      appearance="filled-darker"
                      name="header"
                      value={templateObject.header}
                    />
                  </div>
                  <div className="col-md-5">
                    <Label htmlFor="outlineId" style={{ marginBottom: 6 }}>
                      <strong>Description</strong>
                    </Label>
                    <Textarea
                      disabled={templateObject.isDeleted}
                      style={{ width: "100%" }}
                      onChange={text_area_change_event}
                      appearance="filled-darker"
                      name="description"
                      value={templateObject.description}
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
                      onClick={save_template}
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

                {disableSave && (
                  <MessageBar style={{ marginTop: 10 }} intent={"success"}>
                    <MessageBarBody>
                      Template{" "}
                      <MessageBarTitle>{templateObject.header}</MessageBarTitle>{" "}
                      {isTemplateSaved
                        ? "saved successfully!"
                        : "created successfully!"}{" "}
                      {!isTemplateSaved &&
                        "Please associate necessary Requirements below."}
                    </MessageBarBody>
                  </MessageBar>
                )}
              </div>
            </div>
          </div>

          {/* ── Main content: Flow + sidebar ─────────────────── */}
          <div className="row" style={{ padding: "0 10px" }}>
            <div className="col-md-9" style={{ paddingRight: 0 }}>
              <TemplateFlow
                root={templateObject}
                onTreeChange={handleTreeChange}
                paletteItems={requirementObjectlist}
                disabled={!isTemplateSaved}
              />
            </div>
            <div className="col-md-3">
              <div className="row">
                <div className="col-md-12">
                  <span
                    style={{
                      textDecoration: "none",
                      display: "block",
                      marginBottom: 10,
                      marginTop: 20,
                    }}
                  >
                    <Status20Filled /> <strong>Status</strong>
                  </span>
                  <Select
                    disabled={templateObject.isDeleted}
                    value={templateObject.status}
                    appearance="filled-darker"
                    name="status"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Released">Released</option>
                    <option value="Closed">Closed</option>
                  </Select>
                  {templateObject.Updated_by != undefined && (
                    <>
                      <span
                        style={{
                          textDecoration: "none",
                          display: "block",
                          marginBottom: 10,
                          marginTop: 20,
                        }}
                      >
                        <PeopleIcon /> <strong>Updated by</strong>
                      </span>
                      <span style={{ display: "block", marginLeft: "20px" }}>
                        {templateObject.Updated_by["NAME"]}
                      </span>
                      <span
                        style={{
                          textDecoration: "none",
                          display: "block",
                          marginBottom: 10,
                          marginTop: 20,
                        }}
                      >
                        <Calendar20Regular /> <strong>Updated on</strong>
                      </span>
                      <span style={{ display: "block", marginLeft: "20px" }}>
                        {new Date(
                          templateObject.UPDATED_ON
                            ? templateObject.UPDATED_ON
                            : "",
                        ).toString()}
                      </span>
                    </>
                  )}

                  <Field style={{ maxWidth: 400, marginTop: 20 }}>
                    <span
                      style={{
                        textDecoration: "none",
                        display: "block",
                        marginBottom: 10,
                      }}
                    >
                      <TagIcon size={16} /> <strong>Tags</strong>
                    </span>
                    {selectcount % 2 == 0 ? (
                      <TagPicker
                        disabled={templateObject.isDeleted}
                        size="medium"
                        appearance="filled-darker"
                        onOptionSelect={onTagSelect}
                        selectedOptions={templateObject["Tag"]}
                      >
                        <TagPickerControl>
                          <TagPickerGroup>
                            {templateObject.Tag?.map(
                              (option: any, tagIdx: number) => (
                                <Tag
                                  disabled={templateObject.isDeleted}
                                  key={`tag-${option.NAME}-${tagIdx}`}
                                  shape="rounded"
                                  media={
                                    <Avatar
                                      aria-hidden
                                      name={option.NAME}
                                      color="colorful"
                                    />
                                  }
                                  value={option}
                                >
                                  {option.NAME}
                                </Tag>
                              ),
                            )}
                          </TagPickerGroup>
                          <TagPickerInput aria-label="Select Employees" />
                        </TagPickerControl>
                        <TagPickerList>
                          {tags.length > 0
                            ? tags.map((option: any, tagIdx: number) => (
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
                                  key={`tagopt-${option.NAME}-${tagIdx}`}
                                >
                                  {option.NAME}
                                </TagPickerOption>
                              ))
                            : "No options available"}
                        </TagPickerList>
                      </TagPicker>
                    ) : (
                      <TagPicker
                        disabled={templateObject.isDeleted}
                        size="medium"
                        appearance="filled-darker"
                        onOptionSelect={onTagSelect}
                        selectedOptions={templateObject["Tag"]}
                      >
                        <TagPickerControl>
                          <TagPickerGroup>
                            {templateObject.Tag?.map(
                              (option: any, tagIdx: number) => (
                                <Tag
                                  disabled={templateObject.isDeleted}
                                  key={`tag-${option.NAME}-${tagIdx}`}
                                  shape="rounded"
                                  media={
                                    <Avatar
                                      aria-hidden
                                      name={option.NAME}
                                      color="colorful"
                                    />
                                  }
                                  value={option}
                                >
                                  {option.NAME}
                                </Tag>
                              ),
                            )}
                          </TagPickerGroup>
                          <TagPickerInput aria-label="Select Employees" />
                        </TagPickerControl>
                        <TagPickerList>
                          {tags.length > 0
                            ? tags.map((option: any, tagIdx: number) => (
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
                                  key={`tagopt-${option.NAME}-${tagIdx}`}
                                >
                                  {option.NAME}
                                </TagPickerOption>
                              ))
                            : "No options available"}
                        </TagPickerList>
                      </TagPicker>
                    )}
                  </Field>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Palette groups in TemplateFlow replace the old selection dialogs */}
      {/* <SelectRequirement
        open={open}
        setOpen={setOpen}
        updateTemplate={update_tempalte}
        selectedRequirementObject={selectedRequirementObject}
        setSelectedRequirementObject={setSelectedRequirementObject}
        requirementObjectlist={requirementObjectlist}
        loadWhileRendering={loadwhileerender}
      /> */}

      {/* open={open} */}
      <Dialog
        open={false}
        fullWidth={true}
        maxWidth="sm"
        onClose={() => setOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title"></DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            <Autocomplete
              style={{ zIndex: 1 }}
              multiple
              size="small"
              options={requirementObjectlist}
              getOptionLabel={(option: any) =>
                option.hasInput
                  ? `${option.header} - (Object) `
                  : `${option.header} - (Template)`
              }
              defaultValue={selectedRequirementObject["children"]}
              renderInput={(params) => (
                <TextField {...params} label={"Requirements Object"} />
              )}
              onChange={(event: any, value: any) => (
                (selectedRequirementObject.children = []),
                (selectedRequirementObject.children = value),
                setSelectedRequirementObject(selectedRequirementObject),
                console.log(selectedRequirementObject)
              )}
            />
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
            }}
          >
            <Button appearance="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              appearance="secondary"
              disabled={loadwhileerender}
              onClick={() => update_tempalte(selectedRequirementObject)}
            >
              {loadwhileerender ? <Spinner size="small" /> : "Update"}
            </Button>
          </div>
        </DialogActions>
      </Dialog>
    </div>
  );
};
