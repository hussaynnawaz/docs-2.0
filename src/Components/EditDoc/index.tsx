import "./index.scss";
import { useState, useRef, useEffect } from "react";
import ReactQuill from "react-quill";
import EditorToolbar, { modules, formats } from "../../Toolbar";
import { editDoc, getCurrentDoc } from "../../API/Firestore";
import { Input } from "antd";
import { asBlob } from 'html-docx-js-typescript';
import { saveAs } from 'file-saver'

export default function EditDoc({ id }: functionInterface) {
  let quillRef = useRef<any>(null);
  const [value, setValue] = useState("");
  const [title, setTitle] = useState("");
  const [isSaving, setIsSaving] = useState("");

  function editDocument() {
    let payload = {
      value,
      title,
    };
    editDoc(payload, id);
  }

  const getCurrentDocument = () => {
    if (id) {
      getCurrentDoc(id, setValue, setTitle);
    }
  };

  const downloadDocument = () => {
    asBlob(value).then((data) => {
      saveAs(data as Blob, 'file.docx') // save as docx file
    }) 
  }
  useEffect(() => {
    setIsSaving("");
    const debounced = setTimeout(() => {
      editDocument();
    }, 500);

    return () => {
      clearTimeout(debounced);
    };
  }, [value, title]);

  useEffect(() => {
    getCurrentDocument();
    quillRef.current.focus();
  }, []);

  console.log(isSaving);
  return (
    <div className="edit-container">
      {/* <p className="saving-conf">{isSaving}</p> */}
      <Input
        value={title}
        className="title-input"
        onChange={(event) => setTitle(event?.target.value)}
        placeholder="Enter the Title"
      />
      <div className="quill-container">
        <EditorToolbar />
        <ReactQuill
          className="react-quill"
          theme="snow"
          ref={quillRef}
          value={value}
          onChange={setValue}
          modules={modules}
          formats={formats}
        />
      </div>

      <button
      onClick={downloadDocument}
      >Download</button>
    </div>
  );
}
