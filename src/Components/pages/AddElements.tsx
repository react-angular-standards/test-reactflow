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
  Badge,
  Body1,
  Body1Strong,
  Breadcrumb,
  BreadcrumbButton,
  BreadcrumbDivider,
  BreadcrumbItem,
  Caption1,
  Card,
  CardHeader,
  CounterBadge,
  DialogTitle,
  Divider,
  Field,
  Input,
  Label,
  Link,
  makeStyles,
  mergeClasses,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  shorthands,
  Subtitle2,
  Tag,
  TagPicker,
  TagPickerControl,
  TagPickerGroup,
  TagPickerInput,
  TagPickerList,
  TagPickerOption,
  Text,
  Textarea,
  Title3,
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

/* ------------------------------------------------------------------ */
/*  Styles via Fluent makeStyles + tokens (zero inline CSS)           */
/* ------------------------------------------------------------------ */
const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    ...shorthands.gap(tokens.spacingVerticalM),
    ...shorthands.padding(tokens.spacingVerticalM, tokens.spacingHorizontalL),
  },

  /* ---- Header card ------------------------------------------------ */
  headerCard: {
    ...shorthands.padding(tokens.spacingVerticalL, tokens.spacingHorizontalXL),
    ...shorthands.borderRadius(tokens.borderRadiusXLarge),
    boxShadow: tokens.shadow4,
  },
  headerRow: {
    display: "flex",
    alignItems: "flex-end",
    ...shorthands.gap(tokens.spacingHorizontalL),
    flexWrap: "wrap" as const,
  },
  headerField: {
    flexGrow: 1,
    flexBasis: "260px",
    minWidth: "200px",
  },
  headerActions: {
    display: "flex",
    alignItems: "flex-end",
    ...shorthands.gap(tokens.spacingHorizontalS),
    paddingBottom: tokens.spacingVerticalXXS,
  },

  /* ---- Main layout ------------------------------------------------ */
  mainLayout: {
    display: "flex",
    ...shorthands.gap(tokens.spacingHorizontalL),
  },
  flowColumn: {
    flexGrow: 1,
    flexBasis: 0,
    minWidth: 0,
  },
  sidebarColumn: {
    flexShrink: 0,
    width: "280px",
    display: "flex",
    flexDirection: "column",
    ...shorthands.gap(tokens.spacingVerticalM),
  },

  /* ---- Sidebar cards ---------------------------------------------- */
  sidebarCard: {
    ...shorthands.padding(tokens.spacingVerticalM, tokens.spacingHorizontalL),
    ...shorthands.borderRadius(tokens.borderRadiusLarge),
    boxShadow: tokens.shadow2,
  },
  sidebarCardTitle: {
    display: "flex",
    alignItems: "center",
    ...shorthands.gap(tokens.spacingHorizontalS),
    marginBottom: tokens.spacingVerticalS,
  },
  metaRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    ...shorthands.padding(tokens.spacingVerticalXS, "0"),
    ...shorthands.borderBottom(
      tokens.strokeWidthThin,
      "solid",
      tokens.colorNeutralStroke2,
    ),
  },
  metaLabel: {
    color: tokens.colorNeutralForeground3,
  },
  metaValue: {
    color: tokens.colorNeutralForeground1,
    fontWeight: tokens.fontWeightSemibold,
  },

  /* ---- Skeleton --------------------------------------------------- */
  skeletonWrap: {
    ...shorthands.padding(tokens.spacingVerticalL, tokens.spacingHorizontalL),
  },
  skeletonRow: {
    marginBottom: tokens.spacingVerticalM,
  },

  /* ---- Misc ------------------------------------------------------- */
  successBar: {
    marginTop: tokens.spacingVerticalS,
  },
  deletedBar: {
    marginBottom: tokens.spacingVerticalM,
  },
  tagField: {
    maxWidth: "100%",
    marginTop: tokens.spacingVerticalM,
  },
  dialogFooter: {
    display: "flex",
    justifyContent: "flex-end",
    ...shorthands.gap(tokens.spacingHorizontalS),
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

  /* ================================================================ */
  /*  TagPicker helper — avoids duplicating 40 lines for even/odd     */
  /* ================================================================ */
  const renderTagPicker = () => (
    <TagPicker
      disabled={templateObject.isDeleted}
      size="medium"
      appearance="filled-darker"
      onOptionSelect={onTagSelect}
      selectedOptions={templateObject["Tag"]}
    >
      <TagPickerControl>
        <TagPickerGroup>
          {templateObject.Tag?.map((option: any, tagIdx: number) => (
            <Tag
              disabled={templateObject.isDeleted}
              key={`tag-${option.NAME}-${tagIdx}`}
              shape="rounded"
              media={<Avatar aria-hidden name={option.NAME} color="colorful" />}
              value={option}
            >
              {option.NAME}
            </Tag>
          ))}
        </TagPickerGroup>
        <TagPickerInput aria-label="Select Tags" />
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
  );

  /* ================================================================ */
  /*  Render                                                          */
  /* ================================================================ */
  return (
    <div className={styles.root}>
      {/* ── Breadcrumb ──────────────────────────────────────────── */}
      <Breadcrumb aria-label="Template breadcrumb" size="small">
        <BreadcrumbItem>
          <BreadcrumbButton icon={<Home20Regular />}>Home</BreadcrumbButton>
        </BreadcrumbItem>
        <BreadcrumbDivider />
        <BreadcrumbItem>
          <BreadcrumbButton
            onClick={() => (window.location.href = "#/formbuilder")}
          >
            <Fluid16Regular /> {screenname}
          </BreadcrumbButton>
        </BreadcrumbItem>
        <BreadcrumbDivider />
        <BreadcrumbItem>
          <BreadcrumbButton icon={<AddCircle20Filled />} current>
            ADD SOW
          </BreadcrumbButton>
        </BreadcrumbItem>
      </Breadcrumb>

      {/* ── Loading skeleton ────────────────────────────────────── */}
      {loadwhileerender && (
        <Skeleton>
          <div className={styles.skeletonWrap}>
            <div className={styles.skeletonRow}>
              <Body1Strong>Template Name</Body1Strong>
              <SkeletonItem size={28} />
            </div>
            <div className={styles.skeletonRow}>
              <Body1Strong>Description</Body1Strong>
              <SkeletonItem size={72} />
            </div>
            <div className={styles.skeletonRow}>
              <SkeletonItem size={32} />
            </div>
            <SkeletonItem size={96} />
            <SkeletonItem size={96} />
            <SkeletonItem size={96} />
          </div>
        </Skeleton>
      )}

      {/* ── Main content ────────────────────────────────────────── */}
      {!loadwhileerender && (
        <>
          {/* Deleted warning */}
          {templateObject.isDeleted && (
            <MessageBar intent="error" className={styles.deletedBar}>
              <MessageBarBody>
                Template{" "}
                <MessageBarTitle>{templateObject.header}</MessageBarTitle> is
                deleted, and cannot be edited or used in any new statement of
                work.
              </MessageBarBody>
            </MessageBar>
          )}

          {/* ── Header card: Name + Description + Save ─────────── */}
          <Card className={styles.headerCard}>
            <div className={styles.headerRow}>
              <Field
                className={styles.headerField}
                label={<Body1Strong>Template Name</Body1Strong>}
              >
                <Input
                  disabled={templateObject.isDeleted}
                  onChange={handletextchange}
                  appearance="filled-darker"
                  name="header"
                  value={templateObject.header}
                  placeholder="Enter template name"
                />
              </Field>

              <Field
                className={styles.headerField}
                label={<Body1Strong>Description</Body1Strong>}
              >
                <Textarea
                  disabled={templateObject.isDeleted}
                  onChange={text_area_change_event}
                  appearance="filled-darker"
                  name="description"
                  value={templateObject.description}
                  placeholder="Enter description"
                  resize="vertical"
                />
              </Field>

              <div className={styles.headerActions}>
                <Button
                  appearance="primary"
                  icon={<Save20Regular />}
                  disabled={templateObject.isDeleted || saveButtonLoading}
                  onClick={save_template}
                >
                  {saveButtonLoading ? (
                    <Spinner size="tiny" />
                  ) : isTemplateSaved ? (
                    "Update"
                  ) : (
                    "Save"
                  )}
                </Button>
                {isTemplateSaved && (
                  <Badge appearance="filled" color="success" size="small">
                    Saved
                  </Badge>
                )}
              </div>
            </div>

            {disableSave && (
              <MessageBar intent="success" className={styles.successBar}>
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
          </Card>

          {/* ── Flow + Sidebar ─────────────────────────────────── */}
          <div className={styles.mainLayout}>
            {/* Flow area — expands to fill */}
            <div className={styles.flowColumn}>
              <TemplateFlow
                root={templateObject}
                onTreeChange={handleTreeChange}
                paletteItems={requirementObjectlist}
                disabled={!isTemplateSaved}
              />
            </div>

            {/* Sidebar — fixed width */}
            <div className={styles.sidebarColumn}>
              {/* Status card */}
              <Card className={styles.sidebarCard}>
                <div className={styles.sidebarCardTitle}>
                  <Status20Filled />
                  <Subtitle2>Status</Subtitle2>
                </div>
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
              </Card>

              {/* Metadata card — only when loaded */}
              {templateObject.Updated_by != undefined && (
                <Card className={styles.sidebarCard}>
                  <div className={styles.sidebarCardTitle}>
                    <DocumentData24Filled />
                    <Subtitle2>Metadata</Subtitle2>
                  </div>

                  <div className={styles.metaRow}>
                    <Caption1 className={styles.metaLabel}>
                      <PeopleIcon size={14} /> Updated by
                    </Caption1>
                    <Body1Strong className={styles.metaValue}>
                      {templateObject.Updated_by["NAME"]}
                    </Body1Strong>
                  </div>

                  <div className={styles.metaRow}>
                    <Caption1 className={styles.metaLabel}>
                      <Calendar20Regular /> Updated on
                    </Caption1>
                    <Caption1 className={styles.metaValue}>
                      {new Date(
                        templateObject.UPDATED_ON
                          ? templateObject.UPDATED_ON
                          : "",
                      ).toLocaleDateString()}
                    </Caption1>
                  </div>
                </Card>
              )}

              {/* Tags card */}
              <Card className={styles.sidebarCard}>
                <div className={styles.sidebarCardTitle}>
                  <TagIcon size={16} />
                  <Subtitle2>Tags</Subtitle2>
                  {templateObject.Tag?.length > 0 && (
                    <CounterBadge
                      count={templateObject.Tag.length}
                      size="small"
                      color="brand"
                    />
                  )}
                </div>
                <Field className={styles.tagField}>
                  {selectcount % 2 === 0
                    ? renderTagPicker()
                    : renderTagPicker()}
                </Field>
              </Card>
            </div>
          </div>
        </>
      )}

      {/* ── Legacy dialog (hidden) ──────────────────────────────── */}
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
          <div className={styles.dialogFooter}>
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
