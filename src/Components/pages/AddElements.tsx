// @ts-nocheck
/**
 * @file Acme Detailed view
 * @author Gopinath Rajgopal
 * @copyright
 *   Boeing Proprietary, Confidential and/or Trade Secret
 *     Copyright (c) 2023 The Boeing Company
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
import ReactHierarchy from "../HierarchyNode/ReactHierarchy";
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
import { HARDCODED_TEMPLATE } from "./hardcodedTemplate";
import { Types } from "./TemplateTypes";
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
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const isEditMode = !!id;
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
  const [flowTree, setFlowTree] = useState<Types>(HARDCODED_TEMPLATE);
  const [flowValidationMsg, setFlowValidationMsg] = useState<string>("");

  React.useEffect(() => {
    setFlowValidationMsg(validateFlowTree(flowTree));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    setLoadwhilerender(true);

    if (id) {
      // Load from json-server
      fetch(`${UrlConstant.TEMPLATES}/${id}`)
        .then((res) => res.json())
        .then((result) => {
          setTemplateObject(result);
          setFlowTree(result);
          setFlowValidationMsg(validateFlowTree(result));
          settemplatearray([result]);
          settemplatearray1([result]);
          setLoadwhilerender(false);
        })
        .catch(() => setLoadwhilerender(false));
    } else {
      setLoadwhilerender(false);
    }
  }, [id]);

  const save_template = () => {
    setSaveButtonLoading(true);

    const payload = {
      ...flowTree,
      header: templateObject.header,
      description: templateObject.description,
      id: isEditMode ? Number(id) : undefined,
    };

    const url = isEditMode
      ? `${UrlConstant.TEMPLATES}/${id}`
      : UrlConstant.TEMPLATES;
    const method = isEditMode ? "PUT" : "POST";

    fetch(url, {
      method,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then(() => {
        setDisableSave(true);
        setSaveButtonLoading(false);
        setTimeout(() => {
          history.push("/templates");
        }, 800);
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
    const tempformprop: any = templateObject;
    tempformprop[e.target.name] = e.target.value;
    setTemplateObject(tempformprop);

    setCount(count + 1);
  };

  const text_area_change_event = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    const tempformprop: any = templateObject;
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
        // console.log$&
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
    templateObject["Tag"] = data.selectedOptions;
    setTemplateObject(templateObject);
    setInputFocus(true);
    setSelectCount(selectcount + 1);
  };

  /* ---- Tree validation ------------------------------------------ */
  const countTreeNodes = (root: Types): number => {
    let count = 1;
    for (const child of root.children || []) {
      count += countTreeNodes(child);
    }
    return count;
  };

  const countTreeEdges = (root: Types): number => {
    let edges = root.children?.length || 0;
    for (const child of root.children || []) {
      edges += countTreeEdges(child);
    }
    return edges;
  };

  const validateFlowTree = (tree: Types): string => {
    const nodes = countTreeNodes(tree);
    const edges = countTreeEdges(tree);
    if (nodes > 1 && edges !== nodes - 1) {
      const orphanCount = nodes - 1 - edges;
      return `${orphanCount} free object${orphanCount > 1 ? "s" : ""} not a child of any parent. Drag onto a parent node to connect.`;
    }
    return "";
  };

  const handleFlowTreeChange = (tree: Types) => {
    setFlowTree(tree);
    setFlowValidationMsg(validateFlowTree(tree));
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
          <BreadcrumbButton onClick={() => history.push("/templates")}>
            <Fluid16Regular color="black" fontSize={15} /> Templates
          </BreadcrumbButton>
        </BreadcrumbItem>
        <BreadcrumbDivider />
        <BreadcrumbItem>
          <BreadcrumbButton icon={<AddCircle20Filled />} current>
            {isEditMode ? "Edit Template" : "Add Template"}
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
          <div className="row" style={{ padding: 10 }}>
            <div className="col-md-9">
              <div className="row">
                <div className="col-md-12" style={{ marginBottom: 30 }}>
                  {templateObject.isDeleted && (
                    <MessageBar
                      style={{ marginTop: 20, color: "red", padding: 10 }}
                      intent={"error"}
                    >
                      <MessageBarBody style={{ fontSize: 14 }}>
                        Template{" "}
                        <MessageBarTitle style={{ fontSize: 14 }}>
                          {templateObject.header}
                        </MessageBarTitle>{" "}
                        is deleted, and cannot be edited or used in any new
                        statement of work.
                      </MessageBarBody>
                    </MessageBar>
                  )}
                </div>
                <div className="col-md-12">
                  <Label htmlFor={"outlineId"} style={{ marginBottom: 10 }}>
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
                <div className="col-md-12">
                  <Label
                    htmlFor={"outlineId"}
                    style={{ marginTop: 20, marginBottom: 10 }}
                  >
                    <strong>Description</strong>
                  </Label>
                  <Textarea
                    disabled={templateObject.isDeleted}
                    style={{ width: "100%" }}
                    onChange={text_area_change_event}
                    appearance="filled-darker"
                    name="description"
                    value={templateObject.description}
                  />
                  {/* <Button disabled={templateObject.isDeleted} onClick={save_template} style={{ width: 30, marginTop: 10 }}>
                    Save
                  </Button> */}

                  <Button
                    className="mt-2"
                    appearance="primary"
                    shape="square"
                    disabled={
                      templateObject.isDeleted ||
                      saveButtonLoading ||
                      !!flowValidationMsg
                    }
                    onClick={save_template}
                  >
                    {saveButtonLoading ? <Spinner size="small" /> : "Save"}
                  </Button>
                </div>
                <div className="col-md-12">
                  {disableSave && (
                    <MessageBar style={{ marginTop: 20 }} intent={"success"}>
                      <MessageBarBody>
                        Template{" "}
                        <MessageBarTitle>
                          {templateObject.header}
                        </MessageBarTitle>{" "}
                        created successfully! , please associate necessary
                        Requirements below.
                      </MessageBarBody>
                    </MessageBar>
                  )}
                </div>
                <div className="col-md-12">
                  <div
                    style={{
                      overflowY: "auto",
                      maxHeight: "calc(100vh - 100px)",
                      marginTop: 20,
                      background: "#f0f0f0",
                      padding: 20,
                    }}
                  >
                    {flowValidationMsg && (
                      <MessageBar intent="warning" style={{ marginBottom: 12 }}>
                        <MessageBarBody>
                          <MessageBarTitle>Validation Error</MessageBarTitle>
                          {flowValidationMsg}
                        </MessageBarBody>
                      </MessageBar>
                    )}
                    <TemplateFlow
                      root={isEditMode ? flowTree : HARDCODED_TEMPLATE}
                      onTreeChange={handleFlowTreeChange}
                    />

                    {/* <ReactHierarchy
                      nodes={templatearray}
                      direction="horizontal"
                      randerNode={(node: any) => {
                        const isTemplate = node.node_type === 'Template';

                        return (
                          <Tooltip
                            content={
                              <table className="table table-bordered" style={{ fontSize: 10 }}>
                                <tbody>
                                  {
                                    Object.keys(node).map((element) => {
                                      if (element !== "children" && element !== "Updated_by" && element !== "Tag") {
                                        // Generate a unique key by combining element with node.id
                                        const uniqueKey = `${node.id}-${element}`;
                                        return (
                                          <tr style={{ padding: 2 }} key={uniqueKey}>
                                            <td style={{ padding: 1 }}>{element}</td>
                                            <td style={{ padding: 1 }}>{node[element.toString()]}</td>
                                          </tr>
                                        );
                                      }
                                      return null; // Return null if the condition is not met to avoid rendering unnecessary elements
                                    })
                                  }
                                </tbody>
                              </table>
                            }
                            positioning="above-start"
                            withArrow
                            relationship="label"
                          >
                            <Button
                              size="small"
                              onClick={() => associateRequirements(node)}
                              styles={{
                                root: {
                                  borderColor: isTemplate ? 'green' : 'red',
                                  borderWidth: 2,
                                }
                              }}
                            >
                              {(node.order !== undefined ? node.order + ". " : "") + node.header}
                            </Button>
                          </Tooltip>
                        );
                      }}
                    /> */}
                  </div>
                </div>
              </div>
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
                            {templateObject.Tag?.map((option: any) => (
                              <Tag
                                disabled={templateObject.isDeleted}
                                key={option.NAME}
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
                            ))}
                          </TagPickerGroup>
                          <TagPickerInput aria-label="Select Employees" />
                        </TagPickerControl>
                        <TagPickerList>
                          {tags.length > 0
                            ? tags.map((option: any) => (
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
                                  key={option.NAME}
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
                            {templateObject.Tag?.map((option: any) => (
                              <Tag
                                disabled={templateObject.isDeleted}
                                key={option.NAME}
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
                            ))}
                          </TagPickerGroup>
                          <TagPickerInput aria-label="Select Employees" />
                        </TagPickerControl>
                        <TagPickerList>
                          {tags.length > 0
                            ? tags.map((option: any) => (
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
                                  key={option.NAME}
                                >
                                  {option.NAME}
                                </TagPickerOption>
                              ))
                            : "No options available"}
                        </TagPickerList>
                      </TagPicker>
                    )}
                  </Field>

                  {/* <span style={{ display: "block", marginTop: 20 }}>
                    <DownloadIcon /> <strong>Download</strong>
                    <span style={{ display: "block", marginLeft: "20px", marginTop: 10 }}></span>
                    <Button disabled size="medium" icon={<DocumentPdf24Regular />} onClick={() => alert("TBD")} style={{ marginRight: 5 }}></Button>
                    <Button  size="medium" icon={<DocumentData24Filled />} onClick={() => ExportToCSV_Template(templatearray)}></Button>

                  </span> */}

                  {/* <span style={{ display: "block", marginTop: 20 }}></span>
                  <strong>Delete/Archive</strong>
                  <span style={{ display: "block", marginLeft: "20px", marginTop: 10 }}></span>
                  <Button size="medium" icon={<Delete24Filled />} disabled={templateObject.isDeleted} onClick={delete_template}>

                  </Button> */}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <SelectRequirement
        open={open}
        setOpen={setOpen}
        updateTemplate={update_tempalte}
        selectedRequirementObject={selectedRequirementObject}
        setSelectedRequirementObject={setSelectedRequirementObject}
        requirementObjectlist={requirementObjectlist}
        loadWhileRendering={loadwhileerender}
      />

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
            {/*
                        <Field style={{ maxWidth: 400 }}>
                            <TagPicker
                                size="medium"
                                onOptionSelect={(event: any, value: any) => (
                                    selectedRequirementObject.children = [],
                                    selectedRequirementObject.children = value["selectedOptions"],
                                    setSelectedRequirementObject(selectedRequirementObject),
                                    console.log(selectedRequirementObject)
                                )}
                                selectedOptions={selectedRequirementObject["children"]}
                            >
                                <TagPickerControl>
                                    <TagPickerGroup>
                                        {selectedRequirementObject["children"] != undefined && selectedRequirementObject["children"].map((option: any) => (
                                            <Tag
                                                key={option.id}
                                                shape="rounded"
                                                media={<Avatar aria-hidden name={option.header} color="colorful" />}
                                                value={option}
                                            >
                                                {option.header.replace(/_/g, " ")}
                                            </Tag>
                                        ))}
                                    </TagPickerGroup>
                                    <TagPickerInput aria-label="Select Employees" />
                                </TagPickerControl>
                                <TagPickerList>
                                    {requirementObjectlist.length > 0
                                        ? requirementObjectlist.map((option: any) => (
                                            <TagPickerOption
                                                media={
                                                    <Avatar
                                                        shape="square"
                                                        aria-hidden
                                                        name={option.header}
                                                        color="colorful"
                                                    />
                                                }
                                                value={option}
                                                key={option.id}
                                            >
                                                {option.header.replace(/_/g, " ")}
                                            </TagPickerOption>
                                        ))
                                        : "No options available"}
                                </TagPickerList>
                            </TagPicker>
                        </Field> */}

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
          {/* <Button onClick={() => update_tempalte(selectedRequirementObject)}>Update</Button> */}
          <div
            style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}
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
