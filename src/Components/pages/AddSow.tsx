/**
 * @file Acme Detailed view
 * @author Gopinath Rajagopal
 * @copyright
 * Boeing Proprietary, Confidential and/or Trade Secret
 * Copyright (c) 2023 The Boeing Company
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
  const [selectedOptions, setSelectedOptions] = React.useState<any>([]);
  const [formData, setFormData] = useState<any>([]);
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
  const [tabCount, setTabCount] = useState<number>(0);
  const [useEffectcall, setuseEffectcall] = useState<number>(0);
  const [displaySaveMessage, setDisplaySaveMessage] = useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

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
          setSelectedOptions(result);
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

  const onOptionSelect: TagPickerProps["onOptionSelect"] = (_, data: any) => {
    // console.log(data)
    const tempFormProp: any = [];
    // const newValue = JSON.parse(JSON.stringify(data.value));
    setSelectedOptions(data.selectedOptions);
    dataset["template"] = data.selectedOptions;
    // console.log(data)
    setDataset({ ...dataset });
    setIsInputFocused(true);
    setSelectTemplateCount((prev) => prev + 1);
    const templateFormProp = formData;
    let optionfound = false;
    let found = false;

    for (let i = 0; i < templateFormProp.length; i++) {
      found = false;
      for (let j = 0; j < data.selectedOptions.length; j++) {
        if (templateFormProp[i]["id"] === data.selectedOptions[j]["id"]) {
          found = true;
        }
      }
      if (found === false) {
        templateFormProp.splice(i, 1);
      }
    }

    for (let i = 0; i < templateFormProp.length; i++) {
      if (
        templateFormProp[i]["id"] ===
        data.selectedOptions[data.selectedOptions.length - 1]["id"]
      ) {
        optionfound = true;
      }
    }

    setFormData(templateFormProp);

    if (!optionfound) {
      setDisableSelectTemplate(true);
      fetch(
        UrlConstant.QUERY_TEMPLATE_BY_ID +
          data.selectedOptions[data.selectedOptions.length - 1][
            "id"
          ].toString(),
        {
          mode: "cors",
          credentials: "include",
        },
      )
        .then((res) => res.json())
        .then((result) => {
          templateFormProp.push(result[0]);
          setOpenPopover(false);
          setFormData(templateFormProp);
          let found = false;
          for (let j = 0; j < formData.length; j++) {
            if (formData[j]["id"] === result[0]["id"]) {
              found = true;
            }
          }
          if (found === false) {
            formData.push(result[0]);
            dataset[result["header"]] = {};
            setFormData(formData);
          }
          setDisableSelectTemplate(false);
        });
    }
  };

  const onTagClick: TagPickerProps["onOptionSelect"] = (_, data) => {
    dataset["Tag"] = data.selectedOptions;
    setDataset(dataset);
    setIsInputFocused(true);
    setSelectCount((prev) => prev + 1);
  };

  const handleAddOption = (newOption: any) => {
    setDisableSelectTemplate(true);
    fetch(UrlConstant.QUERY_TEMPLATE_BY_ID + newOption.id.toString(), {
      mode: "cors",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((result) => {
        if (result && result.length > 0) {
          const uniqueId = Date.now(); // or use a library like uuid
          const objKey =
            result[0].header + "#" + result[0].id + "#" + uniqueId.toString();
          const newTemplate = {
            ...result[0],
            // key: `${result[0].id}_${Date.now()}`, // Add a unique key
            objKey: objKey, // Set the header to the unique ID
            TemplateId: result[0].id, // Add TemplateId
            TemplateHeader: result[0].header, // Add TemplateHeader
          };

          setFormData((prevFormData: any) => [...prevFormData, newTemplate]);

          setDataset((prevDataset: any) => ({
            ...prevDataset,
            // [newTemplate.id]: prevDataset[newTemplate.header] || {}
            [objKey]: {
              ...prevDataset[newTemplate.header], // Spread existing data if any
              TemplateId: result[0].id, // Add TemplateId
              TemplateHeader: result[0].header, // Add TemplateHeader
              objKey: objKey, // Add TemplateHeader
            },
          }));

          setDisableSelectTemplate(false);
          setOpenPopover(false);
        }
      })
      .catch((error) => {
        console.error("Error fetching template:", error);
      });
  };

  const handleRemoveOption = (removedOption: any) => {
    setFormData((prevFormData: any) =>
      prevFormData.filter((item: any) => item.key !== removedOption.key),
    );

    setDataset((prevDataset: any) => {
      const newDataset = { ...prevDataset };
      // Only remove the dataset entry if there are no more instances of this template
      if (
        !selectedOptions.some(
          (option: any) =>
            option.id === removedOption.id && option.key !== removedOption.key,
        )
      ) {
        delete newDataset[removedOption.header];
      }
      return newDataset;
    });
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

  const handleTagRemove = (tagToRemove: any) => {
    setSelectedOptions((prev: any) =>
      prev.filter((tag: any) => tag.id !== tagToRemove.id),
    );
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

  function extractTemplateKey(input: string) {
    const parts = input.split("#");
    return parts[0].trim(); // Return the first part, trimmed of whitespace
  }

  const handleDelete = (templateKey: string) => {
    setDataset((prevDataset: any) => {
      const newDataset = { ...prevDataset };

      if (newDataset[templateKey]) {
        newDataset[templateKey] = {
          ...newDataset[templateKey],
          isDeleted: true,
          deletedDate: new Date().toISOString(),
        };
      }

      return newDataset;
    });

    setSelectedOptions((prev: any) =>
      prev.filter((option: any) => option.objKey !== templateKey),
    );

    setFormData((prevFormData: any) =>
      prevFormData.filter((item: any) => item.objKey !== templateKey),
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
                    onOptionSelect={onOptionSelect}
                    selectedOptions={selectedOptions}
                  >
                    <TagPickerControl>
                      <TagPickerGroup>
                        {selectedOptions.map((option: any, index: number) => (
                          <Tag
                            style={{ fontSize: 12 }}
                            key={option.key || `${option.id}-${index}`}
                            shape="circular"
                            media={
                              <Avatar
                                aria-hidden
                                name={option.header}
                                color="colorful"
                              />
                            }
                            value={option}
                          >
                            {option.header.replace(/_/g, " ")}
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
                              value={{
                                ...option,
                                key: `${option.id}-${Date.now()}`,
                              }}
                              key={`${option.id}-${Date.now()}`}
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
                    {Object.entries(dataset).map(([key, value], index) => {
                      if (
                        typeof value === "object" &&
                        value !== null &&
                        "TemplateId" in value &&
                        !(value as any)["isDeleted"]
                      ) {
                        const datasetItem = value as {
                          TemplateId?: number;
                          id?: number;
                          TemplateHeader?: string;
                          objKey?: string;
                        };

                        if (datasetItem.TemplateId) {
                          const matchingFormDataItem = formData.find(
                            (formItem: any) =>
                              formItem.id === datasetItem.TemplateId,
                          );

                          if (matchingFormDataItem) {
                            return (
                              <React.Fragment
                                key={`${datasetItem.id}-${index}`}
                              >
                                <Tab key={`tab-${datasetItem.id}-${index}`}>
                                  <strong>
                                    <DocumentContract16Regular />
                                    {datasetItem.TemplateHeader?.replace(
                                      /_/g,
                                      " ",
                                    ).replace("Template", "")}
                                  </strong>
                                  <button
                                    onClick={() =>
                                      handleDelete(datasetItem.objKey || "")
                                    }
                                    aria-label="Delete tab"
                                    style={{
                                      background: "none",
                                      border: "none",
                                      cursor: "pointer",
                                    }}
                                  >
                                    <XIcon fill="red" />{" "}
                                    {/* Make the icon red */}
                                  </button>
                                </Tab>
                              </React.Fragment>
                            );
                          }
                        }
                      }
                      return null;
                    })}
                  </TabList>

                  {Object.entries(dataset).map(([key, value], index) => {
                    // Type guard to check if value has a TemplateId
                    if (
                      typeof value === "object" &&
                      value !== null &&
                      "TemplateId" in value &&
                      !(value as any)["isDeleted"]
                    ) {
                      const datasetItem = value as {
                        TemplateId?: number;
                        id?: number;
                      };

                      // Check if the TemplateId is defined
                      if (datasetItem.TemplateId) {
                        // Find the matching object in formdata by TemplateId
                        const matchingFormDataItem = formData.find(
                          (formItem: any) =>
                            formItem.id === datasetItem.TemplateId,
                        );

                        // If a matching form data item is found, render TabPanel
                        if (matchingFormDataItem) {
                          return (
                            <React.Fragment key={`${datasetItem.id}-${index}`}>
                              <TabPanel
                                key={`tabpanel-${datasetItem.id}-${index}`}
                                style={{ padding: 20 }}
                              >
                                <NestedForm
                                  schema={matchingFormDataItem} // Pass the matched form data item as schema
                                  screenname={screenname}
                                  formvalue={dataset}
                                  formData={datasetItem}
                                  onCloseDrawer={handleToggleDrawer}
                                />
                              </TabPanel>
                            </React.Fragment>
                          );
                        }
                      }
                    }
                    return null; // Return null if no TemplateId is found or no matching form data item
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
                onClick={() => handleExportPdf(dataset)}
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
