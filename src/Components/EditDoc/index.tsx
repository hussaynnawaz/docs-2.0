import "./index.scss";
import { useState, useRef, useEffect, useCallback } from "react";
import ReactQuill from "react-quill";
import EditorToolbar, { modules, formats } from "../../Toolbar";
import { editDoc, getCurrentDoc } from "../../API/Firestore";
import { Input } from "antd";
import { asBlob } from 'html-docx-js-typescript';
import { saveAs } from 'file-saver';
import htmlToPdfmake from 'html-to-pdfmake';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

// Register fonts
pdfMake.vfs = pdfFonts.pdfMake.vfs;

export default function EditDoc({ id }: functionInterface) {
  const quillRef = useRef<any>(null);
  const [value, setValue] = useState("");
  const [title, setTitle] = useState("");
  const localStorageKey =`documentVersion+${id}`;
  const [versions, setVersion] = useState([])

  const editDocument = useCallback(()=>{
    const payload = {
      value,
      title,
    };
    editDoc(payload, id);
  },[id, title, value]) 

  useEffect(() => {
    const debounced = setTimeout(() => {
      editDocument();
    }, 500);

    return () => {
      clearTimeout(debounced);
    };
  }, [value, title, editDocument]);
    

  const getCurrentDocument = useCallback(() => {
    if (id) {
      getCurrentDoc(id, setValue, setTitle);
    }
  },[id]);

  const downloadDocumentAsDocx = () => {
    asBlob(value).then((data) => {
      saveAs(data as Blob, `${title}.docx`); 
      // save as docx file with title as file name
    }) 
  }

  const downloadDocumentAsPdf = () => {
    const contentAsHtml = value; // Get HTML content from editor
    const pdfContent = htmlToPdfmake(contentAsHtml);
    const documentDefinition = { content: pdfContent };
    const pdfDocGenerator = pdfMake.createPdf(documentDefinition);

    pdfDocGenerator.download(`${title}.pdf`);
  }

  const saveVersion = useCallback(() => {
    const previousData = localStorage.getItem(localStorageKey);
      if(previousData) {
        
        const preData = JSON.parse(previousData);
        if(preData.length === 5) preData.shift();
        const datatoStore =  JSON.stringify([...preData, value])
        localStorage.setItem(localStorageKey,datatoStore )
      } else {
        localStorage.setItem(localStorageKey, JSON.stringify([value]));
      }
      const newData = (localStorage.getItem(localStorageKey))
      if(newData) {
        const versionsData = JSON.parse(newData);
        setVersion(versionsData);
      }
  },[localStorageKey, value])

  useEffect(()=>{
    const previousData = localStorage.getItem(localStorageKey);
    if(previousData) {
      const versionsData = JSON.parse(previousData);
        setVersion(versionsData);
      }
  },[])

  useEffect(() => {
    getCurrentDocument();
    quillRef.current.focus();
  }, [getCurrentDocument]);

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
       <div className="action-buttons">
      <button onClick={downloadDocumentAsDocx}>Download as DOCX</button>
      <button onClick={downloadDocumentAsPdf}>Download as PDF</button>
      <button onClick={saveVersion}>Save Version</button>
       </div>
      <div className="version-control">
          <h3>Version Control</h3>
          {versions.length > 0 ? versions.map((version,index: number) => {
            return(
              <li onClick={()=> setValue(version)} key={index}>Version {index + 1}</li>
            )
          }) : <></>}
      </div>
    </div>
  );
}
