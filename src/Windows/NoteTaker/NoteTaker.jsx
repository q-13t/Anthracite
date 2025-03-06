import "./NoteTaker.css";
import { saveAs } from "file-saver";
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";
import { useState } from "react";

const marked = new Marked(
    markedHighlight({
        emptyLangClass: 'hljs',
        langPrefix: 'hljs language-',
        highlight(code, lang, info) {
            const language = hljs.getLanguage(lang) ? lang : 'plaintext';
            return hljs.highlight(code, { language }).value;
        }
    })
);

marked.use({
    "async": false,
    "breaks": true,
    "extensions": null,
    "gfm": true,
    "hooks": null,
    "pedantic": false,
    "silent": false,
    "tokenizer": null,
    "walkTokens": null
});

const NoteTaker = ({ id }) => {
    const [display, setDisplay] = useState({ left: "block", right: "block" });

    const open = () => {
        const file_input = document.createElement("input");
        file_input.type = "file";
        file_input.accept = ".txt, .md";
        file_input.click();

        file_input.onchange = () => {
            const reader = new FileReader();
            const file = file_input.files[0];
            reader.onload = () => {
                document.getElementById(`Notes-plain-text-` + id).value = reader.result;
                document.getElementById(`Notes-MD-` + id).innerHTML = marked.parse(reader.result);
            }
            reader.readAsText(file);
        }
    }

    const save = (event, format) => {
        const text = document.getElementById(`Notes-plain-text-` + id);
        if (!text) {
            return;
        }
        event.preventDefault();
        format = format === 'text/plain' ? 'txt' : "md";
        saveAs(new Blob([text.value], { type: "text/plain;charset=utf-8" }), "Anthracite Notes." + format);

    }

    const parseText = () => {
        document.getElementById(`Notes-MD-` + id).innerHTML = marked.parse(document.getElementById(`Notes-plain-text-` + id).value).replaceAll("disabled=\"\"", "");
    }

    const changeView = (event, type) => {
        event.preventDefault();
        event.stopPropagation();
        var md = document.getElementById(`Notes-MD-` + id);
        var plain = document.getElementById(`Notes-plain-text-` + id);
        if (md === null || plain === null) {
            return;
        }
        switch (type) {
            case "left": {
                const set = { left: "block", right: "none" };
                setDisplay(set);
                break;
            }
            case "mid": {
                const set = { left: "block", right: "block" };
                setDisplay(set);
                break;
            }
            case "right": {
                const set = { left: "none", right: "block" };
                setDisplay(set);
                break;
            }
            default: {
                const set = { left: "block", right: "block" };
                setDisplay(set);
                break;
            }

        }
    }

    const adjustScrollPlain = (e) => {
        e.preventDefault();
        e.stopPropagation();
        var md = document.getElementById(`Notes-MD-` + id);
        var plain = document.getElementById(`Notes-plain-text-` + id);
        if (md === null || plain === null) {
            return;
        } else {
            md.scrollTop = (plain.scrollTop / (plain.scrollHeight - plain.clientHeight)) * (md.scrollHeight - md.clientHeight);
        }

    }

    return (
        <div id={`Notes-Root-` + id} className="notes-root">
            <div id={`Notes-Header-` + id} className="notes-header">
                <div id={`Notes-Controls-1-` + id}>
                    <button onClick={open}>Open</button>
                    {/* TODO: Make a two button choice md/txt */}
                    <button onClick={(e) => { save(e, "text/plain"); }}>save</button>
                </div>
                <div id={`Notes-Controls-2-` + id}>
                    <button onClick={(e) => { changeView(e, "left") }}>left</button>
                    <button onClick={(e) => { changeView(e, "mid") }}>mid</button>
                    <button onClick={(e) => { changeView(e, "right") }}>right</button>
                </div>
            </div>
            <div id={`Notes-Body-` + id} className="notes-body">
                <textarea id={`Notes-plain-text-` + id} style={{ display: display.left }} onScroll={(e) => { adjustScrollPlain(e) }} className="notes-plain-text" onChange={parseText}></textarea>
                <div id={`Notes-MD-` + id} className="notes-md" style={{ display: display.right }}></div>
            </div>
        </div >

    );
}

export default NoteTaker;