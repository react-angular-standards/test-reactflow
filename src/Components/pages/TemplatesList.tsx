/**
 * @file Simple template list with json-server
 */
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Button, Label, makeStyles } from "@fluentui/react-components";
import { UrlConstant } from "../Util/UrlConstants";

const useStyles = makeStyles({
  container: {
    padding: "20px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    fontSize: "14px",
  },
  th: {
    textAlign: "left" as const,
    padding: "10px 12px",
    borderBottom: "2px solid #ccc",
    fontWeight: 600,
  },
  td: {
    padding: "10px 12px",
    borderBottom: "1px solid #eee",
  },
  row: {
    ":hover": {
      background: "#f5f5f5",
    },
  },
});

export const TemplatesList = (): JSX.Element => {
  const styles = useStyles();
  const history = useHistory();
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(UrlConstant.TEMPLATES)
      .then((res) => res.json())
      .then((data) => {
        setTemplates(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleDelete = (id: number) => {
    if (!window.confirm("Delete this template?")) return;
    fetch(`${UrlConstant.TEMPLATES}/${id}`, { method: "DELETE" }).then(() => {
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Label weight="semibold" size="large">
          Templates
        </Label>
        <Button
          appearance="primary"
          onClick={() => history.push("/templates/edit")}
        >
          Add Template
        </Button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : templates.length === 0 ? (
        <div>No templates found.</div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>ID</th>
              <th className={styles.th}>Header</th>
              <th className={styles.th}>Description</th>
              <th className={styles.th}>Type</th>
              <th className={styles.th}>Customer</th>
              <th className={styles.th} style={{ textAlign: "right" }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {templates.map((t) => (
              <tr key={t.id} className={styles.row}>
                <td className={styles.td}>{t.id}</td>
                <td className={styles.td}>{t.header}</td>
                <td className={styles.td}>{t.description || "—"}</td>
                <td className={styles.td}>{t.inputType}</td>
                <td className={styles.td}>{t.sponsoring_customer || "—"}</td>
                <td
                  className={styles.td}
                  style={{ textAlign: "right", display: "flex", gap: 8, justifyContent: "flex-end" }}
                >
                  <Button
                    size="small"
                    onClick={() => history.push(`/templates/edit/${t.id}`)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    appearance="subtle"
                    onClick={() => handleDelete(t.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
