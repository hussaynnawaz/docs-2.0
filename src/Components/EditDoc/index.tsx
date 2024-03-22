import "./index.scss";
import { useState, useRef, useEffect, useCallback } from "react";
import ReactQuill from "react-quill";
import EditorToolbar, { modules, formats } from "../../Toolbar";
import { editDoc, getCurrentDoc } from "../../API/Firestore";
import { Input, Modal, Button } from "antd"; // Import Modal and Button components from antd
import { asBlob } from 'html-docx-js-typescript';
import { saveAs } from 'file-saver';
import htmlToPdfmake from 'html-to-pdfmake';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

// Register fonts
pdfMake.vfs = pdfFonts.pdfMake.vfs;

export default function EditDoc({ id }: { id: string }) {
  const quillRef = useRef<any>(null);
  const [value, setValue] = useState("");
  const [title, setTitle] = useState("");
  const localStorageKey = `documentVersion+${id}`;
  const [versions, setVersions] = useState<string[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null); // State to track selected version
  const [modalVisible, setModalVisible] = useState(false); // State for modal visibility

  const editDocument = useCallback(() => {
    const payload = {
      value,
      title,
    };
    editDoc(payload, id);
  }, [id, title, value]);

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
  }, [id]);

  const downloadDocumentAsDocx = () => {
    asBlob(value).then((data) => {
      saveAs(data as Blob, `${title}.docx`);
    });
  }

  const downloadDocumentAsPdf = () => {
    const contentAsHtml = value;
    const pdfContent = htmlToPdfmake(contentAsHtml);
    const documentDefinition = { content: pdfContent };
    const pdfDocGenerator = pdfMake.createPdf(documentDefinition);

    pdfDocGenerator.download(`${title}.pdf`);
  }

  const saveVersion = useCallback(() => {
    const previousData = localStorage.getItem(localStorageKey);
    if (previousData) {
      const preData = JSON.parse(previousData);
      if (preData.length === 5) preData.shift();
      const dataToStore = JSON.stringify([...preData, value])
      localStorage.setItem(localStorageKey, dataToStore)
    } else {
      localStorage.setItem(localStorageKey, JSON.stringify([value]));
    }
    const newData = (localStorage.getItem(localStorageKey))
    if (newData) {
      const versionsData = JSON.parse(newData);
      setVersions(versionsData);
    }
  }, [localStorageKey, value])

  useEffect(() => {
    const previousData = localStorage.getItem(localStorageKey);
    if (previousData) {
      const versionsData = JSON.parse(previousData);
      setVersions(versionsData);
    }
  }, [localStorageKey])

  useEffect(() => {
    getCurrentDocument();
    quillRef.current.focus();
  }, [getCurrentDocument]);

  const handleVersionClick = (version: string) => {
    setSelectedVersion(version);
    setModalVisible(true);
  }

  const restoreVersion = () => {
    setValue(selectedVersion || "");
    setModalVisible(false);
  }

  const cancelRestore = () => {
    setSelectedVersion(null);
    setModalVisible(false);
  }

  return (
    <div className="edit-container">
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
        <Button type="primary" onClick={downloadDocumentAsDocx}>Download as DOCX</Button>
        <Button type="primary" onClick={downloadDocumentAsPdf}>Download as PDF</Button>
        <Button type="primary" onClick={saveVersion} style={{ backgroundColor: '#28a745' }}>
  Save Version
</Button>
      </div>
      <div className="version-control">
        <h3>Version Control</h3>
        {versions.length > 0 ? versions.map((version, index: number) => (
          <Button key={index} onClick={() => handleVersionClick(version)}>Version {index + 1}</Button>
        )) : <></>}
      </div>
      <Modal
        title={`Version ${versions.indexOf(selectedVersion || "") + 1}`}
        visible={modalVisible}
        onCancel={cancelRestore}
        footer={[
          <Button key="restore" type="primary" onClick={restoreVersion}>Restore Version</Button>,
          <Button key="cancel" type="primary" danger onClick={cancelRestore}>Cancel</Button>,
        ]}
      >
        <div>
          <p>Old Version:</p>
          <ReactQuill theme="snow" value={selectedVersion || ""} readOnly />
          <p>New Version:</p>
          <ReactQuill theme="snow" value={value} readOnly />
        </div>
      </Modal>
    </div>
  );
}
