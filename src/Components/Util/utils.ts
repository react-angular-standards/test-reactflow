export function stringToColour(str: string) {
  return "#000000";
}
export function getOptionsDisplay() {
  return [];
}
export function nodeLabelDisplay() {
  return "";
}
export function sortAllArrayPropertyRecurcive() {
  return [];
}
export function sortDropDownListNode() {
  return [];
}
export function sortLabelNode() {
  return [];
}
export interface INode {
  id: string;
  name: string;
}
export function convertToTitleCase(str: string) {
  return str.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
export function GenerateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
