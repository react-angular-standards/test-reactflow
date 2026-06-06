// @ts-nocheck
/**
 * @file ACME Application Header Bar
 * @author Gopinath Rajgopal <Gopinath.Rajagopal2@company.com>
 * @copyright
 *   Company ,  and/or 
 *     Copyright (c) 2023 The Company Company
 *     Unpublished Work - All Rights Reserved
 *   Third Party Disclosure Requires Written Approval
 */

import {
  XIcon
} from "@primer/octicons-react";
import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  FormGroup,
  InputGroup,
  Intent,
  HTMLSelect,
  MenuItem,
  Checkbox,
  Collapse,
  Radio,
} from "@blueprintjs/core";

import React from "react";
import { useState } from "react";
import { MultiSelect } from "@blueprintjs/select";
import { Icon } from "@blueprintjs/core";
import "react-tabs/style/react-tabs.css";
import { NewObject, Edit, FilterList, Add } from "@blueprintjs/icons";
import Autocomplete from "@mui/material/Autocomplete";
import { AddSquareMultiple24Filled } from "@fluentui/react-icons";
import { DialogContent, Spinner } from "@fluentui/react-components";
import TextField from "@mui/material/TextField";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import ReactHierarchy from "../HierarchyNode/ReactHierarchy";
import "../HierarchyNode/HierarchyNode.scss";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { ConfigurationReportPDF } from "./ConfigurationReportPDF";
import * as XLSX from "xlsx";
import { FormControlLabel, IconButton, Stack, Typography } from "@mui/material";
// import CloseIcon from "@mui/icons-material/Close";
import { UrlConstant } from "../Util/UrlConstants";
import { getSpecialRelationQuery } from "../../services";
import { BenchConfigEditProps, BenchConfigurationEditDialog } from "./BenchConfigEditDialog";
import { getOptionsDisplay, nodeLabelDisplay, sortAllArrayPropertyRecurcive, sortDropDownListNode, sortLabelNode, INode } from "../Util/utils";

export const Configuration = (): JSX.Element => {
  const [searchResult, setSearchResult] = useState<INode[]>([]);
  const [currentNode, setCurrrentNode] = useState<INode | undefined>(undefined);
  const [benchlist, setbenchlist] = useState<any>([]);
  const [position, setPositionlist] = useState<any>([]);
  const [benchName, setBenchName] = useState<any>("");
  const [version, setVersion] = useState<any>("");
  const [relationlist, setRelationList] = useState<any>([]);
  const [relation, setRelation] = useState("");
  const [benchConfigList, setBenchConfigList] = useState<any>([]);
  const [dialogOpen, setDialogOpen] = useState<boolean>();
  const [versionSpin, setVersionSpin] = useState<boolean>(false);
  const [hierarchySpinner, setHierarchySpinner] = useState<boolean>(false);
  const [updateLoader, setUpdateLoader] = useState<any>("");
  const [selectedObj, setSelectedObj] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [availableLookup, setAvailableLookup] = useState<any>([]);
  const [availableLookupElementNumber, setAvailableLookupElementNumber] = useState<any>([]);
  const [count, setCount] = useState<number>(0);
  const [requiredFields, setRequiredFields] = useState<any>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isReadyFinder, setIsReadyFinder] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isCheckOpen, setIsCheckOpen] = useState(false);
  const [allElementList, setAllElementList] = useState<any[]>([]);
  const [allComponentList, setAllComponentList] = useState<any[]>([]);
  const [allSoftwareList, setAllSoftwareList] = useState<any[]>([]);
  const [ignoreAllElements, setIgnoreAllElements] = useState(false);
  const [ignoreAllComponent, setIgnoreAllComponent] = useState(false);
  const [ignoreAllSoftware, setIgnoreAllSoftware] = useState(false);
  const [ignoreElements, setIgnoreElements] = useState<any[]>([]);
  const [ignoreComponent, setIgnoreComponent] = useState<any[]>([]);
  const [ignoreSoftware, setIgnoreSoftware] = useState<any[]>([]);
  const [currentReport, setCurrentReport] = useState<any>(null);
  const [currentBench, setCurrentBench] = useState<any>("");
  const [formData, setFormData] = useState<any>({});
  const [intentColour, setIntentColour] = useState<Intent | undefined>();
  const [reportType, setReportType] = useState("pdf");
  const [schema, setSchema] = useState<any>({});
  const [localValues, setLocalValues] = useState<{ [key: string]: string }>({});
  const [openDialog, setOpenDialog] = useState(false);
  const [massage, setMassage] = useState<any>(false);
  const [isExpanded, setIsExpanded] = useState(true);

  let admin_name: any = localStorage.getItem("userinfo")?.toString();
  admin_name = JSON.parse(admin_name).NAME;

  const userinfo: any = localStorage.getItem("userinfo")?.toString();
  const role = JSON.parse(userinfo).ROLES;

  const initialFilters = {
    element: false,
    component: false,
    software: false,
    serial: false,
    ignoreElements: [],
    ignoreComponent: [],
    ignoreSoftware: [],
    ignoreSerial: [],
  };
  const [, setFilterSettings] = useState(initialFilters);


  const handleDialogOpen = () => {
    setOpenDialog(true);
  };
  const handleToggle = () => {
    setIsExpanded((prevExpanded) => !prevExpanded);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const generateReport = (reportType: any) => {
    // console.log$&
    exportReportToExcel();
  };

  const createFinder = (data: any) => {
    fetch(UrlConstant.ADD_FINDER, {
      method: "post",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((result) => {
        // console.log$&
      });
  };

  const addToFinder = (data: any) => {
    let urls: any = "";
    if (data["VERSION"] != undefined && data["VERSION"] != "Bench") {
      urls = UrlConstant.QUERY_HIERARCHY_BENCH + `${data["BENCH_ID"]}?rel_type=${data["VERSION"]}`;
    } else {
      urls = UrlConstant.QUERY_HIERARCHY_BENCH + data["BENCH_ID"];
    }
    fetch(urls, {
      mode: "cors",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((result) => {
        const datas = { ...data, ...result[0] };
        createFinder(datas);
        // console.log$&
      });
  };




  const getBenchConfigVersion = (bench_id: any) => {
    if (bench_id === undefined || bench_id === null || bench_id === "")
      return;
    setVersionSpin(true);
    fetch(UrlConstant.QUERY_RELATION + bench_id, {
      mode: "cors",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((result: any) => {
        if (result.length > 0) {
          const uniqueData = new Set(result);
          let uniqueArray = Array.from(uniqueData) as string[];
          uniqueArray = uniqueArray.filter((item: any) => item !== null || item !== undefined);
          uniqueArray = uniqueArray.sort((a: string, b: string) => {
            return a.toLowerCase().localeCompare(b.toLowerCase());
          });
          setRelationList(uniqueArray);
        } else {
          setRelationList([]);
        }
        setVersionSpin(false);
      });
  };

  const handleInputChange = (key: any, value: any) => {
    // Update the localValues state when the input changes
    setLocalValues({ ...localValues, [key]: value });
  };

  const handletextchange = (e: React.ChangeEvent<HTMLInputElement>, oneKey: any) => {
    const temp_form_data: any = formData;
    const { name, value } = e.currentTarget;
    // console.log$&

    if (oneKey != "") {
      if (temp_form_data[oneKey] == undefined) {
        temp_form_data[oneKey] = {};
      }
      temp_form_data[oneKey][name] = value;
    } else {
      temp_form_data[name] = value;
    }
    // console.log$&

    setFormData(temp_form_data);
    setIsReadyFinder(true);
  };

  const validateFormField = (e: any, schemaItem: any) => {
    fetch(UrlConstant.VALIDATE_FINDER + e.target.name, {
      method: "post",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then((result) => {
        if (result == true) {
          schemaItem["error"] = false;
          setIntentColour(Intent.DANGER);
        } else {
          schemaItem["error"] = true;
          setIntentColour(Intent.DANGER);
        }
      });
  };

  const handleCheckboxEvent = (elementName: any, oneKey: any) => {
    // console.log$&
    const temp_form_data: any = formData;
    if (oneKey != "") {
      if (temp_form_data[oneKey] == undefined) {
        temp_form_data[oneKey] = {};
      }
      temp_form_data[oneKey][elementName] =
        temp_form_data[oneKey][elementName] == undefined || temp_form_data[oneKey][elementName] == "false"
          ? "true"
          : "false";
    } else {
      temp_form_data[elementName] =
        temp_form_data[elementName] == undefined || temp_form_data[elementName] == "false" ? "true" : "false";
    }
    // console.log$&
    setFormData(temp_form_data);
  };

  const handleComponentPositionSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (event.target.value != "-1") {
      setSelectedObj((prevState: any) => ({
        ...prevState,
        Component_Position: [{ "id": event.target.value, "Position": event.target.value }],

      }));
    } else {
      setSelectedObj((prevState: any) => ({
        ...prevState,
        Component_Position: [{}],

      }));
    }


    console.log("setSelectedObj", selectedObj)

  };

  const generate_form = (schema: any, element: any, formvalue: any, increment: number, versionList: any) => {
    // if (element != "") {
    //   formData[element] = {};
    // }
    return (
      <>
        <div
          className="row"
          style={{
            padding: 10,
            margin: "8px",
            border: "1px solid #a2c677",
            background: "#f5f5dc30",
          }}
        >
          {Object.keys(schema).map((oneKey: any, i) => {
            return (
              <div key={i} className="col-md-3">
                {schema[oneKey]["type"] == "string" &&
                  schema[oneKey]["enum"] == undefined &&
                  schema[oneKey]["maxLength"] < 70 && (
                    <FormGroup
                      helperText={
                        localValues[oneKey] == ""
                          ? intentColour != undefined
                            ? requiredFields.includes(schema[oneKey]["name"])
                              ? schema[oneKey]["message"].split(":").pop()
                              : ""
                            : ""
                          : ""
                      }
                      inline={false}
                      intent={
                        intentColour != undefined
                          ? requiredFields.includes(schema[oneKey]["name"])
                            ? intentColour
                            : Intent.SUCCESS
                          : Intent.SUCCESS
                      }
                      label={schema[oneKey]["description"]}
                      labelFor="text-input"
                      labelInfo={requiredFields.includes(schema[oneKey]["name"]) ? "*" : ""}
                    >
                      <InputGroup
                        maxLength={schema[oneKey]["maxLength"]}
                        name={schema[oneKey]["name"]}
                        type="text"
                        id={`text-input-${oneKey}`}
                        value={formData[oneKey] != undefined ? formData[oneKey] : ""}
                        disabled={false}
                        onChange={(event: any) => {
                          const newValue = event.target.value;
                          handleInputChange(oneKey, newValue); // Update localValues state
                          handletextchange(event, element);
                        }}
                        onBlur={(event) => validateFormField(event, schema[oneKey])}
                      />
                    </FormGroup>
                  )}
                {schema[oneKey]["type"] == "string" &&
                  schema[oneKey]["enum"] == undefined &&
                  schema[oneKey]["maxLength"] >= 70 && (
                    <FormGroup
                      inline={false}
                      intent={Intent.SUCCESS}
                      label={schema[oneKey]["description"]}
                      labelFor="text-input"
                    >
                      <textarea
                        className="bp5-input bp5-small bp5-fill"
                        name={schema[oneKey]["name"]}
                        id="text-input"
                        value={localValues[oneKey] ? localValues[oneKey] : formvalue[oneKey] || ""}
                        disabled={false}
                        onChange={(event: any) => {
                          const newValue = event.target.value;
                          handleInputChange(oneKey, newValue); // Update localValues state
                          handletextchange(event, element);
                        }}
                      />
                    </FormGroup>
                  )}
                {schema[oneKey]["type"] == "integer" && schema[oneKey]["enum"] == undefined && (
                  <FormGroup
                    inline={false}
                    intent={Intent.SUCCESS}
                    label={schema[oneKey]["description"]}
                    labelFor="text-input"
                    labelInfo={requiredFields.includes(schema[oneKey]["name"]) ? "*" : ""}
                  >
                    <InputGroup
                      name={schema[oneKey]["name"]}
                      type="number"
                      id="text-input"
                      disabled={false}
                      value={localValues[oneKey] ? localValues[oneKey] : formvalue[oneKey] || ""}
                      intent={Intent.SUCCESS}
                      onChange={(event: any) => {
                        const newValue = event.target.value;
                        handleInputChange(oneKey, newValue); // Update localValues state
                        handletextchange(event, element);
                      }}
                    />
                  </FormGroup>
                )}
                {schema[oneKey]["enum"] != undefined && schema[oneKey]["type"] != "boolean" && (
                  <FormGroup
                    inline={false}
                    intent={Intent.SUCCESS}
                    label={schema[oneKey]["description"]}
                    labelFor="text-input"
                    labelInfo={requiredFields.includes(schema[oneKey]["name"]) ? "*" : ""}
                  >
                    <HTMLSelect
                      fill={true}
                      value={formData[oneKey] != undefined ? formData[oneKey] : localValues[oneKey]}
                      name={schema[oneKey]["name"]}
                      options={formData[oneKey] != undefined ? [formData[oneKey]] : schema[oneKey]["enum"]}
                      onChange={(event: any) => {
                        const newValue = event.target.value;
                        handleInputChange(oneKey, newValue); // Update localValues state
                        handletextchange(event, element);
                      }}
                      onBlur={(event) => validateFormField(event, schema[oneKey])}
                    />
                  </FormGroup>
                )}

                {schema[oneKey]["type"] == "dateTime" && (
                  <FormGroup
                    inline={false}
                    intent={Intent.SUCCESS}
                    label={schema[oneKey]["description"]}
                    labelFor="text-input"
                    labelInfo={requiredFields.includes(schema[oneKey]["name"]) ? "*" : ""}
                  >
                    <InputGroup
                      name={schema[oneKey]["name"]}
                      type="Date"
                      id="text-input"
                      value={localValues[oneKey] ? localValues[oneKey] : formvalue[oneKey] || ""}
                      disabled={false}
                      onChange={(event: any) => {
                        const newValue = event.target.value;
                        handleInputChange(oneKey, newValue); // Update localValues state
                        handletextchange(event, element);
                      }}
                      onBlur={(event) => validateFormField(event, schema[oneKey])}
                    />
                  </FormGroup>
                )}
                {schema[oneKey]["type"] == "boolean" && (
                  <FormGroup
                    inline={false}
                    intent={Intent.SUCCESS}
                    label={schema[oneKey]["description"]}
                    labelFor="text-input"
                    labelInfo={requiredFields.includes(schema[oneKey]["name"]) ? "*" : ""}
                  >
                    <Checkbox
                      name={schema[oneKey]["name"]}
                      checked={
                        formvalue != undefined && formvalue[oneKey] && formvalue["edit"] == "true"
                          ? localValues[oneKey] != undefined
                            ? localValues[oneKey]
                            : JSON.parse(formvalue != undefined && formvalue[oneKey])
                          : JSON.parse(formvalue[oneKey] != undefined && formvalue[oneKey])
                      }
                      onClick={() => {
                        const newValue = localValues[oneKey];
                        handleInputChange(oneKey, newValue); // Update localValues state
                        handleCheckboxEvent(schema[oneKey]["name"], element);
                      }}
                    ></Checkbox>
                  </FormGroup>
                )}
              </div>
            );
          })}
          <div className="col-md-3">
            {versionList.length > 0 ? (
              <FormGroup inline={false} intent={Intent.SUCCESS} label={"Version"} labelFor="text-input" labelInfo={"*"}>
                <HTMLSelect
                  fill={true}
                  name={"VERSION"}
                  options={[{ label: "Please select a version", value: "" }, ...versionList]}
                  defaultChecked={true}
                  onChange={(event: any) => {
                    const newValue = event.target.value;
                    handleInputChange("Version", newValue); // Update localValues state
                    handletextchange(event, "");
                  }}
                />
              </FormGroup>
            ) : (
              <div>
                <h6>Loading Version...</h6>
              </div>
            )}
          </div>
        </div>
      </>
    );
  };

  const handleInputVersion = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.currentTarget;
    if (!/^\d/.test(value) && !/\s/.test(value)) {
      setMassage(false);
      setVersion(value);
    } else {
      setMassage(true);
    }
  };


  const isValidId = (value: any) => typeof value === "string" && /^[a-zA-Z0-9_-]+$/.test(value);
  const isValidRelation = (value: any) =>
    typeof value === "string" && ["Bench", "Child", "Parent"].includes(value);

  const query_data = (id: any, relation: any) => {
    if (id === undefined || id === null || id === "") return;

    if (!isValidId(id)) return;
    if (relation && !isValidRelation(relation)) return;

    let urls = "";

    if (relation !== "" && relation !== "Bench") {
      urls = `${UrlConstant.QUERY_HIERARCHY_BENCH}${encodeURIComponent(id)}?rel_type=${encodeURIComponent(relation)}`;
    } else {
      urls = `${UrlConstant.QUERY_HIERARCHY_BENCH}${encodeURIComponent(id)}`;
    }
    setHierarchySpinner(true);
    fetch(urls, {
      mode: "cors",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((result: any) => {
        if (result[0]) {
          sortAllArrayPropertyRecurcive(result[0], sortLabelNode);
          result[0]["Bench"] = result[0]["NAME"];
          setBenchName(result[0]["NAME"]);
          setSearchResult(result);
          setUpdateLoader("");
          // console.log$&
          if (relation != "") {
            setBenchConfigList(result[0]);
          }
          setCurrentReport(<ConfigurationReportPDF data={result[0]} filters={initialFilters} />);
          if (result[0] && result[0].Element) {
            let currentElementsList: any[] = [];
            let currentComponentList: any[] = [];
            let currentSoftwareList: any[] = [];
            result[0].Element.map((el: any) => {
              currentElementsList.push({
                id: el.id,
                name: el.NAME,
              });
              if (el.Component) {
                el.Component.map((comp: any) => {
                  currentComponentList.push({
                    id: comp.id,
                    name: comp.Part_Name,
                  });
                  if (comp.Serial_Number != undefined && comp.Serial_Number[0].Software != undefined && comp.Serial_Number[0].Software) {
                    comp.Serial_Number.map((serial_numbr: any) => {
                      serial_numbr.Software.map((sw: any) => {
                        currentSoftwareList.push({
                          id: sw.id,
                          name: sw.SW_TITLE,
                        });
                      });
                    });
                  }
                });
              }
            });

            currentElementsList = currentElementsList.filter(
              (item, index) => currentElementsList.indexOf(item) === index
            );
            currentComponentList = currentComponentList.filter(
              (item, index) => currentComponentList.indexOf(item) === index
            );
            // currentSoftwareList = currentSoftwareList.filter(
            //   (item, index) => currentSoftwareList.indexOf(item) === index
            // );
            currentSoftwareList = Array.from(new Set(currentSoftwareList.map(obj => JSON.stringify(obj))))
              .map(json => JSON.parse(json))

            setAllElementList(currentElementsList);
            setAllComponentList(currentComponentList);
            setAllSoftwareList(currentSoftwareList);
          }
        }
      })
      .finally(() => {
        setHierarchySpinner(false);
      });
  };

  const handleselectchange = (e: any) => {
    setLocalValues({});
    setRelationList([]);
    setFormData({});
    const { value } = e.currentTarget;
    if (value !== "") {
      setCurrentBench(value);
      getBenchConfigVersion(value);
      query_data(value, "");
      let bench = "";
      if (e.nativeEvent != undefined) {
        const index = e.nativeEvent.target.selectedIndex;
        bench = e.nativeEvent.target[index].innerText
      } else {
        const { label } = e.currentTarget;
        if (label != undefined) {
          bench = label.replace(/\s/g, "");
          bench = label.replace("-", "");
        }

      }

      if (bench != "" && bench != undefined && bench != null) {
        bench = bench.replace(/\s/g, "");
        bench = bench.replace("-", "");
        const updatedRelation = "Baseline_" + bench;
        setRelation(updatedRelation)
      }
    } else {
      setVersionSpin(false);

    }


  };

  const exportReportToExcel = () => {
    const reportData: any[][] = [];
    if (searchResult) {
      searchResult[0].Element &&
        !ignoreAllElements &&
        searchResult[0].Element.map((ele: any) => {
          if (!ignoreElements.map((a: any) => a.name).includes(ele.NAME)) {
            if (ele.Component && ele.Component.length > 0 && !ignoreAllComponent) {
              ele.Component.map((comp: any) => {
                if (!ignoreComponent.map((a: any) => a.name).includes(comp.Part_Name)) {
                  if (comp.Serial_Number && comp.Serial_Number.length > 0) {
                    comp.Serial_Number.map((serial_num: any) => {

                      if (serial_num.Software && serial_num.Software.length > 0 && !ignoreAllSoftware) {
                        serial_num.Software.map((sw: any) => {
                          if (!ignoreSoftware.map((a: any) => a.name).includes(sw.SW_TITLE)) {
                            reportData.push([
                              ele.NAME,
                              comp.Part_Name,
                              comp.Company_Part_Number,
                              serial_num.Part_Status != undefined && serial_num.Part_Status != "" ? serial_num.SERIAL_NUMBER + "-" + serial_num.Part_Status : serial_num.SERIAL_NUMBER,
                              sw.SW_TITLE,
                              sw.SOFTWARE_PART_NUMBER,
                            ]);
                          }
                        });
                      } else {
                        reportData.push([ele.NAME, comp.Part_Name, comp.Company_Part_Number,
                        serial_num.Part_Status != undefined && serial_num.Part_Status != "" ? serial_num.SERIAL_NUMBER + "-" + serial_num.Part_Status : serial_num.SERIAL_NUMBER,
                        ]);
                      }
                    });

                  }
                }
              });
            } else {
              reportData.push([ele.NAME]);
            }
          }
        });
    }
    const data = [
      ["Element Name", "Component Part Name", "Component Company Part Number", "Serial Number", "Software Title", "Software Part Number"],
      ...reportData,
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "ConfigurationReport.xlsx";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlerelationchange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.currentTarget;
    setRelation(value);
    query_data(currentBench, value);
  };

  const addBenchConfiguration = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.currentTarget;

    setIsReady(true);
    let urls = "";
    if (relation != "" && relation != "Bench" && value == currentBench) {
      urls = UrlConstant.QUERY_HIERARCHY_BENCH + `${value}?rel_type=${relation}`;
    } else {
      urls = UrlConstant.QUERY_HIERARCHY_BENCH + value;
    }
    fetch(urls, {
      mode: "cors",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((result) => {
        // console.log$&
        const sortedResult = sortDropDownListNode(result[0]);
        setBenchConfigList(sortedResult);
        setIsReady(false);
      });
  };

  const addNewBenchConfigRelation = (data: any) => {
    fetch(UrlConstant.MANAGE_ASSOCIATE + version, {
      method: "post",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then(() => {
        setIsConfigOpen(false);
        getBenchConfigVersion(data.id);
      });
  };

  const updateRecord = () => {
    // console.log$&
    let updateUrl = "";
    if (relation !== "") {
      updateUrl = UrlConstant.MANAGE_ASSOCIATE + relation;
    } else {
      const updatedRelation = "Baseline_" + benchName.replace(/\s/g, "");
      // setRelation(updatedRelation);
      updateUrl = UrlConstant.MANAGE_ASSOCIATE + updatedRelation;
    }

    fetch(updateUrl, {
      method: "post",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(selectedObj),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Network response was not ok");
        }
        res.json();
      })
      .then(() => {
        setDialogOpen(false);
        if (relation != "") {
          query_data(currentBench, relation);
        } else {
          query_data(currentBench, "");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const handle_dialog_open = (module: any, node: any) => {
    const id = node.id;
    setCurrrentNode(node);
    setUpdateLoader(node.uniqueId);
    setIsLoading(true);
    // console.log$&
    let urls = "";
    if (dialogOpen) {
      setDialogOpen(false);
    } else {
      if (relation != "" && relation != "Bench") {
        urls = UrlConstant.QUERY_HIERARCHY_BENCH + `${id}?rel_type=${relation}`;
      } else {
        urls = UrlConstant.QUERY_HIERARCHY_BENCH + id;
      }
      fetch(urls, {
        mode: "cors",
        credentials: "include",
      })
        .then((res) => res.json())
        .then((result) => {
          if (result[0][module] == undefined && module != "EOH") {
            result[0][module] = [];
          }
          if (module == "Serial_Number" && result[0]["Component_Position"] === undefined) {
            result[0]["Component_Position"] = [{}]
          }
          // console.log$&

          setSelectedObj(result[0]);
          setCount(0);

          setIsLoading(false);
        });
      setDialogOpen(true);
    }
  };

  const applyFilter = () => {
    const newFilters = {
      element: ignoreAllElements,
      component: ignoreAllComponent,
      software: ignoreAllSoftware,
      ignoreElements: ignoreElements,
      ignoreComponent: ignoreComponent,
      ignoreSoftware: ignoreSoftware,
    };
    // console.log$&
    const newReport: any = <ConfigurationReportPDF data={searchResult[0]} filters={newFilters} />;
    setCurrentReport(newReport);
    setIsFilterOpen(false);
  };

  const clearFilter = () => {
    setIgnoreComponent([]);
    setIgnoreElements([]);
    setIgnoreSoftware([]);
    setIgnoreAllElements(false);
    setIgnoreAllComponent(false);
    setIgnoreAllSoftware(false);
    setFilterSettings(initialFilters);
  };

  const handleElementTagRemove = (e: any) => {
    const newTags = ignoreElements.filter((el) => el.name !== e);
    setIgnoreElements(newTags);
  };

  const handleComponentTagRemove = (e: any) => {
    const newTags = ignoreComponent.filter((el) => el.name !== e);
    setIgnoreComponent(newTags);
  };

  const handleSoftwareTagRemove = (e: any) => {
    const newTags = ignoreSoftware.filter((el) => el.name !== e);
    setIgnoreSoftware(newTags);
  };

  const getSchema = () => {
    setLocalValues({});
    setFormData({});

    fetch(UrlConstant.SCHEMA_FINDER, {
      mode: "cors",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((result) => {
        setSchema(result["properties"]);
        setRequiredFields(result["required"]);
      });
  };

  React.useEffect(() => {
    fetch(UrlConstant.QUERYLOOKUP_COMPONENT_POSITION, {
      mode: "cors",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((result) => {
        result = result.sort((x: any, y: any) =>
          x.Position === y.Position
            ? 0
            :
            x.Position < y.Position ? -1 : 1
        )
        setPositionlist(result);
      });

    fetch(UrlConstant.QUERYLOOKUP_BENCH, {
      mode: "cors",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((result: any) => {
        result = sortDropDownListNode(result);
        const benchId: any = localStorage.getItem("bench_id");
        const benchLabel = result.filter((x: any) => x.id === +benchId);
        if (benchId && benchLabel) {
          handleselectchange({ currentTarget: { value: benchId, label: benchLabel["NAME"] } });
        }
        else {
          handleselectchange({ currentTarget: { value: "", label: undefined } });
        }
        setbenchlist(result);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localStorage.getItem("bench_id")]);

  const getAssosiationDropdownElementNumber = (data: any, module: string, initCount: number) => {
    const props = {
      module: module,
      selectedObj: data,
      availableLookup: availableLookupElementNumber,
      setAvailableLookup: (data) => setAvailableLookupElementNumber(data),
      setSelectedObjModule: (module, value) => data[module] = value,
    } as BenchConfigEditProps;

    if (initCount == 0) {
      setAvailableLookupElementNumber([]);
      getSpecialRelationQuery(module, data["id"])
        .then((result) => {
          result = sortDropDownListNode(result);
          setAvailableLookupElementNumber(result);
        });
    }
    return BenchConfigurationEditDialog(props);
  }

  const get_association_dropdown = (data: any, module: string) => {
    if (Array.isArray(selectedObj[module])) {
      // console.log$&
      let specificRelationId = data["id"];
      if (selectedObj.node_type === "Element_Number" && currentNode?.parentNode) {
        specificRelationId = currentNode.parentNode?.id;
      }
      if (selectedObj.node_type === "Element" && module === "Element_Number") {
        return;
      }
      let initCount = 1;
      if (count == 0) {
        initCount = 0;
        setAvailableLookup([]);
        fetch(UrlConstant.QUERY_SPECIFIC_RELATION + module + "/" + specificRelationId, {
          mode: "cors",
          credentials: "include",
        })
          .then((res) => res.json())
          .then((result) => {
            result = sortDropDownListNode(result);
            setAvailableLookup(result);
            // localStorage.removeItem("Bench");
            // localStorage.removeItem("Bench_id");
          });
        setCount(1);
      }
      return (
        <div style={{ marginTop: 15 }}>
          <Stack spacing={2} sx={{ width: 300 }}>
            {data.node_type === "Element" && module === "Component" && getAssosiationDropdownElementNumber(data, "Element_Number", initCount)}
            <br />
            <Autocomplete
              multiple
              id={module}
              options={
                selectedObj[module].length > 0
                  ? availableLookup.filter((key: any) => !selectedObj[module].some((item: any) => item.id === key.id))
                  : availableLookup
              }
              disableCloseOnSelect
              title={module}
              size="small"
              getOptionLabel={(option: any) => getOptionsDisplay(option)}
              defaultValue={data[module]}
              style={{ width: 500 }}
              // value={data[module]}
              onChange={(event: any, value: any) => (
                (selectedObj[module] = []),
                (selectedObj[module] = value),
                setAvailableLookup(availableLookup.filter((key: any) => !value.some((item: any) => item.id === key.id)))
              )}
              renderInput={(params) => <TextField {...params} label={module + "s"} />}
            />
          </Stack>
        </div>
      );
    }
  };
  return (
    <div style={{ padding: 20 }}>
      <div className="bp5-html-select">
        <select
          value={currentBench}
          onChange={(e) => handleselectchange(e)}
          style={{ width: "210px" }}
          disabled={hierarchySpinner}
        >
          <option value={""} disabled={true}>Select Bench Configuration</option>
          {Object.keys(benchlist).map((oneKey, i) => {
            return (
              <option key={i} value={benchlist[oneKey]["id"]}>
                {benchlist[oneKey]["NAME"]}
              </option>
            );
          })}
        </select>
        {
          !versionSpin ? (
            (relationlist.length > 0) &&
            <div className="bp5-html-select" id="relation" style={{ marginLeft: "10px" }}>
              <label htmlFor="relation">
                <h6>Version:</h6>
              </label>
              <select
                id="relation"
                defaultValue=""
                onChange={(e) => handlerelationchange(e)}
                style={{ width: "130px", marginLeft: "4px" }}
              >
                <option value="" disabled>
                  Select Version
                </option>
                {relationlist.map((oneKey: any, i: any) => {
                  return (
                    <option key={i} value={oneKey}>
                      {oneKey}
                    </option>
                  );
                })}
              </select>
            </div>
          ) : (
            <div className="bp5-html-select" id="relation" style={{ marginLeft: "10px" }}>
              <Spinner size="tiny" label="Loading Version" />
            </div>
          )
        }
      </div>
      {currentBench !== "" && role !== "ReadOnly" && (
        <Button
          style={{ marginLeft: 20 }}
          text="Add New Configuration"
          icon={
            <>
              <AddSquareMultiple24Filled style={{ height: 16 }} />
            </>
          }
          intent="none"
          onClick={() => {
            setIsConfigOpen(true);
          }}
          disabled={benchlist.length <= 0}
        />
      )}
      {/* <Button
        style={{ marginLeft: 20 }}
        text="Filter Report"
        icon={<FilterList size={16} />}
        onClick={() => {
          setIsFilterOpen(true);
        }}
        disabled={searchResult.length <= 0}
      /> */}

      <Dialog isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} className="bp5-popover-dismiss">
        <DialogBody useOverflowScrollContainer={true}>
          <h3>Filter Report</h3>
          <FormGroup label="Ignore All">
            <Checkbox
              checked={ignoreAllElements}
              label="Hide All Elements"
              onChange={() => setIgnoreAllElements(!ignoreAllElements)}
            />
            <Checkbox
              checked={ignoreAllComponent}
              label="Hide All Components"
              onChange={() => setIgnoreAllComponent(!ignoreAllComponent)}
            />
            <Checkbox
              checked={ignoreAllSoftware}
              label="Hide All Softwares"
              onChange={() => setIgnoreAllSoftware(!ignoreAllSoftware)}
            />
          </FormGroup>

          <FormGroup label="Ignore Specific Elements">
            <MultiSelect
              placeholder="Ignore Elements"
              selectedItems={ignoreElements}
              tagRenderer={(item) => item.name}
              items={allElementList}
              itemRenderer={(val: any) => {
                return (
                  <>
                    <MenuItem
                      key={val.id}
                      text={val.name}
                      shouldDismissPopover={true}
                      onClick={() => {
                        if (!ignoreElements.includes(val)) {
                          setIgnoreElements([...ignoreElements, val]);
                        }
                      }}
                    />
                  </>
                );
              }}
              popoverProps={{ minimal: true }}
              noResults={<MenuItem disabled={true} text="No results." roleStructure="listoption" />}
              onItemSelect={() => {
                // console.log$&
              }}
              tagInputProps={{
                onRemove: handleElementTagRemove,
              }}
            />
          </FormGroup>

          <FormGroup label="Ignore Specific Components">
            <MultiSelect
              placeholder="Ignore Components"
              selectedItems={ignoreComponent}
              tagRenderer={(item) => item.name}
              items={allComponentList}
              itemRenderer={(val: any) => {
                return (
                  <MenuItem
                    key={val.id}
                    text={val.name}
                    shouldDismissPopover={true}
                    onClick={() => {
                      if (!ignoreComponent.includes(val)) {
                        setIgnoreComponent([...ignoreComponent, val]);
                      }
                    }}
                  />
                );
              }}
              noResults={<MenuItem disabled={true} text="No results." roleStructure="listoption" />}
              onItemSelect={() => {
                // console.log$&
              }}
              tagInputProps={{
                onRemove: handleComponentTagRemove,
              }}
            />
          </FormGroup>

          <FormGroup label="Ignore Specific Softwares">
            <MultiSelect
              placeholder="Ignore Softwares"
              selectedItems={ignoreSoftware}
              tagRenderer={(item) => item.name}
              items={allSoftwareList}
              itemRenderer={(val: any) => {
                return (
                  <MenuItem
                    key={val.id}
                    text={val.name}
                    shouldDismissPopover={true}
                    onClick={() => {
                      if (!ignoreSoftware.includes(val)) {
                        setIgnoreSoftware([...ignoreSoftware, val]);
                      }
                    }}
                  />
                );
              }}
              noResults={<MenuItem disabled={true} text="No results." roleStructure="listoption" />}
              onItemSelect={() => {
                // console.log$&
              }}
              tagInputProps={{
                onRemove: handleSoftwareTagRemove,
              }}
            />
          </FormGroup>
        </DialogBody>
        <DialogFooter>
          <Button text="Apply" intent="primary" onClick={applyFilter} />
          <Button text="Clear Filters" style={{ marginLeft: 20 }} onClick={clearFilter} />
        </DialogFooter>
      </Dialog>

      <Dialog isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} className="bp5-popover-dismiss" style={{ width: 350, background: "aliceblue" }}>
        <DialogBody useOverflowScrollContainer={true}>
          <div style={{ padding: 10 }}>
            <div>
              <FormGroup
                // helperText={schema[oneKey]["message"].split(":").pop()}
                inline={false}
                helperText={massage ? "Space and starting with numerical values not allowed" : ""}
                intent={massage == false ? Intent.SUCCESS : Intent.DANGER}
                label={"Enter Version Name"}
                labelFor="text-input"
                labelInfo={"*"}
                style={{ fontStyle: "bold", fontSize: 12 }}
              >
                <InputGroup
                  type="text"
                  id="text-input"
                  intent="primary"
                  name={"VERSION"}
                  disabled={false}
                  style={{ width: "100%" }}
                  onChange={(event: any) => {
                    handleInputVersion(event);
                  }}
                />
              </FormGroup>
            </div>
            <div className="bp5-html-select">
              <label style={{ marginBottom: "15px", fontSize: 12 }} htmlFor="option">
                Select Configuration You Want To Copy *
              </label>
              <select defaultValue="" onChange={(e) => addBenchConfiguration(e)} style={{ width: "100%", border: "1px solid #2d72d2" }}>
                <option value="" disabled>
                  Select an existing bench configuration
                </option>
                {Object.keys(benchlist).map((oneKey, i) => {
                  return (
                    <option key={i} value={benchlist[oneKey]["id"]}>
                      {benchlist[oneKey]["NAME"]}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            text="Add"
            intent="primary"
            disabled={massage ? true : isReady == false ? (version == "" ? true : false) : true}
            onClick={() => {
              addNewBenchConfigRelation(benchConfigList);
              // getBenchConfigVersion(benchConfigList.id);
            }}
          />

          <Button text="Close" style={{ marginLeft: 20 }} onClick={() => setIsConfigOpen(false)} />
        </DialogFooter>
      </Dialog>

      <Dialog
        isOpen={isCheckOpen}
        onClose={() => setIsCheckOpen(false)}
        className="bp5-popover-dismiss"
        style={{ width: "800px" }}
      >
        <DialogBody useOverflowScrollContainer={true}>
          {Object.keys(schema).length > 0 && (
            <React.Fragment>
              {generate_form(schema, "", formData == undefined ? {} : formData, 1, relationlist)}
            </React.Fragment>
          )}
        </DialogBody>
        <DialogFooter>
          <Button
            text="Add To Finder"
            intent="primary"
            disabled={isReadyFinder == false ? true : false}
            onClick={() => {
              addToFinder(formData);
              setIsCheckOpen(false);
            }}
          />

          <Button
            text="Close"
            style={{ marginLeft: 20 }}
            onClick={() => {
              setIsCheckOpen(false);
              setIsReadyFinder(false);
            }}
          />
        </DialogFooter>
      </Dialog>

      {currentReport && (
        <div style={{ display: "inline-flex", marginLeft: 20 }}>
          <Button
            onClick={handleDialogOpen}
            disabled={searchResult.length <= 0}
            style={{ color: "white", background: "#1658ba" }}
          >
            Download Report
          </Button>
          <Dialog style={{ width: "484px" }} isOpen={openDialog} onClose={handleDialogOpen}>
            <DialogContent>
              <IconButton onClick={handleDialogClose} style={{ marginLeft: "439px", marginTop: "10px" }}>
                <XIcon />
              </IconButton>
              <Typography variant="h6" style={{ marginLeft: "144px", marginRight: "50px", marginBottom: "15px" }}>
                Choose File Format
              </Typography>

              <div style={{ display: "flex", flexDirection: "row", marginLeft: "144px", marginRight: "50px" }}>
                <FormControlLabel
                  control={<Radio checked={reportType === "pdf"} onChange={() => setReportType("pdf")} />}
                  label="PDF"
                />
                <FormControlLabel
                  control={
                    <Radio
                      checked={reportType === "excel"}
                      onChange={() => setReportType("excel")}
                      style={{ marginLeft: "45px" }}
                    />
                  }
                  label="Excel"
                />
              </div>
              <br></br>
              <Button
                text="Filter Report"
                icon={<FilterList size={16} style={{ color: "white" }} />}
                style={{ color: "white", background: "#1658ba", marginLeft: "120px", marginRight: "10px", marginBottom: "30px" }}
                onClick={() => {
                  setIsFilterOpen(true);
                }}
                disabled={searchResult.length <= 0}
              />
              {reportType == "pdf" && (
                <PDFDownloadLink document={currentReport} fileName="ConfigurationReport.pdf">
                  <Button
                    style={{ color: "white", background: "#1658ba", marginBottom: "30px" }}
                    onClick={() => handleDialogClose()}
                  >
                    Generate Report
                  </Button>
                </PDFDownloadLink>
              )}
              {reportType != "pdf" && (
                <Button
                  onClick={() => {
                    generateReport(reportType);
                    handleDialogClose();
                  }}
                  style={{ color: "white", background: "#1658ba", marginBottom: "30px" }}
                >
                  Generate Report
                </Button>
              )}
            </DialogContent>
          </Dialog>
        </div>
      )}

      {currentBench !== "" && role != "ReadOnly" && (
        <Button
          style={{ marginLeft: 20, color: "white" }}
          text="Create Entry"
          intent="primary"
          icon={<Add color="white" />}
          onClick={() => {
            setIsCheckOpen(true);
            getSchema();
            if (admin_name != undefined && benchName != "" && relationlist.length == 1) {
              setFormData({
                BENCH_ID: currentBench,
                CONFIGURED_BY: admin_name,
                BENCH: benchName,
                VERSION: relationlist[0],
              });
            } else if (admin_name != undefined && benchName != "") {
              setFormData({ BENCH_ID: currentBench, CONFIGURED_BY: admin_name, BENCH: benchName });
            } else if (admin_name != undefined) {
              setFormData({ CONFIGURED_BY: admin_name });
            } else if (benchName != "") {
              setFormData({ BENCH_ID: currentBench, BENCH: benchName });
            } else if (relationlist.length == 1) {
              setFormData({ VERSION: relationlist[0] });
            }
          }}
          disabled={benchlist.length <= 0}
        />
      )}

      <div className="row">
        <div style={{ margin: 30 }} className="col-md-7">
          <div className="tree">
            <div style={{ display: "flex", alignItems: "center" }}>
              <Icon
                style={{ color: "gray", marginRight: "5px" }}
                icon={isExpanded ? "chevron-down" : "chevron-up"}
                onClick={handleToggle}
              />
              <span>Expand Color Bar</span>
            </div>
            <Collapse isOpen={isExpanded}>
              <div style={{ border: "1px solid", height: "166px", width: "170px" }}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div style={{ width: "20px", height: "20px", margin: "3px", backgroundColor: "#e0f0ff" }}></div>
                    <div>
                      <b>Bench</b>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div style={{ width: "20px", height: "20px", margin: "3px", backgroundColor: "#e2ccff" }}></div>
                    <div>
                      <b>Element</b>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div style={{ width: "20px", height: "20px", margin: "3px", backgroundColor: "#fff5cc" }}></div>
                    <div>
                      <b>Sub-Element</b>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div style={{ width: "20px", height: "20px", margin: "3px", backgroundColor: "#ccfff1" }}></div>
                    <div>
                      <b>Component</b>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div style={{ width: "20px", height: "20px", margin: "5px", backgroundColor: "#ffe6e6" }}></div>
                    <div>
                      <b>Serial Number</b>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div style={{ width: "20px", height: "20px", margin: "5px", backgroundColor: "#c2e8c7" }}></div>
                    <div>
                      <b>Software</b>
                    </div>
                  </div>
                </div>
              </div>
            </Collapse>
            {/* <li><Tag className="tagColor"><h5>BENCH - 18374</h5></Tag></li> */}
            {/* {RecursiveProperty(searchResult)} */}
          </div>
        </div>
        {!hierarchySpinner ? (
          <div className="hierarchy-viewer">
            {/* <ReactHierarchy
              nodes={searchResult}
              direction="horizontal"
              randerNode={(node: INode) => {
                return (
                  <div
                    className="bp5-tag bp5-intent-primary bp5-large bp5-minimal node-template"
                    style={{ fontSize: 10, wordWrap: "break-word", width: 250, padding: 10, border: "1px solid black" }}
                  >
                    {node.NAME && <strong>{nodeLabelDisplay(node)} </strong>}
                    {node.ELEMENT_NUMBER && (
                      <strong>{nodeLabelDisplay(node)}</strong>
                    )}

                    {node.Part_Name && <strong>{nodeLabelDisplay(node)}</strong>}

                    {node.SERIAL_NUMBER && !node.ELEMENT_NUMBER ? (
                      <strong>{nodeLabelDisplay(node)}</strong>
                    ) : (
                      ""
                    )}
                    {node.SW_TITLE && <strong>{nodeLabelDisplay(node)} </strong>}

                    {node.NAME != undefined &&
                      node.Element_Part_Number == undefined &&
                      role != "ReadOnly" &&
                      (updateLoader == node.uniqueId ? (
                        <Spinner size="tiny" />
                      ) : (
                        <Edit onClick={() => handle_dialog_open("Element", node)} />
                      ))}
                    {node.NAME != undefined &&
                      node.Element_Part_Number != undefined &&
                      role != "ReadOnly" &&
                      (updateLoader == node.uniqueId ? (
                        <Spinner size="tiny" />
                      ) : (
                        node.parentNode?.node_type !== "Element_Number" && <Edit onClick={() => handle_dialog_open("Component", node)} />
                      ))}
                    {node.ELEMENT_NUMBER != undefined &&
                      role != "ReadOnly" &&
                      (updateLoader == node.uniqueId ? (
                        <Spinner size="tiny" />
                      ) : (
                        <Edit onClick={() => handle_dialog_open("Component", node)} />
                      ))}
                    {node.Part_Name != undefined &&
                      role != "ReadOnly" &&
                      (updateLoader == node.uniqueId ? (
                        <Spinner size="tiny" />
                      ) : (
                        <Edit onClick={() => handle_dialog_open("Serial_Number", node)} />
                      ))}
                    {node.SERIAL_NUMBER != undefined &&
                      node.MLDS != undefined &&
                      role != "ReadOnly" &&
                      (updateLoader == node.uniqueId ? (
                        <Spinner size="tiny" />
                      ) : (
                        node.parentNode?.Part_Installable?.toLocaleLowerCase() !="true" &&  <Edit onClick={() =>   handle_dialog_open("Software", node)} />

                      ))}
                  </div>
                );
              }}
            /> */}
          </div>
        ) : (
          <div className="bp5-html-select" id="relation" style={{ marginLeft: "10px" }}>
            <Spinner size="tiny" label="Loading Configuration Hierarchy...." />
          </div>
        )}
      </div>

      <Dialog isOpen={dialogOpen} onClose={() => handle_dialog_open("", 0)} style={{ width: 530 }}>
        <DialogBody>
          <Tabs>
            <TabList>
              <Tab>
                <NewObject />
              </Tab>
            </TabList>
            <TabPanel>
              <div className="row" style={{ fontSize: 12 }}>
                {isLoading == true && (
                  <div className="col-md-5" style={{ margin: 5 }}>
                    <h5> Loading....</h5>
                  </div>
                )}

                {isLoading == false &&
                  Object.keys(selectedObj).map((oneKey, i) => {
                    return (
                      <>
                        {!Array.isArray(selectedObj[oneKey]) ? (
                          <div className="col-md-5" style={{ margin: 5 }} key={i}>
                            <span>
                              <strong>{oneKey} : </strong>
                            </span>

                            {oneKey !== "Component_Position" && selectedObj[oneKey].toString().toUpperCase()}
                          </div>
                        ) : (

                          (oneKey == "Component_Position") ? (
                            <div className="col-md-5" style={{ margin: 5 }} key={i}>
                              <span>
                                <strong>{oneKey} : </strong>
                              </span>
                              <select
                                defaultValue={
                                  (selectedObj[oneKey] == "" ? "none" : (selectedObj[oneKey][0]["id"] != undefined ? selectedObj[oneKey][0]["id"] : selectedObj[oneKey].toString().toUpperCase()))
                                }
                                defaultChecked={true}
                                style={{ width: "180px" }}
                                onChange={handleComponentPositionSelectChange}
                              >
                                <option key={i} value="-1">Choose an option</option>
                                {position.map((oneKeys: any, i: any) => {
                                  return (oneKeys["Position"] !== "" && oneKeys["Position"] !== undefined ? <option key={i} value={oneKeys["id"]}>{oneKeys["Position"]}</option> : "");
                                })}
                              </select>
                            </div>
                          ) : (
                            <div className="col-md-12" key={i}>
                              {get_association_dropdown(selectedObj, oneKey)}
                            </div>
                          )
                        )}
                      </>
                    );
                  })}
                <div className="col-md-9" style={{ margin: 10 }}>
                  <Button onClick={updateRecord}>Update</Button>
                </div>
              </div>
            </TabPanel>
          </Tabs>
        </DialogBody>
      </Dialog>
    </div>
  );
};
