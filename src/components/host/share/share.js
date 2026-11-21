import QRCode from "qrcode";
import template from "./share.html?raw";
import { html } from "../../../lib/render.js";
import { H, playerLink } from "../state.js";

export default () => html(template, { code: H.code, link: playerLink() });

/** Draw the QR code into the canvas rendered by the template. */
export function drawQr(root) {
  const canvas = root.querySelector("[data-qr]");
  if (canvas) QRCode.toCanvas(canvas, canvas.dataset.qr, { width: 300, margin: 0, errorCorrectionLevel: "M" }).catch(() => { canvas.hidden = true; });
}
