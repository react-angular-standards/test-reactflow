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
import React, { MouseEventHandler } from "react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ActionList,
  ActionMenu,
  BranchName,
  IconButton,
  StateLabel,
} from "@primer/react";
import {
  ArchiveIcon,
  ColumnsIcon,
  PencilIcon,
  VersionsIcon,
} from "@primer/octicons-react";
import { DataTable, PageHeader } from "@primer/react/lib-esm/drafts";
import Form from "./form/form";
import NameAutocomplete from "./nameAutocomplete";
import ConfirmationDialog from "./confirmDailog";

import { UrlConstant } from "../Util/UrlConstants";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbDivider,
  BreadcrumbButton,
  Divider,
  makeStyles,
  tokens,
  Card,
  Badge,
  shorthands,
  mergeClasses,
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionPanel,
  Tag,
  InteractionTagPrimary,
  Input,
  Label,
  Switch,
  Dropdown,
  Option,
  Textarea,
  Select,
  Button,
  OverlayDrawer,
  DrawerHeader,
  DrawerHeaderTitle,
  DrawerBody,
  TagGroup,
  InteractionTag,
  useToastController,
  useId,
  Toast,
  ToastTitle,
  ToastIntent,
  CardHeader,
  Caption1,
  Field,
  Tooltip,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Spinner,
  ToastBody,
} from "@fluentui/react-components";
import { TrashIcon } from "@primer/octicons-react";

import {
  bundleIcon,
  CalendarMonth20Filled,
  CalendarMonth20Regular,
  ContentViewRegular,
  Home20Filled,
  Calendar20Regular,
  PresenceUnknown12Regular,
  Home20Regular,
  Dismiss24Regular,
  PresenceAvailable12Regular,
  Options20Regular,
} from "@fluentui/react-icons";
import { Temperature } from "@blueprintjs/icons";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import { SearchBox } from "@fluentui/react/lib/SearchBox";

import { gridColumnLookupSelector } from "@mui/x-data-grid";
import Autocomplete from "@mui/material/Autocomplete";
import { TextField } from "@mui/material";
import { stringToColour } from "../Util/utils";
import ReactFilterBox from "react-filter-box";
import { CustomAutoComplete, CustomResultProcessing } from "./Field";
import SearchComponent from "../../globalSearch";

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    rowGap: "5px",
  },
  example: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyItems: "center",
    minHeight: "96px",
    backgroundColor: tokens.colorNeutralBackground1,
  },
  container: {
    ...shorthands.gap("16px"),
    display: "flex",
    flexWrap: "wrap",
  },

  card: {
    minWidth: "280px",
    height: "fit-content",
  },

  flex: {
    ...shorthands.gap("4px"),
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },

  labels: {
    ...shorthands.gap("6px"),
  },

  footer: {
    ...shorthands.gap("12px"),
  },

  caption: {
    color: tokens.colorNeutralForeground3,
  },

  taskCheckbox: {
    display: "flex",
    alignItems: "flex-start",
  },

  grid: {
    ...shorthands.gap("16px"),
    display: "flex",
    flexDirection: "column",
  },
});

export interface IFieldType {
  UniqueID: string;
  header: string;
  prompt: string;
  hasInput: boolean;
  inputType: string;
  choices: [];
  validators: [];
  children: [];
  sponsoring_customer: string;
  UPDATED_ON?: string;
  id?: number;
  key?: string;
  display: boolean;
  description?: string;
  status?: string;
  Updated_by?: any;
  Tag?: any;
  order?: string;
  isDeleted?: boolean;
}

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
});

export const RequirementObject = (): JSX.Element => {
  const styles = useStyles();
  const CalendarMonth = bundleIcon(
    CalendarMonth20Filled,
    CalendarMonth20Regular,
  );
  const [template, setTemplate] = useState<any>({
    title: "",
    type: "object",
    properties: [],
  });
  const [addTemplate, setAddTemplate] = useState<boolean>(false);
  const [formprop, setformprop] = useState<IFieldType>(emptyfields);
  const [templateObjectList, setTemplateObjectList] = useState<any>([]);
  const [requirementObjectList, setRequirementObjectList] = useState<any>([]);
  const [requirementObjectListForSearch, setRequirementObjectListForSearch] =
    useState<any>([]);
  const [formprop1, setformprop1] = useState<IFieldType>(emptyfields);
  const [count, setCount] = useState<number>(0);
  const toasterId = useId("toaster");
  const { dispatchToast } = useToastController(toasterId);
  const [intent, setIntent] = React.useState<ToastIntent>("success");
  const [displayResult, setDisplayResult] = useState<boolean>(false);
  const [columns, setColumns] = useState<any>([]);
  const customAutoComplete = new CustomAutoComplete(
    templateObjectList,
    columns,
  );
  const [displaySaveMessage, setDisplaySaveMessage] = useState<boolean>(false);
  const [spinIndicator, setspinIndicator] = useState<boolean>(false);
  const [displaysearch, setDisplaySearch] = useState<boolean>(false);

  const onParse = (expression: any) => {
    // console.log$&
    setRequirementObjectList(
      new CustomResultProcessing(columns).process(
        templateObjectList,
        expression,
      ),
    );
  };

  React.useEffect(() => {
    const tempcol = columns;
    tempcol.push({
      columnField: "header",
      type: "selection",
      columnText: "header",
    });
    tempcol.push({ columnField: "prompt", type: "text" });
    tempcol.push({ columnField: "hasInput", type: "selection" });
    // tempcol.push({ columnField: "Updatedby", type: "selection" });
    setColumns(tempcol);
    // console.log$&
    setTemplateObjectList([]);
    fetch(UrlConstant.QUERY_TEMPLATE_OBJECT + "RequirementObject", {
      mode: "cors",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((result) => {
        let temptemplateObjectlist = [];
        temptemplateObjectlist = result;
        setTemplateObjectList(temptemplateObjectlist);
        setRequirementObjectList(temptemplateObjectlist);
        setRequirementObjectListForSearch(temptemplateObjectlist);
        setDisplayResult(true);
        setDisplaySearch(true);
      });
  }, [columns]);

  const refresh = () => {
    setRequirementObjectListForSearch([]);
    const tempcol = columns;
    tempcol.push({
      columnField: "header",
      type: "selection",
      columnText: "header",
    });
    tempcol.push({ columnField: "prompt", type: "text" });
    tempcol.push({ columnField: "hasInput", type: "selection" });
    // tempcol.push({ columnField: "Updatedby", type: "selection" });
    setColumns(tempcol);
    // console.log$&
    setTemplateObjectList([]);
    fetch(UrlConstant.QUERY_TEMPLATE_OBJECT + "RequirementObject", {
      mode: "cors",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((result) => {
        let temptemplateObjectlist = [];
        temptemplateObjectlist = result;
        setTemplateObjectList(temptemplateObjectlist);
        setRequirementObjectList(temptemplateObjectlist);
        setRequirementObjectListForSearch(temptemplateObjectlist);
        setDisplayResult(true);
        setDisplaySearch(true);
      });
  };

  const create_new_template = () => {
    if (addTemplate == true) {
      setAddTemplate(false);
    } else {
      setAddTemplate(true);
      setformprop(emptyfields);
      setformprop1(emptyfields);
      setDisplaySaveMessage(false);
    }
    setDisplaySaveMessage(false);
    setspinIndicator(false);
  };

  const add_new_field = (type: string) => {
    const field: IFieldType = emptyfields();
    template["properties"].push(field);
    setTemplate(template);
    // console.log$&
  };

  const setformtype = (name: string) => {
    const tempformprop = formprop;
    if (name == "textbox") {
      formprop.inputType = "textbox";
    }
    if (name == "textarea") {
      formprop.inputType = "textarea";
    }
    if (name == "select") {
      formprop.inputType = "select";
    }
    if (name == "multiselect") {
      formprop.inputType = "multiselect";
    }
    if (name == "date") {
      formprop.inputType = "date";
    }
    if (name == "number") {
      formprop.inputType = "number";
    }
    if (name == "autoComplete") {
      formprop.inputType = "autoComplete";
    }
    if (name == "attachments") {
      formprop.inputType = "attachments";
    }
    setformprop(formprop);
    setformprop(formprop1);
    setCount(count + 1);
  };

  const handletextchange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tempformprop: any = formprop;
    tempformprop[e.target.name] = e.target.value;
    setformprop(tempformprop);
    setformprop1(tempformprop);
    setCount(count + 1);
  };

  const switchToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target;
    const tempformprop: any = formprop;
    if (tempformprop[name] == true) {
      tempformprop[name] = false;
      tempformprop["inputType"] = "";
    } else {
      tempformprop[name] = true;
    }
    setformprop(tempformprop);
    setformprop1(tempformprop);
    setCount(count + 1);
  };

  const handletextareachange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const tempformprop: any = formprop;
    let { value } = e.target;
    if (value.slice(-1) == ",") {
      value = value + "-";
    }

    tempformprop[e.target.name] = e.target.value.split(",");
    setformprop(tempformprop);
    setformprop1(tempformprop);
    setCount(count + 1);
  };

  const edit_from_card = (data: any) => {
    const tempformprop = data;
    if (tempformprop["choices"] == undefined) {
      tempformprop["choices"] = [];
    }
    setformprop(tempformprop);
    setformprop1(tempformprop);
    setCount(count + 1);
    setAddTemplate(true);
  };

  const save_template_object = () => {
    // const isFormValid = (formprop.hasInput == true && formprop.inputType)

    // if (!isFormValid) {
    //   alert("form is invalid select Input type")
    //   return;
    // }

    setDisplaySaveMessage(false);
    setspinIndicator(true);

    console.log(
      "🚀 ~ file: Requirementobject.tsx ~ line 387 ~ RequirementObject ~ JSON.stringify(formprop)",
      JSON.stringify(formprop),
    );
    fetch(UrlConstant.MANAGE_SAVE_TEMPLATE + "RequirementObject", {
      method: "post",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formprop),
    }).then((res) => {
      fetch(UrlConstant.QUERY_TEMPLATE_OBJECT + "RequirementObject", {
        mode: "cors",
        credentials: "include",
      })
        .then((res) => res.json())
        .then((result) => {
          refresh();

          setDisplaySaveMessage(true);
          setTimeout(() => {
            setDisplaySaveMessage(false);
          }, 2000);

          setspinIndicator(false);

          // let temptemplateobjectlist = [];
          // temptemplateobjectlist = result;
          // setTemplateObjectList(temptemplateobjectlist);
          // setDisplayResult(true);
          // // console.log$&
        });
    });
  };

  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [itemIdToDelete, setItemIdToDelete] = useState(null);

  const handleDelete = (id) => {
    setItemIdToDelete(id);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setLoading(false);
    setItemIdToDelete(null);
  };

  const handleConfirmDelete = () => {
    if (itemIdToDelete !== null) {
      setLoading(true);
      delete_row(itemIdToDelete);
    }
  };

  const delete_row = (id) => {
    fetch(UrlConstant.DELETE_SAVE_TEMPLATE + "RequirementObject/" + id, {
      mode: "cors",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((result) => {
        // Refresh the list or handle the result as needed
        refresh();
        handleCloseDialog();
      })
      .catch((error) => {
        console.error("Error deleting item:", error);
        handleCloseDialog();
      });
  };

  const notify = () =>
    dispatchToast(
      <Toast>
        <ToastTitle>Title</ToastTitle>
        <ToastBody subtitle="Subtitle">
          Requirement added successfully.{" "}
        </ToastBody>
      </Toast>,
      { intent: "success" },
    );

  const FileAttachmentInput = () => {
    const [selectedFile, setSelectedFile] = useState(null);

    const handleFileChange = (event) => {
      setSelectedFile(event.target.files[0]);
    };

    return (
      <div className="container">
        <div className="form-group">
          {/* <label htmlFor="fileInput">Select File:</label> */}
          <input
            disabled
            type="file"
            className="form-control"
            id="fileInput"
            onChange={handleFileChange}
          />
        </div>
        {selectedFile && <p>Selected file: {selectedFile.name}</p>}
      </div>
    );
  };

  // const delete_row = (id: any) => {
  //   fetch(UrlConstant.DELETE_SAVE_TEMPLATE + "RequirementObject/" + id, {
  //     mode: "cors",
  //     credentials: "include",
  //   })
  //     .then((res) => res.json())
  //     .then((result) => {
  //       // setTemplateObjectList(result);
  //       refresh();
  //     });
  // };

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
          <BreadcrumbButton style={{ color: "#590b8ef2" }} current>
            <ContentViewRegular color="black" fontSize={15} />
            Requirement
          </BreadcrumbButton>
        </BreadcrumbItem>
      </Breadcrumb>
      {/* <header style={{ width: "100%" }}>
        <h6 style={{ textDecoration: "none", marginBottom: 20 }}>
          <ContentViewRegular color="black" fontSize={20} />
          <b>Requirement </b>
        </h6>

      </header> */}

      <Button
        onClick={create_new_template}
        size="medium"
        appearance="outline"
        icon={<CalendarMonth />}
      >
        ADD REQUIREMENT
      </Button>
      <div className="row">
        <div className="row mg-t-20">
          <SearchComponent
            data={requirementObjectListForSearch}
            setSearchResults={setRequirementObjectList}
          />

          {/* <div style={{ paddingTop: 10 }}>
            {displaysearch && (
              <ReactFilterBox
                autoCompleteHandler={customAutoComplete}
                data={templateObjectList}
                options={columns}
                onParseOk={onParse.bind(this)}
              />
            )}
          </div> */}
          <ActionList>
            {requirementObjectList.map((item1: any) => (
              <ActionList.Item
                key={item1.id}
                style={{ borderBottom: "1px solid #e6e6e6", borderRadius: 0 }}
              >
                <ActionList.LeadingVisual>
                  <VersionsIcon size={16} />
                </ActionList.LeadingVisual>
                {/* <Link
                  style={{ color: "black", fontWeight: "bold" }}
                  onClick={() => edit_from_card(item1)}
                  to={item1.link}
                >
                </Link> */}
                {item1.header.replace(/_/g, " ")}

                <ActionList.Description variant="block">
                  <span style={{ width: "90%", display: "block" }}>
                    {item1.prompt ? item1.prompt : "No prompt available"}
                  </span>
                  <div style={{ margin: 5 }}></div>
                </ActionList.Description>
                <ActionList.TrailingVisual>
                  <Link
                    onClick={() => edit_from_card(item1)}
                    style={{
                      marginRight: 8,
                      textDecoration: "none",
                      color: "#828282",
                    }}
                    to={undefined}
                  >
                    <PencilIcon size={18} fill="#28a745" /> {/* Green color */}
                  </Link>

                  <Link
                    onClick={() => handleDelete(item1.id)}
                    style={{
                      marginRight: 8,
                      textDecoration: "none",
                      color: "#828282",
                    }}
                    to={undefined}
                  >
                    <TrashIcon fill="#dc3545" size={18} />
                  </Link>
                </ActionList.TrailingVisual>
              </ActionList.Item>
            ))}
          </ActionList>

          {/* <DataTable
                        aria-labelledby="repositories"
                        aria-describedby="repositories-subtitle"
                        data={templateObjectList}
                        columns={columns}
                        initialSortColumn="header" /> */}
        </div>

        <OverlayDrawer
          position="end"
          open={addTemplate}
          modalType="modal"
          size={"large"}
        >
          <DrawerHeader>
            <DrawerHeaderTitle
              action={
                <Button
                  appearance="subtle"
                  aria-label="Close"
                  icon={<Dismiss24Regular />}
                  onClick={() => create_new_template()}
                />
              }
            >
              Add Requirement
            </DrawerHeaderTitle>
          </DrawerHeader>

          <DrawerBody>
            {addTemplate == true && (
              <div className="row">
                <div className="col-md-4"></div>
                <div className="row">
                  <div className="col-md-6 mt-4">
                    <Card
                      appearance="outline"
                      style={{ background: "#fffff8" }}
                      className="mb-4"
                    >
                      <Label size="small" weight="semibold" color="brand">
                        Header
                      </Label>
                      <Input
                        name="header"
                        size="small"
                        title="header"
                        value={formprop.header}
                        onChange={(e) => handletextchange(e)}
                      />
                      <Label size="small">Prompt</Label>
                      <Input
                        name="prompt"
                        size="small"
                        title="prompt"
                        value={formprop.prompt}
                        onChange={(e) => handletextchange(e)}
                      />
                      <Switch
                        name="hasInput"
                        label="has input?"
                        checked={formprop.hasInput}
                        onChange={(e) => switchToggle(e)}
                      />

                      {formprop.hasInput == true && (
                        <>
                          <Label size="small">Input Type</Label>
                          <TagGroup aria-label="Simple tag group with InteractionTag">
                            <InteractionTag
                              appearance={
                                formprop.inputType == "textbox"
                                  ? "brand"
                                  : "outline"
                              }
                            >
                              <InteractionTagPrimary
                                onClick={() => setformtype("textbox")}
                              >
                                <Label size="small" weight="semibold">
                                  Text
                                </Label>
                              </InteractionTagPrimary>
                            </InteractionTag>
                            <InteractionTag
                              appearance={
                                formprop.inputType == "textarea"
                                  ? "brand"
                                  : "outline"
                              }
                            >
                              <InteractionTagPrimary
                                onClick={() => setformtype("textarea")}
                              >
                                <Label size="small" weight="semibold">
                                  Text : Multiple
                                </Label>
                              </InteractionTagPrimary>
                            </InteractionTag>
                            <InteractionTag
                              appearance={
                                formprop.inputType == "select"
                                  ? "brand"
                                  : "outline"
                              }
                            >
                              <InteractionTagPrimary
                                onClick={() => setformtype("select")}
                              >
                                <Label size="small" weight="semibold">
                                  Option
                                </Label>
                              </InteractionTagPrimary>
                            </InteractionTag>
                            <InteractionTag
                              appearance={
                                formprop.inputType == "multiselect"
                                  ? "brand"
                                  : "outline"
                              }
                            >
                              <InteractionTagPrimary
                                onClick={() => setformtype("multiselect")}
                              >
                                <Label size="small" weight="semibold">
                                  Option : Multiple
                                </Label>
                              </InteractionTagPrimary>
                            </InteractionTag>
                          </TagGroup>
                          <div className="row">
                            <TagGroup>
                              <InteractionTag
                                appearance={
                                  formprop.inputType == "date"
                                    ? "brand"
                                    : "outline"
                                }
                              >
                                <InteractionTagPrimary
                                  onClick={() => setformtype("date")}
                                >
                                  <Label size="small" weight="semibold">
                                    Date
                                  </Label>
                                </InteractionTagPrimary>
                              </InteractionTag>
                              <InteractionTag
                                appearance={
                                  formprop.inputType == "number"
                                    ? "brand"
                                    : "outline"
                                }
                              >
                                <InteractionTagPrimary
                                  onClick={() => setformtype("number")}
                                >
                                  <Label size="small" weight="semibold">
                                    Number
                                  </Label>
                                </InteractionTagPrimary>
                              </InteractionTag>
                              <InteractionTag
                                appearance={
                                  formprop.inputType == "autoComplete"
                                    ? "brand"
                                    : "outline"
                                }
                              >
                                <InteractionTagPrimary
                                  onClick={() => setformtype("autoComplete")}
                                >
                                  <Label size="small" weight="semibold">
                                    Name
                                  </Label>
                                </InteractionTagPrimary>
                              </InteractionTag>
                              <InteractionTag
                                appearance={
                                  formprop.inputType == "attachments"
                                    ? "brand"
                                    : "outline"
                                }
                              >
                                <InteractionTagPrimary
                                  onClick={() => setformtype("attachments")}
                                >
                                  <Label size="small" weight="semibold">
                                    Attachments
                                  </Label>
                                </InteractionTagPrimary>
                              </InteractionTag>
                            </TagGroup>
                          </div>

                          {(formprop.inputType == "multiselect" ||
                            formprop.inputType == "select") && (
                            <Textarea
                              name="choices"
                              onChange={(e) => handletextareachange(e)}
                              value={formprop.choices.toString()}
                              size="small"
                            />
                          )}
                          {(formprop.inputType == "multiselect" ||
                            formprop.inputType == "select") && (
                            <Badge
                              color="brand"
                              shape="rounded"
                              appearance="tint"
                            >
                              enter options separated by comma ( , )
                            </Badge>
                          )}
                        </>
                      )}
                    </Card>

                    {displaySaveMessage && (
                      <MessageBar
                        key={intent}
                        intent={intent}
                        style={{ marginTop: 10 }}
                      >
                        <MessageBarBody>
                          <MessageBarTitle>
                            Requirement added successfully.{" "}
                          </MessageBarTitle>
                        </MessageBarBody>
                      </MessageBar>
                    )}

                    {/* <Button
                      onClick={save_template_object}
                      style={{ width: 150, marginTop: 20 }}
                      appearance="primary"
                      icon={<Home20Regular />}
                    >
                      Save
                    </Button> */}

                    <Button
                      className="m-1 "
                      appearance="primary"
                      shape="square"
                      disabled={spinIndicator}
                      onClick={save_template_object}
                    >
                      {spinIndicator ? <Spinner size="small" /> : "Save"}
                    </Button>

                    <Button
                      onClick={() => create_new_template()}
                      className="m-1"
                      appearance="outline"
                      shape="square"
                    >
                      Close
                    </Button>
                  </div>
                  <div className="col-md-6">
                    <Card
                      appearance="outline"
                      className="mb-4 mt-4"
                      style={{ background: "#fffff8" }}
                    >
                      <Tabs>
                        <TabList>
                          <Tab>UI</Tab>
                          {/* <Tab>Json</Tab> */}
                        </TabList>
                        <TabPanel>
                          <Card appearance="subtle">
                            <Label style={{ fontStyle: "oblique" }}>
                              <strong>{formprop.header}</strong>
                            </Label>
                            <div
                              style={{
                                background: "brown",
                                width: "100%",
                                height: "1px",
                              }}
                            ></div>
                            <Label size="small">
                              <strong>{formprop.prompt}</strong>
                            </Label>
                            {formprop.inputType == "textbox" && <Input />}
                            {formprop.inputType == "autoComplete" && (
                              <NameAutocomplete />
                            )}
                            {formprop.inputType == "attachments" && (
                              <FileAttachmentInput />
                            )}
                            {formprop.inputType == "date" && (
                              <Input type="date" />
                            )}
                            {formprop.inputType == "number" && (
                              <Input type="number" />
                            )}
                            {formprop.inputType == "textarea" && <Textarea />}
                            {formprop.inputType == "select" && (
                              <Dropdown multiselect={false}>
                                {formprop.choices.map((option) => (
                                  <Option
                                    key={option}
                                    disabled={option === "Ferret"}
                                  >
                                    {option}
                                  </Option>
                                ))}
                              </Dropdown>
                            )}
                            {formprop.inputType == "multiselect" && (
                              <Dropdown multiselect={true}>
                                {formprop.choices.map((option) => (
                                  <Option
                                    key={option}
                                    disabled={option === "Ferret"}
                                  >
                                    {option}
                                  </Option>
                                ))}
                              </Dropdown>
                            )}
                          </Card>
                        </TabPanel>
                        {/* <TabPanel>
                          <div style={{ background: "black", margin: 10, padding: 10, color: "white" }}>
                            <pre>{JSON.stringify(JSON.parse(JSON.stringify(formprop)), null, 2)}</pre>
                          </div>
                        </TabPanel> */}
                      </Tabs>
                    </Card>
                  </div>
                </div>
              </div>
            )}
          </DrawerBody>
        </OverlayDrawer>
      </div>

      {/* Confirmation dialog */}
      <ConfirmationDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmDelete}
        loading={loading}
      />
    </div>
  );
};
