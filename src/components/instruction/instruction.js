import { marked } from "marked";
import source from "../../instruction.md?raw";

document.getElementById("instructions").innerHTML = marked.parse(source);
