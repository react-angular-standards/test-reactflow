/**
 * @file Acme Detailed view
 * @author Gopinath Rajagopal
 * @copyright
 * Company ,  and/or
 * Copyright (c) 2023 The Company Company
 * Unpublished Work - All Rights Reserved
 * Third Party Disclosure Requires Written Approval
 */

import { useParams } from "react-router-dom";
import {
  Avatar,
  Breadcrumb,
  BreadcrumbButton,
  BreadcrumbDivider,
  BreadcrumbItem,
  Button,
  Card,
  CardFooter,
  CardHeader,
  CardPreview,
  CompoundButton,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
  Field,
  Input,
  Link,
  makeStyles,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  Option,
  Popover,
  PopoverSurface,
  PopoverTrigger,
  type PositioningImperativeRef,
  Select,
  Skeleton,
  SkeletonItem,
  Spinner,
  Tag,
  TagPicker,
  TagPickerControl,
  TagPickerGroup,
  TagPickerInput,
  TagPickerList,
  TagPickerOption,
  TagPickerProps,
  Textarea,
  Toast,
  ToastBody,
  ToastTitle,
  Toaster,
  Tooltip,
  useId,
  useRestoreFocusTarget,
  useToastController,
} from "@fluentui/react-components";

import {
  ArrowUploadRegular,
  Calendar20Regular,
  ChevronRightRegular,
  DocumentContract16Regular,
  DocumentPdf24Regular,
  DocumentData24Filled,
  Home20Filled,
  Status20Filled,
  Delete24Filled,
  Dismiss20Regular,
} from "@fluentui/react-icons";

import {
  XIcon,
  PeopleIcon,
  TagIcon,
  DownloadIcon,
} from "@primer/octicons-react";

import React, { useState, useRef, useEffect } from "react";
import { UrlConstant } from "../Util/UrlConstants";

import { ExportToCSV_SOW, handleExportPdf } from "./exportToCSV";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import { convertToTitleCase, GenerateUUID } from "../Util/utils";
import NestedForm from "./nestedform";

const useStyles = makeStyles({
  container: {
    display: "flex",
    gap: "10px",
  },
  contentHeader: {
    marginTop: "0",
  },
  redIcon: {
    color: "red",
  },
});

export const AddSow = (): JSX.Element => {
  const { screenname } = useParams<{ screenname: string }>();
  const { id } = useParams<{ id: string }>();
  const [templateList, setTemplateList] = useState<any>([]);
  const [tags, setTags] = useState<any>([]);
  const [selectedTemplates, setSelectedTemplates] = useState<any[]>([]);
  const [formData, setFormData] = useState<any[]>([]);
  const [dataset, setDataset] = useState<any>({});
  const [selectTemplateCount, setSelectTemplateCount] = useState<number>(0);
  const [disableSelectTemplate, setDisableSelectTemplate] =
    useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const positioningRef = React.useRef<PositioningImperativeRef>(null);
  const styles = useStyles();
  const [openPopover, setOpenPopover] = React.useState(false);
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false);
  const [saveButtonLoading, setSaveButtonLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectCount, setSelectCount] = useState<number>(0);
  const [useEffectcall, setuseEffectcall] = useState<number>(0);
  const [displaySaveMessage, setDisplaySaveMessage] = useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const selectedTemplatesRef = useRef<any[]>([]);

  useEffect(() => {
    selectedTemplatesRef.current = selectedTemplates;
  }, [selectedTemplates]);

  React.useEffect(() => {
    if (id !== undefined && useEffectcall === 0) {
      setDisableSelectTemplate(true);
      fetch(UrlConstant.QUERY_BY_ID + id + "/", {
        mode: "cors",
        credentials: "include",
      })
        .then((res) => res.json())
        .then((result) => {
          console.log(
            "🚀 ~ file: AddSow.tsx ~ line 143 ~ .then ~ result",
            result,
          );
          setDataset(result);
          setLoading(false);
          setuseEffectcall(1);
          setDisableSelectTemplate(false);

          // Reconstruct selected templates with persisted order for edit mode
          const instances: any[] = [];
          Object.entries(result).forEach(([key, value]) => {
            if (
              typeof value === "object" &&
              value !== null &&
              "TemplateId" in value &&
              !(value as any).isDeleted
            ) {
              const v = value as any;
              const objKey = v.objKey || key;
              instances.push({
                instanceId: objKey,
                templateId: v.TemplateId,
                header: v.TemplateHeader || key,
                objKey,
                tabOrder: v.tabOrder ?? instances.length,
              });
            }
          });
          instances.sort((a, b) => (a.tabOrder ?? 0) - (b.tabOrder ?? 0));
          setSelectedTemplates(instances);
        });

      fetch(UrlConstant.QUERY_BY_NAME + id, {
        mode: "cors",
        credentials: "include",
      })
        .then((res) => res.json())
        .then((result) => {
          console.log(
            "🚀 ~ file: AddSow.tsx ~ line 168 ~ .then ~ result",
            result,
          );
          setFormData(result);
          setDisableSelectTemplate(false);
        });
    } else {
      setLoading(false);
    }

    if (buttonRef.current) {
      positioningRef.current?.setTarget(buttonRef.current);
    }

    fetch(UrlConstant.QUERY_TEMPLATE_OBJECT + "?template", {
      mode: "cors",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((result) => {
        setTags(result);
      });

    fetch(UrlConstant.QUERY_TEMPLATE_OBJECT + "?template", {
      mode: "cors",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((result) => {
        setTemplateList(result);
      });
  }, [buttonRef, positioningRef]);

  const addTemplateInstance = (templateOption: any) => {
    const instanceId = GenerateUUID();
    const objKey = `${templateOption.header}#${templateOption.id}#${instanceId}`;
    const newInstance = {
      instanceId,
      templateId: templateOption.id,
      header: templateOption.header,
      objKey,
    };

    setSelectedTemplates((prev) => {
      const next = [...prev, newInstance];
      setDataset((d: any) => {
        const newD = { ...d };
        newD[objKey] = {
          ...(newD[objKey] || {}),
          TemplateId: templateOption.id,
          TemplateHeader: templateOption.header,
          objKey,
        };
        next.forEach((t, idx) => {
          if (newD[t.objKey]) {
            newD[t.objKey] = { ...newD[t.objKey], tabOrder: idx };
          }
        });
        return newD;
      });
      return next;
    });

    const alreadyCached = formData.some((f: any) => f.id === templateOption.id);
    if (!alreadyCached) {
      setDisableSelectTemplate(true);
      fetch(UrlConstant.QUERY_TEMPLATE_BY_ID + templateOption.id.toString(), {
        mode: "cors",
        credentials: "include",
      })
        .then((res) => res.json())
        .then((result) => {
          if (result && result.length > 0) {
            setFormData((prev: any) => {
              if (prev.some((f: any) => f.id === result[0].id)) return prev;
              return [...prev, result[0]];
            });
          }
          setDisableSelectTemplate(false);
        })
        .catch(() => {
          setDisableSelectTemplate(false);
        });
    }
  };

  const removeTemplateInstance = (instanceId: string) => {
    setSelectedTemplates((prev) => {
      const idx = prev.findIndex((t) => t.instanceId === instanceId);
      if (idx === -1) return prev;
      const instance = prev[idx];
      const next = prev.filter((t) => t.instanceId !== instanceId);
      setDataset((d: any) => {
        const newD = { ...d };
        if (newD[instance.objKey]) {
          newD[instance.objKey] = {
            ...newD[instance.objKey],
            isDeleted: true,
            deletedDate: new Date().toISOString(),
          };
        }
        next.forEach((t, i) => {
          if (newD[t.objKey]) {
            newD[t.objKey] = { ...newD[t.objKey], tabOrder: i };
          }
        });
        return newD;
      });
      return next;
    });
  };

  const reorderTemplates = (dragIndex: number, dropIndex: number) => {
    if (dragIndex === dropIndex) return;
    setSelectedTemplates((prev) => {
      const next = [...prev];
      const [removed] = next.splice(dragIndex, 1);
      next.splice(dropIndex, 0, removed);
      setDataset((d: any) => {
        const newD = { ...d };
        next.forEach((t, idx) => {
          if (newD[t.objKey]) {
            newD[t.objKey] = { ...newD[t.objKey], tabOrder: idx };
          }
        });
        return newD;
      });
      return next;
    });
  };

  const handleTemplatePickerSelect: TagPickerProps["onOptionSelect"] = (
    _,
    data: any,
  ) => {
    const current = selectedTemplatesRef.current;
    const next = (data.selectedOptions || []) as any[];
    const nextIds = new Set(next.map((o: any) => o.instanceId).filter(Boolean));

    if (next.length < current.length) {
      const removed = current.find((t) => !nextIds.has(t.instanceId));
      if (removed) {
        removeTemplateInstance(removed.instanceId);
      }
      return;
    }

    if (next.length > current.length) {
      const added = next.find((o: any) => !o.instanceId);
      if (added) {
        addTemplateInstance(added);
      } else if (data.value) {
        addTemplateInstance(data.value);
      }
      return;
    }
  };

  const handleDelete = (instanceId: string) => {
    removeTemplateInstance(instanceId);
  };

  const onTagClick: TagPickerProps["onOptionSelect"] = (_, data) => {
    dataset["Tag"] = data.selectedOptions;
    setDataset(dataset);
    setIsInputFocused(true);
    setSelectCount((prev) => prev + 1);
  };

  const text_box_change_event = (
    event: React.ChangeEvent<HTMLInputElement>,
    data: any,
  ) => {
    const { name, value } = event.target;
    dataset[name] = value;
    setDataset(dataset);
    setSelectCount((prev) => prev + 1);
  };

  const text_area_change_event = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
    data: any,
  ) => {
    const { name, value } = event.target;
    dataset[name] = value;
    setDataset(dataset);
    setSelectCount((prev) => prev + 1);
  };

  const select_change_event = (
    event: React.ChangeEvent<HTMLSelectElement>,
    data: any,
  ) => {
    const { name, value } = event.target;
    dataset[name] = value;
    setDataset(dataset);
    setSelectCount((prev) => prev + 1);
  };

  const save_form = () => {
    let isError = false;
    setSaveButtonLoading(true);
    // console.log(dataset)
    fetch(UrlConstant.PUBLIC_SOW + screenname, {
      method: "post",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataset),
    })
      .then((res) => {
        if (res.status === 409) {
          isError = true;
        }
        return res.json();
      })
      .then((result) => {
        setDisplaySaveMessage(false);
        setSaveButtonLoading(false);
        notify();
      })
      .catch(() => {
        setSaveButtonLoading(false);
      });
  };

  const handleToggleDrawer = (screen: string) => {
    setIsOpen(isOpen ? false : true);
  };

  const editRow = (row: any) => {
    setIsOpen(true);
  };

  const { dispatchToast } = useToastController("toast");

  const notify = () => {
    dispatchToast(
      <Toast>
        <ToastTitle>Record added successfully.</ToastTitle>
      </Toast>,
      { intent: "success" },
    );
  };

  return (
    <div>
      <Breadcrumb
        aria-label="Large breadcrumb example with buttons"
        size="small"
        style={{ marginBottom: 20 }}
      >
        <BreadcrumbItem>
          <BreadcrumbButton href="/" icon={<Home20Filled />}>
            Home
          </BreadcrumbButton>
        </BreadcrumbItem>
        <BreadcrumbDivider />
        <BreadcrumbItem>
          <BreadcrumbButton
            onClick={() => (window.location.href = "#/page/statement_of_work")}
          >
            <ChevronRightRegular color="black" fontSize={15} />
            Statement of Work
          </BreadcrumbButton>
        </BreadcrumbItem>
        <BreadcrumbDivider />
        <BreadcrumbItem>
          <BreadcrumbButton style={{ color: "#0f6cbd" }} current>
            {" "}
            Manage
          </BreadcrumbButton>
        </BreadcrumbItem>
      </Breadcrumb>

      {loading ? (
        <Skeleton>
          <div className="row">
            <div className="col-md-9">
              <div className="row">
                <div className="col-md-12">
                  <span style={{ textDecoration: "none", marginBottom: 10 }}>
                    Name
                  </span>
                  <SkeletonItem
                    size={28}
                    style={{ marginTop: 10, marginBottom: 20 }}
                  />
                </div>

                <div className="col-md-12">
                  <span
                    style={{
                      textDecoration: "none",
                      marginBottom: 10,
                      marginTop: 10,
                    }}
                  >
                    Select Template
                  </span>
                  <br />
                  <SkeletonItem
                    size={28}
                    style={{ marginTop: 10, marginBottom: 20 }}
                  />
                </div>

                <div className="col-md-12" style={{ marginBottom: 5 }}>
                  <span style={{ textDecoration: "none", marginBottom: 5 }}>
                    Description
                  </span>
                  <SkeletonItem
                    size={96}
                    style={{ marginTop: 10, marginBottom: 20 }}
                  />
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <SkeletonItem size={56} />
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
      ) : (
        <div className="row" style={{ marginTop: 10 }}>
          <div className="col-md-9">
            {/* <MessageBar intent={"error"} style={{marginBottom:40}}>
              <MessageBarBody>
                Record has been deleted by <b>{dataset.UserInfo.NAME}</b> and cannot be edited.
              </MessageBarBody>
            </MessageBar> */}
            <div className="row">
              <div className="col-md-12">
                <span
                  style={{
                    textDecoration: "none",
                    marginBottom: 10,
                    display: "block",
                    fontSize: 12,
                  }}
                >
                  Name
                </span>
                <Input
                  appearance="outline"
                  ref={inputRef}
                  name="statement_of_work_name"
                  onChange={(e) => text_box_change_event(e, dataset)}
                  value={dataset["statement_of_work_name"]}
                  style={{ width: "100%", fontSize: 12 }}
                  size="medium"
                  title="header"
                />
              </div>

              <div className="col-md-12">
                <span
                  style={{
                    textDecoration: "none",
                    marginTop: 20,
                    marginBottom: 10,
                    display: "block",
                    fontSize: 12,
                  }}
                >
                  Select Templates
                </span>
                <Field>
                  <TagPicker
                    size="medium"
                    appearance="outline"
                    onOptionSelect={handleTemplatePickerSelect}
                    selectedOptions={
                      selectedTemplates.map((t) => ({
                        id: t.templateId,
                        header: t.header,
                        instanceId: t.instanceId,
                        key: t.instanceId,
                      })) as any
                    }
                  >
                    <TagPickerControl>
                      <TagPickerGroup>
                        {selectedTemplates.map((instance) => (
                          <Tag
                            style={{ fontSize: 12 }}
                            key={instance.instanceId}
                            shape="circular"
                            dismissible
                            media={
                              <Avatar
                                aria-hidden
                                name={instance.header}
                                color="colorful"
                              />
                            }
                          >
                            {instance.header.replace(/_/g, " ")}
                          </Tag>
                        ))}
                      </TagPickerGroup>
                      <TagPickerInput aria-label="Select Templates" />
                    </TagPickerControl>
                    <TagPickerList
                      style={{ height: 400, fontFamily: "monospace" }}
                    >
                      {templateList.length > 0
                        ? templateList.map((option: any) => (
                            <TagPickerOption
                              media={
                                <Avatar
                                  shape="circular"
                                  size={24}
                                  aria-hidden
                                  name={option.header}
                                  color="colorful"
                                />
                              }
                              value={option}
                              key={option.id}
                            >
                              {option && option.header
                                ? option.header.replace(/_/g, " ")
                                : "Default Header"}
                            </TagPickerOption>
                          ))
                        : "No options available"}
                    </TagPickerList>
                  </TagPicker>
                </Field>
              </div>

              <div className="col-md-12">
                <span
                  style={{
                    textDecoration: "none",
                    display: "block",
                    marginTop: 20,
                    marginBottom: 10,
                    fontSize: 12,
                  }}
                >
                  Description
                </span>
                <Textarea
                  appearance="outline"
                  name="statement_of_work_description"
                  onChange={(e: any) => text_area_change_event(e, dataset)}
                  value={dataset["statement_of_work_description"]}
                  style={{ width: "100%", fontSize: "12px !important" }}
                  size="small"
                  title="header"
                />
              </div>

              {disableSelectTemplate && (
                <Skeleton>
                  <SkeletonItem
                    style={{ marginBottom: 10, padding: 200, marginTop: 20 }}
                  ></SkeletonItem>
                </Skeleton>
              )}

              {!disableSelectTemplate && (
                <Tabs style={{ marginTop: 20 }}>
                  <TabList>
                    {selectedTemplates.map((instance, index) => {
                      const matchingFormDataItem = formData.find(
                        (formItem: any) => formItem.id === instance.templateId,
                      );

                      if (!matchingFormDataItem) return null;

                      return (
                        <React.Fragment key={instance.instanceId}>
                          <Tab
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.setData(
                                "text/plain",
                                String(index),
                              );
                              e.dataTransfer.effectAllowed = "move";
                            }}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                              e.preventDefault();
                              const dragIndex = Number(
                                e.dataTransfer.getData("text/plain"),
                              );
                              reorderTemplates(dragIndex, index);
                            }}
                          >
                            <strong>
                              <DocumentContract16Regular />
                              {instance.header
                                ?.replace(/_/g, " ")
                                .replace("Template", "")}
                            </strong>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(instance.instanceId);
                              }}
                              aria-label="Delete tab"
                              style={{
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                              }}
                            >
                              <XIcon fill="red" />
                            </button>
                          </Tab>
                        </React.Fragment>
                      );
                    })}
                  </TabList>

                  {selectedTemplates.map((instance) => {
                    const matchingFormDataItem = formData.find(
                      (formItem: any) => formItem.id === instance.templateId,
                    );

                    if (!matchingFormDataItem) return null;

                    return (
                      <React.Fragment key={instance.instanceId}>
                        <TabPanel style={{ padding: 20 }}>
                          <NestedForm
                            schema={matchingFormDataItem}
                            screenname={screenname}
                            formvalue={dataset}
                            formData={dataset[instance.objKey]}
                            onCloseDrawer={handleToggleDrawer}
                          />
                        </TabPanel>
                      </React.Fragment>
                    );
                  })}
                </Tabs>
              )}
            </div>
          </div>

          <div className="col-md-3">
            <span
              style={{
                textDecoration: "none",
                display: "block",
                marginBottom: 10,
                fontSize: 12,
              }}
            >
              <Status20Filled /> <strong>Status</strong>
            </span>
            <Select
              appearance="outline"
              name="status"
              onChange={(e) => select_change_event(e, dataset)}
              value={dataset["status"]}
            >
              <option value="Draft">Draft</option>
              <option value="Released">Released</option>
              <option value="Closed">Closed</option>
            </Select>

            {dataset.UserInfo != undefined && (
              <>
                <span
                  style={{
                    textDecoration: "none",
                    display: "block",
                    marginBottom: 10,
                    marginTop: 20,
                    fontSize: 12,
                  }}
                >
                  <PeopleIcon /> <strong>Updated by</strong>
                </span>
                <span
                  style={{ display: "block", marginLeft: "20px", fontSize: 12 }}
                >
                  {dataset.UserInfo.NAME}
                </span>
                <span
                  style={{
                    textDecoration: "none",
                    display: "block",
                    marginBottom: 10,
                    marginTop: 20,
                    fontSize: 12,
                  }}
                >
                  <Calendar20Regular /> <strong>Updated on</strong>
                </span>
                <span
                  style={{ display: "block", marginLeft: "20px", fontSize: 12 }}
                >
                  {new Date(dataset.UPDATED_ON).toString()}
                </span>
              </>
            )}

            <Field style={{ maxWidth: 400, marginTop: 20 }}>
              <span
                style={{
                  textDecoration: "none",
                  display: "block",
                  marginBottom: 10,
                  fontSize: 12,
                }}
              >
                <TagIcon size={16} /> <strong>Tags</strong>
              </span>
              {selectCount % 2 === 0 ? (
                <TagPicker
                  size="medium"
                  appearance="outline"
                  onOptionSelect={onTagClick}
                  selectedOptions={dataset["Tag"]}
                >
                  <TagPickerControl>
                    <TagPickerGroup>
                      {dataset.Tag?.map((option: any) => (
                        <Tag
                          key={option.NAME}
                          shape="circular"
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
                                shape="circular"
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
                  size="medium"
                  appearance="outline"
                  onOptionSelect={onTagClick}
                  selectedOptions={dataset["Tag"]}
                >
                  <TagPickerControl>
                    <TagPickerGroup>
                      {dataset.Tag?.map((option: any) => (
                        <Tag
                          key={option.NAME}
                          shape="circular"
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
                                style={{ height: 20, width: 20 }}
                                shape="circular"
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

            <span style={{ display: "block", marginTop: 20, fontSize: 12 }}>
              <DownloadIcon /> <strong>Download</strong>
              <span
                style={{
                  display: "block",
                  marginLeft: "20px",
                  marginTop: 10,
                  fontSize: 12,
                }}
              ></span>
              <Button
                size="medium"
                icon={<DocumentPdf24Regular />}
                onClick={() => {
                  const ordered: any = {};
                  Object.entries(dataset).forEach(([key, value]) => {
                    if (
                      typeof value !== "object" ||
                      value === null ||
                      !("TemplateId" in value)
                    ) {
                      ordered[key] = value;
                    }
                  });
                  const templates = Object.entries(dataset).filter(
                    ([, value]) =>
                      typeof value === "object" &&
                      value !== null &&
                      "TemplateId" in value &&
                      !(value as any).isDeleted,
                  ) as [string, any][];
                  templates.sort(
                    (a, b) => (a[1].tabOrder ?? 0) - (b[1].tabOrder ?? 0),
                  );
                  templates.forEach(([key, value]) => {
                    ordered[key] = value;
                  });
                  handleExportPdf(ordered);
                }}
                style={{ marginRight: 5 }}
              ></Button>
              {/* <Button size="medium" icon={<DocumentData24Filled />} onClick={() => ExportToCSV_SOW(formdata)}></Button> */}
            </span>
            {/* <span style={{display:"block",marginTop:20,fontSize:12}}>
              <strong>Delete/Archive</strong></span>
              <span style={{ display: "block", marginLeft: "20px",marginTop:10,fontSize:12}}></span>
              <Button size="medium" style={{color:"#df6e6e"}} icon={<Delete24Filled />} onClick={()=>alert("TBD")}>
              </Button>
            </span> */}
          </div>
        </div>
      )}
      <Toaster toasterId={"toast"} />
    </div>
  );
};
