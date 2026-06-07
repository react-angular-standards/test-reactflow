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
  PositioningImperativeRef,
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
  Toaster,
  ToastTitle,
  Tooltip,
  useId,
  useRestoreFocusTarget,
  useToastController,
} from "@fluentui/react-components";
import {
  Home20Filled,
  Delete24Filled,
  DocumentTextExtract20Filled,
  DocumentContract16Regular,
  ContentView20Filled,
  Briefcase16Regular,
  Calendar20Regular,
  Status20Filled,
  DocumentPdf24Regular,
  Document24Filled,
  DocumentData24Filled,
} from "@fluentui/react-icons";
import { XIcon } from "@primer/octicons-react";

import React, { useState } from "react";
import { UrlConstant } from "../Util/UrlConstants";
import { GenerateUUID } from "../Util/utils";

import { ActionList, Label, StateLabel } from "@primer/react";
import NestedForm from "./form/nestedform";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import { IFieldType } from "./Formbuilder";
import {
  TagIcon,
  WorkflowIcon,
  PeopleIcon,
  CalendarIcon,
  DownloadIcon,
} from "@primer/octicons-react";
import { getDayOfYear } from "date-fns";
import { ExportToCSV_SOW, GeneratePDF } from "./exportToCSV";

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
  const [sowList, setSowList] = useState<any>([]);
  const [selectedOptions, setSelectedOptions] = React.useState<any>([]);
  const [formdata, setformdata] = useState<any[]>([]);
  const [formdata1, setformdata1] = useState<any[]>([]);
  const [selecttemplateCount, setselecttemplateCount] = useState<number>(0);
  const [dataset, setdataset] = useState<any>({});
  const [dataset1, setdataset1] = useState<any>({});
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [columns, setColumns] = useState<any>([]);
  const [disableSelectTemplate, setDisableSelectTemplate] =
    useState<boolean>(false);
  const [selectcount, setSelectCount] = useState<number>(0);
  // add popover.
  const [openPopover, setOpenPopover] = React.useState(false);
  const headerId = useId();
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const positioningRef = React.useRef<PositioningImperativeRef>(null);
  const styles = useStyles();
  const restoreFocusTargetAttribute = useRestoreFocusTarget();
  const [inputRef, setInputFocus] = useState<boolean>(false);
  const [displaySaveMessage, setDisplaySaveMessage] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [useeffectcall, setuseeffectcall] = useState<number>(0);
  const [saveButtonLoading, setSaveButtonLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedTemplates, setSelectedTemplates] = useState<any[]>([]);
  const selectedTemplatesRef = React.useRef<any[]>([]);
  const formdataRef = React.useRef<any[]>([]);

  const handleExportPdf = (item: any) => {
    setIsExporting(true);
    GeneratePDF(item);
  };

  React.useEffect(() => {
    selectedTemplatesRef.current = selectedTemplates;
  }, [selectedTemplates]);

  React.useEffect(() => {
    formdataRef.current = formdata;
  }, [formdata]);

  React.useEffect(() => {
    setuseeffectcall(0);
  }, [id]);

  React.useEffect(() => {
    if (id != undefined && useeffectcall == 0) {
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

          setdataset(result);
          setdataset1(result);
          setLoading(false);
          setuseeffectcall(1);
          const instances: any[] = [];
          Object.entries(result).forEach(([key, value]: [string, any]) => {
            if (
              typeof value === "object" &&
              value !== null &&
              "TemplateId" in value &&
              !value.isDeleted
            ) {
              const parts = value.ojbKey ? value.ojbKey.split("#") : [];
              const instanceId = parts.length === 3 ? parts[2] : key;
              instances.push({
                instanceId,
                templateId: value.TemplateId,
                header: value.TemplateHeader || parts[0] || "",
                ojbKey: value.ojbKey || key,
                tabOrder: value.tabOrder ?? 0,
              });
            }
          });
          instances.sort((a, b) => (a.tabOrder ?? 0) - (b.tabOrder ?? 0));
          setSelectedTemplates(instances);
          setDisableSelectTemplate(false);
        })
        .catch(() => {
          setLoading(false);
          setDisableSelectTemplate(false);
        });
      fetch(UrlConstant.QUERY_BY_SOW + id, {
        mode: "cors",
        credentials: "include",
      })
        .then((res) => res.json())
        .then((result) => {
          console.log(
            "🚀 ~ file: AddSow.tsx ~ line 160 ~ .then ~ result",
            result,
          );

          if (Array.isArray(result)) {
            setformdata(result);
            setformdata1(result);
          }
          setDisableSelectTemplate(false);
        })
        .catch(() => {
          setDisableSelectTemplate(false);
        });
    } else {
      setLoading(false);
    }

    if (buttonRef.current) {
      positioningRef.current?.setTarget(buttonRef.current);
    }
    fetch(UrlConstant.QUERY_TEMPLATE_OBJECT + "Template", {
      mode: "cors",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((result) => {
        setTemplateList(result);
      });
    //get the tags
    fetch(UrlConstant.QUERY_TEMPLATE_OBJECT + "Tag", {
      mode: "cors",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((result) => {
        setTags(result);
      });
  }, [id, useeffectcall, buttonRef, positioningRef]);

  React.useEffect(() => {
    if (selectedTemplates.length === 0) return;
    selectedTemplates.forEach((instance: any) => {
      const alreadyCached = formdataRef.current.some(
        (f: any) => String(f.id) === String(instance.templateId),
      );
      if (!alreadyCached) {
        fetch(UrlConstant.QUERY_TEMPLATE_BY_ID + instance.templateId, {
          mode: "cors",
          credentials: "include",
        })
          .then((res) => res.json())
          .then((result) => {
            if (result && result.length > 0) {
              setformdata((prev: any) => {
                if (
                  prev.some((f: any) => String(f.id) === String(result[0].id))
                ) {
                  return prev;
                }
                return [...prev, result[0]];
              });
            }
          })
          .catch((err) =>
            console.error("Fallback template fetch failed:", err),
          );
      }
    });
  }, [selectedTemplates]);

  const addTemplateInstance = (templateOption: any) => {
    const instanceId = GenerateUUID();
    const ojbKey =
      templateOption.header + "#" + templateOption.id + "#" + instanceId;
    const nextTabOrder = selectedTemplates.length;
    const newInstance = {
      instanceId,
      templateId: templateOption.id,
      header: templateOption.header,
      ojbKey,
      tabOrder: nextTabOrder,
    };
    setSelectedTemplates((prev) => [...prev, newInstance]);
    setdataset((prevDataset: any) => {
      const nextTemplates = [...(prevDataset.Template || [])];
      nextTemplates.push({
        id: templateOption.id,
        header: templateOption.header,
        ojbKey,
      });
      return {
        ...prevDataset,
        [ojbKey]: {
          TemplateId: templateOption.id,
          TemplateHeader: templateOption.header,
          ojbKey,
          tabOrder: nextTabOrder,
        },
        Template: nextTemplates,
      };
    });

    const alreadyCached = formdataRef.current.some(
      (f: any) => String(f.id) === String(templateOption.id),
    );
    if (!alreadyCached) {
      setDisableSelectTemplate(true);
      fetch(UrlConstant.QUERY_TEMPLATE_BY_ID + templateOption.id.toString(), {
        mode: "cors",
        credentials: "include",
      })
        .then((res) => res.json())
        .then((result) => {
          if (result && result.length > 0) {
            setformdata((prevFormData: any) => [...prevFormData, result[0]]);
          }
          setDisableSelectTemplate(false);
          setOpenPopover(false);
        })
        .catch((error) => {
          console.error("Error fetching template:", error);
          setDisableSelectTemplate(false);
        });
    } else {
      setOpenPopover(false);
    }
  };

  const removeTemplateInstance = (instanceId: string) => {
    const instance = selectedTemplatesRef.current.find(
      (inst: any) => inst.instanceId === instanceId,
    );
    if (!instance) return;

    const remaining = selectedTemplatesRef.current.filter(
      (inst: any) => inst.instanceId !== instanceId,
    );
    const reordered = remaining.map((inst: any, idx: number) => ({
      ...inst,
      tabOrder: idx,
    }));

    setdataset((prevDataset: any) => {
      const newDataset = { ...prevDataset };
      if (newDataset[instance.ojbKey]) {
        newDataset[instance.ojbKey] = {
          ...newDataset[instance.ojbKey],
          isDeleted: true,
          deletedDate: new Date().toISOString(),
        };
      }
      reordered.forEach((inst: any) => {
        if (newDataset[inst.ojbKey]) {
          newDataset[inst.ojbKey] = {
            ...newDataset[inst.ojbKey],
            tabOrder: inst.tabOrder,
          };
        }
      });
      newDataset.Template = (newDataset.Template || []).filter(
        (t: any) => t.ojbKey !== instance.ojbKey,
      );
      return newDataset;
    });

    setSelectedTemplates(reordered);
  };

  const onOptionSelect: TagPickerProps["onOptionSelect"] = (e, data: any) => {
    const current = selectedTemplatesRef.current;
    const next = Array.isArray(data.selectedOptions)
      ? data.selectedOptions
      : [];

    const currentIds = new Set(current.map((inst: any) => inst.instanceId));
    const nextIds = new Set(next.map((o: any) => o.instanceId).filter(Boolean));

    if (next.length < current.length) {
      const removed = current.find(
        (inst: any) => !nextIds.has(inst.instanceId),
      );
      if (removed) {
        removeTemplateInstance(removed.instanceId);
      }
      setInputFocus(true);
      setselecttemplateCount((prev) => prev + 1);
      return;
    }

    if (next.length > current.length) {
      const added = next.find((o: any) => !o.instanceId);
      if (added) {
        addTemplateInstance(added);
      } else if (data.value && !data.value.instanceId) {
        addTemplateInstance(data.value);
      }
      setInputFocus(true);
      setselecttemplateCount((prev) => prev + 1);
      return;
    }
  };

  const reorderTemplates = (dragIndex: number, dropIndex: number) => {
    if (dragIndex === dropIndex) return;
    const reordered = [...selectedTemplatesRef.current];
    const [removed] = reordered.splice(dragIndex, 1);
    reordered.splice(dropIndex, 0, removed);

    const withTabOrder = reordered.map((inst: any, idx: number) => ({
      ...inst,
      tabOrder: idx,
    }));

    setdataset((prevDataset: any) => {
      const newDataset = { ...prevDataset };
      withTabOrder.forEach((inst: any) => {
        if (newDataset[inst.ojbKey]) {
          newDataset[inst.ojbKey] = {
            ...newDataset[inst.ojbKey],
            tabOrder: inst.tabOrder,
          };
        }
      });
      return newDataset;
    });

    setSelectedTemplates(withTabOrder);
  };

  const onTagSelect: TagPickerProps["onOptionSelect"] = (e, data) => {
    dataset["Tag"] = data.selectedOptions;
    setdataset(dataset);
    setdataset1(dataset);
    setInputFocus(true);
    setSelectCount(selectcount + 1);
  };

  const text_box_change_event = (
    event: React.ChangeEvent<HTMLInputElement>,
    data: any,
  ) => {
    const { name, value } = event.target;
    dataset[name] = value;
    setdataset(dataset);
    setdataset1(dataset);
    setSelectCount(selectcount + 1);
  };

  const text_area_change_event = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
    data: any,
  ) => {
    const { name, value } = event.target;
    dataset[name] = value;
    setdataset(dataset);
    setdataset1(dataset);
    setSelectCount(selectcount + 1);
  };

  const select_change_event = (
    event: React.ChangeEvent<HTMLSelectElement>,
    data: any,
  ) => {
    const { name, value } = event.target;
    dataset[name] = value;
    setdataset(dataset);
    setdataset1(dataset);
    setSelectCount(selectcount + 1);
  };
  const query_template = () => {
    setDisableSelectTemplate(true);
    for (let i = 0; i < selectedOptions.length; i++) {
      fetch(
        UrlConstant.QUERY_TEMPLATE_BY_ID + selectedOptions[i]["id"].toString(),
        {
          mode: "cors",
          credentials: "include",
        },
      )
        .then((res) => res.json())
        .then((result) => {
          let found = false;
          for (let j = 0; j < formdata.length; j++) {
            if (formdata[j]["id"] == result["id"]) {
              found = true;
            }
          }
          if (found == false) {
            formdata.push(result);
            dataset[result["header"]] = {};
            setformdata(formdata);
          }
          found = false;
          for (let i = 0; i < formdata.length; i++) {
            found = false;
            for (let j = 0; j < selectedOptions.length; j++) {
              if (formdata[i]["id"] == selectedOptions[j]["id"]) {
                found = true;
              }
            }
            if (found == false) {
              formdata.splice(i, 1);
            }
          }
          setOpenPopover(false);
          setformdata(formdata);
          setDisableSelectTemplate(false);
        });
    }

    // console.log$&
  };

  const save_form = () => {
    let isError = false;
    setSaveButtonLoading(true);
    // console.log$&
    // delete formdata["0"];
    fetch(UrlConstant.MANAGE_SAVE + screenname, {
      method: "post",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataset),
    }).then((res) => {
      if (res.status == 409) {
        isError = true;
      }
      res.json();

      setDisplaySaveMessage(false);
      setSaveButtonLoading(false);
      notify();
    });
  };

  const handletoggleDrawer = (action: string) => {
    setIsOpen(isOpen ? false : true);
  };

  const edit_sow = (data: any) => {
    setIsOpen(true);
  };

  const handleTagRemove = (tagToRemove: any) => {
    setSelectedOptions((prev: any) =>
      prev.filter((tag: any) => tag.id !== tagToRemove.id),
    );
  };

  const { dispatchToast } = useToastController("toast");

  const notify = () =>
    dispatchToast(
      <Toast>
        {/* <ToastTitle>Title</ToastTitle> */}
        <ToastBody>SOW added successfully. </ToastBody>
      </Toast>,
      { intent: "success" },
    );

  function extractFirstPart(input: any) {
    const parts = input.split("#");
    return parts[0].trim(); // Return the first part, trimmed of whitespace
  }

  // const handleDelete = (templateId) => {
  //     console.log("🚀 ~ file: AddSow.tsx ~ line 473 ~ handleDelete ~ templateId", templateId)

  //     setdataset((prevDataset) => {
  //         const newDataset = { ...prevDataset };

  //         // Instead of deleting, mark the entry as deleted
  //         if (newDataset[templateId]) {
  //             newDataset[templateId] = {
  //                 ...newDataset[templateId],
  //                 isDeleted: true,
  //                 deletedAt: new Date().toISOString()
  //             };
  //         }

  //         return newDataset;
  //     });
  // };

  const handleDelete = (instanceId: string) => {
    removeTemplateInstance(instanceId);
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
            <Briefcase16Regular color="black" fontSize={15} />
            Statement of work
          </BreadcrumbButton>
        </BreadcrumbItem>
        <BreadcrumbDivider />
        <BreadcrumbItem>
          <BreadcrumbButton style={{ color: "#590b8ef2" }} current>
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
                  autoFocus={inputRef}
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
                    selectedOptions={
                      selectedTemplates.map((inst: any) => ({
                        id: inst.templateId,
                        header: inst.header,
                        instanceId: inst.instanceId,
                        ojbKey: inst.ojbKey,
                      })) as any
                    }
                  >
                    <TagPickerControl>
                      <TagPickerGroup>
                        {selectedTemplates.map((instance: any) => (
                          <Tag
                            style={{ fontSize: 12 }}
                            key={instance.instanceId}
                            shape="circular"
                            media={
                              <Avatar
                                aria-hidden
                                name={instance.header}
                                color="colorful"
                              />
                            }
                            value={
                              {
                                id: instance.templateId,
                                header: instance.header,
                                instanceId: instance.instanceId,
                                ojbKey: instance.ojbKey,
                              } as any
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

              {/*
                            <div className="col-md-12">
                                <span
                                    style={{ textDecoration: "none", marginTop: 20, marginBottom: 10, display: "block", fontSize: 12 }}
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
                                                {selectedOptions.map((option: any) => (
                                                    <Tag
                                                        style={{ fontSize: 12 }}
                                                        key={option.header}
                                                        shape="circular"
                                                        media={<Avatar aria-hidden name={option.header} color="colorful" />}
                                                        value={option}
                                                    >
                                                        {option.header.replace(/_/g, " ")}
                                                    </Tag>
                                                ))}
                                            </TagPickerGroup>
                                            <TagPickerInput aria-label="Select Employees" />
                                        </TagPickerControl>
                                        <TagPickerList style={{ height: 400, fontFamily: "monospace" }}>
                                            {templateList.length > 0
                                                ? templateList.map((option: any) => (
                                                    <TagPickerOption
                                                        media={
                                                            <Avatar shape="circular" size={24} aria-hidden name={option.header} color="colorful" />
                                                        }
                                                        value={option}
                                                        key={option.header}
                                                    >
                                                        {option.header.replace(/_/g, " ")}
                                                    </TagPickerOption>
                                                ))
                                                : "No options available"}
                                        </TagPickerList>
                                    </TagPicker>
                                </Field>
                            </div> */}

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
                  onChange={(e) => text_area_change_event(e, dataset)}
                  value={dataset["statement_of_work_description"]}
                  style={{ width: "100%", fontSize: "12px !important" }}
                  size="small"
                  title="header"
                />

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
                      {selectedTemplates.map((instance: any, index: number) => {
                        const matchingFormDataItem = formdata.find(
                          (formItem: any) =>
                            String(formItem.id) === String(instance.templateId),
                        );

                        if (matchingFormDataItem) {
                          return (
                            <React.Fragment key={instance.ojbKey}>
                              <Tab
                                draggable
                                onDragStart={(e: React.DragEvent) => {
                                  e.dataTransfer.setData(
                                    "text/plain",
                                    String(index),
                                  );
                                }}
                                onDragOver={(e: React.DragEvent) => {
                                  e.preventDefault();
                                }}
                                onDrop={(e: React.DragEvent) => {
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
                                    .replace(/_/g, " ")
                                    .replace("Template", " ")}
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
                                  <XIcon fill="red" /> {/* Make the icon red */}
                                </button>
                              </Tab>
                            </React.Fragment>
                          );
                        }
                        return null; // Return null if no matching form data item
                      })}
                    </TabList>

                    {selectedTemplates.map((instance: any, index: number) => {
                      // Type guard to check if value has a TemplateId
                      if (
                        typeof dataset[instance.ojbKey] === "object" &&
                        dataset[instance.ojbKey] !== null &&
                        "TemplateId" in dataset[instance.ojbKey] &&
                        !(dataset[instance.ojbKey] as any)["isDeleted"]
                      ) {
                        const datasetItem = dataset[instance.ojbKey] as {
                          TemplateId?: number;
                          id?: number;
                        };

                        // Check if the TemplateId is defined
                        if (datasetItem.TemplateId) {
                          // Find the matching object in formdata by TemplateId
                          const matchingFormDataItem = formdata.find(
                            (formItem: any) =>
                              String(formItem.id) ===
                              String(datasetItem.TemplateId),
                          );

                          // If a matching form data item is found, render TabPanel
                          if (matchingFormDataItem) {
                            return (
                              <React.Fragment key={instance.ojbKey}>
                                <TabPanel
                                  key={`tabpanel-${instance.ojbKey}`}
                                  style={{ padding: 20 }}
                                >
                                  <NestedForm
                                    schema={matchingFormDataItem} // Pass the matched form data item as schema
                                    screenname={screenname}
                                    formvalue={dataset}
                                    formData={dataset[instance.ojbKey]}
                                    onCloseDrawer={handletoggleDrawer}
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
                  // <Tabs style={{ marginTop: 20 }}>

                  //     <TabList>
                  //         {formdata.map((item: any, index: number) => (
                  //             <Tab key={`${item.id}-${index}`}>
                  //                 {" "}
                  //                 <strong>
                  //                     <DocumentContract16Regular />
                  //                     {item.header.replace(/_/g, " ").replace("Template", " ")}
                  //                 </strong>
                  //             </Tab>
                  //         ))}
                  //     </TabList>

                  //     {formdata.map((item: any, index: number) => (

                  //         <TabPanel key={`${item.id}-${index}`} style={{ padding: 20 }}>

                  //             <NestedForm
                  //                 schema={item}
                  //                 screenname={screenname}
                  //                 formvalue={dataset}
                  //                 onCloseDrawer={handletoggleDrawer}
                  //             ></NestedForm>

                  //         </TabPanel>
                  //     ))}
                  // </Tabs>
                )}

                <Toaster toasterId={"toast"} />
                <div style={{ marginBottom: 50, marginTop: 20 }}>
                  {/* <Button style={{ marginRight: 10 }} onClick={save_form}>Save</Button> */}

                  <Button
                    className="mt-2"
                    appearance="primary"
                    shape="square"
                    disabled={saveButtonLoading}
                    onClick={save_form}
                  >
                    {saveButtonLoading ? <Spinner size="small" /> : "Save"}
                  </Button>

                  {/* <div className="row">
                                        <div className="col-6"> <pre>{JSON.stringify(dataset, null, 4)}</pre>  </div>
                                        <div className="col-6">
                                            <pre>{formdata.length}
                                                {JSON.stringify(formdata, null, 4)}</pre></div>



                                    </div> */}
                </div>
              </div>
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
              {selectcount % 2 == 0 ? (
                <TagPicker
                  size="medium"
                  appearance="outline"
                  onOptionSelect={onTagSelect}
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
                  onOptionSelect={onTagSelect}
                  selectedOptions={dataset1["Tag"]}
                >
                  <TagPickerControl>
                    <TagPickerGroup>
                      {dataset1.Tag?.map((option: any) => (
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
              {/* <Button  size="medium" icon={<DocumentData24Filled />} onClick={() => ExportToCSV_SOW(formdata)}></Button> */}
            </span>
            {/* <span style={{display:"block",marginTop:20,fontSize:12}}>
                          <strong>Delete/Archive</strong></span>
                          <span style={{ display: "block", marginLeft: "20px",marginTop:10,fontSize:12}}></span>
                          <Button  size="medium" style={{color:"#df6e6e"}} icon={<Delete24Filled />} onClick={()=>alert("TBD")}>

                          </Button> */}
          </div>
        </div>
      )}

      {/* {JSON.stringify(formdata)} */}
    </div>
  );
};
