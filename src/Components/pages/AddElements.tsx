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
  Fluid16Regular,
} from "@fluentui/react-icons";
import { UrlConstant } from "../Util/UrlConstants";

import {
  Skeleton,
  SkeletonItem,
  Breadcrumb,
  BreadcrumbButton,
  BreadcrumbDivider,
  BreadcrumbItem,
  makeStyles,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  Button,
  Spinner,
} from "@fluentui/react-components";

import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import SelectMui from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Autocomplete from "@mui/material/Autocomplete";
import Chip from "@mui/material/Chip";

import { IFieldType } from "./Requirementobject";
import TemplateFlow from "./TemplateFlow";

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    overflow: "hidden",
    backgroundColor: "#f0f2f5",
  },
  topNav: {
    flexShrink: 0,
    padding: "10px 24px 6px",
    backgroundColor: "#fff",
    borderBottom: "1px solid #e0e0e0",
  },
  alerts: {
    flexShrink: 0,
    padding: "0 24px",
    marginTop: 12,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  formCard: {
    flexShrink: 0,
    margin: "12px 24px 0",
    padding: "20px 24px",
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1.5fr 1fr 0.8fr",
    gap: "28px",
    alignItems: "start",
  },
  col: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  colMeta: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    justifyContent: "space-between",
    height: "100%",
  },
  metaRow: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  metaLabel: {
    fontSize: "11px",
    fontWeight: 600,
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: "0.6px",
  },
  metaValue: {
    fontSize: "13px",
    color: "#333",
    fontWeight: 500,
  },
  btnWrap: {
    marginTop: "auto",
    paddingTop: 8,
  },
  flowCard: {
    flex: 1,
    margin: "16px 24px 20px",
    backgroundColor: "#fff",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
    overflow: "hidden",
    display: "flex",
    minHeight: 0,
  },
  skeletonCard: {
    margin: "12px 24px",
    padding: 24,
    backgroundColor: "#fff",
    borderRadius: "12px",
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
  const [saveButtonLoading, setSaveButtonLoading] = useState(false);
  const [tags, setTags] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  /* ── Load data ──────────────────────────────────────────────────── */
  React.useEffect(() => {
    setLoadwhilerender(true);

    fetch(UrlConstant.QUERY_TEMPLATE_OBJECT + "Tag", {
      mode: "cors",
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : []))
      .then(setTags)
      .catch(() => setTags([]));

    if (id != undefined) {
      fetch(UrlConstant.QUERY_TEMPLATE_BY_ID + id, {
        mode: "cors",
        credentials: "include",
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to load template");
          return res.json();
        })
        .then((result) => {
          settemplatearray1(result);
          settemplatearray(result);
          setTemplateObject(result[0]);
        })
        .catch((err) => setErrorMsg(err.message || "Failed to load template."))
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

  /* ── Shared handlers ────────────────────────────────────────────── */
  const clearAlerts = () => {
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleSuccess = (result: any) => {
    setSaveButtonLoading(false);
    settemplatearray([result]);
    settemplatearray1([result]);
    setTemplateObject(result);
    setSuccessMsg(
      isTemplateSaved
        ? `Template "${result.header}" updated successfully.`
        : `Template "${result.header}" created successfully.`,
    );
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const handleError = (err: any) => {
    const msg = err?.message || "Something went wrong. Please try again.";
    console.error(msg);
    setErrorMsg(msg);
    setSaveButtonLoading(false);
    setTimeout(() => setErrorMsg(""), 6000);
  };

  /* ── Save / Update ──────────────────────────────────────────────── */
  const save_template = () => {
    clearAlerts();
    setSaveButtonLoading(true);
    fetch(UrlConstant.MANAGE_SAVE_TEMPLATE + "Template", {
      method: "post",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(templateObject),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Save failed (" + res.status + ")");
        return res.json();
      })
      .then(handleSuccess)
      .catch(handleError);
  };

  const update_tempalte = () => {
    clearAlerts();
    setSaveButtonLoading(true);
    fetch(UrlConstant.MANAGE_ASSOCIATE + "Template" + templateObject.id, {
      method: "post",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(templateObject),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Associate failed (" + res.status + ")");
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
        if (!res.ok) throw new Error("Save failed (" + res.status + ")");
        return res.json();
      })
      .then(handleSuccess)
      .catch(handleError);
  };

  /* ── Form handlers ──────────────────────────────────────────────── */
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

  const handleTreeChange = useCallback((tree: any) => {
    setTemplateObject(tree);
    settemplatearray([tree]);
  }, []);

  /* ── Render ─────────────────────────────────────────────────────── */
  return (
    <div className={styles.root}>
      {/* Breadcrumb */}
      <div className={styles.topNav}>
        <Breadcrumb aria-label="Breadcrumb" size="small">
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
      </div>

      {/* Alerts */}
      <div className={styles.alerts}>
        {templateObject.isDeleted && (
          <MessageBar intent="error">
            <MessageBarBody>
              Template{" "}
              <MessageBarTitle>{templateObject.header}</MessageBarTitle> is
              deleted and cannot be edited or used in any new statement of work.
            </MessageBarBody>
          </MessageBar>
        )}
        {errorMsg && (
          <MessageBar intent="error">
            <MessageBarBody>{errorMsg}</MessageBarBody>
          </MessageBar>
        )}
        {successMsg && (
          <MessageBar intent="success">
            <MessageBarBody>{successMsg}</MessageBarBody>
          </MessageBar>
        )}
      </div>

      {/* Loading skeleton */}
      {loadwhileerender && (
        <div className={styles.skeletonCard}>
          <Skeleton>
            <div style={{ display: "flex", gap: 24 }}>
              <div style={{ flex: 1.5 }}>
                <SkeletonItem size={28} style={{ marginBottom: 12 }} />
                <SkeletonItem size={72} />
              </div>
              <div style={{ flex: 1 }}>
                <SkeletonItem size={28} style={{ marginBottom: 12 }} />
                <SkeletonItem size={72} />
              </div>
              <div style={{ flex: 0.8 }}>
                <SkeletonItem size={96} />
              </div>
            </div>
          </Skeleton>
        </div>
      )}

      {/* ── Row 1: Form ──────────────────────────────────────────── */}
      {!loadwhileerender && (
        <>
          <div className={styles.formCard}>
            <div className={styles.formGrid}>
              {/* Column 1 — Name + Description */}
              <div className={styles.col}>
                <TextField
                  label="Template Name"
                  name="header"
                  value={templateObject.header || ""}
                  onChange={handletextchange}
                  fullWidth
                  size="small"
                  variant="outlined"
                  disabled={templateObject.isDeleted}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      backgroundColor: "#fafafa",
                    },
                  }}
                />
                <TextField
                  label="Description"
                  name="description"
                  value={templateObject.description || ""}
                  onChange={text_area_change_event}
                  fullWidth
                  multiline
                  rows={2}
                  size="small"
                  variant="outlined"
                  disabled={templateObject.isDeleted}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "8px",
                      backgroundColor: "#fafafa",
                    },
                  }}
                />
              </div>

              {/* Column 2 — Status + Tags */}
              <div className={styles.col}>
                <FormControl
                  fullWidth
                  size="small"
                  disabled={templateObject.isDeleted}
                >
                  <InputLabel id="status-label">Status</InputLabel>
                  <SelectMui
                    labelId="status-label"
                    label="Status"
                    value={templateObject.status || "Draft"}
                    onChange={(e: any) =>
                      setTemplateObject((prev: any) => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }
                    sx={{
                      borderRadius: "8px",
                      backgroundColor: "#fafafa",
                    }}
                  >
                    <MenuItem value="Draft">Draft</MenuItem>
                    <MenuItem value="Released">Released</MenuItem>
                    <MenuItem value="Closed">Closed</MenuItem>
                  </SelectMui>
                </FormControl>

                <Autocomplete
                  multiple
                  size="small"
                  options={tags}
                  getOptionLabel={(option: any) => option.NAME || ""}
                  value={templateObject.Tag || []}
                  disabled={templateObject.isDeleted}
                  onChange={(e, newValue) =>
                    setTemplateObject((prev: any) => ({
                      ...prev,
                      Tag: newValue,
                    }))
                  }
                  renderTags={(value: any[], getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        {...getTagProps({ index })}
                        key={option.id || option.NAME + index}
                        label={option.NAME}
                        size="small"
                        sx={{
                          backgroundColor: "#e3f2fd",
                          color: "#1565c0",
                          fontWeight: 600,
                          fontSize: 12,
                        }}
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Tags"
                      placeholder="Select tags"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "8px",
                          backgroundColor: "#fafafa",
                          paddingTop: "4px",
                          paddingBottom: "4px",
                        },
                      }}
                    />
                  )}
                />
              </div>

              {/* Column 3 — Meta + Button */}
              <div className={styles.colMeta}>
                <div>
                  <div className={styles.metaRow}>
                    <span className={styles.metaLabel}>Updated by</span>
                    <span className={styles.metaValue}>
                      {templateObject.Updated_by?.NAME || "—"}
                    </span>
                  </div>
                  <div className={styles.metaRow} style={{ marginTop: 10 }}>
                    <span className={styles.metaLabel}>Updated on</span>
                    <span className={styles.metaValue}>
                      {templateObject.UPDATED_ON
                        ? new Date(templateObject.UPDATED_ON).toLocaleString()
                        : "—"}
                    </span>
                  </div>
                </div>

                <div className={styles.btnWrap}>
                  <Button
                    appearance="primary"
                    shape="square"
                    icon={<Save20Regular />}
                    disabled={templateObject.isDeleted || saveButtonLoading}
                    onClick={isTemplateSaved ? update_tempalte : save_template}
                    style={{
                      width: "100%",
                      justifyContent: "center",
                      minHeight: 36,
                    }}
                  >
                    {saveButtonLoading ? (
                      <Spinner size="tiny" />
                    ) : isTemplateSaved ? (
                      "Update Template"
                    ) : (
                      "Save Template"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Row 2: Flow (full width) ───────────────────────────── */}
          <div className={styles.flowCard}>
            <TemplateFlow
              root={templateObject}
              onTreeChange={handleTreeChange}
              paletteItems={requirementObjectlist}
              disabled={!isTemplateSaved}
            />
          </div>
        </>
      )}
    </div>
  );
};
